import { Router } from 'express';
import { discourseForumService } from '../forum/discourseService.js';

const router = Router();

router.get('/forum/search', async (req, res) => {
  try {
    const q = (req.query.q as string) || 'House of Stake';
    const topics = await discourseForumService.searchProposalDiscussions(q);
    res.json({ success: true, data: topics });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message });
  }
});

router.post('/forum/evaluate', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ success: false, error: 'Text body parameter is required' });
    }

    const evaluation = discourseForumService.evaluateExplanationContent(text);
    res.json({ success: true, data: evaluation });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message });
  }
});

export default router;

