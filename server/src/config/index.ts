import dotenv from 'dotenv';
import path from 'node:path';
import { z } from 'zod';

const workingDirectory = process.cwd();
const envPaths = [
  path.resolve(workingDirectory, 'server', '.env'),
  path.resolve(workingDirectory, '.env'),
  path.resolve(workingDirectory, '..', '.env'),
];

for (const envPath of new Set(envPaths)) {
  dotenv.config({ path: envPath });
}

const envSchema = z.object({
  PORT: z.coerce.number().default(8787),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/turnout_governance?schema=public'),
  
  // NEAR Protocol
  NEAR_NETWORK_ID: z.enum(['mainnet', 'testnet']).default('testnet'),
  NEAR_RPC_URL: z.string().default('https://rpc.testnet.near.org'),
  NEAR_ARCHIVAL_RPC_URL: z.string().default('https://archival-rpc.testnet.near.org'),
  
  // Smart Contracts
  HOUSE_OF_STAKE_VOTING_CONTRACT: z.string().default('vote.hos.testnet'),
  HOUSE_OF_STAKE_VENEAR_CONTRACT: z.string().default('venear.hos.testnet'),
  TURNOUT_SCORECARD_CONTRACT: z.string().default('turnout-registry.testnet'),
  TURNOUT_REWARD_CONTRACT: z.string().default('turnout-rewards.testnet'),

  // Oracle Account (Optional for on-chain publishing)
  ORACLE_ACCOUNT_ID: z.string().default('turnout-oracle.testnet'),
  ORACLE_PRIVATE_KEY: z.string().optional(),

  // Forum API
  DISCOURSE_BASE_URL: z.string().default('https://gov.near.org'),

  // OpenAI-compatible AI provider
  AI_API_KEY: z.string().optional(),
  AI_BASE_URL: z.string().url().default('https://cloud-api.near.ai/v1'),
  AI_MODEL: z.string().default('z-ai/glm-5.3-flash'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.warn('⚠️ Warning: Environment variables validation issues:', parsedEnv.error.format());
}

export const config = parsedEnv.success ? parsedEnv.data : envSchema.parse({});
