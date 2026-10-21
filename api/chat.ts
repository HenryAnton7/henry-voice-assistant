import { generateChatReply, errorStatus } from '../lib/gemini.js';

export async function POST(request: Request): Promise<Response> {
  try {
    const { messages } = await request.json();
    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: 'messages array is required' }, { status: 400 });
    }
    return Response.json({ reply: await generateChatReply(messages) });
  } catch (error: any) {
    console.error('Chat error:', error);
    return Response.json({ error: error?.message || 'Failed to generate assistant response' }, { status: errorStatus(error) });
  }
}
