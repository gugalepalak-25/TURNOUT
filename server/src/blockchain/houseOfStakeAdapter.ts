import { config } from '../config/index.js';
import { NearRpcClient, nearRpcClient } from './nearClient.js';
import {
  HoSProposal,
  HoSVote,
  VeNearAccountInfo,
  BlockchainAdapterStatus,
  PaginationParams,
} from './types.js';

export interface IHouseOfStakeAdapter {
  getProposals(params?: PaginationParams): Promise<HoSProposal[]>;
  getNumProposals(): Promise<number>;
  getVote(proposalId: string, accountId: string): Promise<HoSVote | null>;
  getAccountInfo(accountId: string): Promise<VeNearAccountInfo | null>;
  getFtBalanceOf(accountId: string): Promise<string>;
  getFtTotalSupply(): Promise<string>;
  getAccounts(params?: PaginationParams): Promise<VeNearAccountInfo[]>;
  getStatus(): Promise<BlockchainAdapterStatus>;
}

export class HouseOfStakeAdapter implements IHouseOfStakeAdapter {
  private rpcClient: NearRpcClient;
  private votingContract: string;
  private venearContract: string;

  constructor(
    rpcClient: NearRpcClient = nearRpcClient,
    votingContract: string = config.HOUSE_OF_STAKE_VOTING_CONTRACT,
    venearContract: string = config.HOUSE_OF_STAKE_VENEAR_CONTRACT
  ) {
    this.rpcClient = rpcClient;
    this.votingContract = votingContract;
    this.venearContract = venearContract;
  }

  async getStatus(): Promise<BlockchainAdapterStatus> {
    return this.rpcClient.checkConnection();
  }

  /**
   * Voting contract view: get_num_proposals() -> u32
   */
  async getNumProposals(): Promise<number> {
    const result = await this.rpcClient.callViewMethod<number>({
      contractId: this.votingContract,
      methodName: 'get_num_proposals',
      args: {},
    });

    return result ?? 0;
  }

  /**
   * Voting contract view: get_proposals(from_index, limit) -> Vec<Proposal>
   */
  async getProposals(params: PaginationParams = {}): Promise<HoSProposal[]> {
    const fromIndex = params.fromIndex ?? 0;
    const limit = params.limit ?? 50;

    const rawProposals = await this.rpcClient.callViewMethod<any[]>({
      contractId: this.votingContract,
      methodName: 'get_proposals',
      args: {
        from_index: fromIndex,
        limit,
      },
    });

    if (!rawProposals || !Array.isArray(rawProposals)) {
      return [];
    }

    return rawProposals.map((raw, idx) => this.normalizeProposal(raw, (fromIndex + idx).toString()));
  }

  /**
   * Voting contract view: get_vote(proposal_id, account_id) -> Option<Vote>
   */
  async getVote(proposalId: string, accountId: string): Promise<HoSVote | null> {
    const rawVote = await this.rpcClient.callViewMethod<any>({
      contractId: this.votingContract,
      methodName: 'get_vote',
      args: {
        proposal_id: Number(proposalId) || proposalId,
        account_id: accountId,
      },
    });

    if (!rawVote) return null;

    return {
      proposalId,
      delegateAccountId: accountId,
      voteOption: typeof rawVote === 'string' ? (rawVote as any) : rawVote.vote_option || rawVote.vote || 'Approve',
      votingPower: rawVote.voting_power || rawVote.weight || '0',
      blockHeight: rawVote.block_height || 0,
      timestamp: rawVote.timestamp ? new Date(Number(rawVote.timestamp) / 1e6).toISOString() : new Date().toISOString(),
    };
  }

  /**
   * veNEAR contract view: get_account_info(account_id) -> AccountInfo
   */
  async getAccountInfo(accountId: string): Promise<VeNearAccountInfo | null> {
    const raw = await this.rpcClient.callViewMethod<any>({
      contractId: this.venearContract,
      methodName: 'get_account_info',
      args: { account_id: accountId },
    });

    if (!raw) return null;

    return {
      accountId,
      lockedBalance: raw.locked_balance || raw.amount || '0',
      votingPower: raw.voting_power || raw.ve_balance || '0',
      unlockTimestamp: raw.unlock_timestamp ? new Date(Number(raw.unlock_timestamp) / 1e6).toISOString() : undefined,
      delegatorsCount: raw.delegators_count || (raw.delegators ? Object.keys(raw.delegators).length : 0),
      delegationsTo: raw.delegations_to || [],
    };
  }

  /**
   * veNEAR contract view: ft_balance_of(account_id) -> U128
   */
  async getFtBalanceOf(accountId: string): Promise<string> {
    const balance = await this.rpcClient.callViewMethod<string>({
      contractId: this.venearContract,
      methodName: 'ft_balance_of',
      args: { account_id: accountId },
    });

    return balance || '0';
  }

  /**
   * veNEAR contract view: ft_total_supply() -> U128
   */
  async getFtTotalSupply(): Promise<string> {
    const supply = await this.rpcClient.callViewMethod<string>({
      contractId: this.venearContract,
      methodName: 'ft_total_supply',
      args: {},
    });

    return supply || '0';
  }

  /**
   * veNEAR contract view: get_accounts(from_index, limit) -> Vec<AccountInfo>
   */
  async getAccounts(params: PaginationParams = {}): Promise<VeNearAccountInfo[]> {
    const fromIndex = params.fromIndex ?? 0;
    const limit = params.limit ?? 50;

    const rawAccounts = await this.rpcClient.callViewMethod<any[]>({
      contractId: this.venearContract,
      methodName: 'get_accounts',
      args: {
        from_index: fromIndex,
        limit,
      },
    });

    if (!rawAccounts || !Array.isArray(rawAccounts)) {
      return [];
    }

    return rawAccounts.map((raw) => ({
      accountId: raw.account_id || raw.account || 'unknown.near',
      lockedBalance: raw.locked_balance || raw.amount || '0',
      votingPower: raw.voting_power || raw.ve_balance || '0',
      delegatorsCount: raw.delegators_count || 0,
      unlockTimestamp: raw.unlock_timestamp ? new Date(Number(raw.unlock_timestamp) / 1e6).toISOString() : undefined,
    }));
  }

  private normalizeProposal(raw: any, fallbackId: string): HoSProposal {
    return {
      id: raw.id !== undefined ? String(raw.id) : fallbackId,
      title: raw.title || raw.name || `House of Stake Proposal #${fallbackId}`,
      description: raw.description || raw.body || '',
      proposer: raw.proposer || raw.creator || 'unknown.near',
      status: this.normalizeStatus(raw.status),
      kind: raw.kind === 'FastTrack' ? 'FastTrack' : 'Classic',
      submissionTime: raw.submission_time ? new Date(Number(raw.submission_time) / 1e6).toISOString() : new Date().toISOString(),
      voteStartTime: raw.vote_start_time ? new Date(Number(raw.vote_start_time) / 1e6).toISOString() : new Date().toISOString(),
      voteEndTime: raw.vote_end_time ? new Date(Number(raw.vote_end_time) / 1e6).toISOString() : new Date(Date.now() + 86400000 * 3).toISOString(),
      executionTime: raw.execution_time ? new Date(Number(raw.execution_time) / 1e6).toISOString() : undefined,
      yesVotes: raw.yes_votes || raw.votes?.yes || '0',
      noVotes: raw.no_votes || raw.votes?.no || '0',
      abstainVotes: raw.abstain_votes || raw.votes?.abstain || '0',
      totalVotesCast: raw.total_votes_cast || (raw.votes ? Object.keys(raw.votes).length : 0),
      forumUrl: raw.forum_url || raw.discussion_link,
      snapshotBlockHeight: raw.snapshot_block_height || raw.block_height,
    };
  }

  private normalizeStatus(status: any): any {
    if (!status) return 'Voting';
    if (typeof status === 'string') return status;
    // Rust enums often serialize as { "Voting": {} } or { "Succeeded": { ... } }
    const key = Object.keys(status)[0];
    return key || 'Voting';
  }
}

export const houseOfStakeAdapter = new HouseOfStakeAdapter();

