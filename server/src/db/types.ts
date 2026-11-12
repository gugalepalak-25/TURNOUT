export interface IStorageEngine {
  init(): Promise<void>;
  isLiveDb(): boolean;

  // Overview
  getGovernanceOverview(): Promise<any>;

  // DAOs
  getAllDAOs(): Promise<any[]>;
  getDAOById(daoId: string): Promise<any | null>;

  // Delegates
  getAllDelegates(): Promise<any[]>;
  getDelegateByAccount(accountId: string): Promise<any | null>;
  saveDelegate(delegate: any): Promise<any>;

  // Proposals
  getAllProposals(): Promise<any[]>;
  getProposalById(id: string): Promise<any | null>;

  // Votes & Rationales
  getVotesByProposal(proposalId: string): Promise<any[]>;
  getVotesByDelegate(delegateAccountId: string): Promise<any[]>;
  getRationalesByProposal(proposalId: string): Promise<any[]>;
  getRationalesByDelegate(delegateAccountId: string): Promise<any[]>;

  // Scorecards
  getAllScorecards(): Promise<any[]>;
  getScorecardsByDelegate(delegateAccountId: string): Promise<any[]>;
  getScorecardByPeriod(delegateAccountId: string, period: string): Promise<any | null>;
  saveScorecard(scorecard: any): Promise<any>;

  // Reward Pools
  getAllRewardPools(): Promise<any[]>;
  getRewardPoolById(id: string): Promise<any | null>;
  saveRewardPool(pool: any): Promise<any>;

  // Delegation Guardian Watchlist
  getWatchlist(delegatorAccountId: string): Promise<any[]>;
  saveWatchlistEntry(entry: any): Promise<any>;
  removeWatchlistEntry(delegatorAccountId: string, delegateAccountId: string): Promise<boolean>;

  // Sync State
  getSyncState(key: string): Promise<any | null>;
  setSyncState(key: string, state: any): Promise<void>;
}

