export interface TokenUsage {
  promptTokens: number;
  responseTokens: number;
  totalTokens: number;
  estimatedCost: number;
}

export interface ChapterSection {
  title: string;
  content: string; // Markdown content
}

export interface Chapter {
  title: string;
  intro: string; 
  sections: ChapterSection[];
}

export type DocumentType = 'kurs_ishi' | 'mustaqil_ish' | 'referat' | 'bmi' | 'maqola';

export interface CourseWorkStructure {
  id?: string;
  type?: DocumentType;
  createdAt?: string;
  universityName: string;
  facultyName: string;
  groupName: string; 
  studentName: string;
  teacherName: string;
  cityYear: string;
  topic: string;
  tableOfContents: string[];
  introduction: string;
  chapter1: Chapter;
  chapter2: Chapter;
  chapter3: Chapter;
  conclusion: string;
  references: string[];
  sourceUrls: string[]; 
  appendix?: string;
  tokenUsage?: TokenUsage;
  generationTime: number; 
}

export interface CourseSettings {
  includeCode: boolean;
  includeTables: boolean;
  style: 'academic' | 'simple';
  useGoogleSearch: boolean;
}

export interface UserInputs {
  documentType: DocumentType;
  universityName: string;
  facultyName: string;
  groupName: string;
  studentName: string;
  teacherName: string;
  cityYear: string;
  topic: string;
  pages: number;
  settings: CourseSettings;
}

export interface CoursePlan {
  chapter1_title: string;
  chapter1_subsections: string[];
  chapter2_title: string;
  chapter2_subsections: string[];
  chapter3_title: string;
  chapter3_subsections: string[];
}

export type ValidationStatus = 'success' | 'warning' | 'error';

export interface ValidationItem {
  id: string;
  category: 'Structure' | 'Formatting' | 'Content' | 'GOST';
  label: string;
  status: ValidationStatus;
  message: string;
  recommendation?: string;
}

export interface ValidationReport {
  score: number;
  items: ValidationItem[];
  passed: boolean;
}

export type PlanType = 'free' | 'student' | 'teacher';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  plan: PlanType;
  credits: number;
  isPro: boolean;
}

export interface PricingTier {
  id: PlanType;
  name: string;
  price: string;
  period?: string;
  features: string[];
  isPopular?: boolean;
  buttonText: string;
}