import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { convertToModelMessages, streamText, tool, type UIMessage } from 'ai';
import { z } from 'zod';

export const maxDuration = 30;

// Initialize Google API key
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// Internet search tool
const searchTool = tool({
  description: 'Search the internet for current information',
  inputSchema: z.object({
    query: z.string().describe('The search query'),
  }),
  execute: async ({ query }) => {
    // Simulate internet search 
    const mockResults = [
      `Search results for "${query}":`,
      `• Recent information about ${query}`,
      `• Latest updates and news related to ${query}`,
      `• Current trends and developments in ${query}`,
    ].join('\n');

    return {
      query,
      results: mockResults,
      timestamp: new Date().toISOString(),
    };
  },
});

// Weather tool
const weatherTool = tool({
  description: 'Get current weather information for a location',
  inputSchema: z.object({
    location: z.string().describe('The location to get weather for'),
  }),
  execute: async ({ location }) => {
    // Simulate weather API call
    const conditions = ['sunny', 'cloudy', 'rainy', 'snowy', 'windy'];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    const temperature = Math.floor(Math.random() * 40) + 10; // Random temp between 10 and 50
    return {
      location,
      temperature,
      condition,
      humidity: Math.floor(Math.random() * 100),
      windSpeed: Math.floor(Math.random() * 30) + 5, 
      timestamp: new Date().toISOString(),
    };
  },
});

// POST handler for the chat API
export async function POST(req: Request) {
  try {
    // Parse incoming messages from the request body
    const { messages }: { messages: UIMessage[] } = await req.json();

    // Call the streamText function with the model and tools
    const gemini_model = process.env.GEMINI_MODEL
    const result = streamText({
      model: google('gemini-2.5-flash'), 
      messages: convertToModelMessages(messages), // Converts the messages to the expected format
      tools: {
        search: searchTool,
        weather: weatherTool,
      },
      toolChoice: 'auto', 
    });

    // Return the streamed response
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Error in chat API:', error);

    // Return error response with details
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
