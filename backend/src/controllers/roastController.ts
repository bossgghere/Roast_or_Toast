import { Response } from 'express';
import { AuthRequest, RoastRequestDTO } from '../types/index.js';
import prisma from '../config/database.js';
import { generateRoastOrCompliment } from '../services/openaiService.js';
import fs from 'fs';
import { SelectObjectContentCommand } from '@aws-sdk/client-s3';

export const createRoast = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type }: RoastRequestDTO = req.body;
    const userId = req.user!.id;

    // Check if image was uploaded
    if (!req.file) {
      res.status(400).json({ message: 'No image uploaded' });
      return;
    }

    // Validate type
    if (type !== 'roast' && type !== 'compliment') {
      res.status(400).json({ message: 'Type must be "roast" or "compliment"' });
      return;
    }

    // Read image file
    const imageBuffer = fs.readFileSync(req.file.path);

    // Generate roast/compliment using Gemini AI
    const aiResponse = await generateRoastOrCompliment(imageBuffer, type);

    // Save to database
    const roast = await prisma.roast.create({
      data: {
        userId: userId,
        imageUrl: `/uploads/${req.file.filename}`,
        type: type,
        resultText: aiResponse.roast,
        comment: aiResponse.comment,
        memeCaption: aiResponse.meme_caption
      }
    });

    res.status(201).json({
      message: `${type === 'roast' ? 'Roast' : 'Compliment'} generated successfully!`,
      roast: {
        id: roast.id,
        imageUrl: roast.imageUrl,
        type: roast.type,
        resultText: roast.resultText,
        comment: roast.comment,
        memeCaption: roast.memeCaption,
        createdAt: roast.createdAt
      }
    });

  } catch (error) {
    console.error('Roast creation error:', error);
    res.status(500).json({ message: 'Error generating roast/compliment' });
  }
};

export const getRoastHistory = async (req: AuthRequest, res: Response): Promise<void> => {
    try{
        const userId = req.user!.id;

        const roasts = await prisma.roast.findMany({
            where: { userId: userId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                imageUrl: true,
                type: true,
                resultText: true,
                comment: true,
                memeCaption: true,
                createdAt: true
            }
        });

        res.json({ 
            count: roasts.length,
            roasts 
        });
    }
    catch(error){
        console.error('Roast history error:', error);
        res.status(500).json({ message: 'Error fetching roast history' });
    }
};