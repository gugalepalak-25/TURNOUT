import { app } from './app.js';
import { config } from './config/index.js';
import { getStorage } from './db/index.js';
import { nearRpcClient } from './blockchain/nearClient.js';

async function startServer() {
  console.log('====================================================');
  console.log('🏛️  TURNOUT — THE ACCOUNTABILITY LAYER FOR NEAR GOVERNANCE');
  console.log('====================================================');

  // Initialize storage
  const storage = await getStorage();
  console.log(`📦 Storage Engine initialized: ${storage.isLiveDb() ? 'PostgreSQL' : 'Verified Snapshot Engine'}`);

  // Test NEAR RPC connectivity
  const rpcStatus = await nearRpcClient.checkConnection();
  console.log(
    `🌐 Blockchain Connection: [${rpcStatus.network.toUpperCase()}] ${rpcStatus.connected ? 'Connected (LIVE_RPC)' : 'Offline/Isolated (INDEXED_SNAPSHOT)'}`
  );
  console.log(`📜 House of Stake Voting Contract: ${config.HOUSE_OF_STAKE_VOTING_CONTRACT}`);
  console.log(`🔒 veNEAR Contract: ${config.HOUSE_OF_STAKE_VENEAR_CONTRACT}`);
  console.log(`🛡️ Scorecard Registry: ${config.TURNOUT_SCORECARD_CONTRACT}`);
  console.log(
    `🤖 AI Governance Analyst: ${config.AI_API_KEY ? `${config.AI_MODEL} configured` : 'Offline deterministic mode'}`
  );

  const port = config.PORT;
  app.listen(port, '0.0.0.0', () => {
    console.log(`⚡ Turnout API listening on http://localhost:${port}`);
    console.log(`📊 Health Endpoint: http://localhost:${port}/api/health`);
    console.log(`📡 Ready for Governance Control Room frontend.`);
  });
}

startServer().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
