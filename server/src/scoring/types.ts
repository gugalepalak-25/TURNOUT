export type PerformanceGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface ScoringWeights {
  votingParticipationWeight: number; // default 40
  rationalePublicationWeight: number; // default 25
  timelyReportingWeight: number; // default 20
  participationConsistencyWeight: number; // default 15
}

export interface DelegateEvaluationMetrics {
  eligibleClosedProposals: number;
  votesCast: number; // includes Approve, Reject, Abstain
  abstentions: number;
  missedVotes: number;
  verifiedExplanations: number;
  timelyExplanations: number;
  rollingConsistencyPct: number; // 0 to 100
  applicableVotes: number;
}

export interface ScorecardResult {
  delegateAccountId: string;
  evaluationPeriod: string;
  methodologyVersion: string;
  totalScore: number; // 0 to 100
  grade: PerformanceGrade;
  breakdown: {
    votingScore: number; // max 40
    rationaleScore: number; // max 25
    timelinessScore: number; // max 20
    consistencyScore: number; // max 15
  };
  metrics: DelegateEvaluationMetrics;
  hosCharterRequirement: {
    minimumRequiredPct: number; // 80.0
    actualParticipationPct: number;
    meetsHoSCharter: boolean;
  };
  evidenceHash: string; // 64 hex characters
  canonicalEvidenceJson: string;
  calculatedAt: string;
}

