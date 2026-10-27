import { LLMProvider, LLMMessage, LLMGenerateOptions } from './provider.interface.js';

export class MockLLMProvider implements LLMProvider {
  async generate(messages: LLMMessage[], _options?: LLMGenerateOptions): Promise<string> {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content.toLowerCase() || '';

    if (lastUserMessage.includes('water') || lastUserMessage.includes('पानी')) {
      return 'Staying well hydrated is essential for energy levels and overall wellbeing. Most adults benefit from aiming for 2 to 3 liters of water across the day.';
    }

    if (lastUserMessage.includes('sleep') || lastUserMessage.includes('नींद')) {
      return 'A consistent bedtime routine and limiting screen time 30 minutes before sleep can support deeper rest and better sleep quality.';
    }

    if (lastUserMessage.includes('steps') || lastUserMessage.includes('walk') || lastUserMessage.includes('कदम')) {
      return 'Regular brisk walks are a great way to stay active, support cardiovascular health, and boost your daily mood.';
    }

    return 'I am your general wellness companion. I can share lifestyle tips, hydration reminders, and healthy habit suggestions. Always consult your doctor for medical advice.';
  }
}
