import { describe, it, expect, vi } from 'vitest';
import { HouseOfStakeAdapter } from '../src/blockchain/houseOfStakeAdapter.js';
import { NearRpcClient } from '../src/blockchain/nearClient.js';

describe('HouseOfStakeAdapter', () => {
  it('normalizes raw contract proposals into typed HoSProposal structs', async () => {
    const mockRpc = new NearRpcClient('http://mock-rpc');
    vi.spyOn(mockRpc, 'callViewMethod').mockResolvedValue([
      {
        id: 0,
        title: 'HSP-001: House of Stake Charter',
        description: 'Test description',
        proposer: 'nearfoundation.near',
        status: { Succeeded: {} },
        kind: 'Classic',
        submission_time: '1705000000000000000',
        vote_start_time: '1705100000000000000',
        vote_end_time: '1705800000000000000',
        yes_votes: '15000000',
        no_votes: '0',
        total_votes_cast: 5,
        block_height: 169000000,
      },
    ]);

    const adapter = new HouseOfStakeAdapter(mockRpc, 'vote.testnet', 'venear.testnet');
    const proposals = await adapter.getProposals({ fromIndex: 0, limit: 10 });

    expect(proposals).toHaveLength(1);
    expect(proposals[0].id).toBe('0');
    expect(proposals[0].title).toBe('HSP-001: House of Stake Charter');
    expect(proposals[0].status).toBe('Succeeded');
    expect(proposals[0].kind).toBe('Classic');
    expect(proposals[0].yesVotes).toBe('15000000');
  });

  it('handles empty results and RPC view failures gracefully without throwing', async () => {
    const mockRpc = new NearRpcClient('http://mock-rpc');
    vi.spyOn(mockRpc, 'callViewMethod').mockResolvedValue(null);

    const adapter = new HouseOfStakeAdapter(mockRpc, 'vote.testnet', 'venear.testnet');
    const proposals = await adapter.getProposals();
    const count = await adapter.getNumProposals();
    const vote = await adapter.getVote('1', 'alice.near');

    expect(proposals).toEqual([]);
    expect(count).toBe(0);
    expect(vote).toBeNull();
  });
});

