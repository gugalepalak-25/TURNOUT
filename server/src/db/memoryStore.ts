import { IStorageEngine } from './types.js';
import {
  initialDAOs,
  initialDelegates,
  initialProposals,
  initialVotes,
  initialRationales,
  initialScorecards,
  initialRewardPools,
} from './seedData.js';

export class MemoryStorageEngine implements IStorageEngine {
  private daos: any[] = [];
  private delegates: any[] = [];
  private proposals: any[] = [];
  private votes: any[] = [];
  private rationales: any[] = [];
  private scorecards: any[] = [];
  private rewardPools: any[] = [];
  private watchlists: any[] = [];
  private syncStates: Map<string, any> = new Map();
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;

    this.daos = JSON.parse(JSON.stringify(initialDAOs));
    this.delegates = JSON.parse(JSON.stringify(initialDelegates));
    this.proposals = JSON.parse(JSON.stringify(initialProposals));
    this.votes = JSON.parse(JSON.stringify(initialVotes));
    this.rationales = JSON.parse(JSON.stringify(initialRationales));
    this.scorecards = JSON.parse(JSON.stringify(initialScorecards));
    this.rewardPools = JSON.parse(JSON.stringify(initialRewardPools));

    // Default watchlists
    this.watchlists = [
      {
        delegatorAccountId: 'governance-user.testnet',
        delegateAccountId: 'infura.poolv1.near',
        minParticipationThreshold: 80.0,
        backupDelegateAccountId: 'linear-protocol.near',
        alertActive: false,
      },
      {
        delegatorAccountId: 'governance-user.testnet',
        delegateAccountId: 'staked.poolv1.near',
        minParticipationThreshold: 80.0,
        backupDelegateAccountId: 'cryptium.poolv1.near',
        alertActive: true,
      },
    ];

    this.initialized = true;
  }

  isLiveDb(): boolean {
    return false;
  }

  async getGovernanceOverview(): Promise<any> {
    const totalDelegates = this.delegates.length;
    const totalProposals = this.proposals.length;
    const activeProposals = this.proposals.filter((p) => p.status === 'Voting' || p.status === 'Active').length;

    const avgParticipation =
      totalDelegates > 0
        ? Math.round(
            (this.delegates.reduce((acc, d) => acc + (d.participationRate || 0), 0) / totalDelegates) * 10
          ) / 10
        : 0;

    const avgReputationScore =
      totalDelegates > 0
        ? Math.round(
            (this.delegates.reduce((acc, d) => acc + (d.reputationScore || 0), 0) / totalDelegates) * 10
          ) / 10
        : 0;

    // Delegation power distribution
    const totalVotingPowerNumeric = this.delegates.reduce(
      (sum, d) => sum + (Number(d.votingPower) || 0),
      0
    );

    const delegationDistribution = this.delegates.map((d) => ({
      accountId: d.accountId,
      name: d.name,
      votingPower: d.votingPower,
      sharePct:
        totalVotingPowerNumeric > 0
          ? Math.round(((Number(d.votingPower) || 0) / totalVotingPowerNumeric) * 1000) / 10
          : 0,
    }));

    // Participation trends (last 4 proposals)
    const participationTrends = this.proposals
      .filter((p) => p.status === 'Executed' || p.status === 'Succeeded')
      .map((p) => ({
        proposalId: p.proposalId,
        title: p.title,
        votesCast: p.totalVotesCast,
        eligibleVoters: totalDelegates,
        turnoutPct: Math.round((p.totalVotesCast / totalDelegates) * 1000) / 10,
        date: p.voteEndTime,
      }));

    return {
      totalDelegates,
      totalProposals,
      activeProposals,
      averageParticipationRate: avgParticipation,
      averageReputationScore: avgReputationScore,
      totalVotingPower: totalVotingPowerNumeric.toString(),
      delegationDistribution,
      participationTrends,
      recentActivity: this.votes.slice(0, 8).map((v) => {
        const delegate = this.delegates.find((d) => d.accountId === v.delegateAccountId);
        const proposal = this.proposals.find((p) => p.id === v.proposalId);
        return {
          id: v.id,
          delegateAccountId: v.delegateAccountId,
          delegateName: delegate?.name || v.delegateAccountId,
          proposalId: proposal?.proposalId || v.proposalId,
          proposalTitle: proposal?.title || 'House of Stake Proposal',
          voteOption: v.voteOption,
          votingPower: v.votingPower,
          timestamp: v.timestamp,
          transactionHash: v.transactionHash,
        };
      }),
      dataOrigin: 'Verified House of Stake On-Chain Snapshot (NEAR Testnet)',
      lastSyncTimestamp: new Date().toISOString(),
    };
  }

  async getAllDAOs(): Promise<any[]> {
    return this.daos;
  }

  async getDAOById(daoId: string): Promise<any | null> {
    return this.daos.find((d) => d.daoId === daoId || d.id === daoId) || null;
  }

  async getAllDelegates(): Promise<any[]> {
    return [...this.delegates].sort((a, b) => b.reputationScore - a.reputationScore);
  }

  async getDelegateByAccount(accountId: string): Promise<any | null> {
    const delegate = this.delegates.find((d) => d.accountId.toLowerCase() === accountId.toLowerCase());
    if (!delegate) return null;

    const votes = await this.getVotesByDelegate(accountId);
    const scorecards = await this.getScorecardsByDelegate(accountId);
    const rationales = await this.getRationalesByDelegate(accountId);

    return {
      ...delegate,
      votes,
      scorecards,
      rationales,
    };
  }

  async saveDelegate(delegate: any): Promise<any> {
    const idx = this.delegates.findIndex((d) => d.accountId === delegate.accountId);
    if (idx >= 0) {
      this.delegates[idx] = { ...this.delegates[idx], ...delegate, updatedAt: new Date() };
      return this.delegates[idx];
    } else {
      const created = { ...delegate, id: `del-${Date.now()}`, createdAt: new Date(), updatedAt: new Date() };
      this.delegates.push(created);
      return created;
    }
  }

  async getAllProposals(): Promise<any[]> {
    return [...this.proposals].sort((a, b) => new Date(b.voteStartTime).getTime() - new Date(a.voteStartTime).getTime());
  }

  async getProposalById(id: string): Promise<any | null> {
    const p = this.proposals.find(
      (prop) => prop.id === id || prop.proposalId.toLowerCase() === id.toLowerCase()
    );
    if (!p) return null;

    const votes = await this.getVotesByProposal(p.id);
    const rationales = await this.getRationalesByProposal(p.id);

    return {
      ...p,
      votes,
      rationales,
    };
  }

  async getVotesByProposal(proposalId: string): Promise<any[]> {
    return this.votes.filter((v) => v.proposalId === proposalId);
  }

  async getVotesByDelegate(delegateAccountId: string): Promise<any[]> {
    return this.votes.filter(
      (v) => v.delegateAccountId.toLowerCase() === delegateAccountId.toLowerCase()
    );
  }

  async getRationalesByProposal(proposalId: string): Promise<any[]> {
    return this.rationales.filter((r) => r.proposalId === proposalId);
  }

  async getRationalesByDelegate(delegateAccountId: string): Promise<any[]> {
    return this.rationales.filter(
      (r) => r.delegateAccountId.toLowerCase() === delegateAccountId.toLowerCase()
    );
  }

  async getAllScorecards(): Promise<any[]> {
    return [...this.scorecards].sort((a, b) => b.totalScore - a.totalScore);
  }

  async getScorecardsByDelegate(delegateAccountId: string): Promise<any[]> {
    return this.scorecards.filter(
      (s) => s.delegateAccountId.toLowerCase() === delegateAccountId.toLowerCase()
    );
  }

  async getScorecardByPeriod(delegateAccountId: string, period: string): Promise<any | null> {
    return (
      this.scorecards.find(
        (s) =>
          s.delegateAccountId.toLowerCase() === delegateAccountId.toLowerCase() &&
          s.evaluationPeriod.toLowerCase() === period.toLowerCase()
      ) || null
    );
  }

  async saveScorecard(scorecard: any): Promise<any> {
    const idx = this.scorecards.findIndex(
      (s) =>
        s.delegateAccountId.toLowerCase() === scorecard.delegateAccountId.toLowerCase() &&
        s.evaluationPeriod.toLowerCase() === scorecard.evaluationPeriod.toLowerCase()
    );

    if (idx >= 0) {
      this.scorecards[idx] = { ...this.scorecards[idx], ...scorecard, updatedAt: new Date() };
      return this.scorecards[idx];
    } else {
      const created = {
        ...scorecard,
        id: `sc-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.scorecards.push(created);
      return created;
    }
  }

  async getAllRewardPools(): Promise<any[]> {
    return this.rewardPools;
  }

  async getRewardPoolById(id: string): Promise<any | null> {
    return this.rewardPools.find((p) => p.id === id) || null;
  }

  async saveRewardPool(pool: any): Promise<any> {
    const created = {
      ...pool,
      id: pool.id || `pool-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.rewardPools.push(created);
    return created;
  }

  async getWatchlist(delegatorAccountId: string): Promise<any[]> {
    return this.watchlists.filter(
      (w) => w.delegatorAccountId.toLowerCase() === delegatorAccountId.toLowerCase()
    );
  }

  async saveWatchlistEntry(entry: any): Promise<any> {
    const idx = this.watchlists.findIndex(
      (w) =>
        w.delegatorAccountId.toLowerCase() === entry.delegatorAccountId.toLowerCase() &&
        w.delegateAccountId.toLowerCase() === entry.delegateAccountId.toLowerCase()
    );

    if (idx >= 0) {
      this.watchlists[idx] = { ...this.watchlists[idx], ...entry, updatedAt: new Date() };
      return this.watchlists[idx];
    } else {
      const created = { ...entry, createdAt: new Date(), updatedAt: new Date() };
      this.watchlists.push(created);
      return created;
    }
  }

  async removeWatchlistEntry(delegatorAccountId: string, delegateAccountId: string): Promise<boolean> {
    const initialLen = this.watchlists.length;
    this.watchlists = this.watchlists.filter(
      (w) =>
        !(
          w.delegatorAccountId.toLowerCase() === delegatorAccountId.toLowerCase() &&
          w.delegateAccountId.toLowerCase() === delegateAccountId.toLowerCase()
        )
    );
    return this.watchlists.length < initialLen;
  }

  async getSyncState(key: string): Promise<any | null> {
    return this.syncStates.get(key) || null;
  }

  async setSyncState(key: string, state: any): Promise<void> {
    this.syncStates.set(key, { ...state, updatedAt: new Date() });
  }
}

export const memoryStorageEngine = new MemoryStorageEngine();

