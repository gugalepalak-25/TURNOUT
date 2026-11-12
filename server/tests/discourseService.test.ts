import { describe, it, expect } from 'vitest';
import { DiscourseForumService } from '../src/forum/discourseService.js';

describe('DiscourseForumService - Content Evaluation', () => {
  const service = new DiscourseForumService();

  it('classifies substantive governance rationale as Verified with high confidence', () => {
    const post = `We have reviewed HSP-002 thoroughly. We cast our vote in favor (APPROVE) because the proposal rebalances validator rewards towards smaller node operators, improving network decentralization and staking distribution without inflating the overall NEAR supply.`;
    const result = service.evaluateExplanationContent(post);

    expect(result.status).toBe('Verified');
    expect(result.confidence).toBeGreaterThanOrEqual(0.9);
    expect(result.matchedKeywords).toContain('vote');
    expect(result.matchedKeywords).toContain('because');
  });

  it('classifies brief procedural mention as Ambiguous or Unverified', () => {
    const post = `Just voted on this proposal today.`;
    const result = service.evaluateExplanationContent(post);

    expect(['Ambiguous', 'Unverified']).toContain(result.status);
    expect(result.confidence).toBeLessThan(0.7);
  });

  it('classifies unrelated posts as NotFound', () => {
    const post = `Good morning everyone, what is the weather like in Lisbon?`;
    const result = service.evaluateExplanationContent(post);

    expect(result.status).toBe('NotFound');
    expect(result.confidence).toBe(0.0);
  });
});

