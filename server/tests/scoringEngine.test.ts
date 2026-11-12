import { describe, it, expect } from 'vitest';
import { DelegateScoringEngine } from '../src/scoring/scoringEngine.js';
import { canonicalStringify, computeEvidenceHash } from '../src/scoring/hashUtils.js';

describe('DelegateScoringEngine', () => {
  const engine = new DelegateScoringEngine();

  it('calculates perfect 100 score for flawless participation', () => {
    const result = engine.calculateScore('infura.poolv1.near', 'HOS-2026-Q1', {
      eligibleClosedProposals: 10,
      votesCast: 10,
      abstentions: 0,
      missedVotes: 0,
      verifiedExplanations: 10,
      timelyExplanations: 10,
      rollingConsistencyPct: 100,
      applicableVotes: 10,
    });

    expect(result.totalScore).toBe(100);
    expect(result.grade).toBe('A');
    expect(result.breakdown.votingScore).toBe(40);
    expect(result.breakdown.rationaleScore).toBe(25);
    expect(result.breakdown.timelinessScore).toBe(20);
    expect(result.breakdown.consistencyScore).toBe(15);
    expect(result.hosCharterRequirement.meetsHoSCharter).toBe(true);
    expect(result.evidenceHash).toHaveLength(64);
  });

  it('safely handles zero denominators without NaN or throwing', () => {
    const result = engine.calculateScore('new-delegate.near', 'HOS-2026-Q1', {
      eligibleClosedProposals: 0,
      votesCast: 0,
      abstentions: 0,
      missedVotes: 0,
      verifiedExplanations: 0,
      timelyExplanations: 0,
      rollingConsistencyPct: 0,
      applicableVotes: 0,
    });

    expect(result.totalScore).toBe(0);
    expect(result.grade).toBe('F');
    expect(result.breakdown.votingScore).toBe(0);
    expect(result.breakdown.rationaleScore).toBe(0);
    expect(result.breakdown.timelinessScore).toBe(0);
    expect(result.breakdown.consistencyScore).toBe(0);
    expect(result.hosCharterRequirement.meetsHoSCharter).toBe(false);
    expect(Number.isNaN(result.totalScore)).toBe(false);
  });

  it('assigns correct performance grades based on thresholds', () => {
    expect(engine.assignGrade(95)).toBe('A');
    expect(engine.assignGrade(90)).toBe('A');
    expect(engine.assignGrade(89.9)).toBe('B');
    expect(engine.assignGrade(80)).toBe('B');
    expect(engine.assignGrade(75)).toBe('C');
    expect(engine.assignGrade(70)).toBe('C');
    expect(engine.assignGrade(65)).toBe('D');
    expect(engine.assignGrade(50)).toBe('D');
    expect(engine.assignGrade(49.9)).toBe('F');
    expect(engine.assignGrade(0)).toBe('F');
  });

  it('strictly distinguishes 80% House of Stake charter from total score', () => {
    // High explanations but only 70% voting participation (fails HoS charter)
    const result = engine.calculateScore('delegate.near', 'HOS-2026-Q1', {
      eligibleClosedProposals: 10,
      votesCast: 7, // 70% -> Fails HoS 80% rule
      abstentions: 0,
      missedVotes: 3,
      verifiedExplanations: 7,
      timelyExplanations: 7,
      rollingConsistencyPct: 90,
      applicableVotes: 7,
    });

    expect(result.hosCharterRequirement.meetsHoSCharter).toBe(false);
    expect(result.hosCharterRequirement.actualParticipationPct).toBe(70);
  });
});

describe('Canonical Evidence Hashing', () => {
  it('produces identical SHA-256 hash regardless of object key order', () => {
    const objA = { z: 1, a: 'hello', m: { b: 2, a: 1 } };
    const objB = { a: 'hello', m: { a: 1, b: 2 }, z: 1 };

    const hashA = computeEvidenceHash(objA);
    const hashB = computeEvidenceHash(objB);

    expect(canonicalStringify(objA)).toBe(canonicalStringify(objB));
    expect(hashA.evidenceHash).toBe(hashB.evidenceHash);
    expect(hashA.evidenceHash).toMatch(/^[a-f0-9]{64}$/);
  });
});

