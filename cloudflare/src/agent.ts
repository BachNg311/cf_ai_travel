import { Agent, callable, routeAgentRequest } from 'agents';

type Env = {
  AI: {
    run: (
      model: string,
      options: Record<string, unknown>
    ) => Promise<{ response?: unknown }>;
  };
};

type TravelState = {
  profile: Record<string, unknown>;
  lastPlan?: {
    summary: string;
    dayPlans: Array<Record<string, string>>;
  };
};

export class TravelAgent extends Agent<Env, TravelState> {
  declare env: Env;
  onStart() {
    this.setState({
      profile: {},
      lastPlan: undefined
    });
  }

  @callable()
  async updateProfile(profile: Record<string, unknown>) {
    this.setState({
      ...this.state,
      profile: {
        ...this.state.profile,
        ...profile
      }
    });
    return this.state.profile;
  }

  @callable()
  async planTrip(message: string) {
    const prompt = [
      'You are an always-on Cloudflare agent that crafts travel plans.',
      'Respond with concise JSON containing title, summary and dayPlans array.',
      'Traveler profile:',
      JSON.stringify(this.state.profile, null, 2),
      'Request:',
      message
    ].join('\n');

    const { response } = await this.env.AI.run(
      '@cf/meta/llama-3.1-8b-instruct',
      {
        messages: [
          { role: 'system', content: 'Travel planning JSON-only assistant.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 8192
      }
    );

    let plan;
    try {
      plan = JSON.parse(response as string);
    } catch {
      plan = { summary: response, dayPlans: [] };
    }

    this.setState({
      ...this.state,
      lastPlan: plan
    });

    return plan;
  }
}

export default {
  async fetch(request: Request, env: Env & Record<string, unknown>, _ctx: unknown) {
    const response = await routeAgentRequest(request, env, { cors: true });
    if (response) {
      return response;
    }
    return new Response(
      JSON.stringify({
        message: 'Cloudflare agent is deployed. Use the Agents client (ws/http) paths under /agents/:namespace/:room.'
      }),
      {
        status: 200,
        headers: {
          'content-type': 'application/json'
        }
      }
    );
  },
  TravelAgent
};

