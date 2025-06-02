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
You are an AI assistant with expertise in natural language moderation in Vietnamese, English, and Japanese.

Your task is to **lightly** censor the following comment by replacing **only clearly offensive or vulgar words** (e.g., common swear words, strong insults, or sexually explicit terms) with three asterisks "***".

Guidelines:
- Only censor words or expressions that are **obviously** offensive, vulgar, or hateful.
- Do NOT censor mild sarcasm, playful language, or borderline content that is not explicitly offensive.
- Do NOT censor technical terms, names, slang, or expressions that are ambiguous or innocuous.
- Do not over-censor. Be lenient unless the term is **unquestionably** inappropriate.

Examples of what to censor: "fuck", "shit", "bitch", "đụ", "lồn", "くそ", "chó má", etc.
Obfuscated forms like "f***", "sh1t", "d@mn", "đ* m*", etc. should also be censored only if clearly meant to offend.

Return only the censored comment — no explanation, no extra text.

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

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small', // ✅ model rẻ nhất
        input: text,
        encoding_format: 'float',
      });

      const embedding = response.data[0]?.embedding;
      if (!embedding) {
        throw new Error('No embedding returned');
      }

      return embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new Error('Failed to generate embedding');
    }
  }
}
