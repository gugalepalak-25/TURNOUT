import { WatchlistEntry, WatchlistInput } from './types.js';
import { IStorageEngine } from '../db/types.js';

export class DelegationGuardianService {
  async getWatchlist(delegatorAccountId: string, storage: IStorageEngine): Promise<WatchlistEntry[]> {
    const rawWatchlist = await storage.getWatchlist(delegatorAccountId);
    const allDelegates = await storage.getAllDelegates();

    // Top performers for recommendations
    const topAlternatives = allDelegates
      .filter((d) => d.participationRate >= 85.0 && d.reputationScore >= 80.0)
      .sort((a, b) => b.reputationScore - a.reputationScore)
      .slice(0, 3)
      .map((d) => ({
        accountId: d.accountId,
        name: d.name,
        score: d.reputationScore,
        participationRate: d.participationRate,
        grade: d.performanceGrade,
      }));

    return rawWatchlist.map((item) => {
      const delegate = allDelegates.find((d) => d.accountId === item.delegateAccountId);
      const backup = allDelegates.find((d) => d.accountId === item.backupDelegateAccountId);

      const partRate = delegate ? delegate.participationRate : 0;
      const score = delegate ? delegate.reputationScore : 0;
      const grade = delegate ? delegate.performanceGrade : 'F';

      const isBreached = partRate < item.minParticipationThreshold;

      return {
        delegatorAccountId: item.delegatorAccountId,
        delegateAccountId: item.delegateAccountId,
        delegateName: delegate?.name || item.delegateAccountId,
        currentScore: score,
        currentParticipationRate: partRate,
        currentGrade: grade,
        minParticipationThreshold: item.minParticipationThreshold,
        backupDelegateAccountId: item.backupDelegateAccountId,
        backupDelegateName: backup?.name,
        alertActive: isBreached,
        alertMessage: isBreached
          ? `Participation (${partRate}%) is under your guarded threshold of ${item.minParticipationThreshold}%. Consider re-delegating to backup ${backup?.name || 'an alternative delegate'}.`
          : undefined,
        recommendedAlternatives: topAlternatives.filter(
          (alt) => alt.accountId !== item.delegateAccountId
        ),
      };
    });
  }

  async addOrUpdateWatchlist(input: WatchlistInput, storage: IStorageEngine): Promise<WatchlistEntry> {
    const saved = await storage.saveWatchlistEntry({
      delegatorAccountId: input.delegatorAccountId,
      delegateAccountId: input.delegateAccountId,
      minParticipationThreshold: input.minParticipationThreshold ?? 80.0,
      backupDelegateAccountId: input.backupDelegateAccountId,
    });

    const entries = await this.getWatchlist(input.delegatorAccountId, storage);
    return entries.find((e) => e.delegateAccountId === saved.delegateAccountId) || entries[0];
  }

  async removeFromWatchlist(delegatorAccountId: string, delegateAccountId: string, storage: IStorageEngine): Promise<boolean> {
    return storage.removeWatchlistEntry(delegatorAccountId, delegateAccountId);
  }
}

export const delegationGuardianService = new DelegationGuardianService();

