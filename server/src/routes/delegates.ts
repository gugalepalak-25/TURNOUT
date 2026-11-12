import { Router } from 'express';
import { getStorage } from '../db/index.js';

const router = Router();

// Leaderboard route
router.get('/leaderboard', async (req, res) => {
  try {
    const storage = await getStorage();
    const delegates = await storage.getAllDelegates();

    const minScore = req.query.minScore ? Number(req.query.minScore) : 0;
    const grade = req.query.grade ? String(req.query.grade).toUpperCase() : undefined;
    const hosOnly = req.query.hosOnly === 'true';

    let filtered = delegates;

    if (minScore > 0) {
      filtered = filtered.filter((d) => d.reputationScore >= minScore);
    }
    if (grade) {
      filtered = filtered.filter((d) => d.performanceGrade === grade);
    }
    if (hosOnly) {
      filtered = filtered.filter((d) => d.participationRate >= 80.0);
    }

    res.json({
      success: true,
      data: filtered,
      totalCount: delegates.length,
      filteredCount: filtered.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message });
  }
});

// All delegates
router.get('/delegates', async (_req, res) => {
  try {
    const storage = await getStorage();
    const delegates = await storage.getAllDelegates();
    res.json({ success: true, data: delegates });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message });
  }
});

// Individual delegate Governance Passport
router.get('/delegates/:account', async (req, res) => {
  try {
    const storage = await getStorage();
    const delegate = await storage.getDelegateByAccount(req.params.account);
    if (!delegate) {
      return res.status(404).json({ success: false, error: 'Delegate not found' });
    }
    res.json({ success: true, data: delegate });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message });
  }
});

// Historical score changes
router.get('/delegates/:account/history', async (req, res) => {
  try {
    const storage = await getStorage();
    const scorecards = await storage.getScorecardsByDelegate(req.params.account);
    res.json({ success: true, data: scorecards });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message });
  }
});

export default router;

