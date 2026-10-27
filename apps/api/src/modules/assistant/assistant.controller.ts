import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db.js';
import { checkEmergency, sanitizeAssistantOutput, getDisclaimer } from './safety.js';
import { ASSISTANT_SYSTEM_PROMPT_EN, ASSISTANT_SYSTEM_PROMPT_HI } from './prompts.js';
import { getLLMProvider } from './providers/index.js';
import { AssistantChatSchema, AssistantRole } from '@health-care-center/shared';

export class AssistantController {
  static async chat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { message, locale } = AssistantChatSchema.parse(req.body);

      // 1. Pre-filter crisis and emergency terms (safety bypass)
      const emergencyCheck = checkEmergency(message, locale);
      if (emergencyCheck.isEmergency) {
        res.status(200).json({
          reply: emergencyCheck.response,
          disclaimer: getDisclaimer(locale),
          locale
        });
        return;
      }

      // 2. Check if user opted-in to AI health context
      const settings = await prisma.userSettings.findUnique({
        where: { userId }
      });

      let contextSummary = '';
      if (settings?.aiContextOptIn) {
        // Fetch last 7 days of non-sensitive log counts
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7);

        const logs = await prisma.healthLog.findMany({
          where: {
            userId,
            loggedAt: { gte: sevenDaysAgo }
          },
          select: {
            type: true,
            value: true,
            loggedAt: true
          }
        });

        if (logs.length > 0) {
          contextSummary = `\nUser's past 7 days log summary (de-identified): ${logs.length} health events recorded.`;
        }
      }

      // 3. Construct system and user messages
      const systemPrompt =
        (locale === 'hi' ? ASSISTANT_SYSTEM_PROMPT_HI : ASSISTANT_SYSTEM_PROMPT_EN) + contextSummary;

      const provider = getLLMProvider();
      const rawReply = await provider.generate([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ]);

      // 4. Post-filter output
      const sanitizedReply = sanitizeAssistantOutput(rawReply, locale);

      // 5. Persist message history
      await prisma.$transaction([
        prisma.assistantMessage.create({
          data: {
            userId,
            role: AssistantRole.USER,
            content: message
          }
        }),
        prisma.assistantMessage.create({
          data: {
            userId,
            role: AssistantRole.ASSISTANT,
            content: sanitizedReply
          }
        })
      ]);

      res.status(200).json({
        reply: sanitizedReply,
        disclaimer: getDisclaimer(locale),
        locale
      });
    } catch (err) {
      next(err);
    }
  }

  static async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const history = await prisma.assistantMessage.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
        take: 50
      });

      res.status(200).json({ data: history });
    } catch (err) {
      next(err);
    }
  }

  static async deleteHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      await prisma.assistantMessage.deleteMany({
        where: { userId }
      });

      res.status(200).json({ data: { success: true } });
    } catch (err) {
      next(err);
    }
  }
}
