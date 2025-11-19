import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import prisma from '../config/database.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!
}) as any;

// Create subscription order
export const createSubscriptionOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { plan }: { plan: 'monthly' | 'yearly' } = req.body;
    const userId = req.user!.id;

    const prices = {
      monthly: 9900,  // ₹99
      yearly: 99900   // ₹999
    };

    if (!prices[plan]) {
      res.status(400).json({ message: 'Invalid plan' });
      return;
    }

    const order = await razorpay.orders.create({
      amount: prices[plan],
      currency: 'INR',
      receipt: `sub_${Date.now()}`,
      notes: {
        userId: userId,
        plan: plan
      }
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Error creating order' });
  }
};

// Verify payment and activate subscription
export const verifyAndActivate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      plan 
    } = req.body;

    const userId = req.user!.id;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      // Save failed payment
      await prisma.payment.create({
        data: {
          userId: userId,
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          amount: plan === 'monthly' ? 9900 : 99900,
          currency: 'INR',
          plan: plan,
          status: 'failed'
        }
      });

      res.status(400).json({ message: 'Invalid payment signature' });
      return;
    }

    // Calculate expiry
    const now = new Date();
    const expiryDate = new Date(now);
    if (plan === 'monthly') {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else if (plan === 'yearly') {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    }

    // Save successful payment
    await prisma.payment.create({
      data: {
        userId: userId,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        amount: plan === 'monthly' ? 9900 : 99900,
        currency: 'INR',
        plan: plan,
        status: 'success'
      }
    });

    // Update user to Pro
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isPro: true,
        subscriptionExpiry: expiryDate,
        subscriptionPlan: plan
      }
    });

    res.json({
      message: 'Subscription activated successfully!',
      user: {
        id: user.id,
        username: user.username,
        isPro: user.isPro,
        subscriptionExpiry: user.subscriptionExpiry,
        subscriptionPlan: user.subscriptionPlan
      }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Error verifying payment' });
  }
};

// Get subscription status
export const getSubscriptionStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        isPro: true,
        subscriptionExpiry: true,
        subscriptionPlan: true
      }
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check if expired
    let isActive = user.isPro;
    if (user.isPro && user.subscriptionExpiry) {
      isActive = new Date() < new Date(user.subscriptionExpiry);
      
      if (!isActive) {
        await prisma.user.update({
          where: { id: userId },
          data: { isPro: false, subscriptionPlan: null }
        });
      }
    }

    res.json({
      isPro: isActive,
      subscriptionPlan: user.subscriptionPlan,
      subscriptionExpiry: user.subscriptionExpiry,
      daysLeft: user.subscriptionExpiry 
        ? Math.ceil((new Date(user.subscriptionExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 0
    });

  } catch (error) {
    console.error('Subscription status error:', error);
    res.status(500).json({ message: 'Error fetching subscription status' });
  }
};

// Get payment history
export const getPaymentHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const payments = await prisma.payment.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ payments });

  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({ message: 'Error fetching payment history' });
  }
};