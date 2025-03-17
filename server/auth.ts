import { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import { z } from 'zod';
import { storage } from './storage';
import { compareSync, hashSync } from 'bcryptjs';

// User session data
declare module 'express-session' {
  interface SessionData {
    userId: number;
    userRole: 'buyer' | 'seller';
  }
}

// Authentication middleware
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && req.session.userId) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized - Please log in' });
};

// Role-based access middleware
export const checkRole = (role: 'buyer' | 'seller') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.session && req.session.userRole === role) {
      return next();
    }
    res.status(403).json({ message: `Access denied - ${role} role required` });
  };
};

// Login schema
export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

// Register schema (extends user schema with password confirmation)
export const registerSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
  role: z.enum(['buyer', 'seller'], { message: "Role must be either buyer or seller" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Hash password
export const hashPassword = (password: string): string => {
  return hashSync(password, 10);
};

// Check password
export const checkPassword = (password: string, hashedPassword: string): boolean => {
  return compareSync(password, hashedPassword);
};

// Get current user
export const getCurrentUser = async (req: Request) => {
  if (!req.session.userId) return null;
  
  const user = await storage.getUser(req.session.userId);
  if (!user) {
    // Clean up invalid session
    req.session.destroy(() => {});
    return null;
  }
  
  // Don't expose password
  const { password, ...safeUser } = user;
  return safeUser;
};

// Configure session middleware
export const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'techconnect-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  }
});
