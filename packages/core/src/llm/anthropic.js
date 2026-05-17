import Anthropic from '@anthropic-ai/sdk';

/**
 * Anthropic LLM provider.
 */
export class AnthropicProvider {
  constructor(config = {}) {
    this.client = new Anthropic();
    this.model = config.model || 'claude-sonnet-4-20250514';
    this.maxTokens = config.maxTokens || 4096;
  }

  /**
   * Send a completion request.
   * @param {string} systemPrompt
   * @param {string} userMessage
   * @param {Object} [options]
   * @returns {Promise<string>} The response text
   */
  async complete(systemPrompt, userMessage, options = {}) {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: options.maxTokens || this.maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    return response.content[0].text;
  }
}
