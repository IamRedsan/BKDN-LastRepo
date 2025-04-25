import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async censorComment(text: string): Promise<string> {
    const prompt = `
    You are an advanced AI specialized in natural language processing with expertise in identifying and moderating harmful, offensive, and inappropriate content in online comments, across Vietnamese, English, and Japanese.
    
    Your task is to analyze the following comment and censor any **clearly** harmful, offensive, or explicit expressions. This includes:
    - Swear words, slurs, or hate speech in Vietnamese, English, or Japanese.
    - Masked or obfuscated profanity (e.g., "f***", "sh1t", "a$$", "b1tch", "d@mn", "đ* m*", "l*n", "くそ", etc.).
    - Explicit sexual or violent content.
    
    **Only censor words or phrases that are clearly intended to offend, insult, or shock.**
    - Do NOT censor technical terms, names, or innocuous phrases even if they contain special characters or resemble obfuscated words.
    - Allow mild sarcasm or playful banter as long as it's not overtly offensive or disrespectful.
    
    Replace each offensive expression with exactly three asterisks "***", while keeping the rest of the sentence natural and intact.
    
    Return only the censored comment — do NOT include any prefixes like "Comment:", explanations, or formatting. Only return the censored version of the comment as plain text.
    
    Original comment: ${text}
    `.trim();

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
        temperature: 0.7,
      });
      return response.choices[0].message.content?.trim() || '';
    } catch (error) {
      console.error('Error censoring comment:', error);
      throw new Error('Failed to censor comment');
    }
  }
}
