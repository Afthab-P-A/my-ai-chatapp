import { NextRequest } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

// Initialize OpenAI client
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export const runtime = "edge"; 
// Use Edge runtime for streaming responses
export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

  // Call OpenAI with streaming  
    const result = await streamText({
      model: openai("gpt-4o-mini"), 
      messages,
    });

   // Return the streaming response 
    return result.toTextStreamResponse();
  } catch (err: any) {
    console.error("API error:", err);
    return new Response("Error: " + err.message, { status: 500 });
  }
}
