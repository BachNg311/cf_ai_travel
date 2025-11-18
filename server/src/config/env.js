import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: process.env.PORT || 4000,
  cloudflareAccountId: process.env.CF_ACCOUNT_ID,
  cloudflareApiToken: process.env.CF_API_TOKEN,
  cloudflareAIGatewayUrl: process.env.CF_AI_GATEWAY_URL,
  cloudflareModel:
    process.env.CF_AI_MODEL || '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
  mockLLM: process.env.MOCK_LLM === 'true'
};

