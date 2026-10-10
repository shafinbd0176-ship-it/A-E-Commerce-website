import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config(); // fallback to local .env if present

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  jwtSecret: process.env.JWT_SECRET || 'secondlife-super-secure-production-jwt-secret-key-32-chars-min',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'secondlife-refresh-token-secret-key',
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:5173').split(','),
  paymentProvider: process.env.PAYMENT_PROVIDER || 'sandbox',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  pythonServiceUrl: process.env.PYTHON_RECOMMENDATION_SERVICE_URL || 'http://localhost:8000',
  uploadDir: path.resolve(process.cwd(), process.env.UPLOAD_DIR || './uploads'),
};
