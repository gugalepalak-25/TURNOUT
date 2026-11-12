import axios, { AxiosInstance } from 'axios';
import { config } from '../config/index.js';
import { ForumPostMatch, ProposalDiscussion, ExplanationStatus } from './types.js';

export class DiscourseForumService {
  private httpClient: AxiosInstance;
  private baseUrl: string;

  // Known delegate mapping: NEAR accountId -> Discourse username
  private delegateForumUserMap: Map<string, string> = new Map([
    ['infura.poolv1.near', 'infura_near'],
    ['cryptium.poolv1.near', 'cryptium_labs'],
    ['linear-protocol.near', 'linear_dao'],
    ['staked.poolv1.near', 'staked_us'],
    ['kucoincfg.poolv1.near', 'kucoin_official'],
    ['aurora-validator.near', 'aurora_community'],
    ['pathrock.poolv1.near', 'pathrock_network'],
    ['everstake.poolv1.near', 'everstake_near'],
  ]);

  constructor(baseUrl: string = config.DISCOURSE_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 6000,
      headers: {
        Accept: 'application/json',
      },
    });
  }

  /**
   * Search proposal discussions on Discourse
   */
  async searchProposalDiscussions(query: string): Promise<ProposalDiscussion[]> {
    try {
      const response = await this.httpClient.get('/search.json', {
        params: { q: `${query} #governance` },
      });

      const topics = response.data?.topics || [];
      return topics.map((t: any) => ({
        topicId: String(t.id),
        title: t.title,
        url: `${this.baseUrl}/t/${t.slug}/${t.id}`,
        slug: t.slug,
        createdAt: t.created_at,
        postsCount: t.posts_count,
        tags: t.tags || [],
      }));
    } catch {
      // Return empty array on network failure
      return [];
    }
  }

  /**
   * Fetch topic posts and search for delegate rationale
   */
  async findDelegateRationale(
    topicId: string,
    delegateAccountId: string,
    proposalDeadline: Date
  ): Promise<ForumPostMatch | null> {
    try {
      const response = await this.httpClient.get(`/t/${topicId}.json`);
      const postStream = response.data?.post_stream?.posts || [];
      const topicTitle = response.data?.title || 'Governance Proposal';
      const slug = response.data?.slug || 'topic';

      const mappedUsername = this.delegateForumUserMap.get(delegateAccountId)?.toLowerCase();

      for (const post of postStream) {
        const author = (post.username || '').toLowerCase();
        const postContent = (post.cooked || post.raw || '').toLowerCase();

        const authorMatches =
          (mappedUsername && author === mappedUsername) ||
          author === delegateAccountId.replace('.near', '').toLowerCase() ||
          author.includes(delegateAccountId.split('.')[0]);

        if (authorMatches) {
          const postDate = new Date(post.created_at);
          const isBeforeDeadline = postDate <= proposalDeadline;
          const evaluation = this.evaluateExplanationContent(post.raw || post.cooked || '');

          return {
            postId: String(post.id),
            topicId,
            topicTitle,
            authorUsername: post.username,
            postUrl: `${this.baseUrl}/t/${slug}/${topicId}/${post.post_number}`,
            createdAt: post.created_at,
            rawContent: post.raw || post.cooked || '',
            cleanSnippet: this.cleanSnippet(post.raw || post.cooked || ''),
            explanationStatus: evaluation.status,
            confidenceScore: evaluation.confidence,
            reasoning: evaluation.reasoning + (isBeforeDeadline ? ' (Submitted prior to voting close)' : ' (Late submission)'),
            matchedKeywords: evaluation.matchedKeywords,
          };
        }
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Determine whether a post's content provides an explanation for a vote
   */
  evaluateExplanationContent(text: string): {
    status: ExplanationStatus;
    confidence: number;
    reasoning: string;
    matchedKeywords: string[];
  } {
    const lower = text.toLowerCase();
    const rationaleSignals = [
      'vote',
      'voting',
      'voted',
      'support',
      'oppose',
      'against',
      'in favor',
      'rationale',
      'reason',
      'because',
      'we believe',
      'delegation',
      'decision',
      'stakeholders',
      'concerns',
      'budget',
    ];

    const matchedKeywords = rationaleSignals.filter((signal) => lower.includes(signal));

    if (matchedKeywords.length >= 3 && (lower.includes('vote') || lower.includes('support') || lower.includes('against') || lower.includes('in favor') || lower.includes('reject') || lower.includes('approve'))) {
      return {
        status: 'Verified',
        confidence: 0.94,
        reasoning: 'Detailed explanation with clear vote position, rationale signals, and governance reasoning.',
        matchedKeywords,
      };
    }

    if (matchedKeywords.length >= 2) {
      return {
        status: 'Ambiguous',
        confidence: 0.65,
        reasoning: 'Mentions voting position or general reasoning but lacks deep structural explanation.',
        matchedKeywords,
      };
    }

    if (matchedKeywords.length === 1) {
      return {
        status: 'Unverified',
        confidence: 0.35,
        reasoning: 'Brief commentary or procedural post without explicit rationale.',
        matchedKeywords,
      };
    }

    return {
      status: 'NotFound',
      confidence: 0.0,
      reasoning: 'No recognizable voting rationale detected in discussion.',
      matchedKeywords: [],
    };
  }

  private cleanSnippet(content: string): string {
    const plain = content.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    return plain.length > 280 ? `${plain.substring(0, 277)}...` : plain;
  }

  getMappedForumUsername(delegateAccountId: string): string | undefined {
    return this.delegateForumUserMap.get(delegateAccountId);
  }

  setMappedForumUsername(delegateAccountId: string, forumUsername: string): void {
    this.delegateForumUserMap.set(delegateAccountId, forumUsername);
  }
}

export const discourseForumService = new DiscourseForumService();
