import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import { logger } from '../config.js';

const prisma = new PrismaClient();

export async function processSendEmail(jobData: {
  userId: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<void> {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    logger.debug('Email delivery skipped: SMTP not configured');
    return;
  }

  const recipient = await prisma.user.findUnique({
    where: { id: jobData.userId },
    select: { email: true }
  });

  if (!recipient) {
    logger.warn({ userId: jobData.userId }, 'Recipient not found for email delivery');
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user, pass }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'Daily Health Companion <noreply@dailyhealth.internal>',
    to: recipient.email,
    subject: jobData.subject,
    text: jobData.text,
    html: jobData.html || `<p>${jobData.text}</p>`
  });
}
