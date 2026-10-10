import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../database/db.js';
import { AppError } from '../../middleware/errorHandler.js';
import { AuthRequest } from '../../middleware/auth.js';
import { Product, ProductCondition } from '../../../../shared/types/index.js';
import { recordAuditLog } from '../../middleware/audit.js';

export class ProductController {
  public static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 12;
      const offset = (page - 1) * limit;

      const search = req.query.search as string;
      const categoryId = req.query.categoryId as string;
      const condition = req.query.condition as ProductCondition;
      const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined;
      const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined;
      const inStockOnly = req.query.inStockOnly === 'true';
      const featured = req.query.featured === 'true';
      const sortBy = (req.query.sortBy as string) || 'newest';

      const whereClauses: string[] = ['p.is_archived = 0'];
      const params: any[] = [];

      if (search) {
        whereClauses.push('(p.title LIKE ? OR p.short_description LIKE ? OR p.description LIKE ? OR p.sku LIKE ?)');
        const s = `%${search}%`;
        params.push(s, s, s, s);
      }

      if (categoryId) {
        whereClauses.push('p.category_id = ?');
        params.push(categoryId);
      }

      if (condition) {
        whereClauses.push('p.condition = ?');
        params.push(condition);
      }

      if (minPrice !== undefined) {
        whereClauses.push('p.price >= ?');
        params.push(minPrice);
      }

      if (maxPrice !== undefined) {
        whereClauses.push('p.price <= ?');
        params.push(maxPrice);
      }

      if (inStockOnly) {
        whereClauses.push('p.stock_quantity > 0');
      }

      if (featured) {
        whereClauses.push('p.is_featured = 1');
      }

      const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      // Sorting
      let orderBySql = 'ORDER BY p.created_at DESC';
      if (sortBy === 'price_asc') orderBySql = 'ORDER BY p.price ASC';
      else if (sortBy === 'price_desc') orderBySql = 'ORDER BY p.price DESC';
      else if (sortBy === 'rating') orderBySql = 'ORDER BY p.average_rating DESC';
      else if (sortBy === 'sustainability') orderBySql = 'ORDER BY json_extract(p.rebuild_info_json, "$.eWasteDivertedKg") DESC';

      // Count total
      const countRow = await db.get<any>(
        `SELECT COUNT(*) as total FROM products p ${whereSql}`,
        params
      );
      const total = countRow ? Number(countRow.total) : 0;

      // Fetch products
      const querySql = `
        SELECT p.*, c.name as category_name, c.slug as category_slug
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ${whereSql}
        ${orderBySql}
        LIMIT ? OFFSET ?
      `;

      const rows = await db.query<any>(querySql, [...params, limit, offset]);

      // Fetch product images
      const productIds = rows.map(r => r.id);
      let imagesMap: Record<string, any[]> = {};
      if (productIds.length > 0) {
        const placeholders = productIds.map(() => '?').join(',');
        const imgRows = await db.query<any>(
          `SELECT * FROM product_images WHERE product_id IN (${placeholders}) ORDER BY is_primary DESC, sort_order ASC`,
          productIds
        );
        for (const img of imgRows) {
          if (!imagesMap[img.product_id]) imagesMap[img.product_id] = [];
          imagesMap[img.product_id].push({
            id: img.id,
            url: img.url,
            alt: img.alt,
            isPrimary: Boolean(img.is_primary),
            sortOrder: img.sort_order
          });
        }
      }

      const products: Product[] = rows.map((r) => {
        let rebuildInfo = {
          originalDonorDevice: '',
          salvagedParts: [],
          newUpgradesAdded: [],
          eWasteDivertedKg: 1.5,
          co2SavedKg: 25,
          warrantyMonths: 12
        };
        let specs = [];
        try {
          rebuildInfo = JSON.parse(r.rebuild_info_json || '{}');
          specs = JSON.parse(r.specs_json || '[]');
        } catch {
          // fallback
        }

        return {
          id: r.id,
          title: r.title,
          slug: r.slug,
          shortDescription: r.short_description,
          description: r.description,
          price: r.price,
          originalRetailPrice: r.original_retail_price,
          categoryId: r.category_id,
          category: r.category_name ? {
            id: r.category_id,
            name: r.category_name,
            slug: r.category_slug,
            description: ''
          } : undefined,
          condition: r.condition as ProductCondition,
          stockQuantity: r.stock_quantity,
          sku: r.sku,
          images: imagesMap[r.id] || [],
          specs,
          rebuildInfo,
          isFeatured: Boolean(r.is_featured),
          isArchived: Boolean(r.is_archived),
          averageRating: r.average_rating,
          reviewCount: r.review_count,
          createdAt: r.created_at,
          updatedAt: r.updated_at
        };
      });

      res.json({
        success: true,
        data: products,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slugOrId } = req.params;

      const row = await db.get<any>(
        `SELECT p.*, c.name as category_name, c.slug as category_slug
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         WHERE (p.slug = ? OR p.id = ?) AND p.is_archived = 0`,
        [slugOrId, slugOrId]
      );

      if (!row) {
        throw new AppError('Product not found', 404);
      }

      const imgRows = await db.query<any>(
        `SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, sort_order ASC`,
        [row.id]
      );

      let rebuildInfo = {
        originalDonorDevice: '',
        salvagedParts: [],
        newUpgradesAdded: [],
        eWasteDivertedKg: 1.5,
        co2SavedKg: 25,
        warrantyMonths: 12
      };
      let specs = [];
      try {
        rebuildInfo = JSON.parse(row.rebuild_info_json || '{}');
        specs = JSON.parse(row.specs_json || '[]');
      } catch {}

      const product: Product = {
        id: row.id,
        title: row.title,
        slug: row.slug,
        shortDescription: row.short_description,
        description: row.description,
        price: row.price,
        originalRetailPrice: row.original_retail_price,
        categoryId: row.category_id,
        category: row.category_name ? {
          id: row.category_id,
          name: row.category_name,
          slug: row.category_slug,
          description: ''
        } : undefined,
        condition: row.condition as ProductCondition,
        stockQuantity: row.stock_quantity,
        sku: row.sku,
        images: imgRows.map(i => ({
          id: i.id,
          url: i.url,
          alt: i.alt,
          isPrimary: Boolean(i.is_primary),
          sortOrder: i.sort_order
        })),
        specs,
        rebuildInfo,
        isFeatured: Boolean(row.is_featured),
        isArchived: Boolean(row.is_archived),
        averageRating: row.average_rating,
        reviewCount: row.review_count,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };

      res.json({
        success: true,
        data: product
      });
    } catch (err) {
      next(err);
    }
  }

  public static async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        title,
        slug,
        shortDescription,
        description,
        price,
        originalRetailPrice,
        categoryId,
        condition,
        stockQuantity,
        sku,
        isFeatured,
        rebuildInfo,
        specs,
        images
      } = req.body;

      if (!title || !price || !categoryId || !condition) {
        throw new AppError('Title, price, category and condition are required', 400);
      }

      const id = `prod-${uuidv4()}`;
      const productSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const productSku = sku || `SL-${condition.substring(0, 3)}-${Date.now().toString().slice(-4)}`;
      const now = new Date().toISOString();

      await db.run(
        `INSERT INTO products (
          id, title, slug, short_description, description, price, original_retail_price,
          category_id, condition, stock_quantity, sku, is_featured, is_archived,
          rebuild_info_json, specs_json, average_rating, review_count, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, 5.0, 0, ?, ?)`,
        [
          id,
          title,
          productSlug,
          shortDescription || '',
          description || '',
          price,
          originalRetailPrice || null,
          categoryId,
          condition,
          stockQuantity || 1,
          productSku,
          isFeatured ? 1 : 0,
          JSON.stringify(rebuildInfo || {}),
          JSON.stringify(specs || []),
          now,
          now
        ]
      );

      // Insert images if provided
      if (Array.isArray(images) && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          await db.run(
            `INSERT INTO product_images (id, product_id, url, alt, is_primary, sort_order)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [`img-${uuidv4()}`, id, img.url, img.alt || title, i === 0 ? 1 : 0, i]
          );
        }
      }

      if (req.user) {
        await recordAuditLog({
          userId: req.user.id,
          userName: `${req.user.firstName} ${req.user.lastName}`,
          userRole: req.user.role,
          action: 'PRODUCT_CREATED',
          entityType: 'PRODUCT',
          entityId: id,
          details: { title, price, condition, sku: productSku }
        });
      }

      res.status(201).json({
        success: true,
        message: 'Product registered into circular inventory successfully',
        data: { id, title, slug: productSlug, sku: productSku }
      });
    } catch (err) {
      next(err);
    }
  }

  public static async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const {
        title,
        shortDescription,
        description,
        price,
        originalRetailPrice,
        categoryId,
        condition,
        stockQuantity,
        isFeatured,
        isArchived,
        rebuildInfo,
        specs,
        images
      } = req.body;

      const existing = await db.get<any>('SELECT * FROM products WHERE id = ?', [id]);
      if (!existing) {
        throw new AppError('Product not found', 404);
      }

      const now = new Date().toISOString();

      await db.run(
        `UPDATE products SET
          title = COALESCE(?, title),
          short_description = COALESCE(?, short_description),
          description = COALESCE(?, description),
          price = COALESCE(?, price),
          original_retail_price = COALESCE(?, original_retail_price),
          category_id = COALESCE(?, category_id),
          condition = COALESCE(?, condition),
          stock_quantity = COALESCE(?, stock_quantity),
          is_featured = COALESCE(?, is_featured),
          is_archived = COALESCE(?, is_archived),
          rebuild_info_json = COALESCE(?, rebuild_info_json),
          specs_json = COALESCE(?, specs_json),
          updated_at = ?
         WHERE id = ?`,
        [
          title,
          shortDescription,
          description,
          price,
          originalRetailPrice,
          categoryId,
          condition,
          stockQuantity,
          isFeatured !== undefined ? (isFeatured ? 1 : 0) : null,
          isArchived !== undefined ? (isArchived ? 1 : 0) : null,
          rebuildInfo ? JSON.stringify(rebuildInfo) : null,
          specs ? JSON.stringify(specs) : null,
          now,
          id
        ]
      );

      // Replace images if provided
      if (Array.isArray(images)) {
        await db.run('DELETE FROM product_images WHERE product_id = ?', [id]);
        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          await db.run(
            `INSERT INTO product_images (id, product_id, url, alt, is_primary, sort_order)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [`img-${uuidv4()}`, id, img.url, img.alt || title || 'Product Image', i === 0 ? 1 : 0, i]
          );
        }
      }

      if (req.user) {
        await recordAuditLog({
          userId: req.user.id,
          userName: `${req.user.firstName} ${req.user.lastName}`,
          userRole: req.user.role,
          action: 'PRODUCT_UPDATED',
          entityType: 'PRODUCT',
          entityId: id,
          details: { title: title || existing.title, price: price || existing.price }
        });
      }

      res.json({
        success: true,
        message: 'Product updated successfully'
      });
    } catch (err) {
      next(err);
    }
  }

  public static async deleteOrArchive(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const now = new Date().toISOString();

      await db.run('UPDATE products SET is_archived = 1, updated_at = ? WHERE id = ?', [now, id]);

      if (req.user) {
        await recordAuditLog({
          userId: req.user.id,
          userName: `${req.user.firstName} ${req.user.lastName}`,
          userRole: req.user.role,
          action: 'PRODUCT_ARCHIVED',
          entityType: 'PRODUCT',
          entityId: id,
          details: {}
        });
      }

      res.json({
        success: true,
        message: 'Product archived from active catalog'
      });
    } catch (err) {
      next(err);
    }
  }
}
