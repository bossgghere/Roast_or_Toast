import OpenAI from 'openai';
import { GeminiResponse } from '../types/index.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const generateRoastOrCompliment = async (
  imageBuffer: Buffer,
  type: 'roast' | 'compliment'
): Promise<GeminiResponse> => {
  try {
    const base64Image = imageBuffer.toString('base64');
    const prompt = type === 'roast' ? getRoastPrompt() : getComplimentPrompt();

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 300
    });

    const content = response.choices[0].message.content || '';
    
    console.log('AI Response:', content);
    
    // Remove markdown code blocks
    let cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Parse JSON
    const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to parse response:', cleanContent);
      throw new Error('Invalid AI response format');
    }

    const parsed: GeminiResponse = JSON.parse(jsonMatch[0]);
    return parsed;

  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate response');
  }
};

const getRoastPrompt = (): string => {
  return `You are RoastMaster AI — a funny, witty Gen-Z comedian who roasts people in a playful way.

Roast the person in this image with humor and sass. Be creative and entertaining!

Style:
- Use Gen-Z slang and TikTok humor
- Be funny, not mean-spirited
- Roast their style, expression, vibes
- Keep it under 50 words
- Make people laugh, not cry

IMPORTANT: You MUST respond with ONLY a valid JSON object in this exact format:

{
  "roast": "your funny roast here",
  "comment": "your sarcastic comment",
  "meme_caption": "your meme caption"
}

Example:
{
  "roast": "Bro really woke up and chose that fit 💀",
  "comment": "The confidence is unmatched though",
  "meme_caption": "POV: You raided your dad's closet"
}

Output ONLY the JSON, nothing else.`;
};

const getComplimentPrompt = (): string => {
  return `You are ToastMaster AI — a wholesome, uplifting Gen-Z hype person!

Give a genuine, warm compliment to the person in this image.

Style:
- Be genuinely kind and positive
- Use uplifting Gen-Z language
- Keep it under 40 words
- Make them feel amazing

IMPORTANT: You MUST respond with ONLY a valid JSON object in this exact format:

{
  "roast": "your compliment here",
  "comment": "your encouraging comment",
  "meme_caption": "your inspiring caption"
}

Example:
{
  "roast": "Main character energy right here! ✨",
  "comment": "You're literally glowing",
  "meme_caption": "When you know you're that person"
}

Output ONLY the JSON, nothing else.`;
};