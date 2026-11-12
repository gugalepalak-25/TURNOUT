import React, { useState } from 'react';
import { Bot, Send, Sparkles, ExternalLink, ShieldAlert, RefreshCw } from 'lucide-react';
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
      <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#8e8e8e] tracking-widest uppercase mb-1">
            <Bot className="w-3.5 h-3.5 text-white" />
            <span>AI GOVERNANCE ANALYST</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-dotmatrix font-bold text-white tracking-tight">
            INSTITUTIONAL RESEARCH ANALYST
          </h1>
          <p className="text-sm text-[#8e8e8e] mt-1 max-w-2xl font-sans">
            Strictly grounded in on-chain House of Stake voting ledgers and verified Discourse explanations. Zero simulated facts.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#c4c2c3] bg-[#28282a] border border-white/20 px-4 py-2 rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.16)]">
          <ShieldAlert className="w-3.5 h-3.5 text-[#B6F36B]" />
          <span>Grounding: 100% On-Chain DB</span>
        </div>
      </div>

      {/* Suggested Queries */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-mono text-[#8e8e8e] flex items-center gap-1.5 mr-1">
          <Sparkles className="w-3 h-3 text-white" />
          Quick Inquiries:
        </span>
        {samplePrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="text-xs font-sans bg-[#28282a] hover:bg-white hover:text-black text-[#c8c8c8] px-4 py-1.5 rounded-full border border-white/15 transition-all shadow-sm hover:-translate-y-0.5"
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
            className="text-xs font-mono text-[#8e8e8e] hover:text-white flex items-center gap-1.5 transition-colors px-3 py-1 rounded-full bg-[#28282a] border border-white/10"
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
              className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
            >
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-5 font-sans text-sm shadow-[0_4px_14px_rgba(0,0,0,0.16)] ${m.role === 'user'
                    ? 'bg-white text-black font-semibold text-xs rounded-br-sm'
                    : 'bg-[#121214]/90 border border-white/15 text-white rounded-bl-sm'
                  }`}
              >
                <div className="leading-relaxed whitespace-pre-line">{m.content}</div>

                {/* Structured Analyst Evidence Card */}
                {m.analysis && (
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-3 font-mono text-xs">
                    {/* Confidence and Model Tag */}
                    <div className="flex items-center justify-between text-[11px] text-[#8e8e8e]">
                      <span>Model: {m.analysis.generatedByModel}</span>
                      <span className="text-white font-semibold">
                        Confidence: {m.analysis.confidenceLevel}
                      </span>
                    </div>

                    {/* Supporting Evidence List */}
                    {m.analysis.supportingEvidence?.length > 0 && (
                      <div className="bg-[#18181a] p-3.5 rounded-xl border border-white/10 space-y-2">
                        <span className="text-[10px] uppercase text-[#8e8e8e] block tracking-wider font-semibold">
                          Supporting Governance Records:
                        </span>
                        {m.analysis.supportingEvidence.map((ev: string, eIdx: number) => (
                          <div key={eIdx} className="flex items-start gap-2 text-white font-sans text-xs">
                            <span className="text-white font-mono font-bold">•</span>
                            <span>{ev}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Source Links */}
                    {m.analysis.sourceLinks?.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-[10px] uppercase text-[#8e8e8e]">Sources:</span>
                        {m.analysis.sourceLinks.map((link: any, lIdx: number) => (
                          <a
                            key={lIdx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[11px] text-white hover:text-black hover:bg-white bg-[#28282a] px-3 py-1 rounded-full border border-white/20 transition-all"
                          >
                            <span>{link.label}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Limitations Notice */}
                    {m.analysis.limitations?.length > 0 && (
                      <div className="text-[10px] text-[#8e8e8e] pt-1 font-mono">
                        <span className="text-[#E6B85C]">Limitation: </span>
                        {m.analysis.limitations.join(' ')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 items-center text-xs font-mono text-[#8e8e8e]">
              <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <span className="font-dotmatrix text-white">RETRIEVING GOVERNANCE EVIDENCE & FORMULATING ANALYSIS...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="mt-4 pt-4 border-t border-white/10 flex gap-2">
          <input
            type="text"
            placeholder="Ask a factual question about NEAR House of Stake delegates, votes, or rationales..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
            className="flex-1 bg-black text-white font-mono text-xs px-5 py-3 rounded-full border border-white/20 focus:border-white focus:outline-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 rounded-full bg-white text-black font-sans text-xs font-bold hover:bg-neutral-100 hover:shadow-[0_0_22px_rgba(255,255,255,0.32)] transition-all disabled:opacity-40 flex items-center gap-2 shrink-0"
          >
            <span>Ask Analyst</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </TerminalBox>
    </div>
  );
};
