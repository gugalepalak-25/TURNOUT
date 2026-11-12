export interface AIAnalysisRequest {
  query: string;
  contextType?: 'delegate' | 'proposal' | 'comparison' | 'general' | 'overview';
  delegateAccountId?: string;
  secondDelegateAccountId?: string;
  proposalId?: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface AIAnalysisResponse {
  shortAnswer: string;
  supportingEvidence: string[];
  sourceLinks: Array<{ label: string; url: string }>;
  relevantDates: Array<{ event: string; date: string }>;
  confidenceLevel: 'High' | 'Medium' | 'Low';
  limitations: string[];
  generatedByModel: string;
  timestamp: string;
}

