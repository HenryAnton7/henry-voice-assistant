import { useState } from 'react';
import {
  Briefcase,
  GraduationCap,
  Award,
  Dumbbell,
  FileText,
  ExternalLink,
  MessageSquare,
  Car,
  ShoppingBag,
} from 'lucide-react';
import type { ResumeData } from '../types';

interface ResumeDossierProps {
  resumeData: ResumeData | null;
  onAskQuestion: (question: string) => void;
}

export default function ResumeDossier({ resumeData, onAskQuestion }: ResumeDossierProps) {
  const [activeTab, setActiveTab] = useState<'experience' | 'education' | 'skills' | 'projects' | 'pdf'>('experience');

  if (!resumeData) return null;

  return (
    <div className="bg-white border border-[#E5DFD5] rounded-2xl shadow-[0_2px_12px_rgba(28,25,23,0.03)] flex flex-col h-full overflow-hidden transition-colors">
      {/* Dossier Header & Minimalist Tabs */}
      <div className="px-5 pt-4 pb-3 border-b border-[#EBE6DF] bg-[#FAF8F5]">
        <div className="flex items-baseline justify-between mb-3">
          <span className="font-serif text-lg font-medium text-stone-900">
            Curated Career Dossier
          </span>
          <span className="text-[11px] uppercase tracking-wider text-stone-500 font-sans">
            Verified Credentials
          </span>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-1">
          {[
            { id: 'experience', label: 'Experience', icon: Briefcase },
            { id: 'education', label: 'Education', icon: GraduationCap },
            { id: 'skills', label: 'Competencies', icon: Award },
            { id: 'projects', label: 'Ventures & Athletics', icon: Dumbbell },
            { id: 'pdf', label: 'Official PDF', icon: FileText },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === id
                  ? 'bg-white text-stone-900 shadow-sm border border-[#DDD5C7]'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-[#F2ECE1]'
              }`}
            >
              <Icon className="w-3.5 h-3.5 text-stone-500" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        {/* WORK EXPERIENCE */}
        {activeTab === 'experience' && (
          <div className="space-y-6">
            {/* Meliva AS */}
            <article className="border-b border-[#EFE9DE] pb-5 last:border-b-0 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <div>
                  <h4 className="font-serif text-base font-semibold text-stone-900">
                    Assistant Service Coordinator (Trainee)
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                    <span className="font-medium text-stone-800">Meliva AS</span>
                    <span aria-hidden="true">·</span>
                    <span>Tallinn</span>
                    <span aria-hidden="true">·</span>
                    <span>Healthcare Network Operations</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500 font-sans tabular-nums">
                    June 2025 – July 2025
                  </span>
                  <button
                    onClick={() => onAskQuestion('Could you elaborate on Henry’s coordination responsibilities and impact at Meliva AS?')}
                    className="p-1 rounded text-stone-400 hover:text-stone-800 hover:bg-[#F2ECE1] transition-colors"
                    title="Inquire about this role"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <ul className="space-y-1.5 text-xs text-stone-700 leading-relaxed pt-1">
                <li className="flex items-start gap-2">
                  <span className="text-stone-400 select-none">—</span>
                  <span>Supervised front-desk workflows and patient reception operations across dental clinical branches.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-stone-400 select-none">—</span>
                  <span>Conducted regular clinic visits and one-on-one coordination sessions with front-office administrators.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-stone-400 select-none">—</span>
                  <span>Coordinated staff shift scheduling and clinical appointment allocations using Persona HR software.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-stone-400 select-none">—</span>
                  <span>Evaluated operational KPI metrics and Net Promoter Score (NPS) indices, synthesizing strategic feedback reports for executive management.</span>
                </li>
              </ul>
            </article>

            {/* Estonian Ministry of Defence / Kaitsevägi */}
            <article className="border-b border-[#EFE9DE] pb-5 last:border-b-0 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <div>
                  <h4 className="font-serif text-base font-semibold text-stone-900">
                    Reconnaissance Department Driver & Tactical Logistics
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                    <span className="font-medium text-stone-800">Estonian Defence Forces</span>
                    <span aria-hidden="true">·</span>
                    <span>Tapa</span>
                    <span aria-hidden="true">·</span>
                    <span>Reconnaissance Unit</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500 font-sans tabular-nums">
                    July 2023 – June 2024
                  </span>
                  <button
                    onClick={() => onAskQuestion('What duties and leadership principles did Henry demonstrate during his reconnaissance military service?')}
                    className="p-1 rounded text-stone-400 hover:text-stone-800 hover:bg-[#F2ECE1] transition-colors"
                    title="Inquire about this role"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <ul className="space-y-1.5 text-xs text-stone-700 leading-relaxed pt-1">
                <li className="flex items-start gap-2">
                  <span className="text-stone-400 select-none">—</span>
                  <span>Maintained operational readiness and performed scheduled maintenance for all-terrain utility vehicles and mission equipment.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-stone-400 select-none">—</span>
                  <span>Transported specialized reconnaissance teams and mission equipment under tight operational deadlines and demanding terrain.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-stone-400 select-none">—</span>
                  <span>Enforced strict vehicle documentation and military technical standards across dynamic field conditions.</span>
                </li>
              </ul>
            </article>

            {/* Hillar Vatsel FIE */}
            <article className="border-b border-[#EFE9DE] pb-5 last:border-b-0 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <div>
                  <h4 className="font-serif text-base font-semibold text-stone-900">
                    Mover & Logistics Specialist
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                    <span className="font-medium text-stone-800">Hillar Vatsel FIE (Family Enterprise)</span>
                    <span aria-hidden="true">·</span>
                    <span>Tallinn</span>
                  </div>
                </div>
                <span className="text-xs text-stone-500 font-sans tabular-nums">
                  April 2022 – Present
                </span>
              </div>
              <ul className="space-y-1.5 text-xs text-stone-700 leading-relaxed pt-1">
                <li className="flex items-start gap-2">
                  <span className="text-stone-400 select-none">—</span>
                  <span>Supports family enterprise with physically demanding relocations, ensuring zero-damage packing and transportation.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-stone-400 select-none">—</span>
                  <span>Cultivated rapid team problem solving, punctuality, and logistical coordination.</span>
                </li>
              </ul>
            </article>

            {/* Bolt Courier */}
            <article className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <div>
                  <h4 className="font-serif text-base font-semibold text-stone-900">
                    Courier & Customer Service Specialist
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                    <span className="font-medium text-stone-800">Bolt</span>
                    <span aria-hidden="true">·</span>
                    <span>Tallinn</span>
                  </div>
                </div>
                <span className="text-xs text-stone-500 font-sans tabular-nums">
                  June 2022 – August 2022
                </span>
              </div>
              <p className="text-xs text-stone-700 leading-relaxed pt-1">
                Fast-paced summer courier role during high school, delivering time-critical orders throughout Tallinn with polite, solution-oriented customer communication.
              </p>
            </article>
          </div>
        )}

        {/* EDUCATION */}
        {activeTab === 'education' && (
          <div className="space-y-6">
            {/* EBS */}
            <article className="p-5 rounded-xl bg-[#FAF8F5] border border-[#EAE3D6] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <div>
                  <h4 className="font-serif text-lg font-semibold text-stone-900">
                    Estonian Business School (EBS)
                  </h4>
                  <p className="text-xs font-serif italic text-stone-700 mt-0.5">
                    Bachelor’s in Entrepreneurship and Business Administration (Ettevõtlus ja ärijuhtimine)
                  </p>
                </div>
                <span className="text-xs text-stone-500 font-sans tabular-nums">
                  2024 – Present · Tallinn
                </span>
              </div>

              <div className="text-xs text-stone-700 leading-relaxed space-y-2">
                <p>
                  Rigorous academic curriculum centered on strategic enterprise leadership, marketing analytics, corporate finance, and modern organizational development.
                </p>
                <div className="pt-2 border-t border-[#EAE3D6] flex flex-wrap gap-x-4 gap-y-1 text-stone-600">
                  <span>· Strategic Management</span>
                  <span>· Marketing & Funnel Optimization</span>
                  <span>· Financial Fundamentals</span>
                  <span>· Organizational Analysis</span>
                </div>
              </div>

              <button
                onClick={() => onAskQuestion('How does Henry’s EBS education complement his practical experience in operations?')}
                className="text-xs font-medium text-stone-900 hover:underline pt-1 inline-block"
              >
                Inquire about Henry’s academic focus →
              </button>
            </article>

            {/* High School */}
            <article className="p-5 rounded-xl bg-[#FAF8F5] border border-[#EAE3D6] space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <div>
                  <h4 className="font-serif text-lg font-semibold text-stone-900">
                    Tallinna Ühisgümnaasium
                  </h4>
                  <p className="text-xs text-stone-600">
                    Secondary and Basic School Education
                  </p>
                </div>
                <span className="text-xs text-stone-500 font-sans tabular-nums">
                  Graduated 2023 · Tallinn
                </span>
              </div>
              <p className="text-xs text-stone-700 leading-relaxed">
                Completed secondary studies with academic distinction while competing in powerlifting athletics and engaging in independent e-commerce ventures.
              </p>
            </article>
          </div>
        )}

        {/* COMPETENCIES & LICENSES */}
        {activeTab === 'skills' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {resumeData.skills.map((cat) => (
                <div key={cat.category} className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE3D6] space-y-2">
                  <h5 className="font-serif text-sm font-semibold text-stone-900">{cat.category}</h5>
                  <div className="flex flex-wrap gap-1.5 text-xs text-stone-700">
                    {cat.items.map((item, idx) => (
                      <span key={item} className="inline-flex items-center">
                        <span className="bg-white border border-[#E0D7C7] px-2.5 py-1 rounded-md text-stone-800">
                          {item}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Driver Licenses */}
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE3D6] space-y-2.5">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-stone-700" />
                <h5 className="font-serif text-sm font-semibold text-stone-900">
                  Fleet Readiness & Driver Credentials
                </h5>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-white border border-[#E5DFD5]">
                  <span className="font-medium text-stone-900 block">Category B</span>
                  <span className="text-stone-500 text-[11px]">Passenger vehicles (Active)</span>
                </div>
                <div className="p-3 rounded-lg bg-white border border-[#E5DFD5]">
                  <span className="font-medium text-stone-900 block">Category A2</span>
                  <span className="text-stone-500 text-[11px]">Motorcycles (Acquired 2024)</span>
                </div>
                <div className="p-3 rounded-lg bg-white border border-[#E5DFD5]">
                  <span className="font-medium text-stone-900 block">Category C</span>
                  <span className="text-stone-500 text-[11px]">Commercial trucks (In progress)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VENTURES & ATHLETICS */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            {/* E-Commerce */}
            <article className="p-5 rounded-xl bg-[#FAF8F5] border border-[#EAE3D6] space-y-2.5">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-stone-800" />
                <h4 className="font-serif text-base font-semibold text-stone-900">
                  Independent E-Commerce & Digital Marketing
                </h4>
              </div>
              <p className="text-xs text-stone-700 leading-relaxed">
                Independently designs, launches, and operates commercial storefronts (including dropshipping models). Actively conducts market analysis, product curation, landing page optimization, digital advertising campaigns, and funnel conversion tracking.
              </p>
              <button
                onClick={() => onAskQuestion('What has Henry learned from building independent e-commerce stores?')}
                className="text-xs font-medium text-stone-900 hover:underline inline-block pt-1"
              >
                Inquire about his digital ventures →
              </button>
            </article>

            {/* Athletics */}
            <article className="p-5 rounded-xl bg-[#FAF8F5] border border-[#EAE3D6] space-y-2.5">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-stone-800" />
                <h4 className="font-serif text-base font-semibold text-stone-900">
                  Competitive Powerlifting & Physical Conditioning
                </h4>
              </div>
              <p className="text-xs text-stone-700 leading-relaxed">
                Committed to disciplined physical training as a core pillar of resilience and focus. Member of <strong>Reval Academy (Revali Akadeemia)</strong>, competing in official powerlifting events representing his team. Also practices bouldering and rock climbing.
              </p>
              <div className="text-xs text-stone-500 pt-1 flex items-center gap-3">
                <span>· Reval Academy Member</span>
                <span>· Powerlifting Meets</span>
                <span>· Bouldering</span>
              </div>
            </article>
          </div>
        )}

        {/* OFFICIAL PDF */}
        {activeTab === 'pdf' && (
          <div className="h-full flex flex-col space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="font-serif text-sm font-medium text-stone-800">
                Official Resume Document (Estonian)
              </span>
              <a
                href="/assets/aistudio/resume_1603e313.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-800 hover:underline"
              >
                <span>Open in Fullscreen</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="flex-1 w-full min-h-[460px] rounded-xl overflow-hidden border border-[#E0D7C7] bg-[#FAF8F5]">
              <iframe
                src="/assets/aistudio/resume_1603e313.pdf#toolbar=1"
                className="w-full h-full min-h-[460px] border-0"
                title="Henry Anton Resume"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
