import express from 'express';
import { 
  createSubscriptionOrder, 
  verifyAndActivate, 
  getSubscriptionStatus,
  getPaymentHistory 
} from '../controllers/subscriptionController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/create-order', verifyToken, createSubscriptionOrder);
router.post('/verify', verifyToken, verifyAndActivate);
router.get('/status', verifyToken, getSubscriptionStatus);
router.get('/payment-history', verifyToken, getPaymentHistory);

export default router;