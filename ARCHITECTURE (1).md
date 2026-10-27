# ARCHITECTURE
## Daily Health Companion v2

## 1. Overview

A monorepo with a React frontend, an Express API, and a background worker, backed by PostgreSQL and Redis.

```
                    ┌─────────────────────────┐
                    │   Browser / PWA (React) │
                    │  Vercel                 │
                    └────────────┬────────────┘
                                 │ HTTPS (REST + JWT)
                    ┌────────────▼────────────┐
                    │  API Server (Express)   │
                    │  Render Web Service     │
                    └───┬─────────┬───────┬───┘
                        │         │       │
            ┌───────────▼──┐  ┌───▼────┐  ┌▼─────────────┐
            │ PostgreSQL   │  │ Redis  │  │ AI Provider  │
            │ (Render)     │  │ queue  │  │ (LLM API)    │
            └──────────────┘  └───┬────┘  └──────────────┘
                                  │
                    ┌─────────────▼───────────┐
                    │ Worker (BullMQ)         │
                    │ reminders, push, email, │
                    │ weekly summaries        │
                    └─────────────────────────┘
```

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, React Three Fiber (+ drei), TanStack Query, Zustand, React Router, Recharts, i18next |
| Backend | Node.js, Express, TypeScript, Zod (validation), Prisma ORM, Pino (logging) |
| Database | PostgreSQL |
| Queue/Cache | Redis + BullMQ |
| Auth | JWT access token + refresh token rotation (httpOnly cookie), argon2 |
| Notifications | Web Push (VAPID) + Nodemailer (email) |
| AI | Provider-agnostic LLM service with safety layer |
| Testing | Vitest, React Testing Library, Supertest, Playwright |
| DevOps | Docker, Docker Compose, GitHub Actions, Render, Vercel |

## 3. Directory Structure

```
daily-health-companion/
├── README.md
├── PRD.md
├── ARCHITECTURE.md
├── LICENSE
├── .gitignore
├── .editorconfig
├── .env.example
├── package.json                  # npm workspaces root
├── docker-compose.yml            # postgres + redis + api + worker + web
├── render.yaml                   # Render blueprint (api, worker, db, redis)
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                # lint, typecheck, test, build
│   │   └── deploy.yml
│   └── pull_request_template.md
│
├── docs/
│   ├── api.md                    # endpoint reference
│   ├── database.md               # ERD + table notes
│   ├── security.md
│   ├── ai-safety.md              # assistant rules and prompts policy
│   └── diagrams/
│
├── apps/
│   ├── web/                      # ───────── FRONTEND ─────────
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   ├── tailwind.config.ts
│   │   ├── vercel.json
│   │   ├── public/
│   │   │   ├── manifest.webmanifest
│   │   │   ├── icons/
│   │   │   └── sw.js             # service worker (push + offline)
│   │   └── src/
│   │       ├── main.tsx
│   │       ├── App.tsx
│   │       ├── routes/
│   │       │   ├── index.tsx
│   │       │   └── ProtectedRoute.tsx
│   │       ├── pages/
│   │       │   ├── Landing/
│   │       │   ├── Auth/         # Login, Register, ForgotPassword
│   │       │   ├── Dashboard/
│   │       │   ├── Logs/
│   │       │   ├── Medicines/
│   │       │   ├── Reminders/
│   │       │   ├── Appointments/
│   │       │   ├── Analytics/
│   │       │   ├── Assistant/    # AI chat
│   │       │   ├── Settings/     # profile, privacy, notifications
│   │       │   └── NotFound/
│   │       ├── components/
│   │       │   ├── ui/           # Button, Card, Modal, Input, Toast
│   │       │   ├── layout/       # Navbar, Sidebar, AppShell
│   │       │   ├── charts/       # TrendChart, ProgressRing, Heatmap
│   │       │   ├── three/        # HeroOrb, FloatingHeart, SceneCanvas
│   │       │   ├── logs/
│   │       │   ├── medicines/
│   │       │   └── assistant/    # ChatWindow, MessageBubble, Disclaimer
│   │       ├── features/         # feature logic (api hooks + state)
│   │       │   ├── auth/
│   │       │   ├── logs/
│   │       │   ├── medicines/
│   │       │   ├── reminders/
│   │       │   ├── assistant/
│   │       │   └── analytics/
│   │       ├── hooks/            # useDebounce, usePushSubscription, useReducedMotion
│   │       ├── lib/
│   │       │   ├── apiClient.ts  # axios/fetch + token refresh
│   │       │   ├── queryClient.ts
│   │       │   └── push.ts
│   │       ├── store/            # Zustand stores
│   │       ├── i18n/
│   │       │   ├── index.ts
│   │       │   └── locales/{en,hi}.json
│   │       ├── styles/
│   │       │   ├── globals.css
│   │       │   └── theme.css
│   │       ├── types/
│   │       └── utils/
│   │
│   ├── api/                      # ───────── BACKEND API ─────────
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── Dockerfile
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   └── src/
│   │       ├── server.ts         # bootstraps HTTP server
│   │       ├── app.ts            # express app, middleware wiring
│   │       ├── config/
│   │       │   ├── env.ts        # Zod-validated env
│   │       │   ├── db.ts
│   │       │   └── redis.ts
│   │       ├── middleware/
│   │       │   ├── auth.ts
│   │       │   ├── validate.ts
│   │       │   ├── rateLimit.ts
│   │       │   ├── errorHandler.ts
│   │       │   └── requestLogger.ts
│   │       ├── modules/          # one folder per domain
│   │       │   ├── auth/         # routes, controller, service, schema
│   │       │   ├── users/
│   │       │   ├── logs/
│   │       │   ├── medicines/
│   │       │   ├── reminders/
│   │       │   ├── appointments/
│   │       │   ├── analytics/
│   │       │   ├── notifications/
│   │       │   ├── assistant/
│   │       │   │   ├── assistant.routes.ts
│   │       │   │   ├── assistant.service.ts
│   │       │   │   ├── safety.ts       # emergency keywords, filters
│   │       │   │   ├── prompts.ts
│   │       │   │   └── providers/      # llm provider adapters
│   │       │   └── privacy/      # export + delete account
│   │       ├── queues/
│   │       │   └── index.ts      # BullMQ queue definitions
│   │       ├── utils/
│   │       │   ├── jwt.ts
│   │       │   ├── hash.ts
│   │       │   ├── crypto.ts     # field encryption helpers
│   │       │   └── apiError.ts
│   │       └── types/
│   │
│   └── worker/                   # ───────── BACKGROUND WORKER ─────────
│       ├── package.json
│       ├── tsconfig.json
│       ├── Dockerfile
│       └── src/
│           ├── index.ts
│           ├── jobs/
│           │   ├── reminderScheduler.ts   # finds due reminders
│           │   ├── sendPush.ts
│           │   ├── sendEmail.ts
│           │   ├── weeklySummary.ts       # AI summary job
│           │   └── cleanup.ts
│           └── templates/
│               └── email/
│
├── packages/
│   ├── shared/                   # types + Zod schemas shared by web & api
│   │   ├── package.json
│   │   └── src/{schemas,types,constants}/
│   └── config/                   # shared eslint, tsconfig, prettier
│       ├── eslint/
│       ├── tsconfig/
│       └── prettier/
│
├── scripts/
│   ├── generate-vapid-keys.ts
│   └── setup.sh
│
└── tests/
    └── e2e/                      # Playwright specs
```

## 4. Backend Layering

Each module follows: **routes → controller → service → repository (Prisma)**.

- **Routes:** URL mapping and middleware (auth, validate).
- **Controller:** HTTP in/out only.
- **Service:** business logic, no Express objects.
- **Prisma:** data access.

## 5. Database Schema (Core Tables)

| Table | Key Columns |
|---|---|
| `users` | id, email, password_hash, name, dob, height_cm, timezone, locale, created_at |
| `refresh_tokens` | id, user_id, token_hash, expires_at, revoked_at |
| `health_logs` | id, user_id, type, value (JSON), unit, logged_at, note |
| `goals` | id, user_id, type, target_value, period |
| `medicines` | id, user_id, name, dose, schedule (JSON), start_date, end_date, active |
| `medicine_events` | id, medicine_id, scheduled_at, status (taken/skipped/missed), acted_at |
| `reminders` | id, user_id, kind, title, rrule, next_fire_at, channels, active |
| `push_subscriptions` | id, user_id, endpoint, keys (JSON) |
| `appointments` | id, user_id, title, doctor, scheduled_at, notes |
| `assistant_messages` | id, user_id, role, content, created_at |
| `user_settings` | user_id, ai_context_opt_in, quiet_hours, theme, notif_prefs |
| `audit_log` | id, user_id, action, created_at |

Indexes: `(user_id, logged_at)` on logs, `(next_fire_at) WHERE active` on reminders.

## 6. API Surface (Summary)

```
POST   /api/auth/register | login | refresh | logout | forgot | reset
GET    /api/users/me            PATCH /api/users/me
CRUD   /api/logs                GET /api/logs?type=&from=&to=
CRUD   /api/goals
CRUD   /api/medicines           POST /api/medicines/:id/events
CRUD   /api/reminders
CRUD   /api/appointments
GET    /api/analytics/summary | trends | streaks
POST   /api/notifications/subscribe
POST   /api/assistant/chat      GET /api/assistant/history
GET    /api/privacy/export      DELETE /api/privacy/account
GET    /api/health              # uptime check
```

## 7. Key Flows

### Reminder delivery
1. User creates reminder; API stores `next_fire_at`.
2. Worker scheduler runs every minute, queries due reminders.
3. Jobs pushed to BullMQ; push/email sent with retry and backoff.
4. `next_fire_at` recalculated from the repeat rule (timezone aware).

### AI assistant
1. User message goes to `/assistant/chat`.
2. Safety layer checks for emergency terms; if matched, returns a "seek medical help" response.
3. If the user opted in, a compact summary of recent logs is added as context.
4. LLM is called with a strict system prompt (no diagnosis, no dosage advice).
5. Reply is post-filtered, disclaimer attached, saved to history.

### Auth
Access token (15 min) in memory; refresh token (7 days) in httpOnly cookie, rotated on each use; reuse detection revokes the token family.

## 8. Security Design

- argon2 password hashing; helmet; strict CORS allowlist.
- Rate limits on auth and AI endpoints.
- Zod validation on every request body and query.
- Sensitive fields (notes, symptoms) optionally encrypted at application level.
- Secrets only in environment variables; never committed.
- Audit log for login, export, and delete events.
- Minimal PII in logs and in prompts sent to the AI provider.

## 9. Frontend Architecture

- **Server state:** TanStack Query. **Client state:** Zustand.
- **Feature folders** keep API hooks, components, and types together.
- **3D:** `SceneCanvas` is lazy loaded; falls back to a static or CSS animation when `prefers-reduced-motion` is set or the device is low powered.
- **PWA:** service worker for push notifications and offline shell.
- **Theme:** CSS variables with light/dark switch.

## 10. Deployment

| Component | Host |
|---|---|
| Web | Vercel |
| API | Render Web Service |
| Worker | Render Background Worker |
| PostgreSQL | Render PostgreSQL |
| Redis | Render Key Value (Redis) |

CI (GitHub Actions): install, lint, typecheck, unit tests, build, then deploy on merge to `main`. Prisma migrations run on API deploy via `prisma migrate deploy`.

## 11. Environment Variables (see `.env.example`)

```
# API
NODE_ENV=
PORT=
DATABASE_URL=
REDIS_URL=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
CLIENT_ORIGIN=
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
LLM_PROVIDER=
LLM_API_KEY=
FIELD_ENCRYPTION_KEY=

# Web
VITE_API_URL=
VITE_VAPID_PUBLIC_KEY=
```

## 12. Observability and Testing

- Pino structured logs, request IDs, `/api/health` endpoint.
- Optional Sentry for errors.
- Unit tests for services, Supertest for APIs, Playwright for core flows (register, log, medicine reminder, assistant).
