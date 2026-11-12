import { NearRpcClient, nearRpcClient } from './nearClient.js';
import { PaginationParams } from './types.js';

export interface SputnikProposal {
  id: number;
  proposer: string;
  description: string;
  kind: string;
  status: 'InProgress' | 'Approved' | 'Rejected' | 'Removed' | 'Expired' | 'Moved';
  voteCounts: Record<string, string>;
  submissionTime: string;
}

export interface SputnikPolicy {
  roles: Array<{ name: string; kind: any; permissions: string[] }>;
  defaultVotePolicy: { weightKind: string; quorum: string; threshold: any };
  proposalBond: string;
}

export class SputnikDaoAdapter {
  private rpcClient: NearRpcClient;
  private defaultContractId: string;

  constructor(rpcClient: NearRpcClient = nearRpcClient, defaultContractId: string = 'sputnik-v2.near') {
    this.rpcClient = rpcClient;
    this.defaultContractId = defaultContractId;
  }

  async getPolicy(daoContractId: string = this.defaultContractId): Promise<SputnikPolicy | null> {
    return this.rpcClient.callViewMethod<SputnikPolicy>({
      contractId: daoContractId,
      methodName: 'get_policy',
      args: {},
    });
  }

  async getLastProposalId(daoContractId: string = this.defaultContractId): Promise<number> {
    const result = await this.rpcClient.callViewMethod<number>({
      contractId: daoContractId,
      methodName: 'get_last_proposal_id',
      args: {},
    });
    return result ?? 0;
  }

  async getProposals(
    daoContractId: string = this.defaultContractId,
    params: PaginationParams = {}
  ): Promise<SputnikProposal[]> {
    const fromIndex = params.fromIndex ?? 0;
    const limit = params.limit ?? 20;

    const raw = await this.rpcClient.callViewMethod<any[]>({
      contractId: daoContractId,
      methodName: 'get_proposals',
      args: {
        from_index: fromIndex,
        limit,
      },
    });

    if (!raw || !Array.isArray(raw)) return [];

    return raw.map((p, idx) => ({
      id: p.id ?? fromIndex + idx,
      proposer: p.proposer || 'unknown.near',
      description: p.description || '',
      kind: typeof p.kind === 'string' ? p.kind : Object.keys(p.kind || {})[0] || 'Vote',
      status: p.status || 'InProgress',
      voteCounts: p.votes || {},
      submissionTime: p.submission_time ? new Date(Number(p.submission_time) / 1e6).toISOString() : new Date().toISOString(),
    }));
  }
}

export const sputnikDaoAdapter = new SputnikDaoAdapter();

