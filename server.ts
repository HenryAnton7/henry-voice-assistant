// Local development / self-hosted server. On Vercel the same endpoints are served
// by the serverless functions in /api, so both share the logic in /lib.
// Load .env before lib/gemini.ts reads model overrides at import time.
import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { RESUME_DATA } from './lib/profile.js';
import { generateChatReply, synthesizeSpeech, createLiveToken, errorStatus } from './lib/gemini.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// API route to get Henry's resume profile structured data
app.get('/api/resume', (_req, res) => {
  res.json(RESUME_DATA);
});

// Chat endpoint (text → text)
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'messages array is required' });
      return;
    }
    res.json({ reply: await generateChatReply(messages) });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(errorStatus(error)).json({ error: error?.message || 'Failed to generate assistant response' });
  }
});

// Text-to-Speech endpoint
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voiceName } = req.body;
    if (!text) {
      res.status(400).json({ error: 'Text is required' });
      return;
    }
    res.json(await synthesizeSpeech(text, voiceName));
  } catch (error: any) {
    console.error('TTS error:', error);
    res.status(errorStatus(error)).json({ error: error?.message || 'TTS generation failed' });
  }
});

// Ephemeral token for the browser to connect to the Gemini Live API directly
app.post('/api/live-token', async (_req, res) => {
  try {
    res.set('Cache-Control', 'no-store').json(await createLiveToken());
  } catch (error: any) {
    console.error('Live token error:', error);
    res.status(errorStatus(error)).json({ error: error?.message || 'Failed to start Live voice session' });
  }
});

// Mount Vite middleware in development or serve static in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Henry's Assistant server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
