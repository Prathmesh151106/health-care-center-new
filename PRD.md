# Product Requirements Document (PRD)
## Daily Health Companion v2 (Advanced Prototype)

| Field | Value |
|---|---|
| Version | 2.0 (Prototype) |
| Status | Draft |
| Platforms | Web (PWA), responsive mobile |
| Frontend | React + Vite + TypeScript (Vercel) |
| Backend | Node.js + Express + TypeScript (Render) |
| Database | PostgreSQL (Render) |

---

## 1. Problem Statement

Most people track health in scattered ways: notes, memory, or several separate apps. They forget medicines, skip water and sleep goals, and have no simple view of their daily habits. Existing apps are either too complex or too boring to use daily.

**Daily Health Companion v2** is a single, friendly, engaging app that helps a person log daily health data, get timely reminders, see progress visually, and ask an AI assistant for general wellness guidance.

> The AI assistant gives general wellness information only. It is not a doctor and does not diagnose.

## 2. Goals and Non-Goals

### Goals
1. Make daily health logging take under 30 seconds.
2. Deliver reliable reminders (medicine, water, exercise, sleep).
3. Show progress through an animated, visually rich dashboard.
4. Offer a safe AI wellness assistant with context from the user's own logs.
5. Protect user data with strong auth, privacy controls and data export/delete.

### Non-Goals (v2)
- Medical diagnosis or treatment advice.
- Integration with hospitals or insurance.
- Native mobile apps (PWA is used instead).
- Payments or subscriptions.

## 3. Target Users (Personas)

| Persona | Need |
|---|---|
| Busy student/professional | Quick logging, reminders, habit streaks |
| Elderly person / caregiver | Large UI, medicine reminders, simple language |
| Fitness beginner | Goals, progress charts, motivation |

## 4. Feature Requirements

Priority: **P0** = must have, **P1** = should have, **P2** = nice to have.

### 4.1 Authentication and Profile (P0)
- Register/login with email + password; Google OAuth (P1).
- JWT access token + rotating refresh token (httpOnly cookie).
- Profile: name, age, height, weight, goals, language, timezone.
- Password reset by email.

### 4.2 Daily Health Logs (P0)
- Log types: water, sleep, steps, weight, mood, blood pressure, blood sugar, symptoms, notes.
- Create, edit, delete, and view history with filters by date and type.
- Custom daily goals per log type.

### 4.3 Medicine Manager (P0)
- Add medicine: name, dose, schedule (times/days), start/end date.
- Mark as taken / skipped / snoozed.
- Adherence percentage and missed-dose history.

### 4.4 Reminders and Notifications (P0)
- Scheduled reminders for medicine, water, exercise, sleep, appointments.
- Delivery: in-app, Web Push, email (P1).
- Snooze, repeat rules, quiet hours.

### 4.5 Dashboard and Analytics (P0)
- Today view: goals ring, upcoming reminders, streak.
- Weekly and monthly trend charts.
- Habit streaks and achievement badges (P1).

### 4.6 AI Wellness Assistant (P1)
- Chat interface answering general wellness questions.
- Optional context from the user's recent logs (user must opt in).
- Weekly AI-generated summary and gentle suggestions.
- Safety layer: disclaimers, emergency keywords trigger "seek medical help" message, no diagnosis or dosage advice.

### 4.7 Animated / 3D Experience (P1)
- Animated landing and dashboard using Framer Motion.
- 3D hero element (e.g., floating health orb or heart) using React Three Fiber.
- Progress rings, micro-interactions, dark/light theme.
- Reduced-motion and low-power fallback.

### 4.8 Appointments (P2)
- Add doctor appointments with reminders and notes.

### 4.9 Reports and Export (P2)
- Export logs as PDF/CSV to share with a doctor.

### 4.10 Privacy and Settings (P0)
- Download all my data; delete my account and data.
- Control AI data sharing, notification preferences, theme, language.

### 4.11 Multi-language (P2)
- English and Hindi first, with i18n structure for more.

## 5. Non-Functional Requirements

| Area | Requirement |
|---|---|
| Performance | Dashboard first load under 3s on 4G; API p95 under 300 ms |
| Security | HTTPS only, bcrypt/argon2 hashing, rate limiting, input validation, CORS allowlist, helmet |
| Privacy | Health data encrypted at rest (DB), minimal logging, user-controlled deletion |
| Reliability | 99% uptime target; reminder delivery retries |
| Accessibility | WCAG 2.1 AA, keyboard navigation, large-text mode |
| Compatibility | Latest Chrome, Edge, Safari, Firefox; Android and iOS browsers |
| Scalability | Stateless API, background workers scale separately |

## 6. Success Metrics

| Metric | Target |
|---|---|
| Day-7 retention | 35% |
| Daily active logging rate | 50% of active users |
| Reminder delivery success | 98% |
| Medicine adherence tracked | 70% of reminders acknowledged |
| Average time to log | under 30 s |

## 7. User Flows (Summary)

1. **Onboarding:** Sign up, set profile, choose goals, enable notifications, land on dashboard.
2. **Daily log:** Open app, tap quick-add, pick type, enter value, save, see ring update.
3. **Medicine:** Add medicine, schedule created, reminder fires, user marks taken, adherence updates.
4. **AI chat:** Open assistant, ask question, safety filter, context-aware reply with disclaimer.

## 8. Release Plan

| Phase | Scope |
|---|---|
| Phase 1 (MVP) | Auth, logs, medicines, dashboard, basic reminders |
| Phase 2 | Web Push, analytics charts, animated UI, 3D hero |
| Phase 3 | AI assistant, weekly summary, export |
| Phase 4 | Appointments, i18n, badges, polish and testing |

## 9. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| AI gives unsafe medical advice | System prompt rules, safety filter, disclaimers, no diagnosis |
| Sensitive data leak | Encryption, strict auth, audit, minimal retention |
| Reminders missed | Queue with retries, multi-channel delivery |
| 3D hurts performance | Lazy load, fallback to 2D, reduced-motion support |
| Render free-tier cold starts | Health pings, loading states, upgrade path |

## 10. Open Questions
- Which AI provider/model will be used for the assistant?
- Is email delivery needed in the first prototype?
- Should a caregiver be able to view another user's data (shared access)?
