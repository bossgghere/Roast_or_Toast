import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/index.js';
import prisma from '../config/database.js';

export const checkSubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // If user is Pro, allow unlimited
    if (user.isPro) {
      next();
      return;
    }

    // Check free tier limit (3 per day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const roastCount = await prisma.roast.count({
      where: {
        userId: userId,
        createdAt: { gte: today }
      }
    });

    const freeLimit = parseInt(process.env.FREE_DAILY_LIMIT || '3');

    if (roastCount >= freeLimit) {
      res.status(403).json({ 
        message: 'Free tier limit reached. Upgrade to Pro for unlimited roasts!',
        limitReached: true
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({ message: 'Error checking subscription' });
  }
};