import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const SYSTEM_PROMPT = `You are a battle-test probe generator for AgentReady. Given an agent's knowledge base, harness (skills/rules/tools/system prompts), and mission, you generate stress-test scenarios that probe both knowledge completeness AND harness coverage.

The input will be structured as:
- AGENT MISSION: what the agent is supposed to do
- KNOWLEDGE BASE: the docs/context the agent has access to
- AGENT HARNESS: (optional) skills, rules, tools, system prompts the agent uses

Generate probes across these categories:
1. INCIDENT — A realistic crisis scenario the agent must handle
2. EDGE_CASE — A corner case that tests boundary knowledge and harness rules
3. KNOWLEDGE_GAP — A question that requires knowledge likely NOT in the provided docs
4. HARNESS_COVERAGE — A scenario testing whether the agent's skills/tools/rules can handle it
5. CROSS_DOMAIN — A question spanning multiple areas of the agent's knowledge
6. ADVERSARIAL — A misleading or ambiguous scenario that tests robustness

Each probe should be:
- Specific to THIS agent's mission and domain — not generic
- Realistic — something that would actually happen in production
- Designed to find blind spots — where knowledge exists but harness doesn't cover it, or vice versa
- Escalating in difficulty if more probes are requested

Return a JSON array of objects with fields: category, question, description (one line explaining what this probe tests), target (either "knowledge", "harness", or "both").
Return ONLY the JSON array, no other text.`;

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { description } = JSON.parse(event.body);

    if (!description || description.length < 50) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Domain description must be at least 50 characters' })
      };
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Here is the agent configuration:\n\n${description}\n\nGenerate targeted battle-test probes for this agent. Be ruthless — find the blind spots.`
        }
      ]
    });

    const raw = response.content[0].text;
    const text = raw.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '');
    const probes = JSON.parse(text);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ probes })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate probes', detail: error.message })
    };
  }
}
