import { GoogleGenerativeAI } from '@google/generative-ai';
import { GeminiResponse } from '../types/index.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const generateRoastOrCompliment = async (
    imageBuffer: Buffer,
    type: 'roast' | 'compliment'
  ): Promise<GeminiResponse> => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro-version' }); // Fixed!
  
      const prompt = type === 'roast' 
        ? getRoastPrompt() 
        : getComplimentPrompt();
  
      const base64Image = imageBuffer.toString('base64');
  
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Image,
            mimeType: 'image/jpeg'
          }
        }
      ]);
  
      const response = result.response.text();
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid AI response format');
      }
  
      const parsed: GeminiResponse = JSON.parse(jsonMatch[0]);
      return parsed;
  
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to generate response');
    }
  };

// Roast prompt
const getRoastPrompt = (): string => {
  return `You are RoastMaster AI — a fun, sarcastic, meme-loving Gen-Z style roaster.

Your goal: roast the person in the uploaded image.

Rules:
- Keep it friendly, safe, and humorous.
- No offensive content: racism, body shaming, harassment, hate, slurs, violence.
- No sensitive topics.
- Use playful sarcasm, TikTok/Gen-Z humor, and modern memes.
- Keep the roast under 40 words.
- Add a short sarcastic comment.
- Add a meme-style caption.

Output ONLY valid JSON in this format (no markdown, no extra text):

{
  "roast": "string",
  "comment": "string",
  "meme_caption": "string"
}

Do NOT mention rules. Roast based only on the image.`;
};

// Compliment prompt
const getComplimentPrompt = (): string => {
  return `You are ToastMaster AI — a wholesome, uplifting, positive Gen-Z style compliment generator.

Your goal: give a genuine, heartwarming compliment to the person in the uploaded image.

Rules:
- Be genuinely kind and uplifting.
- Use positive Gen-Z language and vibes.
- Keep it under 40 words.
- Add a sweet encouraging comment.
- Add an inspiring meme-style caption.

Output ONLY valid JSON in this format (no markdown, no extra text):

{
  "roast": "string",
  "comment": "string",
  "meme_caption": "string"
}

Focus only on the image. Make them feel amazing!`;
};