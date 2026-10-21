import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini client instance with aistudio-build user agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const HENRY_SYSTEM_INSTRUCTION = `You are Henry Anton's professional executive AI assistant.
Your tone is warm, highly professional, articulate, respectful, and confident.
Language: English.

You MUST always introduce yourself at the start of any conversation with:
"Hello, I am Henry's assistant, what would you like to know about him?"

Here is Henry Anton's complete, verified background from his official resume and credentials:
- Full Name: Henry Anton
- Location: Tallinn, Estonia (Postal Code: 11316)
- Email: henry.anton7@gmail.com
- Phone: +372 56848676
- Resume document: Available directly in the app (/public/assets/aistudio/resume_1603e313.pdf).

Summary:
Business student at Estonian Business School (EBS) with versatile hands-on experience across customer service, operations, and logistics. Proven track record in clinic coordination, military tactical transport, fast-paced courier delivery, and family moving operations. Highly motivated to apply business acumen, discipline, and responsibility in professional corporate environments.

Education:
1. Estonian Business School (EBS), Tallinn (2024 - Present):
   - Degree: Bachelor's in Entrepreneurship and Business Administration (Ettevõtlus ja ärijuhtimine).
   - Focus: Strategic management, marketing, financial analysis, business organizational scaling.
   - Developing strong problem-solving abilities, analytical acumen, and leadership capabilities.
2. Tallinna Ühisgümnaasium, Tallinn (Graduated 2023):
   - Basic and secondary high school education.

Key Competencies & Skills:
- Conscientious & Accurate (Kohusetundlik ja täpne) - dependable, detail-focused execution.
- IT & Technical Skills (IT-alased oskused) - Persona clinic software, digital marketing tools, e-commerce web design.
- Honest & Correct (Aus ja korrektne) - high integrity, trusted with sensitive military and commercial tasks.
- Strong Communicator (Hea suhtleja) - empathetic patient service, team alignment, client problem-solving.
- Fast Learner (Kiire õppija) - rapid onboarding and mastery of new operational challenges.
- Languages: Estonian (Native), English (Fluent / Professional).

Work Experience:
1. Trainee / Assistant Service Coordinator (Meliva AS, Tallinn | June 2025 - July 2025):
   - Monitored and supported front-desk operations across dental clinics.
   - Attended clinic walkthroughs and 1:1 check-ins with clinic reception administrators.
   - Assisted in planning shift and appointment schedules using Persona software.
   - Analyzed operational KPIs and Net Promoter Score (NPS) customer satisfaction metrics, preparing executive summary reports for management.
   - Synthesized patient feedback to elevate service quality.
2. Reconnaissance Department Driver & Tactical Logistics (Estonian Ministry of Defence / Kaitsevägi, Tapa | July 2023 - June 2024):
   - Served in military tactical reconnaissance.
   - Maintained technical readiness and vehicle inspections for all-terrain off-road military vehicles.
   - Transported personnel and critical equipment safely with zero margin for error under strict timelines.
   - Managed rigorous military documentation and equipment standards.
   - Operated effectively within tactical teams during reconnaissance operations under demanding field conditions.
3. Food Courier (Bolt, Tallinn | June 2022 - August 2022):
   - Summer courier work during high school; delivered customer orders quickly, safely, and accurately.
   - Honed personal discipline, route optimization, and polite customer conflict resolution.
4. Mover & Logistics Specialist (Hillar Vatsel FIE / Family business, Tallinn | April 2022 - Present):
   - Supported family moving business handling physically demanding tasks.
   - Guaranteed damage-free packaging and transport of furniture and high-value items.
   - Cultivated physical stamina, efficient team workflows, and time-management.

Independent Projects & Passions:
- E-Commerce & Digital Marketing: Independently builds and manages online stores (including dropshipping), researching products, website architecture, conversion optimization, and marketing analytics.
- Fitness & Sports: Member of Reval Academy (Revali Akadeemia), competitive powerlifter who has represented his team in meets, regular gym training, and indoor climbing/bouldering with friends.
- Driving Credentials: B-category driver's license, A2-category motorcycle license, actively planning to acquire C-category (trucks) next summer.

Guidelines:
- Respond in clear, professional English.
- Be concise yet comprehensive.
- Highlight Henry's dedication, discipline from military service, academic rigor from EBS, and real customer-facing coordination experience.
- When asked about contacting or hiring Henry, provide his email (henry.anton7@gmail.com) and phone (+372 56848676).`;

// API route to get Henry's resume profile structured data
app.get('/api/resume', (_req, res) => {
  res.json({
    name: 'Henry Anton',
    title: 'Business Student & Operations Specialist',
    location: 'Tallinn, Estonia (11316)',
    phone: '+372 56848676',
    email: 'henry.anton7@gmail.com',
    pdfUrl: '/assets/aistudio/resume_1603e313.pdf',
    greeting: "Hello, I am Henry's assistant, what would you like to know about him?",
    education: [
      {
        institution: 'Estonian Business School (EBS)',
        location: 'Tallinn',
        degree: "Bachelor's in Entrepreneurship & Business Administration",
        period: '2024 - Present',
        description: 'Focusing on strategic management, marketing, finance, and organizational development. Developing analytical, problem-solving, and leadership skills.',
      },
      {
        institution: 'Tallinna Ühisgümnaasium',
        location: 'Tallinn',
        degree: 'Secondary & Basic Education',
        period: 'Graduated 2023',
        description: 'Solid academic foundation with extracurricular involvement in athletics.',
      },
    ],
    experience: [
      {
        role: 'Assistant Service Coordinator (Trainee)',
        company: 'Meliva AS',
        location: 'Tallinn',
        period: 'June 2025 - July 2025',
        highlights: [
          'Supported daily front-office operations and patient intake across dental clinics.',
          'Participated in clinic visits and 1:1 sessions with reception administrators.',
          'Assisted with staff scheduling and appointment booking in Persona HR software.',
          'Analyzed customer satisfaction (NPS) and operational KPI data, presenting executive summaries to leadership.',
        ],
      },
      {
        role: 'Reconnaissance Department Driver & Logistics',
        company: 'Estonian Ministry of Defence / Kaitsevägi',
        location: 'Tapa',
        period: 'July 2023 - June 2024',
        highlights: [
          'Maintained mission-readiness of all-terrain SUVs and logistical vehicles.',
          'Transported personnel and critical equipment safely under strict operational timelines.',
          'Executed tactical logistics in dynamic field environments and managed vehicle documentation.',
        ],
      },
      {
        role: 'Logistics & Moving Specialist',
        company: 'Hillar Vatsel FIE (Family Business)',
        location: 'Tallinn',
        period: 'April 2022 - Present',
        highlights: [
          'Safe transportation and damage-free delivery of furniture and heavy goods.',
          'Effective coordination within teams, fostering physical stamina and practical problem-solving.',
        ],
      },
      {
        role: 'Food Courier',
        company: 'Bolt',
        location: 'Tallinn',
        period: 'June 2022 - August 2022',
        highlights: [
          'High-punctuality customer deliveries during summer high school break.',
          'Polite customer interaction and swift resolution of order issues.',
        ],
      },
    ],
    skills: [
      { category: 'Work Ethic', items: ['Conscientious & Precise', 'High Integrity & Honest', 'Reliable & Accountable'] },
      { category: 'Business & Tools', items: ['KPI & NPS Analytics', 'Persona Clinic Software', 'E-commerce & Dropshipping', 'Customer Coordination'] },
      { category: 'Soft Skills', items: ['Clear Communicator', 'Team Player', 'Fast Learner', 'Problem Solver'] },
      { category: 'Languages', items: ['Estonian (Native)', 'English (Fluent / Professional)'] },
      { category: 'Licenses', items: ['Category B (Car)', 'Category A2 (Motorcycle)', 'Category C (Truck - in progress)'] },
      { category: 'Interests', items: ['Competitive Powerlifting (Reval Academy)', 'Rock Climbing & Bouldering', 'Digital Marketing'] },
    ],
    quickPrompts: [
      'Tell me about Henry and his background.',
      'What experience did Henry gain at Meliva AS?',
      'How was his military service in the Reconnaissance Department?',
      'What are Henry’s e-commerce and digital projects?',
      'Why would Henry be a great hire for operations or customer service?',
      'How can I get in touch with Henry or schedule an interview?',
    ],
  });
});

// Chat endpoint (Gemini 3.8 Flash)
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'messages array is required' });
      return;
    }

    // Format chat contents
    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: HENRY_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const reply = response.text || "I'd be glad to share more details about Henry's experience.";
    res.json({ reply });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate assistant response' });
  }
});

// Text-to-Speech endpoint using gemini-3.8-flash-lite-tts
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voiceName = 'Puck' } = req.body;
    if (!text) {
      res.status(400).json({ error: 'Text is required' });
      return;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
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
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      res.status(500).json({ error: 'No audio returned from TTS model' });
      return;
    }

    res.json({ audioBase64: base64Audio, mimeType: 'audio/wav' });
  } catch (error: any) {
    console.error('TTS error:', error);
    res.status(500).json({ error: error?.message || 'TTS generation failed' });
  }
});

// WebSocket Server for Gemini 3.8 Live API voice conversations
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  const pathname = request.url ? new URL(request.url, `http://${request.headers.host}`).pathname : '';
  if (pathname === '/live-ws') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  }
});

wss.on('connection', async (clientWs: WebSocket) => {
  console.log('Client connected to Live voice assistant WebSocket');

  let session: any = null;
  let isClosed = false;

  try {
    session = await ai.live.connect({
      model: 'gemini-3.8-live',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } },
        },
        systemInstruction: `${HENRY_SYSTEM_INSTRUCTION}
Keep your spoken responses natural, conversational, professional, concise, and focused on Henry's strengths, background, and achievements. Always speak in English.`,
      },
      callbacks: {
        onmessage: (message: LiveServerMessage) => {
          if (isClosed || clientWs.readyState !== WebSocket.OPEN) return;

          // Check for audio chunks
          const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audio) {
            clientWs.send(JSON.stringify({ type: 'audio', audio }));
          }

          // Check for text transcript if present
          const textPart = message.serverContent?.modelTurn?.parts?.find((p: any) => p.text)?.text;
          if (textPart) {
            clientWs.send(JSON.stringify({ type: 'text', text: textPart }));
          }

          // Check for interruption signal
          if (message.serverContent?.interrupted) {
            clientWs.send(JSON.stringify({ type: 'interrupted' }));
          }
        },
        onclose: () => {
          if (!isClosed && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: 'closed' }));
          }
        },
        onerror: (err: any) => {
          console.error('Live session internal error:', err);
          if (!isClosed && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: 'error', message: err?.message || 'Live session error' }));
          }
        },
      },
    });

    clientWs.send(JSON.stringify({ type: 'ready', message: 'Connected to Gemini Live Assistant' }));

    clientWs.on('message', (rawData) => {
      if (isClosed || !session) return;
      try {
        const payload = JSON.parse(rawData.toString());
        if (payload.audio) {
          // 16kHz PCM little-endian base64 audio from client mic
          session.sendRealtimeInput({
            audio: { data: payload.audio, mimeType: 'audio/pcm;rate=16000' },
          });
        } else if (payload.text) {
          session.sendRealtimeInput({
            text: payload.text,
          });
        }
      } catch (err) {
        console.error('Error parsing client live message:', err);
      }
    });

    clientWs.on('close', () => {
      isClosed = true;
      try {
        if (session && typeof session.close === 'function') {
          session.close();
        }
      } catch (e) {
        // ignore
      }
    });
  } catch (err: any) {
    console.error('Failed to initiate live session:', err);
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(JSON.stringify({ type: 'error', message: err?.message || 'Failed to start Live voice session' }));
    }
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

  server.listen(port, '0.0.0.0', () => {
    console.log(`Henry's Assistant server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
