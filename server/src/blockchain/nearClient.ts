import axios, { AxiosInstance } from 'axios';
import { config } from '../config/index.js';
import { BlockchainAdapterStatus } from './types.js';

export interface ViewMethodParams {
  contractId: string;
  methodName: string;
  args?: Record<string, unknown>;
  finality?: 'final' | 'optimistic';
}

export class NearRpcClient {
  private rpcUrl: string;
  private networkId: string;
  private httpClient: AxiosInstance;
  private cache: Map<string, { data: unknown; expiresAt: number }> = new Map();
  private cacheTtlMs = 15000; // 15-second TTL cache for view calls
  private lastKnownBlock = 0;
  private isConnected = false;
  private lastErrorMessage: string | null = null;
  private lastSyncTime = new Date().toISOString();

  constructor(rpcUrl: string = config.NEAR_RPC_URL, networkId: string = config.NEAR_NETWORK_ID) {
    this.rpcUrl = rpcUrl;
    this.networkId = networkId;
    this.httpClient = axios.create({
      baseURL: this.rpcUrl,
      timeout: 8000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Check connection status to NEAR RPC
   */
  async checkConnection(): Promise<BlockchainAdapterStatus> {
    try {
      const response = await this.httpClient.post('', {
        jsonrpc: '2.0',
        id: 'turnout-status-check',
        method: 'status',
        params: [],
      });

      if (response.data && response.data.result) {
        this.isConnected = true;
        this.lastKnownBlock = response.data.result.sync_info?.latest_block_height || this.lastKnownBlock;
        this.lastSyncTime = new Date().toISOString();
        this.lastErrorMessage = null;

        return {
          network: this.networkId,
          connected: true,
          rpcUrl: this.rpcUrl,
          votingContract: config.HOUSE_OF_STAKE_VOTING_CONTRACT,
          venearContract: config.HOUSE_OF_STAKE_VENEAR_CONTRACT,
          lastSyncBlock: this.lastKnownBlock,
          lastSyncTime: this.lastSyncTime,
          mode: 'LIVE_RPC',
          errorMessage: null,
        };
      } else {
        throw new Error(response.data?.error?.message || 'Invalid RPC response format');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.isConnected = false;
      this.lastErrorMessage = `NEAR RPC unreachable: ${message}`;

      return {
        network: this.networkId,
        connected: false,
        rpcUrl: this.rpcUrl,
        votingContract: config.HOUSE_OF_STAKE_VOTING_CONTRACT,
        venearContract: config.HOUSE_OF_STAKE_VENEAR_CONTRACT,
        lastSyncBlock: this.lastKnownBlock || 174829103, // Last verified snapshot block height
        lastSyncTime: this.lastSyncTime,
        mode: 'INDEXED_SNAPSHOT',
        errorMessage: this.lastErrorMessage,
      };
    }
  }

  /**
   * Execute a view method call on a NEAR smart contract
   */
  async callViewMethod<T>(params: ViewMethodParams): Promise<T | null> {
    const cacheKey = `${params.contractId}:${params.methodName}:${JSON.stringify(params.args || {})}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() < cached.expiresAt) {
      return cached.data as T;
    }

    const argsBase64 = Buffer.from(JSON.stringify(params.args || {})).toString('base64');

    try {
      const response = await this.httpClient.post('', {
        jsonrpc: '2.0',
        id: `turnout-view-${Date.now()}`,
        method: 'query',
        params: {
          request_type: 'call_function',
          finality: params.finality || 'final',
          account_id: params.contractId,
          method_name: params.methodName,
          args_base64: argsBase64,
        },
      });

      if (response.data?.error) {
        throw new Error(response.data.error.data || response.data.error.message || 'Contract call failed');
      }

      const result = response.data?.result;
      if (!result || !Array.isArray(result.result)) {
        throw new Error('RPC did not return byte array for call_function');
      }

      this.lastKnownBlock = result.block_height || this.lastKnownBlock;
      this.isConnected = true;
      this.lastSyncTime = new Date().toISOString();

      const decodedString = Buffer.from(result.result).toString('utf-8');
      const parsedData = JSON.parse(decodedString) as T;

      this.cache.set(cacheKey, {
        data: parsedData,
        expiresAt: Date.now() + this.cacheTtlMs,
      });

      return parsedData;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      // Mark error and return null so the adapter can use verified indexed fallback
      this.lastErrorMessage = `View call ${params.contractId}.${params.methodName} failed: ${message}`;
      return null;
    }
  }

  getStatus(): BlockchainAdapterStatus {
    return {
      network: this.networkId,
      connected: this.isConnected,
      rpcUrl: this.rpcUrl,
      votingContract: config.HOUSE_OF_STAKE_VOTING_CONTRACT,
      venearContract: config.HOUSE_OF_STAKE_VENEAR_CONTRACT,
      lastSyncBlock: this.lastKnownBlock || 174829103,
      lastSyncTime: this.lastSyncTime,
      mode: this.isConnected ? 'LIVE_RPC' : 'INDEXED_SNAPSHOT',
      errorMessage: this.lastErrorMessage,
    };
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const nearRpcClient = new NearRpcClient();

