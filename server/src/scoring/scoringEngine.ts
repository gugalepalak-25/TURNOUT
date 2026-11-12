import {
  ScoringWeights,
  DelegateEvaluationMetrics,
  ScorecardResult,
  PerformanceGrade,
} from './types.js';
import { computeEvidenceHash } from './hashUtils.js';

export const DEFAULT_WEIGHTS: ScoringWeights = {
  votingParticipationWeight: 40,
  rationalePublicationWeight: 25,
  timelyReportingWeight: 20,
  participationConsistencyWeight: 15,
};

export class DelegateScoringEngine {
  private weights: ScoringWeights;
  private methodologyVersion: string;

  constructor(
    weights: ScoringWeights = DEFAULT_WEIGHTS,
    methodologyVersion: string = 'turnout-scoring-v1.0.0'
  ) {
    this.weights = weights;
    this.methodologyVersion = methodologyVersion;
  }

  /**
   * Calculate 100-point transparent delegate reputation score
   */
  calculateScore(
    delegateAccountId: string,
    evaluationPeriod: string,
    metrics: DelegateEvaluationMetrics
  ): ScorecardResult {
    const {
      eligibleClosedProposals,
      votesCast,
      abstentions,
      verifiedExplanations,
      timelyExplanations,
      rollingConsistencyPct,
      applicableVotes,
    } = metrics;

    // 1. Voting Participation Score: (votes cast / eligible closed proposals) * 40
    let votingScore = 0;
    let actualParticipationPct = 0;

    if (eligibleClosedProposals > 0) {
      actualParticipationPct = (votesCast / eligibleClosedProposals) * 100;
      votingScore = (votesCast / eligibleClosedProposals) * this.weights.votingParticipationWeight;
    }
    // Clamp to max weight
    votingScore = Math.min(this.weights.votingParticipationWeight, Math.max(0, votingScore));

    // 2. Rationale Score: (verified explanations / applicable votes) * 25
    let rationaleScore = 0;
    if (applicableVotes > 0) {
      rationaleScore = (verifiedExplanations / applicableVotes) * this.weights.rationalePublicationWeight;
    }
    rationaleScore = Math.min(this.weights.rationalePublicationWeight, Math.max(0, rationaleScore));

    // 3. Timeliness Score: (timely explanations / applicable votes) * 20
    let timelinessScore = 0;
    if (applicableVotes > 0) {
      timelinessScore = (timelyExplanations / applicableVotes) * this.weights.timelyReportingWeight;
    }
    timelinessScore = Math.min(this.weights.timelyReportingWeight, Math.max(0, timelinessScore));

    // 4. Consistency Score: (rolling consistency pct / 100) * 15
    const clampedConsistency = Math.min(100, Math.max(0, rollingConsistencyPct));
    const consistencyScore = (clampedConsistency / 100) * this.weights.participationConsistencyWeight;

    // Total score
    const totalScoreRaw = votingScore + rationaleScore + timelinessScore + consistencyScore;
    const totalScore = Math.round(totalScoreRaw * 10) / 10; // 1 decimal place

    // Performance Grade
    const grade = this.assignGrade(totalScore);

    // House of Stake 80% Charter check
    const meetsHoSCharter = actualParticipationPct >= 80.0;

    // Canonical Evidence Generation
    const evidencePayload = {
      version: this.methodologyVersion,
      delegateAccountId,
      evaluationPeriod,
      weights: this.weights,
      metrics: {
        eligibleClosedProposals,
        votesCast,
        abstentions,
        missedVotes: metrics.missedVotes,
        verifiedExplanations,
        timelyExplanations,
        rollingConsistencyPct,
        applicableVotes,
      },
      scores: {
        votingScore: Math.round(votingScore * 10) / 10,
        rationaleScore: Math.round(rationaleScore * 10) / 10,
        timelinessScore: Math.round(timelinessScore * 10) / 10,
        consistencyScore: Math.round(consistencyScore * 10) / 10,
        totalScore,
        grade,
      },
      hosCharter: {
        minimumRequiredPct: 80.0,
        actualParticipationPct: Math.round(actualParticipationPct * 10) / 10,
        meetsHoSCharter,
      },
    };

    const { evidenceHash, canonicalJson } = computeEvidenceHash(evidencePayload);

    return {
      delegateAccountId,
      evaluationPeriod,
      methodologyVersion: this.methodologyVersion,
      totalScore,
      grade,
      breakdown: {
        votingScore: Math.round(votingScore * 10) / 10,
        rationaleScore: Math.round(rationaleScore * 10) / 10,
        timelinessScore: Math.round(timelinessScore * 10) / 10,
        consistencyScore: Math.round(consistencyScore * 10) / 10,
      },
      metrics,
      hosCharterRequirement: {
        minimumRequiredPct: 80.0,
        actualParticipationPct: Math.round(actualParticipationPct * 10) / 10,
        meetsHoSCharter,
      },
      evidenceHash,
      canonicalEvidenceJson: canonicalJson,
      calculatedAt: new Date().toISOString(),
    };
  }

  assignGrade(score: number): PerformanceGrade {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  }

  getWeights(): ScoringWeights {
    return { ...this.weights };
  }
}

export const delegateScoringEngine = new DelegateScoringEngine();

