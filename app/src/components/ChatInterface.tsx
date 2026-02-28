'use client';

import { useState, useRef, useEffect } from 'react';
import type { WorkflowType } from '@/types';
import { useChat } from '@/hooks/useChat';
import { useWorkflow } from '@/hooks/useWorkflow';
import { useArtifacts } from '@/hooks/useArtifacts';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { TerminalMessage } from './TerminalMessage';
import { WorkflowSidebar } from './WorkflowSidebar';
import { DownloadPanel } from './DownloadPanel';
import { LanguageSwitcher } from './LanguageSwitcher';

interface ChatInterfaceProps {
  sessionId: string;
  workflow: WorkflowType;
}

export function ChatInterface({ sessionId, workflow }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { t } = useLanguage();

  const { artifacts, addArtifact, downloadAll, downloadSingle } = useArtifacts();
  const { subWorkflow, steps, currentStepIndex, completedSteps, onStepChange, onWorkflowChange } = useWorkflow(workflow);
  const { messages, isStreaming, error, sendMessage, stopStreaming } = useChat({
    sessionId,
    onArtifact: addArtifact,
    onStepChange,
    onWorkflowChange,
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const agentName = workflow === 'analyst' ? 'Mary' : 'John';
  const title = workflow === 'analyst'
    ? t('workflow.analyst.title')
    : t('workflow.pm.title');

  return (
    <div className="flex h-screen bg-gray-950">
      {/* Sidebar */}
      <WorkflowSidebar
        steps={steps}
        currentStepIndex={currentStepIndex}
        completedSteps={completedSteps}
        subWorkflow={subWorkflow}
        agentName={agentName}
      />

      {/* Main chat area */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-gray-800 px-6 py-3">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-white">{title}</h1>
            {steps.length > 0 && (
              <span className="rounded-full bg-gray-800 px-2.5 py-1 text-xs text-gray-400">
                {t('chat.stepOf', { current: currentStepIndex + 1, total: steps.length })}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <a href="/" className="text-sm text-gray-500 hover:text-gray-300">
              {t('chat.newSession')}
            </a>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4 font-mono">
          {messages.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-gray-600">
                {t('chat.emptyState', { agent: agentName })}
              </p>
            </div>
          )}
          <div className="space-y-3">
            {(() => {
              const lastAssistantIdx = messages.reduce(
                (last, m, i) => (m.role === 'assistant' ? i : last),
                -1,
              );
              return messages.map((msg, idx) => {
                const showMenu =
                  !isStreaming &&
                  msg.role === 'assistant' &&
                  idx === lastAssistantIdx;
                return (
                  <TerminalMessage
                    key={msg.id}
                    message={msg}
                    agentName={agentName}
                    onMenuSelect={showMenu ? sendMessage : undefined}
                  />
                );
              });
            })()}
            {isStreaming && (
              <div className="py-3">
                <span className="mb-1 block text-xs font-semibold text-blue-300">{agentName}</span>
                <span className="terminal-cursor">_</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="mx-6 mb-2 border-l-2 border-red-500 bg-red-900/20 px-4 py-2 font-mono text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Download panel */}
        <DownloadPanel
          artifacts={artifacts}
          onDownloadAll={downloadAll}
          onDownloadSingle={downloadSingle}
        />

        {/* Input */}
        <form onSubmit={handleSubmit} className="border-t border-gray-800 p-4">
          <div className="flex gap-3 px-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('chat.placeholder')}
              rows={1}
              className="flex-1 resize-none rounded-md border border-gray-700 bg-gray-900 px-4 py-3 font-mono text-sm text-gray-200 placeholder-gray-500 focus:border-emerald-600 focus:outline-none"
            />
            {isStreaming ? (
              <button
                type="button"
                onClick={stopStreaming}
                className="rounded-md border border-red-600 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-600/10"
              >
                {t('chat.stop')}
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="rounded-md border border-emerald-600 px-4 py-3 text-sm font-medium text-emerald-400 hover:bg-emerald-600/10 disabled:opacity-40"
              >
                {t('chat.send')}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
