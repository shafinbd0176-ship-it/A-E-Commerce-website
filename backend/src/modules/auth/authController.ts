import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../database/db.js';
import { config } from '../../config/index.js';
import { AppError } from '../../middleware/errorHandler.js';
import { AuthRequest } from '../../middleware/auth.js';
import { User, UserRole } from '../../../../shared/types/index.js';
import { recordAuditLog } from '../../middleware/audit.js';

export class AuthController {
  public static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, firstName, lastName, phone } = req.body;

      if (!email || !password || !firstName || !lastName) {
        throw new AppError('Email, password, first name and last name are required', 400);
      }

      if (password.length < 6) {
        throw new AppError('Password must be at least 6 characters long', 400);
      }

      const existingUser = await db.get<any>('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
      if (existingUser) {
        throw new AppError('An account with this email address already exists', 409);
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      const id = `usr-${uuidv4()}`;
      const now = new Date().toISOString();

      await db.run(
        `INSERT INTO users (id, email, password_hash, first_name, last_name, role, phone, is_email_verified, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'customer', ?, 1, 1, ?, ?)`,
        [id, email.toLowerCase(), passwordHash, firstName, lastName, phone || null, now, now]
      );

      const user: User = {
        id,
        email: email.toLowerCase(),
        firstName,
        lastName,
        role: 'customer',
        phone: phone || undefined,
        isEmailVerified: true,
        isActive: true,
        createdAt: now,
        updatedAt: now
      };

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName },
        config.jwtSecret,
        { expiresIn: '7d' }
      );

      await recordAuditLog({
        userId: id,
        userName: `${firstName} ${lastName}`,
        userRole: 'customer',
        action: 'USER_REGISTERED',
        entityType: 'USER',
        entityId: id,
        details: { email: user.email }
      });

      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: { user, token }
      });
    } catch (err) {
      next(err);
    }
  }

  public static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new AppError('Email and password are required', 400);
      }

      const row = await db.get<any>('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
      if (!row) {
        throw new AppError('Invalid email or password credentials', 401);
      }

      if (!row.is_active) {
        throw new AppError('This account has been deactivated. Please contact support.', 403);
      }

      const isMatch = await bcrypt.compare(password, row.password_hash);
      if (!isMatch) {
        throw new AppError('Invalid email or password credentials', 401);
      }

      const user: User = {
        id: row.id,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        role: row.role as UserRole,
        phone: row.phone,
        avatarUrl: row.avatar_url,
        isEmailVerified: Boolean(row.is_email_verified),
        isActive: Boolean(row.is_active),
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName },
        config.jwtSecret,
        { expiresIn: '7d' }
      );

      await recordAuditLog({
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        userRole: user.role,
        action: 'USER_LOGIN',
        entityType: 'USER',
        entityId: user.id,
        details: { email: user.email }
      });

      res.json({
        success: true,
        message: 'Login successful',
        data: { user, token }
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getCurrentUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const row = await db.get<any>('SELECT * FROM users WHERE id = ?', [req.user.id]);
      if (!row) {
        throw new AppError('User not found', 404);
      }

      const user: User = {
        id: row.id,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        role: row.role as UserRole,
        phone: row.phone,
        avatarUrl: row.avatar_url,
        isEmailVerified: Boolean(row.is_email_verified),
        isActive: Boolean(row.is_active),
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };

      res.json({
        success: true,
        data: user
      });
    } catch (err) {
      next(err);
    }
  }

  public static async updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const { firstName, lastName, phone, avatarUrl } = req.body;
      const now = new Date().toISOString();

      await db.run(
        `UPDATE users SET first_name = COALESCE(?, first_name), 
                          last_name = COALESCE(?, last_name), 
                          phone = COALESCE(?, phone), 
                          avatar_url = COALESCE(?, avatar_url), 
                          updated_at = ? 
         WHERE id = ?`,
        [firstName, lastName, phone, avatarUrl, now, req.user.id]
      );

      const row = await db.get<any>('SELECT * FROM users WHERE id = ?', [req.user.id]);
      const user: User = {
        id: row.id,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        role: row.role as UserRole,
        phone: row.phone,
        avatarUrl: row.avatar_url,
        isEmailVerified: Boolean(row.is_email_verified),
        isActive: Boolean(row.is_active),
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: user
      });
    } catch (err) {
      next(err);
    }
  }
}
