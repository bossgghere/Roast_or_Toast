import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, UserPayload } from '../types/index.js';

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      res.status(500).json({ message: 'Server configuration error' });
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as UserPayload;
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error);  // Add this for debugging
    res.status(401).json({ message: 'Invalid token' });
  }
};