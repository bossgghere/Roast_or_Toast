import { Request } from 'express';

// User types
export interface UserPayload {
  id: string;
  username: string;
  email: string;
  isPro: boolean;
}

// Extended Request with user
export interface AuthRequest extends Request {
  user?: UserPayload;
}

// Auth DTOs
export interface RegisterDTO {
  username: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  username: string;
  password: string;
}

// Roast DTOs
export interface RoastRequestDTO {
  type: 'roast' | 'compliment';
}

export interface RoastResponseDTO {
  id: string;
  imageUrl: string;
  type: string;
  resultText: string;
  comment: string;
  memeCaption: string;
  createdAt: Date;
}

// AI Response
export interface GeminiResponse {
  roast: string;
  comment: string;
  meme_caption: string;
}

// Razorpay types
export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  notes?: {
    userId: string;
    plan: string;
  };
}

export interface RazorpayVerification {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  plan: 'monthly' | 'yearly';
}