'use client';

import type { ChatMessage } from '@/types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface TerminalMessageProps {
  message: ChatMessage;
  agentName: string;
  onMenuSelect?: (choice: string) => void;
}

function extractMenuOptions(content: string): { letter: string; label: string }[] {
  const matches: { letter: string; label: string }[] = [];
  for (const line of content.split('\n')) {
    // Strip markdown formatting: numbered lists, bullet markers, bold, backticks
    const clean = line.trim()
      .replace(/^\d+[.)]\s+/, '')
      .replace(/^[-*+]\s+/, '')
      .replace(/\*{1,2}/g, '')
      .replace(/`/g, '')
      .trim();
    const m = clean.match(/^\[([A-Z]{1,4})\]\s+(.+)$/);
    if (m) {
      matches.push({ letter: m[1], label: m[2] });
    }
  }
  return matches;
}

export function TerminalMessage({ message, agentName, onMenuSelect }: TerminalMessageProps) {
  const isUser = message.role === 'user';
  const menuOptions = !isUser ? extractMenuOptions(message.content) : [];

  return (
    <div className="border-b border-gray-800/50 py-3 overflow-hidden">
      <span
        className={`mb-1 block text-xs font-semibold ${
          isUser ? 'text-emerald-400' : 'text-blue-300'
        }`}
      >
        {isUser ? 'Vous' : agentName}
      </span>
      {isUser ? (
        <p className="whitespace-pre-wrap text-sm text-gray-200">{message.content}</p>
      ) : (
        <div className="prose-invert max-w-none text-sm text-gray-200 break-words">
          <MarkdownRenderer content={message.content.replace(/<!--\s*(STEP|WORKFLOW):\s*\S+\s*-->/g, '')} />
        </div>
      )}
      {menuOptions.length > 0 && onMenuSelect && (
        <div className="mt-3 flex flex-wrap gap-2">
          {menuOptions.map((opt) => (
            <button
              key={opt.letter}
              type="button"
              onClick={() => onMenuSelect(opt.letter)}
              className="rounded-md border border-emerald-600 px-4 py-2 text-sm font-medium text-emerald-400 hover:bg-emerald-600/10 transition-colors"
            >
              [{opt.letter}] {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
