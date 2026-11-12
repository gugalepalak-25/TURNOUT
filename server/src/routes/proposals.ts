import { Router } from 'express';
import { getStorage } from '../db/index.js';

const router = Router();

router.get('/proposals', async (req, res) => {
  try {
    const storage = await getStorage();
    let proposals = await storage.getAllProposals();

    const status = req.query.status as string;
    const kind = req.query.kind as string;

    if (status) {
      proposals = proposals.filter((p) => p.status.toLowerCase() === status.toLowerCase());
    }
    if (kind) {
      proposals = proposals.filter((p) => p.kind.toLowerCase() === kind.toLowerCase());
    }

    res.json({ success: true, data: proposals });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message });
  }
});

router.get('/proposals/:id', async (req, res) => {
  try {
    const storage = await getStorage();
    const proposal = await storage.getProposalById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ success: false, error: 'Proposal not found' });
    }
    res.json({ success: true, data: proposal });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message });
  }
});

export default router;

