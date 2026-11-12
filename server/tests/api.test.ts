import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { getStorage } from '../src/db/index.js';

describe('Turnout REST API Endpoints', () => {
  beforeAll(async () => {
    await getStorage();
  });

  it('GET /api/health returns 200 with service metadata', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.product).toBe('TURNOUT');
    expect(res.body.blockchain).toBeDefined();
  });

  it('GET /api/overview returns governance metrics and active proposals', async () => {
    const res = await request(app).get('/api/overview');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalDelegates).toBeGreaterThanOrEqual(8);
    expect(res.body.data.totalProposals).toBeGreaterThanOrEqual(6);
    expect(res.body.data.averageParticipationRate).toBeGreaterThan(0);
    expect(Array.isArray(res.body.data.recentActivity)).toBe(true);
  });

  it('GET /api/delegates and /api/leaderboard return sorted delegates', async () => {
    const res = await request(app).get('/api/leaderboard');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0].reputationScore).toBeGreaterThanOrEqual(res.body.data[1].reputationScore);
  });

  it('GET /api/delegates/:account returns Governance Passport with votes and scorecards', async () => {
    const res = await request(app).get('/api/delegates/infura.poolv1.near');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Infura Infrastructure Delegate');
    expect(Array.isArray(res.body.data.votes)).toBe(true);
    expect(Array.isArray(res.body.data.scorecards)).toBe(true);
  });

  it('GET /api/proposals returns all tracked proposals', async () => {
    const res = await request(app).get('/api/proposals');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].title).toBeDefined();
  });

  it('POST /api/scorecards/calculate evaluates 100-point reputation', async () => {
    const res = await request(app)
      .post('/api/scorecards/calculate')
      .send({
        delegateAccountId: 'test.near',
        evaluationPeriod: 'HOS-2026-Q1',
        metrics: {
          eligibleClosedProposals: 5,
          votesCast: 5,
          abstentions: 0,
          missedVotes: 0,
          verifiedExplanations: 5,
          timelyExplanations: 5,
          rollingConsistencyPct: 100,
          applicableVotes: 5,
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalScore).toBe(100);
    expect(res.body.data.grade).toBe('A');
    expect(res.body.data.evidenceHash).toHaveLength(64);
  });

  it('POST /api/analysis runs grounded AI governance analyst query', async () => {
    const res = await request(app)
      .post('/api/analysis')
      .send({
        query: 'Who has the highest participation rate in House of Stake?',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.shortAnswer).toBeDefined();
    expect(Array.isArray(res.body.data.supportingEvidence)).toBe(true);
    expect(Array.isArray(res.body.data.limitations)).toBe(true);
  });
});

