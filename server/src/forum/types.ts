export type ExplanationStatus = 'Verified' | 'Unverified' | 'NotFound' | 'Ambiguous';

export interface ForumPostMatch {
  postId: string;
  topicId: string;
  topicTitle: string;
  authorUsername: string;
  postUrl: string;
  createdAt: string;
  rawContent: string;
  cleanSnippet: string;
  explanationStatus: ExplanationStatus;
  confidenceScore: number; // 0.0 to 1.0
  reasoning: string;
  matchedKeywords: string[];
}

export interface ProposalDiscussion {
  topicId: string;
  title: string;
  url: string;
  slug: string;
  createdAt: string;
  postsCount: number;
  tags: string[];
}

