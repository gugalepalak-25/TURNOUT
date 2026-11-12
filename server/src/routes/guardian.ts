import { Router } from 'express';
import { z } from 'zod';
import { getStorage } from '../db/index.js';
import { delegationGuardianService } from '../guardian/delegationGuardian.js';

const router = Router();

const watchlistSchema = z.object({
  delegatorAccountId: z.string().min(2),
  delegateAccountId: z.string().min(2),
  minParticipationThreshold: z.number().min(0).max(100).default(80.0),
  backupDelegateAccountId: z.string().optional(),
});

router.get('/guardian/watchlist', async (req, res) => {
  try {
    const storage = await getStorage();
    const delegator = (req.query.delegator as string) || 'governance-user.testnet';
    const watchlist = await delegationGuardianService.getWatchlist(delegator, storage);

    res.json({ success: true, data: watchlist });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message });
  }
});

router.post('/guardian/watchlist', async (req, res) => {
  try {
    const parsed = watchlistSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.format() });
    }

    const storage = await getStorage();
    const saved = await delegationGuardianService.addOrUpdateWatchlist(parsed.data, storage);

    res.json({ success: true, data: saved });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message });
  }
});

router.delete('/guardian/watchlist/:delegate', async (req, res) => {
  try {
    const storage = await getStorage();
    const delegator = (req.query.delegator as string) || 'governance-user.testnet';
    const removed = await delegationGuardianService.removeFromWatchlist(
      delegator,
      req.params.delegate,
      storage
    );

    res.json({ success: true, removed });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message });
  }
});

export default router;

