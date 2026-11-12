import { describe, it, expect } from 'vitest';
import { RewardManager } from '../src/rewards/rewardManager.js';

describe('RewardManager', () => {
  const manager = new RewardManager();

  it('calculates proportional rewards only for eligible delegates', () => {
    const poolConfig = {
      name: 'Q1 Test Pool',
      totalRewardAmount: 10000,
      tokenSymbol: 'NEAR',
      period: 'HOS-2026-Q1',
      minScoreRequired: 80.0,
      minHoSThreshold: 80.0,
      createdBy: 'turnout.testnet',
    };

    const delegates = [
      {
        accountId: 'alice.near',
        name: 'Alice Node',
        reputationScore: 90,
        performanceGrade: 'A',
        participationRate: 100, // Eligible
      },
      {
        accountId: 'bob.near',
        name: 'Bob Validator',
        reputationScore: 90,
        performanceGrade: 'A',
        participationRate: 90, // Eligible
      },
      {
        accountId: 'charlie.near',
        name: 'Charlie Staking',
        reputationScore: 70,
        performanceGrade: 'C',
        participationRate: 85, // Ineligible due to score < 80
      },
      {
        accountId: 'dave.near',
        name: 'Dave Node',
        reputationScore: 85,
        performanceGrade: 'B',
        participationRate: 60, // Ineligible due to HoS participation < 80%
      },
    ];

    const result = manager.calculateDistribution(poolConfig, delegates);

    expect(result.totalEligibleDelegates).toBe(2);
    expect(result.totalIneligibleDelegates).toBe(2);

    const aliceAlloc = result.allocations.find((a) => a.delegateAccountId === 'alice.near')!;
    const bobAlloc = result.allocations.find((a) => a.delegateAccountId === 'bob.near')!;
    const charlieAlloc = result.allocations.find((a) => a.delegateAccountId === 'charlie.near')!;
    const daveAlloc = result.allocations.find((a) => a.delegateAccountId === 'dave.near')!;

    expect(aliceAlloc.eligible).toBe(true);
    expect(bobAlloc.eligible).toBe(true);
    expect(charlieAlloc.eligible).toBe(false);
    expect(daveAlloc.eligible).toBe(false);

    // Both have score 90, so they split 10,000 NEAR 50/50 = 5000 NEAR each
    expect(aliceAlloc.allocatedAmount).toBe(5000);
    expect(bobAlloc.allocatedAmount).toBe(5000);
    expect(charlieAlloc.allocatedAmount).toBe(0);
    expect(daveAlloc.allocatedAmount).toBe(0);

    expect(result.generatedProposal.callMethod).toBe('distribute_epoch_rewards');
    expect(result.generatedProposal.recipientCount).toBe(2);
  });
});

