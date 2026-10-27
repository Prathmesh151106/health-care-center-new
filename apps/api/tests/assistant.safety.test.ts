import { describe, it, expect } from 'vitest';
import { checkEmergency, sanitizeAssistantOutput, getDisclaimer } from '../src/modules/assistant/safety.js';

describe('Phase 6: AI Wellness Assistant Safety Guardrails', () => {
  describe('Emergency Pre-filter (English)', () => {
    const englishEmergencies = [
      'I have severe chest pain and pressure',
      'My left arm hurts and I think I am having a heart attack',
      'I feel like I want to commit suicide',
      'I want to kill myself today',
      'I took an overdose of pills',
      'Cannot breathe and my face is swelling',
      'Having a seizure right now',
      'Severe bleeding that won’t stop'
    ];

    it.each(englishEmergencies)('detects emergency: "%s"', (message) => {
      const result = checkEmergency(message, 'en');
      expect(result.isEmergency).toBe(true);
      expect(result.response).toContain('CRITICAL');
      expect(result.response).toContain('emergency medical services');
    });

    it('passes safe wellness questions without triggering emergency', () => {
      const safeQuestions = [
        'How many cups of water should I drink after a 5km jog?',
        'Can you give me tips to sleep earlier at night?',
        'What are some healthy high-protein vegetarian snacks?',
        'I feel a bit tired today after work'
      ];

      for (const q of safeQuestions) {
        const result = checkEmergency(q, 'en');
        expect(result.isEmergency).toBe(false);
      }
    });
  });

  describe('Emergency Pre-filter (Hindi)', () => {
    const hindiEmergencies = [
      'मेरी छाती में दर्द हो रहा है',
      'लगता है मुझे दिल का दौरा पड़ा है',
      'मुझे सांस नहीं आ रही है',
      'मरीज बेहोश हो गया है',
      'बहुत तेज खून बह रहा है',
      'मुझे आत्महत्या के विचार आ रहे हैं'
    ];

    it.each(hindiEmergencies)('detects Hindi emergency: "%s"', (message) => {
      const result = checkEmergency(message, 'hi');
      expect(result.isEmergency).toBe(true);
      expect(result.response).toContain('महत्वपूर्ण चेतावनी');
      expect(result.response).toContain('112');
    });

    it('passes safe Hindi wellness questions', () => {
      const safeHindi = [
        'मुझे रोजाना कितना पानी पीना चाहिए?',
        'अच्छी नींद के लिए क्या करना चाहिए?',
        'सुबह की सैर के क्या फायदे हैं?'
      ];

      for (const q of safeHindi) {
        const result = checkEmergency(q, 'hi');
        expect(result.isEmergency).toBe(false);
      }
    });
  });

  describe('Output Sanitizer Post-filter', () => {
    it('replaces diagnostic statements with safe disclaimer', () => {
      const unsafeOutput = 'Based on your symptoms, you are diagnosed with diabetes.';
      const sanitized = sanitizeAssistantOutput(unsafeOutput, 'en');
      expect(sanitized).not.toContain('diagnosed with diabetes');
      expect(sanitized).toContain('general wellness education');
    });

    it('replaces dosage and prescription suggestions', () => {
      const unsafeDosage = 'You should take 500 mg of paracetamol twice daily.';
      const sanitized = sanitizeAssistantOutput(unsafeDosage, 'en');
      expect(sanitized).not.toContain('500 mg');
      expect(sanitized).toContain('consult your physician directly');
    });

    it('preserves safe wellness replies', () => {
      const safeOutput = 'Aiming for 8 hours of consistent sleep supports physical recovery.';
      const sanitized = sanitizeAssistantOutput(safeOutput, 'en');
      expect(sanitized).toBe(safeOutput);
    });
  });

  describe('Disclaimers', () => {
    it('returns appropriate disclaimers in English and Hindi', () => {
      expect(getDisclaimer('en')).toContain('General wellness information only');
      expect(getDisclaimer('hi')).toContain('केवल सामान्य स्वास्थ्य जानकारी');
    });
  });
});
