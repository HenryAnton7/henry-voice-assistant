export interface EducationItem {
  institution: string;
  location: string;
  degree: string;
  period: string;
  description: string;
}

export interface ExperienceItem {
  role: string;
  company: string;
  location: string;
  period: string;
  highlights: string[];
}

export interface SkillCategory {
  category: string;
  items: string[];
}

export interface ResumeData {
  name: string;
  title: string;
  location: string;
  phone: string;
  email: string;
  pdfUrl: string;
  greeting: string;
  education: EducationItem[];
  experience: ExperienceItem[];
  skills: SkillCategory[];
  quickPrompts: string[];
}

export interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
  audioBase64?: string;
}
