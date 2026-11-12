import { PrismaClient } from '@prisma/client';
import { IStorageEngine } from './types.js';

export class PrismaStorageEngine implements IStorageEngine {
  private prisma: PrismaClient;
  private connected = false;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async init(): Promise<void> {
    try {
      await this.prisma.$connect();
      this.connected = true;
    } catch {
      this.connected = false;
      throw new Error('PostgreSQL database connection failed');
    }
  }

  isLiveDb(): boolean {
    return this.connected;
  }

  async getGovernanceOverview(): Promise<any> {
    const totalDelegates = await this.prisma.delegate.count();
    const totalProposals = await this.prisma.proposal.count();
    const activeProposals = await this.prisma.proposal.count({
      where: { status: { in: ['Voting', 'Active'] } },
    });

    const delegates = await this.prisma.delegate.findMany();
    const avgParticipation =
      totalDelegates > 0
        ? Math.round(
            (delegates.reduce((acc, d) => acc + d.participationRate, 0) / totalDelegates) * 10
          ) / 10
        : 0;

    const avgReputation =
      totalDelegates > 0
        ? Math.round(
            (delegates.reduce((acc, d) => acc + d.reputationScore, 0) / totalDelegates) * 10
          ) / 10
        : 0;

    const recentVotes = await this.prisma.vote.findMany({
      take: 8,
      orderBy: { timestamp: 'desc' },
      include: {
        delegate: true,
        proposal: true,
      },
    });

    return {
      totalDelegates,
      totalProposals,
      activeProposals,
      averageParticipationRate: avgParticipation,
      averageReputationScore: avgReputation,
      delegationDistribution: delegates.map((d) => ({
        accountId: d.accountId,
        name: d.name,
        votingPower: d.votingPower,
        sharePct: 12.5,
      })),
      participationTrends: [],
      recentActivity: recentVotes.map((v) => ({
        id: v.id,
        delegateAccountId: v.delegateAccountId,
        delegateName: v.delegate.name,
        proposalId: v.proposal.proposalId,
        proposalTitle: v.proposal.title,
        voteOption: v.voteOption,
        votingPower: v.votingPower,
        timestamp: v.timestamp.toISOString(),
        transactionHash: v.transactionHash,
      })),
      dataOrigin: 'PostgreSQL Production Ledger (Prisma)',
      lastSyncTimestamp: new Date().toISOString(),
    };
  }

  async getAllDAOs(): Promise<any[]> {
    return this.prisma.dAO.findMany();
  }

  async getDAOById(daoId: string): Promise<any | null> {
    return this.prisma.dAO.findFirst({
      where: { OR: [{ id: daoId }, { daoId: daoId }] },
    });
  }

  async getAllDelegates(): Promise<any[]> {
    return this.prisma.delegate.findMany({
      orderBy: { reputationScore: 'desc' },
    });
  }

  async getDelegateByAccount(accountId: string): Promise<any | null> {
    return this.prisma.delegate.findUnique({
      where: { accountId },
      include: {
        votes: true,
        scorecards: true,
        rationales: true,
      },
    });
  }

  async saveDelegate(delegate: any): Promise<any> {
    return this.prisma.delegate.upsert({
      where: { accountId: delegate.accountId },
      update: delegate,
      create: delegate,
    });
  }

  async getAllProposals(): Promise<any[]> {
    return this.prisma.proposal.findMany({
      orderBy: { voteStartTime: 'desc' },
    });
  }

  async getProposalById(id: string): Promise<any | null> {
    return this.prisma.proposal.findFirst({
      where: { OR: [{ id }, { proposalId: id }] },
      include: {
        votes: true,
        rationales: true,
      },
    });
  }

  async getVotesByProposal(proposalId: string): Promise<any[]> {
    return this.prisma.vote.findMany({
      where: { proposalId },
    });
  }

  async getVotesByDelegate(delegateAccountId: string): Promise<any[]> {
    return this.prisma.vote.findMany({
      where: { delegateAccountId },
    });
  }

  async getRationalesByProposal(proposalId: string): Promise<any[]> {
    return this.prisma.rationale.findMany({
      where: { proposalId },
    });
  }

  async getRationalesByDelegate(delegateAccountId: string): Promise<any[]> {
    return this.prisma.rationale.findMany({
      where: { delegateAccountId },
    });
  }

  async getAllScorecards(): Promise<any[]> {
    return this.prisma.scorecard.findMany({
      orderBy: { totalScore: 'desc' },
    });
  }

  async getScorecardsByDelegate(delegateAccountId: string): Promise<any[]> {
    return this.prisma.scorecard.findMany({
      where: { delegateAccountId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getScorecardByPeriod(delegateAccountId: string, period: string): Promise<any | null> {
    return this.prisma.scorecard.findUnique({
      where: {
        delegateAccountId_evaluationPeriod: {
          delegateAccountId,
          evaluationPeriod: period,
        },
      },
    });
  }

  async saveScorecard(scorecard: any): Promise<any> {
    return this.prisma.scorecard.upsert({
      where: {
        delegateAccountId_evaluationPeriod: {
          delegateAccountId: scorecard.delegateAccountId,
          evaluationPeriod: scorecard.evaluationPeriod,
        },
      },
      update: scorecard,
      create: scorecard,
    });
  }

  async getAllRewardPools(): Promise<any[]> {
    return this.prisma.rewardPool.findMany({
      include: { claims: true },
    });
  }

  async getRewardPoolById(id: string): Promise<any | null> {
    return this.prisma.rewardPool.findUnique({
      where: { id },
      include: { claims: true },
    });
  }

  async saveRewardPool(pool: any): Promise<any> {
    return this.prisma.rewardPool.create({ data: pool });
  }

  async getWatchlist(delegatorAccountId: string): Promise<any[]> {
    return this.prisma.delegation.findMany({
      where: { delegatorAccountId },
      include: { delegate: true },
    });
  }

  async saveWatchlistEntry(entry: any): Promise<any> {
    return this.prisma.delegation.upsert({
      where: {
        delegatorAccountId_delegateAccountId: {
          delegatorAccountId: entry.delegatorAccountId,
          delegateAccountId: entry.delegateAccountId,
        },
      },
      update: entry,
      create: entry,
    });
  }

  async removeWatchlistEntry(delegatorAccountId: string, delegateAccountId: string): Promise<boolean> {
    try {
      await this.prisma.delegation.delete({
        where: {
          delegatorAccountId_delegateAccountId: {
            delegatorAccountId,
            delegateAccountId,
          },
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  async getSyncState(key: string): Promise<any | null> {
    return this.prisma.syncState.findUnique({
      where: { key },
    });
  }

  async setSyncState(key: string, state: any): Promise<void> {
    await this.prisma.syncState.upsert({
      where: { key },
      update: state,
      create: { key, ...state },
    });
  }
}

