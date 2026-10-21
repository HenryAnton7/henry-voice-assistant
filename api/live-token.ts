import { createLiveToken, errorStatus } from '../lib/gemini.js';

export async function POST(): Promise<Response> {
  try {
    return Response.json(await createLiveToken(), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: any) {
    console.error('Live token error:', error);
    return Response.json({ error: error?.message || 'Failed to start Live voice session' }, { status: errorStatus(error) });
  }
}
