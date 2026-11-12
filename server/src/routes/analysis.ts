import { Router } from 'express';
import { z } from 'zod';
import { getStorage } from '../db/index.js';
import { governanceAnalystService } from '../ai/governanceAnalyst.js';

const router = Router();

const analysisRequestSchema = z.object({
  query: z.string().min(2),
  contextType: z.enum(['delegate', 'proposal', 'comparison', 'general', 'overview']).optional(),
  delegateAccountId: z.string().optional(),
  secondDelegateAccountId: z.string().optional(),
  proposalId: z.string().optional(),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .optional(),
});

router.post('/analysis', async (req, res) => {
  try {
    const parsed = analysisRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.format() });
    }

    const storage = await getStorage();
    const result = await governanceAnalystService.analyze(parsed.data, storage);

    res.json({ success: true, data: result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message });
  }
});

export default router;

