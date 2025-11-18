import fetch from 'node-fetch';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { buildMemoryPrompt } from './promptBuilder.js';

const MOCK_PLAN = {
  title: 'Barcelona Remote Work + Culture Sprint',
  summary:
    'Blend morning focus blocks with late-afternoon tapas crawls and seaside resets tailored to remote professionals.',
  travelerPersona: 'Remote professional seeking vibrant neighborhoods, art and easy transit.',
  dayPlans: [
    {
      day: 'Day 1',
      city: 'Barcelona',
      morning: 'Heads-down work session at co-working space near Passeig de Gràcia.',
      afternoon: 'La Sagrada Família small-group tour and Eixample tapas walk.',
      evening: 'Sunset at Bunkers del Carmel followed by paella near Barceloneta.',
      notes: 'Purchase T-mobilitat card for unlimited transit.'
    },
    {
      day: 'Day 2',
      city: 'Barcelona',
      morning: 'Coffee at Nomad Coffee Lab and async work at hotel lounge.',
      afternoon: 'Picasso Museum visit and Gothic Quarter architecture stroll.',
      evening: 'Flamenco show in El Born with late-night churros.',
      notes: 'Reserve timed tickets to avoid queues.'
    }
  ],
  travelTips: [
    'Use Hola Barcelona card for 48/72 hour metro coverage.',
    'Pre-book popular attractions two weeks in advance.',
    'Restaurants start dinner after 8pm; plan snacks.'
  ],
  memoryHints: [
    'Prefers co-working friendly itineraries.',
    'Enjoys art, tapas and scenic overlooks.',
    'Flexible budget for immersive experiences.'
  ]
};

function extractJson(text) {
  if (!text || typeof text !== 'string') {
    return null;
  }
  const fenced = text.match(/```json([\s\S]*?)```/i);
  const payload = fenced ? fenced[1] : text;
  try {
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

export class LLMService {
  static async runChat(messages) {
    if (env.mockLLM || !env.cloudflareAccountId || !env.cloudflareApiToken) {
      logger.warn('LLM running in mock mode');
      return MOCK_PLAN;
    }

    const baseUrl =
      env.cloudflareAIGatewayUrl?.replace(/\/$/, '') ||
      `https://api.cloudflare.com/client/v4/accounts/${env.cloudflareAccountId}/ai/run`;
    const url = `${baseUrl}/${env.cloudflareModel}`;

    logger.info('Calling Workers AI', {
      url,
      model: env.cloudflareModel,
      accountId: env.cloudflareAccountId?.substring(0, 8) + '...',
      hasToken: !!env.cloudflareApiToken
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.cloudflareApiToken}`
        },
        body: JSON.stringify({ 
          messages,
          max_tokens: 8192
        })
      });

      if (!response.ok) {
        const body = await response.text();
        logger.error('Workers AI request failed', {
          status: response.status,
          body
        });
        return MOCK_PLAN;
      }

      const data = await response.json();
      const raw =
        data?.result?.response ||
        data?.result?.output?.text ||
        data?.result?.answer ||
        data?.response;
      
      logger.info('Workers AI response received', { 
        length: raw?.length,
        preview: raw?.substring(0, 100) + '...'
      });
      
      const parsed = extractJson(raw);
      if (parsed && parsed.dayPlans) {
        return parsed;
      }
      
      // If LLM returned text but not valid JSON, wrap it in a minimal plan
      logger.warn('LLM response was not valid JSON, creating fallback plan from text');
      return {
        title: 'Travel Plan',
        summary: typeof raw === 'string' ? raw.substring(0, 300) : 'Plan generated',
        dayPlans: []
      };
    } catch (error) {
      logger.error('Workers AI call threw', { error: error.message });
      return MOCK_PLAN;
    }
  }

  static async summarizeMemories(plan) {
    if (env.mockLLM) {
      return plan.memoryHints || [];
    }
    const prompt = buildMemoryPrompt(plan);
    const response = await this.runChat([{ role: 'user', content: prompt }]);
    if (Array.isArray(response)) {
      return response;
    }
    if (typeof response === 'string') {
      return response.split('\n').map((line) => line.replace(/^[-*]\s*/, '').trim());
    }
    return plan.memoryHints || [];
  }
}

