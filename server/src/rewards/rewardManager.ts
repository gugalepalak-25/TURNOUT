import { RewardPoolConfig, RewardDistributionResult, DelegateRewardAllocation } from './types.js';
import { config } from '../config/index.js';

export class RewardManager {
  /**
   * Transparent performance-weighted reward calculation
   * Formula:
   * Allocation = (Delegate Score / Sum of Eligible Delegate Scores) * Total Reward Pool
   */
  calculateDistribution(
    poolConfig: RewardPoolConfig,
    delegates: Array<{
      accountId: string;
      name: string;
      reputationScore: number;
      performanceGrade: string;
      participationRate: number;
    }>
  ): RewardDistributionResult {
    const allocations: DelegateRewardAllocation[] = [];

    let sumEligibleScores = 0;

    for (const d of delegates) {
      const meetsScore = d.reputationScore >= poolConfig.minScoreRequired;
      const meetsCharter = d.participationRate >= poolConfig.minHoSThreshold;
      const isEligible = meetsScore && meetsCharter;

      let ineligibilityReason: string | undefined;
      if (!meetsScore) {
        ineligibilityReason = `Score ${d.reputationScore} is below required threshold ${poolConfig.minScoreRequired}`;
      } else if (!meetsCharter) {
        ineligibilityReason = `Participation ${d.participationRate}% does not meet House of Stake 80% charter minimum`;
      }

      if (isEligible) {
        sumEligibleScores += d.reputationScore;
      }

      allocations.push({
        delegateAccountId: d.accountId,
        name: d.name,
        score: d.reputationScore,
        grade: d.performanceGrade,
        participationRate: d.participationRate,
        meetsHoSCharter: meetsCharter,
        eligible: isEligible,
        ineligibilityReason,
        weightScore: isEligible ? d.reputationScore : 0,
        allocatedAmount: 0,
        allocatedPercentage: 0,
      });
    }

    let totalEligible = 0;
    let totalIneligible = 0;

    for (const alloc of allocations) {
      if (alloc.eligible && sumEligibleScores > 0) {
        totalEligible++;
        const share = alloc.score / sumEligibleScores;
        alloc.allocatedAmount = Math.round(share * poolConfig.totalRewardAmount * 100) / 100;
        alloc.allocatedPercentage = Math.round(share * 10000) / 100;
      } else {
        totalIneligible++;
      }
    }

    // Sort: eligible first by allocated amount descending
    allocations.sort((a, b) => {
      if (a.eligible && !b.eligible) return -1;
      if (!a.eligible && b.eligible) return 1;
      return b.allocatedAmount - a.allocatedAmount;
    });

    const eligibleAllocations = allocations.filter((a) => a.eligible);

    // Generate formal on-chain payout proposal format for House of Stake or Sputnik DAO
    const generatedProposal = {
      title: `[Turnout] Epoch Payout: ${poolConfig.name} (${poolConfig.period})`,
      description: `Formal governance reward distribution based on verified Turnout reputation scorecards for period ${poolConfig.period}. Total payout of ${poolConfig.totalRewardAmount} ${poolConfig.tokenSymbol} across ${totalEligible} eligible delegates meeting the >= ${poolConfig.minScoreRequired} reputation score and >= ${poolConfig.minHoSThreshold}% House of Stake participation requirement.`,
      targetContract: config.TURNOUT_REWARD_CONTRACT,
      totalPayoutAmount: poolConfig.totalRewardAmount,
      recipientCount: totalEligible,
      callMethod: 'distribute_epoch_rewards',
      callArgs: {
        epoch_id: poolConfig.period,
        allocations: eligibleAllocations.map((a) => ({
          account_id: a.delegateAccountId,
          amount_near: a.allocatedAmount.toString(),
          verified_score: a.score,
        })),
      },
    };

    return {
      poolName: poolConfig.name,
      period: poolConfig.period,
      totalRewardAmount: poolConfig.totalRewardAmount,
      tokenSymbol: poolConfig.tokenSymbol,
      minScoreRequired: poolConfig.minScoreRequired,
      totalEligibleDelegates: totalEligible,
      totalIneligibleDelegates: totalIneligible,
      allocations,
      generatedProposal,
      calculatedAt: new Date().toISOString(),
    };
  }
}

export const rewardManager = new RewardManager();

