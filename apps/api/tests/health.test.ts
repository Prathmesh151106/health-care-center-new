import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

describe('Phase 1: Foundation & Runtime', () => {
  const app = createApp();

  it('GET /api/health returns 200 with status ok and uptime', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('Returns standard error envelope on 404', async () => {
    const res = await request(app).get('/api/non-existent-endpoint');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toHaveProperty('code', 'NOT_FOUND');
    expect(res.body.error).toHaveProperty('requestId');
    expect(res.body.error).toHaveProperty('message');
  });

  it('Attaches X-Request-Id header to responses', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers).toHaveProperty('x-request-id');
  });
});
