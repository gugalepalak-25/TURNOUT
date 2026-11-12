export type HoSProposalStatus =
  | 'Created'
  | 'Queued'
  | 'Sandbox'
  | 'Scheduled'
  | 'Voting'
  | 'Timelock'
  | 'Succeeded'
  | 'Defeated'
  | 'Executed'
  | 'Expired'
  | 'Rejected';

export interface HoSProposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  status: HoSProposalStatus;
  kind: 'Classic' | 'FastTrack';
  submissionTime: string;
  voteStartTime: string;
  voteEndTime: string;
  executionTime?: string;
  yesVotes: string;
  noVotes: string;
  abstainVotes: string;
  totalVotesCast: number;
  forumUrl?: string;
  snapshotBlockHeight?: number;
}

export type VoteOption = 'Approve' | 'Reject' | 'Abstain' | 'Spam';

export interface HoSVote {
  proposalId: string;
  delegateAccountId: string;
  voteOption: VoteOption;
  votingPower: string;
  blockHeight: number;
  transactionHash?: string;
  timestamp: string;
}

export interface VeNearAccountInfo {
  accountId: string;
  lockedBalance: string;
  votingPower: string;
  unlockTimestamp?: string;
  delegationsTo?: Array<{ delegate: string; amount: string }>;
  delegatorsCount: number;
}

export interface BlockchainAdapterStatus {
  network: string;
  connected: boolean;
  rpcUrl: string;
  votingContract: string;
  venearContract: string;
  lastSyncBlock: number;
  lastSyncTime: string;
  mode: 'LIVE_RPC' | 'INDEXED_SNAPSHOT';
  errorMessage: string | null;
}

export interface PaginationParams {
  fromIndex?: number;
  limit?: number;
}

