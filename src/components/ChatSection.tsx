import { useState, useRef, useEffect } from 'react';
import {
  Send,
  Volume2,
  VolumeX,
  Radio,
  Mic,
  MicOff,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';
import type { ChatMessage, ResumeData } from '../types';

interface ChatSectionProps {
  resumeData: ResumeData | null;
  onOpenLiveVoice: () => void;
  externalPrompt?: string | null;
  onClearExternalPrompt?: () => void;
}

export default function ChatSection({
  resumeData,
  onOpenLiveVoice,
  externalPrompt,
  onClearExternalPrompt,
}: ChatSectionProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-msg',
      role: 'assistant',
      content: "Hello, I am Henry's assistant, what would you like to know about him?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  const [isGeneratingTts, setIsGeneratingTts] = useState<string | null>(null);
  const [isListeningSpeech, setIsListeningSpeech] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (externalPrompt) {
      handleSendMessage(externalPrompt);
      onClearExternalPrompt?.();
    }
  }, [externalPrompt]);

  const toggleSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. You can use the Live Voice conversation mode above!');
      return;
    }

    if (isListeningSpeech) {
      recognitionRef.current?.stop();
      setIsListeningSpeech(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListeningSpeech(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? prev + ' ' + transcript : transcript));
        setIsListeningSpeech(false);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListeningSpeech(false);
      };

      recognition.onend = () => {
        setIsListeningSpeech(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Speech recognition start failed:', err);
      setIsListeningSpeech(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: query,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: data.reply || "I would be delighted to provide further context on Henry's background.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content:
          "I apologize for the momentary interruption. Please feel free to repeat your question or connect directly via Live Voice.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAudio = async (msg: ChatMessage) => {
    if (currentlyPlayingId === msg.id) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setCurrentlyPlayingId(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (msg.audioBase64) {
      playAudioBlob(msg.id, msg.audioBase64);
      return;
    }

    setIsGeneratingTts(msg.id);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: msg.content,
          voiceName: 'Puck',
        }),
      });

      if (!res.ok) throw new Error('TTS request failed');

      const data = await res.json();
      if (data.audioBase64) {
        msg.audioBase64 = data.audioBase64;
        playAudioBlob(msg.id, data.audioBase64);
      }
    } catch (err) {
      console.error('Failed to generate speech:', err);
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(msg.content);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.onend = () => setCurrentlyPlayingId(null);
        setCurrentlyPlayingId(msg.id);
        window.speechSynthesis.speak(utterance);
      }
    } finally {
      setIsGeneratingTts(null);
    }
  };

  const playAudioBlob = (msgId: string, base64Audio: string) => {
    try {
      const audioUrl = `data:audio/wav;base64,${base64Audio}`;
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => setCurrentlyPlayingId(msgId);
      audio.onended = () => {
        setCurrentlyPlayingId(null);
        audioRef.current = null;
      };
      audio.onerror = () => {
        setCurrentlyPlayingId(null);
        audioRef.current = null;
      };

      audio.play().catch((err) => {
        console.error('Audio playback failed:', err);
        setCurrentlyPlayingId(null);
      });
    } catch (e) {
      console.error('Audio error:', e);
      setCurrentlyPlayingId(null);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white border border-[#E5DFD5] rounded-2xl shadow-[0_2px_12px_rgba(28,25,23,0.03)] flex flex-col h-full overflow-hidden transition-colors">
      {/* Top Bar */}
      <div className="px-5 py-3.5 border-b border-[#EBE6DF] bg-[#FAF8F5] flex items-center justify-between">
        <div className="flex items-baseline space-x-2.5">
          <span className="font-serif text-lg font-medium text-stone-900">
            Assistant Inquiry
          </span>
          <span className="text-[11px] uppercase tracking-wider text-stone-500 font-sans hidden sm:inline">
            English · Professional
          </span>
        </div>

        <button
          onClick={onOpenLiveVoice}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-800 bg-[#EFE9DD] hover:bg-[#E7E0D2] border border-[#DDD5C7] transition-colors"
        >
          <Radio className="w-3.5 h-3.5 text-stone-700 animate-pulse" />
          <span>Live Voice Mode</span>
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-white">
        {messages.map((m) => {
          const isAssistant = m.role === 'assistant';
          const isPlaying = currentlyPlayingId === m.id;
          const isTtsLoading = isGeneratingTts === m.id;

          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl px-4 py-3.5 text-sm leading-relaxed ${
                  isAssistant
                    ? 'bg-[#FAF8F5] border border-[#EAE3D6] text-stone-800'
                    : 'bg-stone-900 text-stone-50 shadow-sm ml-6'
                }`}
              >
                {/* Message Header */}
                <div className="flex items-center justify-between gap-4 mb-1 text-[11px] font-sans">
                  <span
                    className={`uppercase tracking-wider font-medium ${
                      isAssistant ? 'text-stone-500' : 'text-stone-400'
                    }`}
                  >
                    {isAssistant ? "Henry's Assistant" : 'Inquirer'}
                  </span>

                  <div className="flex items-center space-x-2">
                    {isAssistant && (
                      <button
                        onClick={() => handlePlayAudio(m)}
                        disabled={isTtsLoading}
                        className="text-stone-500 hover:text-stone-900 transition-colors flex items-center gap-1"
                        title={isPlaying ? 'Pause speech' : 'Listen with Voice'}
                      >
                        {isTtsLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-stone-500" />
                        ) : isPlaying ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5 text-stone-800" />
                            <span className="text-[10px]">Stop</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span className="text-[10px]">Listen</span>
                          </>
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => handleCopy(m.id, m.content)}
                      className="text-stone-400 hover:text-stone-700 transition-colors"
                      title="Copy text"
                    >
                      {copiedId === m.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div
                  className={`font-normal ${
                    m.id === 'init-msg' ? 'font-serif text-base italic text-stone-900' : 'text-stone-800'
                  }`}
                >
                  {m.content}
                </div>

                {isPlaying && (
                  <div className="mt-2 pt-2 border-t border-[#EAE3D6] flex items-center space-x-1.5 text-stone-600 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-800 animate-pulse" />
                    <span>Speaking in professional English...</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center space-x-2 p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE3D6] text-xs text-stone-600 w-fit">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-stone-500" />
            <span>Formulating an executive response...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Inquiries */}
      {resumeData?.quickPrompts && (
        <div className="px-5 py-2.5 bg-[#FAF8F5] border-t border-[#EBE6DF]">
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-stone-500 mb-1.5 font-sans">
            <span>Recommended Inquiries</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5">
            {resumeData.quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-lg text-xs bg-white hover:bg-[#F2ECE1] text-stone-700 hover:text-stone-900 border border-[#DDD5C7] whitespace-nowrap transition-colors shrink-0 disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Bar */}
      <div className="p-4 bg-white border-t border-[#EBE6DF]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            className={`p-2.5 rounded-xl border transition-colors ${
              isListeningSpeech
                ? 'bg-amber-100 border-amber-300 text-amber-800 animate-pulse'
                : 'bg-[#FAF8F5] border-[#E0D7C7] text-stone-600 hover:text-stone-900 hover:bg-[#F2ECE1]'
            }`}
            title={isListeningSpeech ? 'Stop microphone' : 'Dictate question via voice'}
          >
            {isListeningSpeech ? <MicOff className="w-4 h-4 text-amber-800" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isListeningSpeech
                ? 'Listening to your voice...'
                : "Ask about Henry's education, clinic coordination, or logistics background..."
            }
            disabled={isLoading}
            className="flex-1 bg-[#FAF8F5] text-stone-900 placeholder-stone-500 text-xs sm:text-sm rounded-xl px-4 py-2.5 border border-[#E0D7C7] focus:outline-none focus:border-stone-500 transition-colors"
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-[#F7F4EE] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
