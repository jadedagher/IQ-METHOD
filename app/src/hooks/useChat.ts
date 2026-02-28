'use client';

import { useState, useCallback, useRef } from 'react';
import type { ChatMessage, StreamChunk, Artifact } from '@/types';

interface UseChatOptions {
  sessionId: string;
  onArtifact?: (artifact: Artifact) => void;
  onStepChange?: (step: string) => void;
  onWorkflowChange?: (workflow: string) => void;
}

export function useChat({ sessionId, onArtifact, onStepChange, onWorkflowChange }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isStreaming) return;
    setError(null);

    // Add user message
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsStreaming(true);

    // Prepare assistant message placeholder
    const assistantId = crypto.randomUUID();
    setMessages(prev => [...prev, {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    }]);

    try {
      abortRef.current = new AbortController();

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: content }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const json = line.slice(6);

          try {
            const chunk: StreamChunk = JSON.parse(json);

            switch (chunk.type) {
              case 'text':
                setMessages(prev => prev.map(m =>
                  m.id === assistantId
                    ? { ...m, content: m.content + (chunk.content || '') }
                    : m,
                ));
                break;

              case 'artifact':
                if (chunk.artifact) onArtifact?.(chunk.artifact);
                break;

              case 'step':
                if (chunk.step) onStepChange?.(chunk.step);
                break;

              case 'workflow':
                if (chunk.workflow) onWorkflowChange?.(chunk.workflow);
                break;

              case 'error':
                setError(chunk.error || 'Unknown error');
                break;

              case 'done':
                break;
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError((err as Error).message);
        // Remove empty assistant message on error
        setMessages(prev => prev.filter(m => !(m.id === assistantId && !m.content)));
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [sessionId, isStreaming, onArtifact, onStepChange, onWorkflowChange]);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { messages, isStreaming, error, sendMessage, stopStreaming };
}
