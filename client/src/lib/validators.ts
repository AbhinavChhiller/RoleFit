import { z } from 'zod';

export const resumeSchema = z.string()
  .min(50, 'Resume must be at least 50 characters')
  .max(50000, 'Resume is too long (max 50,000 characters)');

export const jobDescriptionSchema = z.string()
  .min(50, 'Job description must be at least 50 characters')
  .max(20000, 'Job description is too long (max 20,000 characters)');

export const analysisFormSchema = z.object({
  resumeText: resumeSchema,
  jobDescription: jobDescriptionSchema,
});

export type AnalysisFormData = z.infer<typeof analysisFormSchema>;

// File validation
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
];

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function validateFile(file: File): string | null {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return 'Invalid file type. Please upload a PDF, DOCX, DOC, or TXT file.';
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return 'File too large. Maximum size is 5MB.';
  }
  
  return null;
}
