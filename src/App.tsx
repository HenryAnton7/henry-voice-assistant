/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Header from './components/Header';
import ResumeDossier from './components/ResumeDossier';
import ChatSection from './components/ChatSection';
import LiveVoiceModal from './components/LiveVoiceModal';
import ContactModal from './components/ContactModal';
import { Radio, Volume2 } from 'lucide-react';
import type { ResumeData } from './types';

export default function App() {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [isLiveVoiceOpen, setIsLiveVoiceOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [isPlayingGreeting, setIsPlayingGreeting] = useState(false);

  useEffect(() => {
    fetch('/api/resume')
      .then((res) => res.json())
      .then((data) => setResumeData(data))
      .catch((err) => console.error('Failed to load resume info:', err));
  }, []);

  const handlePlayGreetingAudio = async () => {
    if (isPlayingGreeting) return;
    setIsPlayingGreeting(true);

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: "Hello, I am Henry's assistant, what would you like to know about him?",
          voiceName: 'Puck',
        }),
      });

      if (!res.ok) throw new Error('Greeting TTS failed');
      const data = await res.json();
      if (data.audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
        audio.onended = () => setIsPlayingGreeting(false);
        audio.onerror = () => setIsPlayingGreeting(false);
        await audio.play();
      } else {
        setIsPlayingGreeting(false);
      }
    } catch (e) {
      console.error('Greeting audio error, falling back to Web Speech API:', e);
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance("Hello, I am Henry's assistant, what would you like to know about him?");
        u.onend = () => setIsPlayingGreeting(false);
        window.speechSynthesis.speak(u);
      } else {
        setIsPlayingGreeting(false);
      }
    }
  };

  const handleAskQuestionFromDossier = (question: string) => {
    setSelectedPrompt(question);
  };

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-stone-900 flex flex-col font-sans selection:bg-[#E2D9C8] selection:text-stone-900">
      {/* Top Navigation */}
      <Header
        resumeData={resumeData}
        onOpenLiveVoice={() => setIsLiveVoiceOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
      />

      {/* Main Reading Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-8 py-8 flex flex-col space-y-8">
        {/* Curatorial Hero: Minimalist Greeting with Serif Typeface */}
        <section className="bg-white border border-[#E5DFD5] rounded-3xl p-8 sm:p-10 shadow-[0_2px_16px_rgba(28,25,23,0.03)] relative overflow-hidden transition-colors">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              {/* Kicker */}
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-stone-500 font-sans">
                <span>Executive AI Representative</span>
                <span aria-hidden="true">·</span>
                <span>English Language Mode</span>
                <span aria-hidden="true">·</span>
                <span>Tallinn, Estonia</span>
              </div>

              {/* The Mandated Opening Script in Serif */}
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-medium text-stone-900 tracking-tight leading-[1.18] text-balance">
                “Hello, I am Henry's assistant, what would you like to know about him?”
              </h2>

              <p className="text-sm text-stone-600 leading-relaxed font-sans max-w-xl">
                I provide verified briefings on Henry Anton — covering his business studies at Estonian Business School (EBS), healthcare coordination at Meliva AS, military reconnaissance service, independent e-commerce ventures, and athletics.
              </p>

              {/* Clean Unboxed Metadata Strip */}
              <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500 font-sans">
                <span>EBS Entrepreneurship & Administration</span>
                <span aria-hidden="true">·</span>
                <span>Clinic Coordination (Persona & NPS)</span>
                <span aria-hidden="true">·</span>
                <span>Tactical Military Logistics</span>
                <span aria-hidden="true">·</span>
                <span>Powerlifting Athlete</span>
              </div>
            </div>

            {/* Quick Action Controls */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 w-full lg:w-auto">
              <button
                onClick={() => setIsLiveVoiceOpen(true)}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-xs uppercase tracking-wider font-medium text-[#F7F4EE] bg-stone-900 hover:bg-stone-800 rounded-xl shadow-sm transition-all hover:shadow active:scale-[0.99] whitespace-nowrap"
              >
                <Radio className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>Start Live Voice Conversation</span>
              </button>

              <button
                onClick={handlePlayGreetingAudio}
                disabled={isPlayingGreeting}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-medium text-stone-800 bg-[#FAF8F5] hover:bg-[#F2ECE1] border border-[#DDD5C7] rounded-xl transition-colors whitespace-nowrap"
              >
                <Volume2 className={`w-3.5 h-3.5 text-stone-700 ${isPlayingGreeting ? 'animate-bounce' : ''}`} />
                <span>{isPlayingGreeting ? 'Playing Assistant Voice...' : 'Play Spoken Greeting'}</span>
              </button>
            </div>
          </div>
        </section>

        {/* Dual Section: Assistant Dialogue & Curated Dossier */}
        <section className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[620px]">
          {/* Left Column: Assistant Inquiry (7 cols on lg) */}
          <div id="assistant-conversation" className="lg:col-span-7 h-[680px] flex flex-col">
            <ChatSection
              resumeData={resumeData}
              onOpenLiveVoice={() => setIsLiveVoiceOpen(true)}
              externalPrompt={selectedPrompt}
              onClearExternalPrompt={() => setSelectedPrompt(null)}
            />
          </div>

          {/* Right Column: Curated Career Dossier (5 cols on lg) */}
          <div id="curated-dossier" className="lg:col-span-5 h-[680px] flex flex-col">
            <ResumeDossier
              resumeData={resumeData}
              onAskQuestion={handleAskQuestionFromDossier}
            />
          </div>
        </section>
      </main>

      {/* Minimalist Editorial Footer */}
      <footer className="border-t border-[#E7E2D8] bg-[#F7F4EE] py-6 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500 font-sans">
          <div className="flex items-center space-x-2">
            <span className="font-serif text-sm font-medium text-stone-800">Henry Anton</span>
            <span aria-hidden="true">·</span>
            <span>Executive Assistant</span>
            <span aria-hidden="true">·</span>
            <span>Gemini 3.8 Live & Flash</span>
          </div>

          <div className="flex items-center space-x-4">
            <a
              href="mailto:henry.anton7@gmail.com"
              className="hover:text-stone-900 transition-colors"
            >
              henry.anton7@gmail.com
            </a>
            <span aria-hidden="true">·</span>
            <a
              href="tel:+37256848676"
              className="hover:text-stone-900 transition-colors"
            >
              +372 56848676
            </a>
            <span aria-hidden="true">·</span>
            <span>Tallinn, Estonia</span>
          </div>
        </div>
      </footer>

      {/* Live Voice Conversation Modal (Gemini 3.8 Live API) */}
      <LiveVoiceModal
        isOpen={isLiveVoiceOpen}
        onClose={() => setIsLiveVoiceOpen(false)}
      />

      {/* Contact & Recruitment Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        resumeData={resumeData}
      />
    </div>
  );
}
