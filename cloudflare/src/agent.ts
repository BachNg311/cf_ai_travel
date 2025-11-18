import { Agent, AgentNamespace, callable } from 'agents';

type Env = {
  AI: Ai;
};

type TravelState = {
  profile: Record<string, unknown>;
  lastPlan?: {
    summary: string;
    dayPlans: Array<Record<string, string>>;
  };
};

export class TravelAgent extends Agent<Env, TravelState> {
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
      '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
      {
        messages: [
          { role: 'system', content: 'Travel planning JSON-only assistant.' },
          { role: 'user', content: prompt }
        ]
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

export default new AgentNamespace({
  TravelAgent
});

