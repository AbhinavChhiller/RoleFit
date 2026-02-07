// API Response Types
export interface SkillMatch {
  skill: string;
  status: 'matched' | 'missing' | 'partial';
  relevance: 'high' | 'medium' | 'low';
}

export interface ScoreBreakdown {
  skillsScore: number;
  experienceScore: number;
  roleContextScore: number;
  overallScore: number;
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

export interface AnalysisError {
  error: string;
  details?: string[];
}

const API_BASE = '/api';

/**
 * Analyze resume text against job description
 */
export async function analyzeResume(
  resumeText: string,
  jobDescription: string
): Promise<AnalysisResponse> {
  const response = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ resumeText, jobDescription }),
  });

  if (!response.ok) {
    const error = await response.json() as AnalysisError;
    throw new Error(error.error || 'Analysis failed');
  }

  return response.json() as Promise<AnalysisResponse>;
}

/**
 * Analyze resume file against job description
 */
export async function analyzeResumeFile(
  file: File,
  jobDescription: string
): Promise<AnalysisResponse> {
  const formData = new FormData();
  formData.append('resume', file);
  formData.append('jobDescription', jobDescription);

  const response = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json() as AnalysisError;
    throw new Error(error.error || 'Analysis failed');
  }

  return response.json() as Promise<AnalysisResponse>;
}

/**
 * Check API health
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
