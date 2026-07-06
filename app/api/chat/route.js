import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function POST(req) {
  try {
    const { messages, model } = await req.json();

    const result = await streamText({
      model: google(model || 'models/gemini-1.5-flash'),
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API Error:", error);
    // Provide full details to surface the exact API issue to the UI
    return new Response(JSON.stringify({ 
      error: error.message || "Unknown Error",
      name: error.name,
      details: error.toString()
    }), { status: 500 });
  }
}
