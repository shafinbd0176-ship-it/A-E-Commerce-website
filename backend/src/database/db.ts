import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DatabaseService {
  private static instance: DatabaseService;
  private db!: sqlite3.Database;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    const dataDir = path.resolve(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const dbPath = process.env.DB_SQLITE_PATH 
      ? path.resolve(process.cwd(), process.env.DB_SQLITE_PATH)
      : path.join(dataDir, 'secondlife.db');

    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('[DB] Failed to connect to database:', err);
          return reject(err);
        }
        console.log(`[DB] Connected successfully to SQLite database: ${dbPath}`);
        this.applySchema()
          .then(() => {
            this.isInitialized = true;
            resolve();
          })
          .catch(reject);
      });
    });
  }

  private async applySchema(): Promise<void> {
    // Schema DDL
    const schemaSql = `
      CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'customer',
          phone TEXT,
          avatar_url TEXT,
          is_email_verified INTEGER DEFAULT 0,
          is_active INTEGER DEFAULT 1,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS categories (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          description TEXT,
          image_url TEXT,
          icon_name TEXT,
          parent_id TEXT,
          created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          short_description TEXT NOT NULL,
          description TEXT NOT NULL,
          price REAL NOT NULL,
          original_retail_price REAL,
          category_id TEXT NOT NULL,
          condition TEXT NOT NULL,
          stock_quantity INTEGER NOT NULL DEFAULT 0,
          sku TEXT UNIQUE NOT NULL,
          is_featured INTEGER DEFAULT 0,
          is_archived INTEGER DEFAULT 0,
          rebuild_info_json TEXT NOT NULL,
          specs_json TEXT NOT NULL,
          average_rating REAL DEFAULT 5.0,
          review_count INTEGER DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY (category_id) REFERENCES categories(id)
      );

      CREATE TABLE IF NOT EXISTS product_images (
          id TEXT PRIMARY KEY,
          product_id TEXT NOT NULL,
          url TEXT NOT NULL,
          alt TEXT NOT NULL,
          is_primary INTEGER DEFAULT 0,
          sort_order INTEGER DEFAULT 0,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS addresses (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          recipient_name TEXT NOT NULL,
          street_address1 TEXT NOT NULL,
          street_address2 TEXT,
          city TEXT NOT NULL,
          state_or_province TEXT NOT NULL,
          postal_code TEXT NOT NULL,
          country TEXT NOT NULL,
          phone TEXT NOT NULL,
          is_default INTEGER DEFAULT 0,
          created_at TEXT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS orders (
          id TEXT PRIMARY KEY,
          order_number TEXT UNIQUE NOT NULL,
          user_id TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'PENDING',
          shipping_address_json TEXT NOT NULL,
          subtotal REAL NOT NULL,
          shipping_fee REAL NOT NULL DEFAULT 0.0,
          discount REAL NOT NULL DEFAULT 0.0,
          tax REAL NOT NULL DEFAULT 0.0,
          total_amount REAL NOT NULL,
          total_ewaste_diverted_kg REAL NOT NULL DEFAULT 0.0,
          total_co2_saved_kg REAL NOT NULL DEFAULT 0.0,
          payment_method TEXT NOT NULL,
          payment_status TEXT NOT NULL DEFAULT 'PENDING',
          payment_id TEXT,
          tracking_number TEXT,
          carrier TEXT,
          notes TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS order_items (
          id TEXT PRIMARY KEY,
          order_id TEXT NOT NULL,
          product_id TEXT NOT NULL,
          product_title TEXT NOT NULL,
          product_image TEXT NOT NULL,
          unit_price REAL NOT NULL,
          quantity INTEGER NOT NULL,
          total_price REAL NOT NULL,
          condition TEXT NOT NULL,
          rebuild_notes TEXT,
          FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES products(id)
      );

      CREATE TABLE IF NOT EXISTS cart_items (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          product_id TEXT NOT NULL,
          quantity INTEGER NOT NULL DEFAULT 1,
          selected_specs_json TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS wishlist_items (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          product_id TEXT NOT NULL,
          created_at TEXT NOT NULL,
          UNIQUE(user_id, product_id),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS reviews (
          id TEXT PRIMARY KEY,
          product_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          rating INTEGER NOT NULL,
          title TEXT NOT NULL,
          comment TEXT NOT NULL,
          is_verified_purchase INTEGER DEFAULT 1,
          is_approved INTEGER DEFAULT 1,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS support_tickets (
          id TEXT PRIMARY KEY,
          ticket_number TEXT UNIQUE NOT NULL,
          user_id TEXT NOT NULL,
          order_id TEXT,
          subject TEXT NOT NULL,
          category TEXT NOT NULL,
          priority TEXT NOT NULL DEFAULT 'MEDIUM',
          status TEXT NOT NULL DEFAULT 'OPEN',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS support_messages (
          id TEXT PRIMARY KEY,
          ticket_id TEXT NOT NULL,
          sender_id TEXT NOT NULL,
          sender_role TEXT NOT NULL,
          sender_name TEXT NOT NULL,
          message TEXT NOT NULL,
          created_at TEXT NOT NULL,
          FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          user_name TEXT NOT NULL,
          user_role TEXT NOT NULL,
          action TEXT NOT NULL,
          entity_type TEXT NOT NULL,
          entity_id TEXT NOT NULL,
          details_json TEXT NOT NULL,
          ip_address TEXT,
          created_at TEXT NOT NULL
      );
    `;

    return new Promise((resolve, reject) => {
      this.db.exec(schemaSql, (err) => {
        if (err) {
          console.error('[DB] Schema initialization failed:', err);
          return reject(err);
        }
        console.log('[DB] Schema verified & ready.');
        resolve();
      });
    });
  }

  public query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.error(`[DB Error] query: ${sql}`, err);
          return reject(err);
        }
        resolve((rows as T[]) || []);
      });
    });
  }

  public get<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          console.error(`[DB Error] get: ${sql}`, err);
          return reject(err);
        }
        resolve((row as T) || null);
      });
    });
  }

  public run(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) {
          console.error(`[DB Error] run: ${sql}`, err);
          return reject(err);
        }
        resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }
}

export const db = DatabaseService.getInstance();
