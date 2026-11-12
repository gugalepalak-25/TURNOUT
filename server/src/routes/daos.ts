import { Router } from 'express';
import { getStorage } from '../db/index.js';

const router = Router();

router.get('/daos', async (_req, res) => {
  try {
    const storage = await getStorage();
    const daos = await storage.getAllDAOs();
    res.json({ success: true, data: daos });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message });
  }
});

router.get('/daos/:id', async (req, res) => {
  try {
    const storage = await getStorage();
    const dao = await storage.getDAOById(req.params.id);
    if (!dao) {
      return res.status(404).json({ success: false, error: 'DAO not found' });
    }
    res.json({ success: true, data: dao });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message });
  }
});

export default router;

