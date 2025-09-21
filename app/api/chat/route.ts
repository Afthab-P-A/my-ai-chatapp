import { openai } from '@ai-sdk/openai';
import { streamText, convertToModelMessages } from 'ai';

export const maxDuration = 30; // Streaming duration in seconds

export async function POST(req: Request) {
  try {
    // Parse incoming messages from frontend
    const { messages } = (await req.json()) as {
      messages: { role: 'user' | 'assistant'; content: string }[];
    };

    // Streamed response using Vercel AI SDK
    const response = streamText({
      model: openai('gpt-3.5-turbo'), // Or 'gpt-4o' if available
      messages: [
        { role: 'system', content: 'You are a helpful assistant that provides clear answers.' },
        ...convertToModelMessages(messages),
      ],
      maxTokens: 500,
      temperature: 0.7,
    });

    // Return a streaming response compatible with frontend
    return response.toUIMessageStreamResponse();
  } catch (err: unknown) {
    // Safe error handling without using 'any'
    const errorMessage = err instanceof Error ? err.message : 'Failed to process request';
    console.error('Vercel AI SDK error:', errorMessage);

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
