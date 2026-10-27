# Security Architecture & Threat Model

## Threat Model & Mitigations

### 1. Cross-User Data Exposure
- **Threat:** Malicious user probes endpoints with sequential or known IDs of other users' health logs, medicines, or appointments.
- **Mitigation:** Every user-owned database operation is explicitly scoped to `req.user.id` in the SQL/Prisma query itself. Unscoped queries are forbidden. Attempting to access another user's record returns `404 Not Found` without disclosing existence.

### 2. Password & Credential Attacks
- **Threat:** Credential stuffing, brute-force attacks, and rainbow table cracking.
- **Mitigation:** Argon2id is used for all password hashes (memory cost 64MB, 3 iterations, 1 parallelism). Passwords require a minimum length of 10 characters and are screened against common password lists. Account lockout triggers for 15 minutes after 5 consecutive failures.

### 3. Session Hijacking & Refresh Token Theft
- **Threat:** Stealing refresh tokens from local storage or intercepted network traffic.
- **Mitigation:**
  - Refresh tokens are never returned in JSON or stored in JavaScript-readable storage; they are transmitted exclusively via `HttpOnly`, `Secure`, `SameSite=Lax` cookies.
  - Refresh tokens are 256-bit cryptographically secure random values stored in the database solely as SHA-256 hashes.
  - Automatic token rotation generates a new token on every refresh. If a revoked token is ever presented (indicating theft), the entire token family is revoked instantly.

### 4. Sensitive Health Data at Rest
- **Threat:** Direct access to database storage or leak through database dumps reveals private symptoms and medical notes.
- **Mitigation:** Free-text medical notes and symptoms are encrypted at the application layer with authenticated AES-256-GCM before persistence, using a 256-bit encryption key (`FIELD_ENCRYPTION_KEY`) and unique 96-bit initialization vectors per record.

### 5. Logging and Observability Hygiene
- **Threat:** Patient details, health measurements, or auth tokens leak into monitoring dashboards and error logs.
- **Mitigation:** Pino structured logger is configured with strict data redaction rules, stripping headers (`authorization`, `cookie`), passwords, tokens, and health metric payloads from all application logs.
