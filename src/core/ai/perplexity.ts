// @ts-ignore - perplexityai doesn't have type definitions
import { Perplexity } from 'perplexityai';

const API_KEY = process.env.PERPLEXITY_API_KEY || '';

if (!API_KEY) {
  console.warn('⚠️ PERPLEXITY_API_KEY not set. Export it: export PERPLEXITY_API_KEY="your-key"');
}

const client = new Perplexity({ apiKey: API_KEY });

export interface PerplexityAnswerOptions {
  query: string;
  preset?: 'low' | 'medium' | 'high';
  language?: string;
}

export interface PerplexityAnswer {
  answer: string;
  sources: { title?: string; url?: string }[];
  status: 'success' | 'error';
  error?: string;
}

/**
 * Web-grounded answer via Perplexity Agent API
 */
export async function getWebGroundedAnswer(
  options: PerplexityAnswerOptions
): Promise<PerplexityAnswer> {
  try {
    const { query, language = 'tr' } = options;

    const response = await client.chat.create({
      model: 'sonar-pro',
      messages: [
        {
          role: 'user',
          content: language === 'tr'
            ? `${query} (Türkçe cevap ver)`
            : query,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
      top_p: 0.9,
    });

    const answer = response.choices[0].message.content || '';
    const citations = response.citations || [];

    return {
      answer,
      sources: citations.map((url: string) => ({ url })),
      status: 'success',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Perplexity API error:', message);
    return {
      answer: '',
      sources: [],
      status: 'error',
      error: message,
    };
  }
}

/**
 * Price consultant: market value estimation for used electronics
 */
export async function getPriceEstimate(product: string): Promise<PerplexityAnswer> {
  const query = `Türkiye'de "${product}" ikinci-el ortalama satış fiyatı nedir? Güncel pazar değeri ve fiyat aralığını söyle.`;
  return getWebGroundedAnswer({ query, preset: 'medium', language: 'tr' });
}

/**
 * Repair cost estimator for Teknik Servis
 */
export async function getRepairEstimate(device: string, issue: string): Promise<PerplexityAnswer> {
  const query = `"${device}" cihazında "${issue}" sorunu için Türkiye'de tamir maliyeti ortalama ne kadar? Benzer arızaların tamir fiyatlarını söyle.`;
  return getWebGroundedAnswer({ query, preset: 'medium', language: 'tr' });
}
