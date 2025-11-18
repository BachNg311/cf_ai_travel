function formatProfile(profile = {}) {
  if (!profile || Object.keys(profile).length === 0) {
    return 'No prior preferences captured yet.';
  }
  const { homeAirport, interests = [], budget, travelStyle, travelers } = profile;
  return [
    homeAirport ? `Home airport: ${homeAirport}` : null,
    travelers ? `Travel party: ${travelers}` : null,
    travelStyle ? `Preferred style: ${travelStyle}` : null,
    budget ? `Budget: ${budget}` : null,
    interests.length ? `Interests: ${interests.join(', ')}` : null
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildAgentMessages({ profile, message, history = [], metadata = {} }) {
  const sanitizedHistory = history
    .slice(-6)
    .filter((msg) => msg?.role && msg?.content)
    .map((msg) => ({ role: msg.role, content: msg.content }));
  const systemPrompt = [
    'You are the Cloudflare Travel Concierge, an AI agent orchestrated by Cloudflare Agents, Workflows, Durable Objects and Workers AI.',
    'You blend structured planning with empathetic tone.',
    '',
    'CRITICAL: You MUST respond with ONLY valid JSON. No markdown, no explanations, no extra text.',
    'Start your response with { and end with }',
    '',
    'Required JSON structure:',
    '{',
    '  "title": "Trip title",',
    '  "summary": "One sentence overview",',
    '  "travelerPersona": "Who this is for",',
    '  "dayPlans": [',
    '    {',
    '      "day": "Day 1",',
    '      "city": "City name",',
    '      "morning": "Morning activities",',
    '      "afternoon": "Afternoon activities",',
    '      "evening": "Evening activities",',
    '      "notes": "Practical tips"',
    '    }',
    '  ],',
    '  "travelTips": ["tip1", "tip2"],',
    '  "memoryHints": ["preference1", "preference2"]',
    '}',
    '',
    'Your plans should cite neighborhoods, transport modes, and pacing aligned with the persona.',
    'Explicitly reference any constraints (dates, weather, accessibility, remote work windows).',
    'Remember: Output ONLY the JSON object, nothing else.'
  ].join('\n');

  const contextBlock = [
    'Traveler profile:',
    formatProfile(profile),
    metadata.travelMonth ? `Target month: ${metadata.travelMonth}` : null,
    metadata.departureCity ? `Departure city: ${metadata.departureCity}` : null,
    metadata.durationDays ? `Trip duration: ${metadata.durationDays} days (create ${metadata.durationDays} dayPlans)` : null
  ]
    .filter(Boolean)
    .join('\n');

  const messages = [
    { role: 'system', content: systemPrompt },
    ...sanitizedHistory,
    {
      role: 'user',
      content: `${contextBlock}\n\nLatest traveler request:\n${message}`
    }
  ];
  return messages;
}

export function buildMemoryPrompt(plan) {
  return [
    'Summarize the key enduring preferences contained in this JSON plan.',
    'Return bullet sentences under 120 characters. Focus on tastes, pacing, constraints.',
    'Plan JSON:',
    JSON.stringify(plan)
  ].join('\n');
}

