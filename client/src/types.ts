export type PerformanceGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface DAO {
  id: string;
  daoId: string;
  name: string;
  network: string;
  charterThreshold: number;
  votingContract: string;
  venearContract: string;
  totalDelegates: number;
  totalProposals: number;
  activeProposals: number;
  description?: string;
}

export interface Delegate {
  id: string;
  accountId: string;
  daoId: string;
  name: string;
  votingPower: string;
  delegatorsCount: number;
  participationRate: number;
  reputationScore: number;
  performanceGrade: PerformanceGrade;
  publishedExplanationsCount: number;
  missingExplanationsCount: number;
  missedProposalsCount: number;
  isVerifiedIdentity: boolean;
  forumUsername?: string;
  bio?: string;
  profileImageUrl?: string;
  votes?: Vote[];
  scorecards?: Scorecard[];
  rationales?: Rationale[];
}

export interface Proposal {
  id: string;
  proposalId: string;
  daoId: string;
  title: string;
  description: string;
  proposer: string;
  status: 'Voting' | 'Active' | 'Succeeded' | 'Defeated' | 'Executed' | 'Timelock' | 'Expired';
  kind: 'Classic' | 'FastTrack';
  submissionTime: string;
  voteStartTime: string;
  voteEndTime: string;
  executionTime?: string;
  totalVotesCast: number;
  yesVotes: string;
  noVotes: string;
  abstainVotes: string;
  forumUrl?: string;
  snapshotBlockHeight?: number;
  votes?: Vote[];
  rationales?: Rationale[];
}

export interface Vote {
  id: string;
  proposalId: string;
  delegateAccountId: string;
  voteOption: 'Approve' | 'Reject' | 'Abstain' | 'Spam';
  votingPower: string;
  blockHeight: number;
  transactionHash?: string;
  timestamp: string;
}

export interface Rationale {
  id: string;
  proposalId: string;
  delegateAccountId: string;
  forumPostId?: string;
  forumUrl?: string;
  author?: string;
  contentSummary: string;
  explanationStatus: 'Verified' | 'Unverified' | 'NotFound' | 'Ambiguous';
  publishedAt?: string;
  voteDeadline: string;
  isTimely: boolean;
  confidenceScore: number;
  evidenceSnippet?: string;
}

export interface Scorecard {
  id: string;
  delegateAccountId: string;
  evaluationPeriod: string;
  totalScore: number;
  votingScore: number;
  rationaleScore: number;
  timelinessScore: number;
  consistencyScore: number;
  grade: PerformanceGrade;
  evidenceHash: string;
  methodologyVersion: string;
  publicationStatus: 'Pending' | 'PublishedOnChain' | 'Failed';
  onChainTxHash?: string;
  onChainPublishedAt?: string;
  publisherAccount?: string;
  isCorrection: boolean;
  correctionReason?: string;
}

export interface GovernanceOverview {
  totalDelegates: number;
  totalProposals: number;
  activeProposals: number;
  averageParticipationRate: number;
  averageReputationScore: number;
  totalVotingPower: string;
  delegationDistribution: Array<{
    accountId: string;
    name: string;
    votingPower: string;
    sharePct: number;
  }>;
  participationTrends: Array<{
    proposalId: string;
    title: string;
    votesCast: number;
    eligibleVoters: number;
    turnoutPct: number;
    date: string;
  }>;
  recentActivity: Array<{
    id: string;
    delegateAccountId: string;
    delegateName: string;
    proposalId: string;
    proposalTitle: string;
    voteOption: string;
    votingPower: string;
    timestamp: string;
    transactionHash?: string;
  }>;
  blockchainStatus: {
    network: string;
    connected: boolean;
    rpcUrl: string;
    mode: 'LIVE_RPC' | 'INDEXED_SNAPSHOT';
    lastSyncBlock: number;
    lastSyncTime: string;
    errorMessage: string | null;
  };
}

export interface WatchlistEntry {
  delegatorAccountId: string;
  delegateAccountId: string;
  delegateName: string;
  currentScore: number;
  currentParticipationRate: number;
  currentGrade: string;
  minParticipationThreshold: number;
  backupDelegateAccountId?: string;
  backupDelegateName?: string;
  alertActive: boolean;
  alertMessage?: string;
  recommendedAlternatives: Array<{
    accountId: string;
    name: string;
    score: number;
    participationRate: number;
    grade: string;
  }>;
}

export interface RewardDistribution {
  poolName: string;
  period: string;
  totalRewardAmount: number;
  tokenSymbol: string;
  minScoreRequired: number;
  totalEligibleDelegates: number;
  totalIneligibleDelegates: number;
  allocations: Array<{
    delegateAccountId: string;
    name: string;
    score: number;
    grade: string;
    participationRate: number;
    meetsHoSCharter: boolean;
    eligible: boolean;
    ineligibilityReason?: string;
    allocatedAmount: number;
    allocatedPercentage: number;
  }>;
  generatedProposal: {
    title: string;
    description: string;
    targetContract: string;
    totalPayoutAmount: number;
    recipientCount: number;
    callMethod: string;
    callArgs: Record<string, unknown>;
  };
}

