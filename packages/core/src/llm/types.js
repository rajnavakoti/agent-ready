/**
 * LLM Provider interface.
 * @typedef {Object} LLMProvider
 * @property {function(string, string, {maxTokens?: number}): Promise<string>} complete
 */

/**
 * @typedef {Object} LLMConfig
 * @property {string} model
 * @property {number} [maxTokens]
 * @property {number} [temperature]
 */

export {};
