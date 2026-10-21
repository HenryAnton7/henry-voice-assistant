import { useEffect, useRef, useState, useCallback } from 'react';
import { Mic, MicOff, Volume2, X, PhoneOff, Radio, RefreshCw, AlertCircle } from 'lucide-react';
import { LiveAudioPlayer, LiveAudioRecorder } from '../utils/audio';

interface LiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendTranscriptToChat?: (text: string, role: 'user' | 'assistant') => void;
}

export default function LiveVoiceModal({ isOpen, onClose }: LiveVoiceModalProps) {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error' | 'closed'>('connecting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [transcripts, setTranscripts] = useState<Array<{ id: string; role: 'user' | 'assistant'; text: string }>>([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Hello, I am Henry's assistant, what would you like to know about him?",
    },
  ]);

  const wsRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<LiveAudioRecorder | null>(null);
  const playerRef = useRef<LiveAudioPlayer | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  const startLiveSession = useCallback(async () => {
    setConnectionStatus('connecting');
    setErrorMessage(null);

    try {
      playerRef.current = new LiveAudioPlayer();
      playerRef.current.init();

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live-ws`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = async () => {
        setConnectionStatus('connected');
        try {
          const recorder = new LiveAudioRecorder();
          recorderRef.current = recorder;

          await recorder.start((base64Chunk) => {
            if (ws.readyState === WebSocket.OPEN && !isMuted) {
              ws.send(JSON.stringify({ audio: base64Chunk }));
            }
          });
        } catch (micErr: any) {
          console.error('Microphone error:', micErr);
          setErrorMessage('Microphone access is unavailable. Please grant microphone permission in your browser.');
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'ready') {
            setConnectionStatus('connected');
          } else if (data.type === 'audio' && data.audio) {
            setIsAssistantSpeaking(true);
            playerRef.current?.playChunk(data.audio);
          } else if (data.type === 'text' && data.text) {
            setTranscripts((prev) => {
              const last = prev[prev.length - 1];
              if (last && last.role === 'assistant') {
                return [...prev.slice(0, -1), { ...last, text: last.text + ' ' + data.text }];
              }
              return [...prev, { id: String(Date.now()), role: 'assistant', text: data.text }];
            });
          } else if (data.type === 'interrupted') {
            playerRef.current?.stop();
            setIsAssistantSpeaking(false);
          } else if (data.type === 'error') {
            setErrorMessage(data.message || 'Live session error occurred');
          } else if (data.type === 'closed') {
            setConnectionStatus('closed');
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onerror = () => {
        setConnectionStatus('error');
        setErrorMessage('Failed to connect to Live Voice service. Please check your network connection.');
      };

      ws.onclose = () => {
        setConnectionStatus('closed');
      };
    } catch (err: any) {
      console.error('Session start error:', err);
      setConnectionStatus('error');
      setErrorMessage(err?.message || 'Could not initialize live session');
    }
  }, [isMuted]);

  useEffect(() => {
    if (!isOpen) return;

    const updateVisualizer = () => {
      let level = 0;
      if (recorderRef.current && !isMuted) {
        const micVol = recorderRef.current.getVolume();
        if (micVol > 0.05) {
          setIsUserSpeaking(true);
          level = Math.max(level, micVol * 2);
        } else {
          setIsUserSpeaking(false);
        }
      }

      if (playerRef.current) {
        const playerVol = playerRef.current.getVolume();
        if (playerVol > 0.02) {
          setIsAssistantSpeaking(true);
          level = Math.max(level, playerVol * 2.5);
        } else {
          setIsAssistantSpeaking(false);
        }
      }

      setAudioLevel(Math.min(1, level));
      animFrameRef.current = requestAnimationFrame(updateVisualizer);
    };

    animFrameRef.current = requestAnimationFrame(updateVisualizer);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isOpen, isMuted]);

  const cleanup = useCallback(() => {
    if (recorderRef.current) {
      recorderRef.current.stop();
      recorderRef.current = null;
    }
    if (playerRef.current) {
      playerRef.current.close();
      playerRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      startLiveSession();
    } else {
      cleanup();
    }
    return () => {
      cleanup();
    };
  }, [isOpen, startLiveSession, cleanup]);

  const handleInterrupt = () => {
    playerRef.current?.stop();
    setIsAssistantSpeaking(false);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ text: '[User interrupted]' }));
    }
  };

  const handleSendPromptText = (prompt: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      setTranscripts((prev) => [...prev, { id: String(Date.now()), role: 'user', text: prompt }]);
      wsRef.current.send(JSON.stringify({ text: prompt }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#FAF8F5] border border-[#DDD5C7] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBE6DF] bg-white">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#EFE9DD] border border-[#DDD5C7] text-stone-800">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-serif font-semibold text-stone-900 text-base">
                  Live Voice Assistant
                </h3>
                <span className="text-[11px] uppercase tracking-wider text-stone-500 font-sans">
                  Gemini 3.8 Live
                </span>
              </div>
              <p className="text-xs text-stone-500">Real-time bi-directional conversation</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-[#F2ECE1] transition-colors"
            title="Close conversation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Center Visualizer */}
        <div className="relative flex-1 flex flex-col items-center justify-center p-8 min-h-[250px] overflow-hidden bg-gradient-to-b from-white to-[#FAF8F5]">
          {/* Subtle Acoustic Wave Rings */}
          <div className="relative flex items-center justify-center">
            <div
              className="absolute w-44 h-44 rounded-full border border-stone-300 transition-transform duration-200 pointer-events-none"
              style={{
                transform: `scale(${1 + audioLevel * 0.7})`,
                opacity: 0.2 + audioLevel * 0.6,
              }}
            />
            <div
              className="absolute w-36 h-36 rounded-full border border-stone-400/40 transition-transform duration-150 pointer-events-none"
              style={{
                transform: `scale(${1 + audioLevel * 0.45})`,
                opacity: 0.3 + audioLevel * 0.5,
              }}
            />

            {/* Core Acoustic Orb */}
            <div
              className="relative w-28 h-28 rounded-full flex items-center justify-center shadow-lg transition-all duration-150 border"
              style={{
                background: isAssistantSpeaking
                  ? 'radial-gradient(circle, #292524 0%, #1c1917 100%)'
                  : isUserSpeaking
                  ? 'radial-gradient(circle, #57534e 0%, #292524 100%)'
                  : 'radial-gradient(circle, #e7e2d8 0%, #dcd4c5 100%)',
                borderColor: isAssistantSpeaking || isUserSpeaking ? '#1c1917' : '#cfc6b5',
                transform: `scale(${1 + audioLevel * 0.2})`,
              }}
            >
              {isAssistantSpeaking ? (
                <Volume2 className="w-9 h-9 text-amber-200 animate-pulse" />
              ) : isUserSpeaking ? (
                <Mic className="w-9 h-9 text-white animate-pulse" />
              ) : (
                <Radio className="w-8 h-8 text-stone-600" />
              )}
            </div>
          </div>

          {/* Status Label */}
          <div className="mt-6 text-center space-y-1">
            <p className="text-xs uppercase tracking-widest text-stone-500 font-sans">
              {connectionStatus === 'connecting' && 'Connecting to Live Voice...'}
              {connectionStatus === 'connected' && isAssistantSpeaking && "Henry's Assistant is speaking..."}
              {connectionStatus === 'connected' && isUserSpeaking && 'Listening to you...'}
              {connectionStatus === 'connected' && !isAssistantSpeaking && !isUserSpeaking && (
                isMuted ? 'Microphone muted' : 'Listening — speak naturally at any time'
              )}
              {connectionStatus === 'error' && 'Connection interrupted'}
              {connectionStatus === 'closed' && 'Voice session ended'}
            </p>
            <p className="font-serif italic text-base text-stone-800">
              “Hello, I am Henry's assistant, what would you like to know about him?”
            </p>
          </div>

          {errorMessage && (
            <div className="mt-4 mx-auto max-w-md p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Live Conversation Transcript */}
        <div className="px-6 py-3 bg-[#F4EFE6] border-t border-[#EBE6DF] max-h-44 overflow-y-auto space-y-2">
          <div className="text-[11px] font-medium tracking-wider uppercase text-stone-500">
            Live Dialogue Transcript
          </div>
          {transcripts.map((t) => (
            <div
              key={t.id}
              className={`p-2.5 rounded-xl text-xs leading-relaxed ${
                t.role === 'assistant'
                  ? 'bg-white border border-[#E0D7C7] text-stone-800'
                  : 'bg-[#EAE3D6] border border-[#DDD5C7] text-stone-900 ml-4'
              }`}
            >
              <span className="font-semibold text-stone-500 block mb-0.5 text-[10px] uppercase">
                {t.role === 'assistant' ? "Henry's Assistant" : 'You'}
              </span>
              <span className={t.role === 'assistant' && t.id === 'welcome' ? 'font-serif text-sm italic' : ''}>
                {t.text}
              </span>
            </div>
          ))}
        </div>

        {/* Quick Question Prompts */}
        <div className="px-6 py-2.5 bg-[#FAF8F5] border-t border-[#EBE6DF] flex items-center space-x-2 overflow-x-auto scrollbar-none">
          <span className="text-[11px] text-stone-500 shrink-0 font-medium">Quick ask:</span>
          {[
            'Tell me about Henry',
            'Healthcare coordination at Meliva',
            'Military reconnaissance service',
            'E-commerce & athletics',
            'How to arrange an interview',
          ].map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSendPromptText(prompt)}
              className="text-xs px-3 py-1 rounded-md bg-white hover:bg-[#F2ECE1] text-stone-700 border border-[#DDD5C7] whitespace-nowrap transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-[#EBE6DF]">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-medium border transition-colors ${
              isMuted
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-[#FAF8F5] border-[#DDD5C7] text-stone-700 hover:bg-[#F2ECE1]'
            }`}
          >
            {isMuted ? <MicOff className="w-3.5 h-3.5 text-rose-700" /> : <Mic className="w-3.5 h-3.5 text-stone-700" />}
            <span>{isMuted ? 'Unmute' : 'Mute'}</span>
          </button>

          <div className="flex items-center space-x-2">
            {isAssistantSpeaking && (
              <button
                onClick={handleInterrupt}
                className="px-3.5 py-2 rounded-lg text-xs font-medium bg-[#F2ECE1] text-stone-800 border border-[#DDD5C7] hover:bg-[#EAE3D6] transition-colors"
              >
                Interrupt Speech
              </button>
            )}

            {connectionStatus !== 'connected' && (
              <button
                onClick={startLiveSession}
                className="flex items-center space-x-1 px-3.5 py-2 rounded-lg text-xs font-medium bg-stone-900 text-white transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reconnect</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-stone-900 hover:bg-stone-800 text-white transition-colors"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>End Voice Call</span>
          </button>
        </div>
      </div>
    </div>
  );
}
