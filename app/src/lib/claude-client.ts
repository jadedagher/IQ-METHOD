import OpenAI from 'openai';
import type { ChatMessage } from '@/types';

const MODEL = 'gpt-5.2';
const MAX_TOKENS = 4096;

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

export interface StreamCallbacks {
  onText: (text: string) => void;
  onUsage: (input: number, output: number) => void;
  onError: (error: Error) => void;
  onDone: () => void;
}

/**
 * Stream a chat response from OpenAI GPT-5.2 Thinking.
 */
export async function streamChat(
  systemPrompt: string,
  messages: ChatMessage[],
  callbacks: StreamCallbacks,
): Promise<void> {
  const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'developer', content: systemPrompt },
    ...messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  ];

  try {
    const stream = await getClient().chat.completions.create({
      model: MODEL,
      max_completion_tokens: MAX_TOKENS,
      reasoning_effort: 'high',
      messages: openaiMessages,
      stream: true,
      stream_options: { include_usage: true },
    });

    for await (const chunk of stream) {
      // Usage arrives in the final chunk when stream_options.include_usage is true
      if (chunk.usage) {
        callbacks.onUsage(
          chunk.usage.prompt_tokens,
          chunk.usage.completion_tokens,
        );
      }

      const delta = chunk.choices?.[0]?.delta;
      if (delta?.content) {
        callbacks.onText(delta.content);
      }
    }

    callbacks.onDone();
  } catch (err) {
    callbacks.onError(err instanceof Error ? err : new Error(String(err)));
  }
}
