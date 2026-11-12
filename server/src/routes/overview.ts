import { Router } from 'express';
import { getStorage } from '../db/index.js';
import { nearRpcClient } from '../blockchain/nearClient.js';

const router = Router();

router.get('/overview', async (_req, res) => {
  try {
    const storage = await getStorage();
    const overview = await storage.getGovernanceOverview();
    const rpcStatus = await nearRpcClient.checkConnection();

    res.json({
      success: true,
      data: {
        ...overview,
        blockchainStatus: rpcStatus,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message });
  }
});

export default router;

