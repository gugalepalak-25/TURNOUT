import React, { useState } from 'react';
import { Bot, Send, Sparkles, ExternalLink, ShieldAlert, Calendar, CheckCircle2, RefreshCw } from 'lucide-react';
import { queryAIAnalyst } from '../services/api.js';
import { TerminalBox } from '../components/common/TerminalBox.js';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  analysis?: any;
}

export const AnalystPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'I am the TURNOUT AI Governance Analyst. All answers are strictly grounded in on-chain House of Stake voting records, Discourse forum explanations, and verified scorecard hashes.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const samplePrompts = [
    'Why did cryptium.poolv1.near reject proposal HSP-002?',
    'Which delegates missed proposals in the current epoch?',
    'Who has the highest reputation score in House of Stake?',
    'Explain the 100-point reputation scoring formula.',
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: textToSend.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const response = await queryAIAnalyst({
        query: textToSend.trim(),
        conversationHistory: history,
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.shortAnswer,
        analysis: response,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Unable to complete governance query. Please verify that the Turnout backend is running.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-cr-border pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cr-accent tracking-widest uppercase mb-1">
            <Bot className="w-3.5 h-3.5" />
            AI GOVERNANCE ANALYST
          </div>
          <h1 className="text-3xl font-heading font-bold text-cr-text tracking-tight">
            Institutional Research Analyst
          </h1>
          <p className="text-sm text-cr-muted mt-1 max-w-2xl">
            Strictly grounded in on-chain House of Stake voting ledgers and verified Discourse explanations. Zero simulated facts.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-cr-muted bg-cr-surface border border-cr-border px-3 py-1.5 rounded-lg">
          <ShieldAlert className="w-3.5 h-3.5 text-cr-secondaryAccent" />
          <span>Grounding: 100% On-Chain DB</span>
        </div>
      </div>

      {/* Suggested Queries */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-mono text-cr-muted flex items-center gap-1.5 mr-1">
          <Sparkles className="w-3 h-3 text-cr-accent" />
          Quick Inquiries:
        </span>
        {samplePrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="text-xs font-mono bg-cr-surface hover:bg-cr-surfaceHover text-cr-text hover:text-white px-3 py-1 rounded border border-cr-border hover:border-cr-borderLight transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Log Terminal */}
      <TerminalBox
        title="Intelligence Investigation Terminal"
        tag="Live Session"
        action={
          <button
            onClick={() =>
              setMessages([
                {
                  role: 'assistant',
                  content:
                    'Session reset. Ask any question regarding NEAR House of Stake delegates, votes, or rationales.',
                },
              ])
            }
            className="text-xs font-mono text-cr-muted hover:text-cr-text flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        }
      >
        <div className="space-y-6 max-h-[550px] overflow-y-auto pr-2 pb-2">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${
                m.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-cr-bgSecondary border border-cr-border flex items-center justify-center shrink-0 text-cr-accent">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-lg p-4 font-sans text-sm ${
                  m.role === 'user'
                    ? 'bg-cr-accent text-cr-bg font-semibold font-mono text-xs'
                    : 'bg-cr-bgSecondary border border-cr-border text-cr-text'
                }`}
              >
                <div className="leading-relaxed whitespace-pre-line">{m.content}</div>

                {/* Structured Analyst Evidence Card */}
                {m.analysis && (
                  <div className="mt-4 pt-4 border-t border-cr-border space-y-3 font-mono text-xs">
                    {/* Confidence and Model Tag */}
                    <div className="flex items-center justify-between text-[11px] text-cr-muted">
                      <span>Model: {m.analysis.generatedByModel}</span>
                      <span className="text-cr-accent font-semibold">
                        Confidence: {m.analysis.confidenceLevel}
                      </span>
                    </div>

                    {/* Supporting Evidence List */}
                    {m.analysis.supportingEvidence?.length > 0 && (
                      <div className="bg-cr-surface p-3 rounded border border-cr-border/80 space-y-1.5">
                        <span className="text-[10px] uppercase text-cr-muted block tracking-wider">
                          Supporting Governance Records:
                        </span>
                        {m.analysis.supportingEvidence.map((ev: string, eIdx: number) => (
                          <div key={eIdx} className="flex items-start gap-2 text-cr-text font-sans text-xs">
                            <span className="text-cr-secondaryAccent font-mono font-bold">•</span>
                            <span>{ev}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Source Links */}
                    {m.analysis.sourceLinks?.length > 0 && (
                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <span className="text-[10px] uppercase text-cr-muted">Sources:</span>
                        {m.analysis.sourceLinks.map((link: any, lIdx: number) => (
                          <a
                            key={lIdx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-cr-accent hover:underline bg-cr-surface px-2 py-0.5 rounded border border-cr-border"
                          >
                            <span>{link.label}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Limitations Notice */}
                    {m.analysis.limitations?.length > 0 && (
                      <div className="text-[10px] text-cr-muted/80 pt-1 font-mono">
                        <span className="text-cr-warning">Limitation: </span>
                        {m.analysis.limitations.join(' ')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 items-center text-xs font-mono text-cr-muted">
              <div className="w-8 h-8 rounded-lg bg-cr-bgSecondary border border-cr-border flex items-center justify-center text-cr-accent">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <span>RETRIEVING GOVERNANCE EVIDENCE & FORMULATING ANALYSIS...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="mt-4 pt-4 border-t border-cr-border flex gap-2">
          <input
            type="text"
            placeholder="Ask a factual question about NEAR House of Stake delegates, votes, or rationales..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
            className="flex-1 bg-cr-bg text-cr-text font-mono text-xs px-4 py-2.5 rounded border border-cr-border focus:border-cr-accent focus:outline-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="px-5 py-2.5 rounded bg-cr-accent text-cr-bg font-mono text-xs font-bold hover:bg-cr-accentHover transition-colors disabled:opacity-40 flex items-center gap-2 shrink-0"
          >
            <span>Ask Analyst</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </TerminalBox>
    </div>
  );
};

