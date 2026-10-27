import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { signAccessToken } from '../src/utils/jwt.js';

// Mock DB and Redis for isolated, fast unit & isolation testing
vi.mock('../src/config/db.js', () => {
  return {
    prisma: {
      healthLog: {
        findMany: vi.fn().mockImplementation((args) => {
          if (args.where?.userId === 'user-1-id') {
            return Promise.resolve([
              {
                id: 'log-1',
                userId: 'user-1-id',
                type: 'WATER',
                value: { amountMl: 500 },
                unit: 'ml',
                loggedAt: new Date(),
                encryptedNote: null,
                createdAt: new Date()
              }
            ]);
          }
          return Promise.resolve([]);
        }),
        findFirst: vi.fn().mockImplementation((args) => {
          if (args.where?.id === 'log-1' && args.where?.userId === 'user-1-id') {
            return Promise.resolve({
              id: 'log-1',
              userId: 'user-1-id',
              type: 'WATER',
              value: { amountMl: 500 },
              unit: 'ml',
              loggedAt: new Date(),
              encryptedNote: null,
              createdAt: new Date()
            });
          }
          return Promise.resolve(null);
        }),
        delete: vi.fn().mockResolvedValue({ id: 'log-1' })
      },
      goal: {
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockImplementation((args) => {
          if (args.where?.id === 'goal-1' && args.where?.userId === 'user-1-id') {
            return Promise.resolve({ id: 'goal-1', userId: 'user-1-id' });
          }
          return Promise.resolve(null);
        })
      },
      medicine: {
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockImplementation((args) => {
          if (args.where?.id === 'med-1' && args.where?.userId === 'user-1-id') {
            return Promise.resolve({ id: 'med-1', userId: 'user-1-id', name: 'Aspirin' });
          }
          return Promise.resolve(null);
        })
      },
      reminder: {
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockImplementation((args) => {
          if (args.where?.id === 'rem-1' && args.where?.userId === 'user-1-id') {
            return Promise.resolve({ id: 'rem-1', userId: 'user-1-id' });
          }
          return Promise.resolve(null);
        })
      },
      appointment: {
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockImplementation((args) => {
          if (args.where?.id === 'app-1' && args.where?.userId === 'user-1-id') {
            return Promise.resolve({ id: 'app-1', userId: 'user-1-id' });
          }
          return Promise.resolve(null);
        })
      }
    }
  };
});

describe('Cross-User Resource Isolation Tests', () => {
  const app = createApp();

  const user1Token = signAccessToken({
    id: 'user-1-id',
    email: 'user1@example.com',
    timezone: 'UTC',
    locale: 'en'
  });

  const user2Token = signAccessToken({
    id: 'user-2-id',
    email: 'user2@example.com',
    timezone: 'UTC',
    locale: 'en'
  });

  describe('Health Logs Isolation', () => {
    it('User 1 can read their own health log', async () => {
      const res = await request(app)
        .get('/api/logs/log-1')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe('log-1');
    });

    it('User 2 CANNOT read User 1 log (returns 404 scoped to user)', async () => {
      const res = await request(app)
        .get('/api/logs/log-1')
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('User 2 cannot delete User 1 log', async () => {
      const res = await request(app)
        .delete('/api/logs/log-1')
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.status).toBe(404);
    });
  });

  describe('Medicines & Reminders Isolation', () => {
    it('User 2 cannot record event for User 1 medicine', async () => {
      const res = await request(app)
        .post('/api/medicines/med-1/events')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          status: 'TAKEN',
          scheduledAt: new Date().toISOString()
        });

      expect(res.status).toBe(404);
    });

    it('User 2 cannot snooze User 1 reminder', async () => {
      const res = await request(app)
        .post('/api/reminders/rem-1/snooze')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ minutes: 15 });

      expect(res.status).toBe(404);
    });

    it('User 2 cannot delete User 1 appointment', async () => {
      const res = await request(app)
        .delete('/api/appointments/app-1')
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.status).toBe(404);
    });
  });
});
