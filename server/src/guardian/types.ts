export interface WatchlistEntry {
  delegatorAccountId: string;
  delegateAccountId: string;
  delegateName: string;
  currentScore: number;
  currentParticipationRate: number;
  currentGrade: string;
  minParticipationThreshold: number; // e.g. 80%
  backupDelegateAccountId?: string;
  backupDelegateName?: string;
  alertActive: boolean;
  alertMessage?: string;
  recommendedAlternatives: Array<{
    accountId: string;
    name: string;
    score: number;
    participationRate: number;
    grade: string;
  }>;
}

export interface WatchlistInput {
  delegatorAccountId: string;
  delegateAccountId: string;
  minParticipationThreshold?: number;
  backupDelegateAccountId?: string;
}

