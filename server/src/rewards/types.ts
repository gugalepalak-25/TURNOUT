export interface RewardPoolConfig {
  name: string;
  totalRewardAmount: number; // e.g. 10000 NEAR
  tokenSymbol: string; // 'NEAR'
  period: string; // 'HOS-2026-Q1'
  minScoreRequired: number; // default 80.0
  minHoSThreshold: number; // default 80.0
  createdBy: string;
}

export interface DelegateRewardAllocation {
  delegateAccountId: string;
  name: string;
  score: number;
  grade: string;
  participationRate: number;
  meetsHoSCharter: boolean;
  eligible: boolean;
  ineligibilityReason?: string;
  weightScore: number;
  allocatedAmount: number; // in NEAR
  allocatedPercentage: number;
}

export interface RewardDistributionResult {
  poolName: string;
  period: string;
  totalRewardAmount: number;
  tokenSymbol: string;
  minScoreRequired: number;
  totalEligibleDelegates: number;
  totalIneligibleDelegates: number;
  allocations: DelegateRewardAllocation[];
  generatedProposal: {
    title: string;
    description: string;
    targetContract: string;
    totalPayoutAmount: number;
    recipientCount: number;
    callMethod: string;
    callArgs: Record<string, unknown>;
  };
  calculatedAt: string;
}

