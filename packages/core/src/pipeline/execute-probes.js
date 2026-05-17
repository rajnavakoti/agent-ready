const SYSTEM_PROMPT = `You are an AI agent attempting to answer domain-specific questions using ONLY the context provided. You must be brutally honest about what you know and what you don't.

For each question:
1. Attempt to answer using ONLY the provided domain description. Do not use general knowledge to fill gaps.
2. Rate your confidence from 1-5:
   - 1: Cannot answer — critical knowledge missing
   - 2: Mostly guessing — major gaps
   - 3: Partial answer — some key details missing
   - 4: Good answer — minor gaps
   - 5: Confident answer — sufficient context available
3. List the SPECIFIC knowledge gaps that prevent a confident answer. Be precise — name the missing systems, processes, terminology, or data structures.

Return a JSON object with fields:
- attempt: your best attempt at answering (2-3 sentences)
- confidence: number 1-5
- gaps: array of strings, each describing a specific knowledge gap

Return ONLY the JSON object, no other text.`;

/**
 * Execute a single probe against the knowledge base.
 * @param {import('../llm/anthropic.js').AnthropicProvider} llm
 * @param {string} description - The knowledge base content
 * @param {Object} probe - The probe to execute
 * @returns {Promise<Object>} Probe result with attempt, confidence, gaps
 */
async function executeSingleProbe(llm, description, probe) {
  const raw = await llm.complete(
    SYSTEM_PROMPT,
    `DOMAIN CONTEXT (this is ALL you know):\n\n${description}\n\nQUESTION: ${probe.question}\n\nAttempt to answer using ONLY the context above. Be honest about gaps.`,
    { maxTokens: 1024 },
  );

  const text = raw.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '');
  const result = JSON.parse(text);

  return {
    category: probe.category,
    question: probe.question,
    probeDescription: probe.description,
    target: probe.target,
    attempt: result.attempt,
    confidence: result.confidence,
    gaps: result.gaps,
  };
}

/**
 * Execute all probes against the knowledge base.
 * @param {import('../llm/anthropic.js').AnthropicProvider} llm
 * @param {Object} options
 * @param {string} options.description - The knowledge base content
 * @param {Array} options.probes - Array of probes to execute
 * @returns {Promise<Array>} Array of probe results
 */
export async function executeProbes(llm, { description, probes }) {
  if (!description || !probes || !Array.isArray(probes)) {
    throw new Error('Missing description or probes array');
  }

  // Truncate description if too long
  const truncated = description.length > 15000
    ? description.substring(0, 15000) + '\n\n[... content truncated ...]'
    : description;

  // Run all probes in parallel
  const results = await Promise.all(
    probes.map(probe => executeSingleProbe(llm, truncated, probe)),
  );

  return results;
}
