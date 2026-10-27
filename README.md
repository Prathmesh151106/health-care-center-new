# health-care-center-new
# 🩺 Daily Health Companion v2

An animated, full-stack health companion: log daily health data, get reliable reminders, see progress on a visual dashboard, and ask an AI assistant for general wellness guidance.

> ⚠️ **Disclaimer:** This app provides general wellness information only. It is not a medical device and does not diagnose or treat any condition. Always consult a qualified doctor for medical advice.

## ✨ Features

- 🔐 Secure auth (JWT + refresh token rotation)
- 📝 Daily logs: water, sleep, steps, weight, mood, BP, sugar, symptoms
- 💊 Medicine manager with adherence tracking
- ⏰ Smart reminders via in-app, Web Push and email
- 📊 Dashboard with progress rings, trends and streaks
- 🤖 AI wellness assistant with safety guardrails
- 🌐 3D / animated UI (React Three Fiber + Framer Motion), dark/light theme
- 📱 Installable PWA, English + Hindi
- 🔒 Privacy controls: export and delete all your data

## 🧱 Tech Stack

| Area | Tech |
|---|---|
| Frontend | React, Vite, TypeScript, Tailwind, Framer Motion, React Three Fiber, TanStack Query, Zustand |
| Backend | Node.js, Express, TypeScript, Prisma, Zod |
| Data | PostgreSQL, Redis (BullMQ) |
| Infra | Docker, GitHub Actions, Vercel, Render |

## 📁 Project Structure

```
apps/
  web/      # React frontend
  api/      # Express API + Prisma
  worker/   # BullMQ background jobs (reminders, push, email)
packages/
  shared/   # shared types + Zod schemas
  config/   # shared eslint/tsconfig/prettier
docs/       # API, database, security, AI safety docs
tests/e2e/  # Playwright tests
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full directory tree and design, and [PRD.md](./PRD.md) for product requirements.

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Docker and Docker Compose (recommended)
- PostgreSQL 15+ and Redis 7+ (if not using Docker)

### 1. Clone and install

```bash
git clone <your-repo-url> daily-health-companion
cd daily-health-companion
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in the values (database URL, JWT secrets, VAPID keys, AI key). Generate push keys with:

```bash
npx tsx scripts/generate-vapid-keys.ts
```

### 3. Start services

```bash
docker compose up -d postgres redis
```

### 4. Run database migrations and seed

```bash
npm run db:migrate --workspace=apps/api
npm run db:seed --workspace=apps/api
```

### 5. Run everything

```bash
npm run dev
```

| Service | URL |
|---|---|
| Web | http://localhost:5173 |
| API | http://localhost:4000 |
| Health check | http://localhost:4000/api/health |

Or run the whole stack in Docker:

```bash
docker compose up --build
```

## 🔑 Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Token signing secrets |
| `CLIENT_ORIGIN` | Allowed frontend origin (CORS) |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | Web Push keys |
| `SMTP_*` | Email settings |
| `LLM_PROVIDER` / `LLM_API_KEY` | AI assistant provider |
| `FIELD_ENCRYPTION_KEY` | Encrypts sensitive fields |
| `VITE_API_URL` | API base URL for the frontend |

## 🧪 Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Run web, api and worker together |
| `npm run build` | Build all apps |
| `npm run lint` | Lint all workspaces |
| `npm run typecheck` | TypeScript checks |
| `npm run test` | Unit and API tests |
| `npm run test:e2e` | Playwright end-to-end tests |

## ☁️ Deployment

- **Frontend:** import `apps/web` into Vercel; set `VITE_API_URL`.
- **Backend:** deploy using `render.yaml` (API, worker, PostgreSQL, Redis).
- Run `npx prisma migrate deploy` on each API deploy.
- Set `CLIENT_ORIGIN` on the API to your Vercel URL.

## 🗺️ Roadmap

- [x] Product requirements and architecture
- [ ] Phase 1: auth, logs, medicines, dashboard
- [ ] Phase 2: push reminders, charts, animated UI, 3D hero
- [ ] Phase 3: AI assistant, weekly summary, export
- [ ] Phase 4: appointments, i18n, badges, polish

## 🤝 Contributing

1. Fork and create a branch: `git checkout -b feature/my-feature`
2. Commit with clear messages and run `npm run lint && npm run test`
3. Open a pull request

## 📄 License

MIT. See [LICENSE](./LICENSE).
