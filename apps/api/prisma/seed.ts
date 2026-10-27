import { PrismaClient, LogType, GoalPeriod, MedicineStatus, ReminderKind, ReminderChannel } from '@prisma/client';
import argon2 from 'argon2';
import crypto from 'node:crypto';

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === 'production') {
    console.error('CRITICAL: Seed script refused to run in production!');
    process.exit(1);
  }

  console.log('Seeding synthetic data for local development...');

  // 1. Clean existing development data
  await prisma.auditLog.deleteMany();
  await prisma.assistantMessage.deleteMany();
  await prisma.pushSubscription.deleteMany();
  await prisma.medicineEvent.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.medicine.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.healthLog.deleteMany();
  await prisma.userSettings.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create demo user
  const demoPasswordHash = await argon2.hash('DemoPassword123!', {
    type: argon2.argon2id
  });

  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@healthcompanion.local',
      name: 'Alex Johnson',
      passwordHash: demoPasswordHash,
      dateOfBirth: new Date('1994-06-15T00:00:00Z'),
      heightCm: 175.5,
      timezone: 'America/New_York',
      locale: 'en',
      emailVerifiedAt: new Date(),
      settings: {
        create: {
          aiContextOptIn: true,
          theme: 'dark',
          notifEmail: true,
          notifPush: true,
          notifInApp: true
        }
      }
    }
  });

  console.log(`Created demo user: ${demoUser.email} (id: ${demoUser.id})`);

  // 3. Create Daily Goals
  await prisma.goal.createMany({
    data: [
      { userId: demoUser.id, type: LogType.WATER, targetValue: 2500, period: GoalPeriod.DAILY },
      { userId: demoUser.id, type: LogType.STEPS, targetValue: 10000, period: GoalPeriod.DAILY },
      { userId: demoUser.id, type: LogType.SLEEP, targetValue: 8, period: GoalPeriod.DAILY }
    ]
  });

  // 4. Create Medicines
  const amox = await prisma.medicine.create({
    data: {
      userId: demoUser.id,
      name: 'Amoxicillin',
      dose: '500mg',
      form: 'capsule',
      schedule: { times: ['08:00', '20:00'] },
      startDate: new Date(Date.now() - 7 * 86400000),
      endDate: new Date(Date.now() + 7 * 86400000)
    }
  });

  const vitD = await prisma.medicine.create({
    data: {
      userId: demoUser.id,
      name: 'Vitamin D3',
      dose: '1000 IU',
      form: 'softgel',
      schedule: { times: ['09:00'] },
      startDate: new Date(Date.now() - 30 * 86400000)
    }
  });

  // 5. Create synthetic 7 days of logs and medicine events
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const day = new Date(now.getTime() - i * 86400000);
    day.setHours(9, 0, 0, 0);

    // Logs
    await prisma.healthLog.createMany({
      data: [
        {
          userId: demoUser.id,
          type: LogType.WATER,
          value: { amountMl: 2200 + Math.floor(Math.random() * 600) },
          unit: 'ml',
          loggedAt: day
        },
        {
          userId: demoUser.id,
          type: LogType.STEPS,
          value: { count: 8500 + Math.floor(Math.random() * 3000) },
          unit: 'steps',
          loggedAt: day
        },
        {
          userId: demoUser.id,
          type: LogType.SLEEP,
          value: { hours: 7 + Math.random() * 1.5, quality: 4 },
          unit: 'hours',
          loggedAt: day
        },
        {
          userId: demoUser.id,
          type: LogType.BLOOD_PRESSURE,
          value: { systolic: 118 + Math.floor(Math.random() * 6), diastolic: 76 + Math.floor(Math.random() * 4) },
          unit: 'mmHg',
          loggedAt: day
        }
      ]
    });

    // Medicine Events
    const morn = new Date(day);
    morn.setHours(8, 0, 0, 0);
    await prisma.medicineEvent.create({
      data: {
        medicineId: amox.id,
        scheduledAt: morn,
        status: MedicineStatus.TAKEN,
        actedAt: new Date(morn.getTime() + 15 * 60000)
      }
    });

    const eve = new Date(day);
    eve.setHours(20, 0, 0, 0);
    await prisma.medicineEvent.create({
      data: {
        medicineId: amox.id,
        scheduledAt: eve,
        status: i === 0 ? MedicineStatus.PENDING : MedicineStatus.TAKEN,
        actedAt: i === 0 ? null : new Date(eve.getTime() + 5 * 60000)
      }
    });

    const vitTime = new Date(day);
    vitTime.setHours(9, 0, 0, 0);
    await prisma.medicineEvent.create({
      data: {
        medicineId: vitD.id,
        scheduledAt: vitTime,
        status: MedicineStatus.TAKEN,
        actedAt: vitTime
      }
    });
  }

  // 6. Create Reminder
  await prisma.reminder.create({
    data: {
      userId: demoUser.id,
      kind: ReminderKind.WATER,
      title: 'Hydration check-in',
      body: 'Time to drink a glass of fresh water',
      rrule: 'FREQ=DAILY;INTERVAL=1',
      timezone: 'America/New_York',
      nextFireAt: new Date(Date.now() + 3600000),
      channels: [ReminderChannel.IN_APP, ReminderChannel.PUSH]
    }
  });

  // 7. Create Appointment
  await prisma.appointment.create({
    data: {
      userId: demoUser.id,
      title: 'Annual General Wellness Checkup',
      doctor: 'Dr. Sarah Connor',
      location: 'City Wellness Center, Suite 400',
      scheduledAt: new Date(Date.now() + 5 * 86400000),
      reminderOffsetMinutes: 1440 // 24 hours prior
    }
  });

  // 8. Create Audit record
  await prisma.auditLog.create({
    data: {
      userId: demoUser.id,
      action: 'USER_REGISTERED',
      metadata: { source: 'seed', ipHash: crypto.createHash('sha256').update('127.0.0.1').digest('hex') }
    }
  });

  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
