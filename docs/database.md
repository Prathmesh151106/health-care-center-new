# Database Architecture: Daily Health Companion v2

## Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o{ RefreshToken : has
    User ||--o{ PasswordResetToken : has
    User ||--o{ HealthLog : logs
    User ||--o{ Goal : sets
    User ||--o{ Medicine : tracks
    User ||--o{ Reminder : configures
    User ||--o{ PushSubscription : registers
    User ||--o{ Appointment : schedules
    User ||--o{ AssistantMessage : sends
    User ||--o| UserSettings : configures
    User ||--o{ AuditLog : generates

    Medicine ||--o{ MedicineEvent : generates
    Medicine ||--o{ Reminder : links
    Appointment ||--o{ Reminder : links

    User {
        uuid id PK
        string email UK
        string password_hash
        string name
        datetime date_of_birth
        float height_cm
        string timezone
        string locale
        datetime created_at
    }

    HealthLog {
        uuid id PK
        uuid user_id FK
        enum type
        json value
        string unit
        datetime logged_at
        string encrypted_note
    }

    Medicine {
        uuid id PK
        uuid user_id FK
        string name
        string dose
        string form
        json schedule
        datetime start_date
        datetime end_date
        boolean is_active
        string encrypted_notes
    }

    MedicineEvent {
        uuid id PK
        uuid medicine_id FK
        datetime scheduled_at
        enum status
        datetime acted_at
    }

    Reminder {
        uuid id PK
        uuid user_id FK
        enum kind
        string title
        string rrule
        datetime next_fire_at
        boolean is_active
    }
```

## Key Constraints & Indexes
1. `health_logs`: Indexes on `(userId, loggedAt)` and `(userId, type, loggedAt)` for sub-millisecond history and trend queries.
2. `reminders`: Partial index on `(nextFireAt, isActive)` enabling the background scheduler to claim due tasks without full table scans.
3. `goals`: Unique constraint on `(userId, type, period, isActive)` enforcing single active target per metric at database level.
4. `medicine_events`: Unique constraint on `(medicineId, scheduledAt)` guaranteeing idempotent event generation by the worker.
5. `refresh_tokens`: Family indexing on `(familyId)` for atomic multi-session tracking and instant family revocation upon detected token reuse.
