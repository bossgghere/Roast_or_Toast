import express from 'express';
import multer from 'multer';
import { createRoast } from '../controllers/roastController.js';
import { verifyToken } from '../middleware/auth.js';
import { checkSubscription } from '../middleware/subscription.js';

const router = express.Router();

// Multer config for image upload
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Only allow images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed!'));
    }
  }
});

router.post('/create', verifyToken, checkSubscription, upload.single('image'), createRoast);

export default router;