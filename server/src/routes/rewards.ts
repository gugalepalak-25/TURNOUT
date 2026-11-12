import { Router } from 'express';
import { z } from 'zod';
import { getStorage } from '../db/index.js';
import { rewardManager } from '../rewards/rewardManager.js';

const router = Router();

const calculateRewardSchema = z.object({
  name: z.string().default('House of Stake Epoch Rewards'),
  totalRewardAmount: z.number().positive(),
  tokenSymbol: z.string().default('NEAR'),
  period: z.string().default('HOS-2026-Q1'),
  minScoreRequired: z.number().min(0).max(100).default(80.0),
  minHoSThreshold: z.number().min(0).max(100).default(80.0),
  createdBy: z.string().default('turnout-oracle.testnet'),
});

router.get('/rewards', async (_req, res) => {
  try {
    const storage = await getStorage();
    const pools = await storage.getAllRewardPools();
    const delegates = await storage.getAllDelegates();

    // Default active pool distribution preview
    const activePool = pools[0];
    let distribution = null;
    if (activePool) {
      distribution = rewardManager.calculateDistribution(
        {
          name: activePool.name,
          totalRewardAmount: Number(activePool.totalRewardAmount) || 50000,
          tokenSymbol: activePool.tokenSymbol || 'NEAR',
          period: activePool.period,
          minScoreRequired: activePool.minScoreRequired || 80.0,
          minHoSThreshold: activePool.minHoSThreshold || 80.0,
          createdBy: activePool.createdBy,
        },
        delegates
      );
    }

    res.json({
      success: true,
      data: {
        pools,
        activeDistribution: distribution,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message });
  }
});

router.post('/rewards/calculate', async (req, res) => {
  try {
    const parsed = calculateRewardSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.format() });
    }

    const storage = await getStorage();
    const delegates = await storage.getAllDelegates();

    const distribution = rewardManager.calculateDistribution(parsed.data, delegates);

    res.json({ success: true, data: distribution });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message });
  }
});

router.post('/rewards/create-pool', async (req, res) => {
  try {
    const parsed = calculateRewardSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.format() });
    }

    const storage = await getStorage();
    const pool = await storage.saveRewardPool({
      daoId: 'dao-hos-1',
      name: parsed.data.name,
      totalRewardAmount: parsed.data.totalRewardAmount.toString(),
      tokenSymbol: parsed.data.tokenSymbol,
      period: parsed.data.period,
      minScoreRequired: parsed.data.minScoreRequired,
      minHoSThreshold: parsed.data.minHoSThreshold,
      status: 'ProposalGenerated',
      createdBy: parsed.data.createdBy,
    });

    res.json({ success: true, data: pool });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message });
  }
});

export default router;

