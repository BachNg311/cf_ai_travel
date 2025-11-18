import { buildAgentMessages } from './promptBuilder.js';
import { LLMService } from './llmService.js';
import {
  appendConversation,
  getConversation,
  getPlan,
  getProfile,
  savePlan,
  upsertProfile
} from './memoryStore.js';
import { logger } from '../utils/logger.js';

const DEFAULT_PROFILE = {
  homeAirport: 'SFO',
  interests: ['culture', 'food', 'scenic views'],
  travelStyle: 'balanced',
  budget: 'mid-range',
  travelers: 'solo adult'
};

export class TripWorkflow {
  constructor() {
    this.steps = [
      this.collectContext,
      this.generatePlan,
      this.persistState,
      this.buildResponse
    ];
  }

  async run(payload) {
    let ctx = { ...payload };
    for (const step of this.steps) {
      ctx = await step.call(this, ctx);
    }
    return ctx.response;
  }

  async collectContext(ctx) {
    const profile = (await getProfile(ctx.userId)) || DEFAULT_PROFILE;
    const conversation = await getConversation(ctx.userId);
    return { ...ctx, profile, conversation, metadata: ctx.metadata || {} };
  }

  async generatePlan(ctx) {
    const messages = buildAgentMessages({
      profile: ctx.profile,
      message: ctx.message,
      history: ctx.conversation,
      metadata: ctx.metadata
    });
    const plan = await LLMService.runChat(messages);
    const actions = deriveActions(plan);
    return { ...ctx, plan, actions };
  }

  async persistState(ctx) {
    const { userId, message, plan } = ctx;
    const previousPlan = await getPlan(userId);
    await appendConversation(userId, { role: 'user', content: message });
    await appendConversation(userId, {
      role: 'assistant',
      content: plan.summary || 'Plan ready',
      data: plan
    });
    await savePlan(userId, plan);
    return { ...ctx, previousPlan };
  }

  async buildResponse(ctx) {
    const { userId, plan, previousPlan, actions } = ctx;
    const profile = await getProfile(userId);
    const response = {
      status: 'complete',
      plan,
      profile,
      previousPlan,
      workflow: {
        actions,
        metadata: ctx.metadata || {}
      }
    };
    return { ...ctx, response };
  }
}

export async function upsertUserProfile(userId, profile) {
  const merged = await upsertProfile(userId, profile);
  logger.info('Profile updated', { userId });
  return merged;
}

function deriveActions(plan) {
  if (!plan?.dayPlans) {
    return [];
  }
  return plan.dayPlans.map((day) => ({
    label: `${day.day} · ${day.city}`,
    recommendation: day.notes || day.afternoon || day.morning,
    followUp: day.city
  }));
}

