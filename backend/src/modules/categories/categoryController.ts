import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../database/db.js';
import { AppError } from '../../middleware/errorHandler.js';
import { Category } from '../../../../shared/types/index.js';

export class CategoryController {
  public static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rows = await db.query<any>(`
        SELECT c.*, 
               (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.is_archived = 0) as product_count
        FROM categories c
        ORDER BY c.name ASC
      `);

      const categories: Category[] = rows.map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        description: r.description || '',
        imageUrl: r.image_url,
        iconName: r.icon_name,
        parentId: r.parent_id,
        productCount: Number(r.product_count || 0)
      }));

      res.json({
        success: true,
        data: categories
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      const row = await db.get<any>(`
        SELECT c.*, 
               (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.is_archived = 0) as product_count
        FROM categories c WHERE c.slug = ?
      `, [slug]);

      if (!row) {
        throw new AppError('Category not found', 404);
      }

      const category: Category = {
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description || '',
        imageUrl: row.image_url,
        iconName: row.icon_name,
        parentId: row.parent_id,
        productCount: Number(row.product_count || 0)
      };

      res.json({
        success: true,
        data: category
      });
    } catch (err) {
      next(err);
    }
  }

  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, slug, description, imageUrl, iconName, parentId } = req.body;
      if (!name || !slug) {
        throw new AppError('Category name and slug are required', 400);
      }

      const id = `cat-${uuidv4().substring(0, 8)}`;
      const now = new Date().toISOString();

      await db.run(
        `INSERT INTO categories (id, name, slug, description, image_url, icon_name, parent_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, name, slug.toLowerCase(), description || '', imageUrl || null, iconName || 'Box', parentId || null, now]
      );

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: { id, name, slug, description, imageUrl, iconName, parentId }
      });
    } catch (err) {
      next(err);
    }
  }
}
