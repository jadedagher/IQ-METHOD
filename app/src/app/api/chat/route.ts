import { NextRequest } from 'next/server';
import { getSession, addMessage, addArtifact, updateStep, updateSubWorkflow, addTokens, isOverBudget } from '@/lib/session-store';
import { buildSystemPrompt } from '@/lib/system-prompt-builder';
import { streamChat } from '@/lib/claude-client';
import { extractArtifacts } from '@/lib/artifact-extractor';
import { detectStepTransition, detectWorkflowTransition } from '@/lib/step-tracker';
import { trackDailyTokens, isDailyBudgetExhausted } from '@/lib/rate-limiter';
import type { ChatMessage } from '@/types';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    if (isDailyBudgetExhausted()) {
      return new Response(
        formatSSE({ type: 'error', error: 'Daily usage limit reached.' }),
        { status: 429, headers: sseHeaders() },
      );
    }

    const { sessionId, message } = await req.json();

    if (!sessionId || !message) {
      return new Response(
        formatSSE({ type: 'error', error: 'Missing sessionId or message.' }),
        { status: 400, headers: sseHeaders() },
      );
    }

    const session = getSession(sessionId);
    if (!session) {
      return new Response(
        formatSSE({ type: 'error', error: 'Session not found or expired.' }),
        { status: 404, headers: sseHeaders() },
      );
    }

    if (isOverBudget(sessionId)) {
      return new Response(
        formatSSE({ type: 'error', error: 'Session token budget exceeded.' }),
        { status: 429, headers: sseHeaders() },
      );
    }

    // Add user message
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: message,
      timestamp: Date.now(),
    };
    addMessage(sessionId, userMsg);

    // Build system prompt with current workflow state
    const systemPrompt = buildSystemPrompt(session);

    // Create SSE stream
    const encoder = new TextEncoder();
    let fullResponse = '';

    const stream = new ReadableStream({
      async start(controller) {
        await streamChat(systemPrompt, session.messages, {
          onText(text) {
            fullResponse += text;
            controller.enqueue(
              encoder.encode(formatSSE({ type: 'text', content: text })),
            );
          },

          onUsage(inputTokens, outputTokens) {
            const total = inputTokens + outputTokens;
            addTokens(sessionId, total);
            trackDailyTokens(total);
            controller.enqueue(
              encoder.encode(formatSSE({
                type: 'usage',
                usage: { inputTokens, outputTokens },
              })),
            );
          },

          onError(error) {
            controller.enqueue(
              encoder.encode(formatSSE({ type: 'error', error: error.message })),
            );
            controller.close();
          },

          onDone() {
            // Save assistant message
            const assistantMsg: ChatMessage = {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: fullResponse,
              timestamp: Date.now(),
            };
            addMessage(sessionId, assistantMsg);

            // Extract artifacts
            const artifacts = extractArtifacts(fullResponse);
            for (const artifact of artifacts) {
              addArtifact(sessionId, artifact);
              controller.enqueue(
                encoder.encode(formatSSE({ type: 'artifact', artifact })),
              );
            }

            // Detect sub-workflow transitions
            const nextWorkflow = detectWorkflowTransition(fullResponse);
            if (nextWorkflow) {
              updateSubWorkflow(sessionId, nextWorkflow);
              controller.enqueue(
                encoder.encode(formatSSE({ type: 'workflow', workflow: nextWorkflow })),
              );
            }

            // Detect step transitions
            const nextStep = detectStepTransition(fullResponse);
            if (nextStep) {
              updateStep(sessionId, nextStep);
              controller.enqueue(
                encoder.encode(formatSSE({ type: 'step', step: nextStep })),
              );
            }

            controller.enqueue(
              encoder.encode(formatSSE({ type: 'done' })),
            );
            controller.close();
          },
        });
      },
    });

    return new Response(stream, { headers: sseHeaders() });
  } catch {
    return new Response(
      formatSSE({ type: 'error', error: 'Internal server error.' }),
      { status: 500, headers: sseHeaders() },
    );
  }
}

function sseHeaders(): HeadersInit {
  return {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  };
}

function formatSSE(data: Record<string, unknown>): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}
