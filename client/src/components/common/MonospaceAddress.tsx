import React, { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';

interface MonospaceAddressProps {
  value: string;
  type?: 'account' | 'hash';
  truncate?: boolean;
  linkToExplorer?: boolean;
}

export const MonospaceAddress: React.FC<MonospaceAddressProps> = ({
  value,
  type = 'account',
  truncate = true,
  linkToExplorer = true,
}) => {
  const [copied, setCopied] = useState(false);

  const display =
    truncate && value.length > 20
      ? `${value.substring(0, 8)}...${value.substring(value.length - 8)}`
      : value;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const explorerUrl =
    type === 'account'
      ? `https://testnet.nearblocks.io/address/${value}`
      : `https://testnet.nearblocks.io/txns/${value}`;

  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-xs bg-[#28282a]/80 hover:bg-[#323234] px-2.5 py-0.5 rounded-full border border-white/20 transition-all group backdrop-blur-sm">
      <span className="text-white font-medium select-all" title={value}>
        {display}
      </span>
      <button
        onClick={handleCopy}
        className="text-[#8e8e8e] hover:text-white transition-colors p-0.5 rounded-full"
        title="Copy to clipboard"
      >
        {copied ? <Check className="w-3 h-3 text-[#B6F36B]" /> : <Copy className="w-3 h-3 opacity-60 group-hover:opacity-100" />}
      </button>
      {linkToExplorer && (
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#8e8e8e] hover:text-[#B6F36B] transition-colors p-0.5"
          title="View on NEAR Explorer"
        >
          <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100" />
        </a>
      )}
    </span>
  );
};
