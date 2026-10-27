# API Reference: Daily Health Companion v2

All API responses follow consistent patterns.

## Unified Error Envelope
```json
{
  "error": {
    "code": "VALIDATION_ERROR | UNAUTHORIZED | FORBIDDEN | NOT_FOUND | CONFLICT | TOO_MANY_REQUESTS | SERVICE_UNAVAILABLE | INTERNAL_SERVER_ERROR",
    "message": "Human-readable description",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ],
    "requestId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

## Endpoints

### 1. Health
- `GET /api/health` - Liveness check (`{ status: "ok", uptime: 123.45 }`)
- `GET /api/health/ready` - Readiness check for database and Redis

### 2. Authentication (`/api/auth`)
- `POST /api/auth/register` - Create account (`email`, `password`, `name`, `timezone`, `locale`)
- `POST /api/auth/login` - Login with Argon2id verification. Issues 15m JWT access token and rotates 256-bit opaque refresh token in HttpOnly cookie.
- `POST /api/auth/refresh` - Atomic token rotation. Detects token reuse and revokes entire family if breach attempted.
- `POST /api/auth/logout` - Revokes current refresh token and clears cookie.
- `POST /api/auth/logout-all` - Revokes all user sessions.
- `POST /api/auth/forgot-password` - Request password reset link (disclose no user existence).
- `POST /api/auth/reset-password` - Complete password reset with single-use hashed token.
- `POST /api/auth/change-password` - Authenticated password change.

### 3. Users & Settings (`/api/users`)
- `GET /api/users/me` - Get profile of authenticated user.
- `PATCH /api/users/me` - Update name, DOB, height, timezone, locale.
- `GET /api/users/me/settings` - Get privacy & preferences.
- `PATCH /api/users/me/settings` - Toggle `aiContextOptIn`, `quietHours`, `theme`, notification channels.

### 4. Health Logs (`/api/logs`)
- `GET /api/logs` - List logs with optional `?type=&from=&to=&limit=&cursor=`.
- `POST /api/logs` - Create single log with type-specific validation and AES-256-GCM note encryption.
- `POST /api/logs/bulk` - Atomic batch creation (max 100).
- `GET /api/logs/:id` - Fetch single log with decrypted note.
- `DELETE /api/logs/:id` - Delete log (scoped to user).

### 5. Goals (`/api/goals`)
- `GET /api/goals` - Fetch active and historical goals.
- `POST /api/goals` - Create goal. Automatically deactivates previous goal for identical type/period.
- `DELETE /api/goals/:id` - Remove goal.

### 6. Medicines (`/api/medicines`)
- `GET /api/medicines` - Fetch user's medicines with recent events.
- `POST /api/medicines` - Register medicine. Automatically provisions linked recurring reminder.
- `POST /api/medicines/:id/events` - Mark dose as `TAKEN`, `SKIPPED`, or `SNOOZED`.
- `GET /api/medicines/adherence` - Adherence statistics (% taken, missed count).
- `DELETE /api/medicines/:id` - Delete medicine and linked schedule.

### 7. Reminders (`/api/reminders`)
- `GET /api/reminders` - List scheduled reminders.
- `POST /api/reminders` - Create reminder with RRULE recurrence.
- `POST /api/reminders/:id/snooze` - Snooze reminder by specified minutes.
- `DELETE /api/reminders/:id` - Delete reminder.

### 8. Appointments (`/api/appointments`)
- `GET /api/appointments` - List doctor appointments.
- `POST /api/appointments` - Create appointment with automatic reminder offset.
- `DELETE /api/appointments/:id` - Delete appointment.

### 9. Analytics (`/api/analytics`)
- `GET /api/analytics/summary` - Cached daily summary & goal progress.
- `GET /api/analytics/trends` - Daily series aggregates (`7d`, `30d`, `90d`).
- `GET /api/analytics/streaks` - Continuous logging streak calculation.

### 10. Notifications (`/api/notifications`)
- `GET /api/notifications/vapid-public-key` - Fetch public key for browser push registration.
- `POST /api/notifications/subscribe` - Store web push subscription.
- `POST /api/notifications/unsubscribe` - Remove subscription.
- `POST /api/notifications/test` - Trigger test push.

### 11. AI Wellness Assistant (`/api/assistant`)
- `POST /api/assistant/chat` - Chat with assistant. Pre-filters emergencies (English & Hindi) without calling LLM. Post-filters diagnostic claims.
- `GET /api/assistant/history` - Message history.
- `DELETE /api/assistant/history` - Purge conversation history.

### 12. Privacy & Data Rights (`/api/privacy`)
- `GET /api/privacy/export` - Complete JSON export of all user records with decrypted notes.
- `DELETE /api/privacy/account` - Complete permanent deletion of account and cascaded health data (requires password confirmation).
