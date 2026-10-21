import { GoogleGenAI, Modality } from '@google/genai';
import { HENRY_SYSTEM_INSTRUCTION } from './profile.js';

// Model names can be overridden with environment variables without touching code.
export const CHAT_MODEL = process.env.GEMINI_CHAT_MODEL || 'gemini-3.8-flash';
export const TTS_MODEL = process.env.GEMINI_TTS_MODEL || 'gemini-3.8-flash-lite-tts';
export const LIVE_MODEL = process.env.GEMINI_LIVE_MODEL || 'gemini-3.8-live';
export const LIVE_VOICE = 'Puck';

export class MissingApiKeyError extends Error {
  constructor() {
    super('GEMINI_API_KEY is not set on the server. Add it in Vercel → Settings → Environment Variables and redeploy.');
  }
}

let client: GoogleGenAI | null = null;

// Lazily create the client so a missing key produces a clear error per request
// instead of crashing the whole function at import time.
function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new MissingApiKeyError();
  if (!client) client = new GoogleGenAI({ apiKey });
  return client;
}

export async function generateChatReply(messages: Array<{ role: string; content: string }>): Promise<string> {
  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const response = await getClient().models.generateContent({
    model: CHAT_MODEL,
    contents,
    config: {
      systemInstruction: HENRY_SYSTEM_INSTRUCTION,
      temperature: 0.7,
    },
  });

  return response.text || "I'd be glad to share more details about Henry's experience.";
}

// Gemini TTS returns raw 16-bit PCM (audio/L16;rate=24000). Browsers can't play that
// from a data: URL, so wrap it in a WAV header.
function pcmToWavBase64(pcmBase64: string, sampleRate: number): string {
  const pcm = Buffer.from(pcmBase64, 'base64');
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]).toString('base64');
}

export async function synthesizeSpeech(text: string, voiceName = LIVE_VOICE): Promise<{ audioBase64: string; mimeType: string }> {
  const response = await getClient().models.generateContent({
    model: TTS_MODEL,
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: text.slice(0, 1000), // keep spoken snippets reasonable length
            speechMetadata: {
              style: 'Professional, articulate, warm executive assistant',
            },
          },
        ],
      },
    ],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  });

  const inlineData = response.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data)?.inlineData;
  if (!inlineData?.data) throw new Error('No audio returned from TTS model');

  const mimeType = inlineData.mimeType || '';
  if (mimeType.includes('wav')) {
    return { audioBase64: inlineData.data, mimeType: 'audio/wav' };
  }
  const rate = Number(/rate=(\d+)/.exec(mimeType)?.[1]) || 24000;
  return { audioBase64: pcmToWavBase64(inlineData.data, rate), mimeType: 'audio/wav' };
}

// Creates a short-lived, single-use token so the browser can talk to the Gemini Live API
// directly over WebSocket. The real API key never leaves the server, and the model,
// voice and system instruction are locked into the token.
export async function createLiveToken(): Promise<{ token: string; model: string }> {
  const now = Date.now();
  const token = await getClient().authTokens.create({
    config: {
      uses: 1,
      expireTime: new Date(now + 30 * 60 * 1000).toISOString(),
      newSessionExpireTime: new Date(now + 60 * 1000).toISOString(),
      liveConnectConstraints: {
        model: LIVE_MODEL,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: LIVE_VOICE } },
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: `${HENRY_SYSTEM_INSTRUCTION}
Keep your spoken responses natural, conversational, professional, concise, and focused on Henry's strengths, background, and achievements. Always speak in English.`,
        },
      },
      httpOptions: { apiVersion: 'v1alpha' },
    },
  });

  if (!token.name) throw new Error('Failed to create Live API token');
  return { token: token.name, model: LIVE_MODEL };
}

export function errorStatus(error: unknown): number {
  return error instanceof MissingApiKeyError ? 500 : 502;
}
