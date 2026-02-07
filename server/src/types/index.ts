// Analysis Request/Response Types

export interface AnalysisRequest {
  resumeText: string;
  jobDescription: string;
}

export interface SkillMatch {
  skill: string;
  status: 'matched' | 'missing' | 'partial';
  relevance: 'high' | 'medium' | 'low';
}

export interface ScoreBreakdown {
  skillsScore: number;      // 0-100, weight: 50%
  experienceScore: number;  // 0-100, weight: 30%
  roleContextScore: number; // 0-100, weight: 20%
  overallScore: number;     // 0-100, weighted average
  explanation: string;
}

export interface Suggestion {
  section: string;
  priority: 'high' | 'medium' | 'low';
  suggestion: string;
}

export interface AnalysisResponse {
  score: ScoreBreakdown;
  skills: SkillMatch[];
  suggestions: Suggestion[];
  roleMismatch: boolean;
  roleMismatchReason?: string;
}

// AI Service Types
export interface ExtractedResume {
  skills: string[];
  tools: string[];
  experienceYears: number;
  experienceAreas: string[];
  education: string[];
  summary: string;
}

export interface ExtractedJob {
  requiredSkills: string[];
  preferredSkills: string[];
  requiredTools: string[];
  experienceRequired: number;
  roleTitle: string;
  roleContext: string;
}

export interface AIAnalysisResult {
  resume: ExtractedResume;
  job: ExtractedJob;
  skillMatches: SkillMatch[];
  experienceAlignment: number;
  roleContextMatch: number;
  suggestions: Suggestion[];
  roleMismatch: boolean;
  roleMismatchReason?: string;
}
