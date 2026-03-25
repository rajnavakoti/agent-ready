import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const SYSTEM_PROMPT = `You are a battle-test analyzer for AgentReady. Given the results of stress-test probes against an agent's knowledge base and harness, you produce a readiness assessment.

Analyze the probe results and produce:

1. CATEGORY SCORES — Rate coverage (0-100) for each area:
   - knowledge_depth: How well the knowledge base covers the agent's domain
   - knowledge_breadth: How many areas of the domain are covered vs missing
   - harness_coverage: How well the agent's skills, rules, and tools handle the scenarios tested
   - edge_case_handling: How robust the agent is against corner cases and adversarial inputs
   - cross_domain: How well the agent handles questions spanning multiple areas
   - tribal_knowledge: Undocumented operational wisdom that's missing from both knowledge and harness

2. OVERALL READINESS SCORE — Weighted average (0-100). Harness coverage and edge cases weigh 1.5x because they determine real-world reliability.

3. TOP GAPS — The 10 most critical blind spots, ordered by impact. Each gap should specify:
   - what: What specific capability or knowledge is missing
   - target: "knowledge", "harness", or "both" — which layer has the gap
   - impact: Why this gap will cause failures (one sentence)
   - severity: "critical", "high", or "medium"
   - fix: One-line recommendation for how to fix it

4. INTERPRETATION — One paragraph battle assessment. Be direct: is this agent ready for production or not? What's the biggest risk?

Return ONLY a JSON object with fields: categories (object with scores), overallScore (number), topGaps (array), interpretation (string).`;

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { results } = JSON.parse(event.body);

    if (!results || !Array.isArray(results)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing results array' })
      };
    }

    const probesSummary = results.map(r =>
      `[${r.category}] Q: ${r.question}\nConfidence: ${r.confidence}/5\nAttempt: ${r.attempt}\nGaps: ${r.gaps.join('; ')}`
    ).join('\n\n');

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Here are the probe execution results:\n\n${probesSummary}\n\nAnalyze these results and produce the gap analysis.`
        }
      ]
    });

    const raw = response.content[0].text;
    const text = raw.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '');
    const analysis = JSON.parse(text);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysis })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to analyze gaps', detail: error.message })
    };
  }
}
