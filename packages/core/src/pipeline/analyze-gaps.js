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

/**
 * Analyze probe execution results and produce a readiness report.
 * @param {import('../llm/anthropic.js').AnthropicProvider} llm
 * @param {Object} options
 * @param {Array} options.results - Probe execution results
 * @returns {Promise<Object>} Gap analysis with scores, gaps, and interpretation
 */
export async function analyzeGaps(llm, { results }) {
  if (!results || !Array.isArray(results)) {
    throw new Error('Missing results array');
  }

  const probesSummary = results.map(r =>
    `[${r.category}] Q: ${r.question}\nConfidence: ${r.confidence}/5\nAttempt: ${r.attempt}\nGaps: ${r.gaps.join('; ')}`,
  ).join('\n\n');

  const raw = await llm.complete(
    SYSTEM_PROMPT,
    `Here are the probe execution results:\n\n${probesSummary}\n\nAnalyze these results and produce the gap analysis.`,
    { maxTokens: 2048 },
  );

  const text = raw.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '');
  return JSON.parse(text);
}
