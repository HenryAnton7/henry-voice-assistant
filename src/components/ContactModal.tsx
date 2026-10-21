import { useState } from 'react';
import { Mail, Phone, MapPin, Copy, Check, X, FileText, Send, Calendar } from 'lucide-react';
import type { ResumeData } from '../types';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData: ResumeData | null;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const emailDraft = `Subject: Inquiry regarding Collaboration / Interview - Henry Anton

Dear Henry,

I reviewed your credentials and executive assistant briefing and was impressed by your business administration studies at EBS, clinic coordination at Meliva AS, and military logistics background.

We would welcome an opportunity to schedule a brief introductory dialogue.

Best regards,
[Name / Organization]`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#FAF8F5] border border-[#DDD5C7] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBE6DF] bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-[#EFE9DD] border border-[#DDD5C7] flex items-center justify-center text-stone-800">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-semibold text-stone-900 text-base">
                Contact Henry Anton
              </h3>
              <p className="text-xs text-stone-500">Recruitment & professional inquiries</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-[#F2ECE1] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* Email Card */}
          <div className="p-3.5 rounded-xl bg-white border border-[#E5DFD5] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-[#FAF8F5] text-stone-700 border border-[#E0D7C7]">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-stone-500 block">Direct Email</span>
                <a
                  href="mailto:henry.anton7@gmail.com"
                  className="text-sm font-medium text-stone-900 hover:underline"
                >
                  henry.anton7@gmail.com
                </a>
              </div>
            </div>
            <button
              onClick={() => copyToClipboard('henry.anton7@gmail.com', 'email')}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-[#F2ECE1] transition-colors"
              title="Copy Email"
            >
              {copiedField === 'email' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Phone Card */}
          <div className="p-3.5 rounded-xl bg-white border border-[#E5DFD5] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-[#FAF8F5] text-stone-700 border border-[#E0D7C7]">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-stone-500 block">Telephone</span>
                <a
                  href="tel:+37256848676"
                  className="text-sm font-medium text-stone-900 hover:underline"
                >
                  +372 56848676
                </a>
              </div>
            </div>
            <button
              onClick={() => copyToClipboard('+37256848676', 'phone')}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-[#F2ECE1] transition-colors"
              title="Copy Phone"
            >
              {copiedField === 'phone' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Location */}
          <div className="p-3.5 rounded-xl bg-white border border-[#E5DFD5] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-[#FAF8F5] text-stone-700 border border-[#E0D7C7]">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-stone-500 block">Location</span>
                <span className="text-sm font-medium text-stone-900">
                  Tallinn, Estonia (11316)
                </span>
              </div>
            </div>
            <span className="text-xs text-stone-500">GMT+2</span>
          </div>

          {/* Invitation Template */}
          <div className="p-4 rounded-xl bg-[#F5F0E6] border border-[#DDD5C7] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-serif text-sm font-semibold text-stone-900 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-stone-700" />
                Executive Invitation Template
              </span>
              <button
                onClick={() => copyToClipboard(emailDraft, 'draft')}
                className="text-xs text-stone-800 hover:underline flex items-center gap-1"
              >
                {copiedField === 'draft' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 rounded-lg bg-white text-[11px] text-stone-800 whitespace-pre-wrap font-sans border border-[#E5DFD5] leading-relaxed">
              {emailDraft}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-[#EBE6DF] flex items-center justify-between gap-3">
          <a
            href="/assets/aistudio/resume_1603e313.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 text-xs text-stone-600 hover:text-stone-900"
          >
            <FileText className="w-4 h-4 text-stone-500" />
            <span>Open Resume PDF</span>
          </a>

          <a
            href="mailto:henry.anton7@gmail.com?subject=Interview%20Inquiry%20-%20Henry%20Anton"
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-[#F7F4EE] text-xs font-medium transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Compose Email</span>
          </a>
        </div>
      </div>
    </div>
  );
}
