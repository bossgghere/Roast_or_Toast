import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';
import { RegisterDTO, LoginDTO, AuthRequest } from '../types/index.js';

// Register
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password }: RegisterDTO = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }]
      }
    });

    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
      }
    });

    // Generate token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      res.status(500).json({ message: 'Server configuration error' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, isPro: user.isPro },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isPro: user.isPro,
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password }: LoginDTO = req.body;

    if (!username || !password) {
      res.status(400).json({ message: 'Username and password required' });
      return;
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Check password
    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Generate token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      res.status(500).json({ message: 'Server configuration error' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, isPro: user.isPro },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isPro: user.isPro
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in' });
  }
};

// Get current user
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        username: true,
        email: true,
        isPro: true,
        subscriptionExpiry: true,
        createdAt: true
      }
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user' });
  }
};