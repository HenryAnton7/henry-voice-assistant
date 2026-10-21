import { Radio, FileText, Mail } from 'lucide-react';
import type { ResumeData } from '../types';

interface HeaderProps {
  resumeData: ResumeData | null;
  onOpenLiveVoice: () => void;
  onOpenContact: () => void;
  onScrollToSection?: (sectionId: string) => void;
}

export default function Header({ onOpenLiveVoice, onOpenContact }: HeaderProps) {
  return (
    <header className="border-b border-[#E7E2D8] bg-[#F7F4EE]/90 backdrop-blur-md sticky top-0 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-4">
        <div className="flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark in Serif */}
          <div className="flex items-baseline space-x-3 shrink-0">
            <span className="font-serif text-2xl font-semibold tracking-tight text-stone-900">
              Henry Anton
            </span>
            <span className="hidden sm:inline-block text-xs uppercase tracking-widest text-stone-500 font-sans">
              Executive AI Assistant
            </span>
          </div>

          {/* Zone 2: Editorial Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium uppercase tracking-wider text-stone-600">
            <a
              href="#assistant-conversation"
              className="hover:text-stone-900 transition-colors whitespace-nowrap"
            >
              Voice & Inquiry
            </a>
            <a
              href="#curated-dossier"
              className="hover:text-stone-900 transition-colors whitespace-nowrap"
            >
              Career Dossier
            </a>
            <a
              href="/assets/aistudio/resume_1603e313.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-stone-900 transition-colors whitespace-nowrap flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5 text-stone-500" />
              <span>Resume PDF</span>
            </a>
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenContact}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-stone-700 hover:text-stone-900 hover:bg-[#EFE9DD] rounded-lg transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-stone-500" />
              <span>Contact</span>
            </button>

            <button
              onClick={onOpenLiveVoice}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium tracking-wide text-[#F7F4EE] bg-stone-900 hover:bg-stone-800 rounded-lg shadow-sm transition-all hover:shadow active:scale-[0.99] whitespace-nowrap"
            >
              <Radio className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Start Live Voice</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
