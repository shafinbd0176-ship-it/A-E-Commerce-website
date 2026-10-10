import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { config } from './config/index.js';
import { db } from './database/db.js';
import { seedDatabase } from './database/seed.js';
import { errorHandler } from './middleware/errorHandler.js';

// Import Route Handlers
import authRoutes from './modules/auth/authRoutes.js';
import categoryRoutes from './modules/categories/categoryRoutes.js';
import productRoutes from './modules/products/productRoutes.js';
import cartRoutes from './modules/cart/cartRoutes.js';
import orderRoutes from './modules/orders/orderRoutes.js';
import addressRoutes from './modules/addresses/addressRoutes.js';
import reviewRoutes from './modules/reviews/reviewRoutes.js';
import wishlistRoutes from './modules/wishlist/wishlistRoutes.js';
import supportRoutes from './modules/support/supportRoutes.js';
import adminRoutes from './modules/admin/adminRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server) or matching allowed origins
    if (!origin || config.corsOrigins.includes(origin) || origin.includes('localhost')) {
      return callback(null, true);
    }
    return callback(null, true); // Dev convenience
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory
if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}
app.use('/uploads', express.static(config.uploadDir));

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'SecondLife REST API Gateway',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Mount Module Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/admin', adminRoutes);

// Centralized Error Handling
app.use(errorHandler);

// Server Startup
async function startServer() {
  try {
    console.log('[SecondLife Backend] Initializing database...');
    await db.initialize();

    // Check if products exist; if not, auto-seed
    const productCount = await db.get<any>('SELECT COUNT(*) as cnt FROM products');
    if (!productCount || productCount.cnt === 0) {
      console.log('[SecondLife Backend] Empty database detected. Running initial seed...');
      await seedDatabase();
    }

    app.listen(config.port, () => {
      console.log('====================================================');
      console.log(`⚡ SecondLife Core API running on http://localhost:${config.port}`);
      console.log(`⚡ Environment: ${config.env}`);
      console.log(`⚡ Payment Provider: ${config.paymentProvider}`);
      console.log('====================================================');
    });
  } catch (err) {
    console.error('[SecondLife Backend] Startup failure:', err);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export { app, startServer };
export default app;
