import type { AIAnalysisResult, ScoreBreakdown, AnalysisResponse } from '../types/index.js';

// Scoring weights as specified in requirements
const WEIGHTS = {
  skills: 0.5,      // 50%
  experience: 0.3,  // 30%
  roleContext: 0.2, // 20%
};

/**
 * Calculate skills score based on skill matches
 */
function calculateSkillsScore(aiResult: AIAnalysisResult): number {
  const { skillMatches } = aiResult;
  
  if (skillMatches.length === 0) return 0;
  
  // Weight by relevance and match status
  let totalWeight = 0;
  let earnedScore = 0;
  
  for (const match of skillMatches) {
    // Relevance weight
    const relevanceWeight = 
      match.relevance === 'high' ? 3 :
      match.relevance === 'medium' ? 2 : 1;
    
    // Status score
    const statusScore = 
      match.status === 'matched' ? 1 :
      match.status === 'partial' ? 0.5 : 0;
    
    totalWeight += relevanceWeight;
    earnedScore += relevanceWeight * statusScore;
  }
  
  return Math.round((earnedScore / totalWeight) * 100);
}

/**
 * Generate explanation for the score
 */
function generateExplanation(
  skillsScore: number,
  experienceScore: number,
  roleContextScore: number,
  overallScore: number,
  aiResult: AIAnalysisResult
): string {
  const parts: string[] = [];
  
  // Overall assessment
  if (overallScore >= 80) {
    parts.push('Excellent match! Your profile aligns very well with this role.');
  } else if (overallScore >= 60) {
    parts.push('Good match with some areas for improvement.');
  } else if (overallScore >= 40) {
    parts.push('Moderate match. Consider addressing the skill gaps before applying.');
  } else {
    parts.push('This role may not be the best fit for your current profile.');
  }
  
  // Skills breakdown
  const matchedCount = aiResult.skillMatches.filter(s => s.status === 'matched').length;
  const missingCount = aiResult.skillMatches.filter(s => s.status === 'missing').length;
  
  if (matchedCount > 0) {
    parts.push(`You match ${matchedCount} of the required skills.`);
  }
  if (missingCount > 0) {
    parts.push(`${missingCount} key skills are missing from your resume.`);
  }
  
  // Experience insight
  if (experienceScore >= 80) {
    parts.push('Your experience level aligns well with requirements.');
  } else if (experienceScore < 50) {
    parts.push('Consider highlighting more relevant experience.');
  }
  
  return parts.join(' ');
}

/**
 * Calculate overall match score with weighted breakdown
 */
export function calculateScore(aiResult: AIAnalysisResult): ScoreBreakdown {
  const skillsScore = calculateSkillsScore(aiResult);
  const experienceScore = aiResult.experienceAlignment;
  const roleContextScore = aiResult.roleContextMatch;
  
  const overallScore = Math.round(
    skillsScore * WEIGHTS.skills +
    experienceScore * WEIGHTS.experience +
    roleContextScore * WEIGHTS.roleContext
  );
  
  const explanation = generateExplanation(
    skillsScore,
    experienceScore,
    roleContextScore,
    overallScore,
    aiResult
  );
  
  return {
    skillsScore,
    experienceScore,
    roleContextScore,
    overallScore,
    explanation,
  };
}

/**
 * Build complete analysis response from AI result
 */
export function buildAnalysisResponse(aiResult: AIAnalysisResult): AnalysisResponse {
  const score = calculateScore(aiResult);
  
  return {
    score,
    skills: aiResult.skillMatches,
    suggestions: aiResult.suggestions,
    roleMismatch: aiResult.roleMismatch,
    roleMismatchReason: aiResult.roleMismatchReason,
  };
}
