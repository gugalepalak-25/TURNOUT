import { Router } from 'express';
import { nearRpcClient } from '../blockchain/nearClient.js';
import { houseOfStakeAdapter } from '../blockchain/houseOfStakeAdapter.js';

const router = Router();

router.get('/blockchain/status', async (_req, res) => {
  try {
    const status = await nearRpcClient.checkConnection();
    res.json({ success: true, data: status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message });
  }
});

router.get('/blockchain/venear/:account', async (req, res) => {
  try {
    const info = await houseOfStakeAdapter.getAccountInfo(req.params.account);
    const balance = await houseOfStakeAdapter.getFtBalanceOf(req.params.account);
    res.json({
      success: true,
      data: {
        accountId: req.params.account,
        accountInfo: info,
        ftBalance: balance,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message });
  }
});

router.get('/blockchain/hos/proposals', async (req, res) => {
  try {
    const fromIndex = req.query.fromIndex ? Number(req.query.fromIndex) : 0;
    const limit = req.query.limit ? Number(req.query.limit) : 20;

    const proposals = await houseOfStakeAdapter.getProposals({ fromIndex, limit });
    const count = await houseOfStakeAdapter.getNumProposals();

    res.json({
      success: true,
      data: {
        proposals,
        totalProposalsCount: count,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message });
  }
});

export default router;

