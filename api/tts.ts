import { synthesizeSpeech, errorStatus } from '../lib/gemini.js';

export async function POST(request: Request): Promise<Response> {
  try {
    const { text, voiceName } = await request.json();
    if (!text) {
      return Response.json({ error: 'Text is required' }, { status: 400 });
    }
    return Response.json(await synthesizeSpeech(text, voiceName));
  } catch (error: any) {
    console.error('TTS error:', error);
    return Response.json({ error: error?.message || 'TTS generation failed' }, { status: errorStatus(error) });
  }
}
