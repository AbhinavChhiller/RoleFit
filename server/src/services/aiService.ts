import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { z } from 'zod';
import type { AIAnalysisResult, SkillMatch, Suggestion } from '../types/index.js';

// Define the schema using the format expected by Gemini API (JSON Schema)
// Instead of zod-to-json-schema, we'll define it more directly to ensure compatibility
// but we can still use zod for validation later if we want.
// However, Gemini's responseSchema prefers a more direct object literal if possible.

const analysisSchema = {
  description: "Resume analysis results",
  type: SchemaType.OBJECT,
  properties: {
    resumeSkills: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Skills extracted from the resume"
    },
    resumeTools: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Tools and technologies from the resume"
    },
    resumeExperienceYears: {
      type: SchemaType.NUMBER,
      description: "Total years of experience"
    },
    resumeExperienceAreas: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Areas of experience"
    },
    jobRequiredSkills: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Required skills from job description"
    },
    jobPreferredSkills: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Preferred/nice-to-have skills"
    },
    jobRequiredTools: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Required tools and technologies"
    },
    jobExperienceRequired: {
      type: SchemaType.NUMBER,
      description: "Years of experience required"
    },
    jobRoleTitle: {
      type: SchemaType.STRING,
      description: "Job role title"
    },
    skillMatches: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          skill: { type: SchemaType.STRING },
          status: { 
            type: SchemaType.STRING,
            enum: ["matched", "partial", "missing"]
          },
          relevance: { 
            type: SchemaType.STRING,
            enum: ["high", "medium", "low"]
          }
        },
        required: ["skill", "status", "relevance"]
      }
    },
    experienceAlignment: {
      type: SchemaType.NUMBER,
      description: "Experience alignment score 0-100"
    },
    roleContextMatch: {
      type: SchemaType.NUMBER,
      description: "Role context match score 0-100"
    },
    suggestions: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          section: { type: SchemaType.STRING },
          priority: { 
            type: SchemaType.STRING,
            enum: ["high", "medium", "low"]
          },
          suggestion: { type: SchemaType.STRING }
        },
        required: ["section", "priority", "suggestion"]
      }
    },
    roleMismatch: {
      type: SchemaType.BOOLEAN,
      description: "Whether there is a significant role mismatch"
    },
    roleMismatchReason: {
      type: SchemaType.STRING,
      description: "Reason for role mismatch if applicable"
    }
  },
  required: [
    "resumeSkills", "resumeTools", "resumeExperienceYears", "resumeExperienceAreas",
    "jobRequiredSkills", "jobPreferredSkills", "jobRequiredTools", "jobExperienceRequired",
    "jobRoleTitle", "skillMatches", "experienceAlignment", "roleContextMatch",
    "suggestions", "roleMismatch"
  ]
};

const ANALYSIS_PROMPT = `You are an expert resume analyzer. Analyze the provided resume against the job description.

IMPORTANT INSTRUCTIONS:
1. Extract skills, tools, and experience from both resume and job description
2. Normalize skill names (e.g., "React.js" and "ReactJS" are the same)
3. Consider semantic similarity (e.g., "REST APIs" matches "RESTful services")
4. For skill matches:
   - "matched": Skill clearly present in resume
   - "partial": Related skill present but not exact match
   - "missing": Skill not found in resume
5. For relevance:
   - "high": Core requirement for the role
   - "medium": Important but not critical
   - "low": Nice to have
6. Experience alignment (0-100): How well does the candidate's experience level and areas match?
7. Role context match (0-100): Does the candidate's background align with the role's domain?
8. Provide actionable suggestions organized by resume section
9. Flag role mismatch only if there's a significant career direction difference

RESUME:
{{RESUME}}

JOB DESCRIPTION:
{{JOB_DESCRIPTION}}

Analyze thoroughly and provide structured output.`;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Analyze resume against job description using Google Gemini AI
 */
export async function analyzeWithAI(
  resumeText: string,
  jobDescription: string
): Promise<AIAnalysisResult> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  // Use the pattern requested by the user
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  // Use gemini-2.5-flash as requested by the user and verified as available.
  // This model supports structured output via responseSchema.
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: analysisSchema as any,
    }
  });

  const prompt = ANALYSIS_PROMPT
    .replace('{{RESUME}}', resumeText)
    .replace('{{JOB_DESCRIPTION}}', jobDescription);

  let lastError: any;
  const maxRetries = 3;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Retrying AI analysis (attempt ${attempt}/${maxRetries}) after ${delay}ms delay...`);
        await sleep(delay);
      }

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (!text) {
        throw new Error('Empty response from AI');
      }
      
      const parsed = JSON.parse(text);
      
      // Transform to AIAnalysisResult
      return {
        resume: {
          skills: parsed.resumeSkills,
          tools: parsed.resumeTools,
          experienceYears: parsed.resumeExperienceYears,
          experienceAreas: parsed.resumeExperienceAreas,
          education: [],
          summary: '',
        },
        job: {
          requiredSkills: parsed.jobRequiredSkills,
          preferredSkills: parsed.jobPreferredSkills,
          requiredTools: parsed.jobRequiredTools,
          experienceRequired: parsed.jobExperienceRequired,
          roleTitle: parsed.jobRoleTitle,
          roleContext: '',
        },
        skillMatches: parsed.skillMatches,
        experienceAlignment: parsed.experienceAlignment,
        roleContextMatch: parsed.roleContextMatch,
        suggestions: parsed.suggestions,
        roleMismatch: parsed.roleMismatch,
        roleMismatchReason: parsed.roleMismatchReason,
      };
    } catch (error: any) {
      lastError = error;
      console.error(`AI Analysis Error (attempt ${attempt + 1}):`, error);

      // Only retry on rate limit (429) errors
      const errorMsg = error.message || '';
      if (!errorMsg.includes('429') && !errorMsg.toLowerCase().includes('quota') && !errorMsg.includes('503')) {
        break; // Don't retry for non-transient errors
      }
      
      if (attempt === maxRetries) {
        throw new Error('Gemini API quota exceeded after multiple retries. Please wait 1-2 minutes and try again.');
      }
    }
  }

  throw new Error(`AI analysis failed: ${lastError instanceof Error ? lastError.message : 'Unknown error'}`);
}
