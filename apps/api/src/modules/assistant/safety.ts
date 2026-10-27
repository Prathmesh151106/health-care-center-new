import { DISCLAIMER_EN, DISCLAIMER_HI } from './prompts.js';

// Crisis and emergency keywords in English and Hindi
const EMERGENCY_PATTERNS = [
  /chest\s*pain/i,
  /heart\s*attack/i,
  /stroke/i,
  /severe\s*bleeding/i,
  /suicid/i,
  /kill\s*myself/i,
  /self\s*harm/i,
  /overdose/i,
  /can't\s*breathe/i,
  /cannot\s*breathe/i,
  /difficulty\s*breathing/i,
  /seizure/i,
  /unconscious/i,
  // Hindi terms
  /छाती\s*में\s*दर्द/,
  /दिल\s*का\s*दौरा/,
  /आत्महत्या/,
  /सांस\s*नहीं\s*आ\s*रही/,
  /बेहोश/,
  /खून\s*बह\s*रहा/
];

const EMERGENCY_RESPONSE_EN = `CRITICAL: Your message describes potential emergency symptoms or distress. Please immediately contact your local emergency medical services (such as 911, 112, or 108 depending on your location) or go to the nearest emergency clinic right away. If you are experiencing thoughts of self-harm, please connect with a crisis helpline immediately. Do not wait for online responses.`;

const EMERGENCY_RESPONSE_HI = `महत्वपूर्ण चेतावनी: आपका संदेश संभावित आपातकालीन स्थिति या खतरे का संकेत देता है। कृपया तुरंत अपनी स्थानीय आपातकालीन चिकित्सा सेवा (जैसे 112 या 108) पर कॉल करें या निकटतम अस्पताल/आपातकालीन कक्ष में जाएं। यदि आप संकट में हैं, तो कृपया तत्काल हेल्पलाइन या किसी परिजन से संपर्क करें। ऑनलाइन उत्तर की प्रतीक्षा न करें।`;

export function checkEmergency(message: string, locale: string = 'en'): { isEmergency: boolean; response?: string } {
  for (const pattern of EMERGENCY_PATTERNS) {
    if (pattern.test(message)) {
      return {
        isEmergency: true,
        response: locale === 'hi' ? EMERGENCY_RESPONSE_HI : EMERGENCY_RESPONSE_EN
      };
    }
  }
  return { isEmergency: false };
}

// Post-filter to block diagnosis and dosage claims
const UNSAFE_POST_PATTERNS = [
  /you\s+(have|are\s+diagnosed\s+with)\s+[a-z]+/i,
  /i\s+diagnose\s+you/i,
  /take\s+\d+\s*(mg|ml|tablets|pills)/i,
  /stop\s+taking\s+your\s+med/i,
  /increase\s+your\s+dose/i,
  /decrease\s+your\s+dose/i
];

export function sanitizeAssistantOutput(output: string, locale: string = 'en'): string {
  for (const pattern of UNSAFE_POST_PATTERNS) {
    if (pattern.test(output)) {
      return locale === 'hi'
        ? 'मैं केवल सामान्य स्वास्थ्य मार्गदर्शन दे सकता हूँ। किसी भी दवा, खुराक या निदान के लिए कृपया अपने चिकित्सक से परामर्श लें।'
        : 'I can only provide general wellness education. For any diagnosis, prescription, or medication dosage adjustments, please consult your physician directly.';
    }
  }
  return output;
}

export function getDisclaimer(locale: string = 'en'): string {
  return locale === 'hi' ? DISCLAIMER_HI : DISCLAIMER_EN;
}
