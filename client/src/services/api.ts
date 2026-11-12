import axios from 'axios';
import {
  GovernanceOverview,
  DAO,
  Delegate,
  Proposal,
  Scorecard,
  WatchlistEntry,
  RewardDistribution,
} from '../types.js';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

export const fetchOverview = async (): Promise<GovernanceOverview> => {
  const res = await api.get('/overview');
  return res.data.data;
};

export const fetchDAOs = async (): Promise<DAO[]> => {
  const res = await api.get('/daos');
  return res.data.data;
};

export const fetchDelegates = async (): Promise<Delegate[]> => {
  const res = await api.get('/delegates');
  return res.data.data;
};

export const fetchLeaderboard = async (params?: {
  minScore?: number;
  grade?: string;
  hosOnly?: boolean;
}): Promise<Delegate[]> => {
  const res = await api.get('/leaderboard', { params });
  return res.data.data;
};

export const fetchDelegatePassport = async (accountId: string): Promise<Delegate> => {
  const res = await api.get(`/delegates/${encodeURIComponent(accountId)}`);
  return res.data.data;
};

export const fetchProposals = async (params?: {
  status?: string;
  kind?: string;
}): Promise<Proposal[]> => {
  const res = await api.get('/proposals', { params });
  return res.data.data;
};

export const fetchProposalDetail = async (id: string): Promise<Proposal> => {
  const res = await api.get(`/proposals/${encodeURIComponent(id)}`);
  return res.data.data;
};

export const fetchScorecards = async (): Promise<Scorecard[]> => {
  const res = await api.get('/scorecards');
  return res.data.data;
};

export const calculateScorecard = async (payload: {
  delegateAccountId: string;
  evaluationPeriod: string;
  metrics: any;
}) => {
  const res = await api.post('/scorecards/calculate', payload);
  return res.data.data;
};

export const publishScorecardOnChain = async (payload: any) => {
  const res = await api.post('/scorecards/publish', payload);
  return res.data;
};

export const fetchRewards = async () => {
  const res = await api.get('/rewards');
  return res.data.data;
};

export const calculateCustomRewardPool = async (payload: {
  name: string;
  totalRewardAmount: number;
  tokenSymbol: string;
  period: string;
  minScoreRequired: number;
  minHoSThreshold: number;
}): Promise<RewardDistribution> => {
  const res = await api.post('/rewards/calculate', payload);
  return res.data.data;
};

export const fetchWatchlist = async (delegatorAccountId?: string): Promise<WatchlistEntry[]> => {
  const res = await api.get('/guardian/watchlist', {
    params: { delegator: delegatorAccountId || 'governance-user.testnet' },
  });
  return res.data.data;
};

export const addToWatchlist = async (payload: {
  delegatorAccountId: string;
  delegateAccountId: string;
  minParticipationThreshold?: number;
  backupDelegateAccountId?: string;
}) => {
  const res = await api.post('/guardian/watchlist', payload);
  return res.data.data;
};

export const removeFromWatchlist = async (
  delegateAccountId: string,
  delegatorAccountId?: string
) => {
  const res = await api.delete(`/guardian/watchlist/${encodeURIComponent(delegateAccountId)}`, {
    params: { delegator: delegatorAccountId || 'governance-user.testnet' },
  });
  return res.data;
};

export const queryAIAnalyst = async (payload: {
  query: string;
  contextType?: string;
  delegateAccountId?: string;
  proposalId?: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}) => {
  const res = await api.post('/analysis', payload);
  return res.data.data;
};

export const fetchBlockchainStatus = async () => {
  const res = await api.get('/blockchain/status');
  return res.data.data;
};

