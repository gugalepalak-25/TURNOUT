import { Router } from 'express';
import { getStorage } from '../db/index.js';
import { nearRpcClient } from '../blockchain/nearClient.js';

const router = Router();

router.get('/health', async (_req, res) => {
  const storage = await getStorage();
  const rpcStatus = nearRpcClient.getStatus();

  res.json({
    status: 'ok',
    product: 'TURNOUT',
    tagline: 'The Accountability Layer for Decentralized Governance.',
    version: '1.0.0',
    uptime: process.uptime(),
    storageEngine: storage.isLiveDb() ? 'PostgreSQL (Prisma)' : 'Verified Snapshot Engine (In-Memory)',
    blockchain: {
      network: rpcStatus.network,
      rpcConnected: rpcStatus.connected,
      rpcUrl: rpcStatus.rpcUrl,
      mode: rpcStatus.mode,
      lastSyncBlock: rpcStatus.lastSyncBlock,
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;

