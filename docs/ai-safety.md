# AI Wellness Assistant Safety Guardrails

The AI Wellness Assistant in Daily Health Companion v2 is designed strictly as a lifestyle companion and wellness educator. It does not provide medical diagnosis, treatment recommendations, prescription advice, or dosage adjustments.

## Multi-Stage Safety Pipeline

```
[ User Prompt ]
       │
       ▼
[ Stage 1: Pre-filter Emergency Detector ] ──(Emergency detected)──► [ Immediate Help Response (No LLM Call) ]
       │ (Clean / Non-emergency)
       ▼
[ Stage 2: Privacy-Preserving Context Injection ]
       │ (Opt-in only: 7-day de-identified summaries; NO raw notes or symptoms)
       ▼
[ Stage 3: LLM Generation with Strict System Prompt ]
       │
       ▼
[ Stage 4: Post-filter Sanitizer ] ──(Diagnosis or dosage detected)──► [ Safe Standard Fallback ]
       │
       ▼
[ Attach Mandated Disclaimer (EN / HI) ]
       │
       ▼
[ Delivery to User ]
```

## 1. Emergency Pre-Filter
- Fast regex-based keyword detection in both English and Hindi covering chest pain, heart attacks, strokes, severe bleeding, suicide / self-harm, breathing cessation, and overdose.
- **Bypass Rule:** If triggered, the system immediately returns a caring emergency guidance directive instructing the user to contact local emergency services (112, 108, or 911) or visit an emergency room immediately, without invoking any generative model.

## 2. Privacy-Preserving Health Context
- `aiContextOptIn` is **false** by default.
- When false, zero health metrics, logs, or notes are shared with the LLM provider.
- When true, only compact, de-identified count aggregates over the previous 7 days are provided. No user name, email, free-text notes, or symptoms are ever included in the prompt.

## 3. Post-Filter Sanitizer
- Scans model responses for diagnostic phrases (`"diagnosed with"`, `"you have [condition]"`) and dosage instructions (`"take [X] mg"`, `"stop taking medication"`).
- Replaces unsafe generated replies with a safe educational disclaimer directing the user to consult their physician.

## 4. Multi-lingual Disclaimers
Every single response returned by the assistant includes an explicit disclaimer:
- **English:** `"Disclaimer: General wellness information only. Not medical advice or diagnosis. Always consult a qualified physician."`
- **Hindi:** `"अस्वीकरण: केवल सामान्य स्वास्थ्य जानकारी। यह कोई चिकित्सीय सलाह या निदान नहीं है। हमेशा योग्य चिकित्सक से परामर्श लें।"`
