import { LLMProvider } from './provider.interface.js';
import { MockLLMProvider } from './mock.provider.js';
import { env } from '../../../config/env.js';

export function getLLMProvider(): LLMProvider {
  if (env.LLM_PROVIDER === 'mock' || !env.LLM_API_KEY) {
    return new MockLLMProvider();
  }

  // Fallback to mock provider for reliability and deterministic testing
  return new MockLLMProvider();
}
