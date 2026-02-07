import { Router, Request, Response } from 'express';
import { z } from 'zod';
import multer from 'multer';
import { extractTextFromFile, normalizeText } from '../services/textExtractor.js';
import { analyzeWithAI } from '../services/aiService.js';
import { buildAnalysisResponse } from '../services/scoringService.js';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, DOC, and TXT files are allowed.'));
    }
  },
});

// Validation schemas
const textAnalysisSchema = z.object({
  resumeText: z.string().min(50, 'Resume must be at least 50 characters').max(50000, 'Resume too long'),
  jobDescription: z.string().min(5, 'Job description must be at least 50 characters').max(20000, 'Job description too long'),
});

/**
 * POST /api/analyze
 * Analyze resume against job description
 * 
 * Body (JSON): { resumeText: string, jobDescription: string }
 * OR
 * Body (multipart): resume (file), jobDescription (text)
 */
router.post(
  '/',
  upload.single('resume'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      let resumeText: string;
      let jobDescription: string;

      console.log('DEBUG: analyze.ts - GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);

      // Handle file upload
      if (req.file) {
        resumeText = await extractTextFromFile(req.file.buffer, req.file.mimetype);
        jobDescription = req.body.jobDescription || '';
      } else {
        // Handle JSON body
        resumeText = req.body.resumeText || '';
        jobDescription = req.body.jobDescription || '';
      }

      // Normalize text
      resumeText = normalizeText(resumeText);
      jobDescription = normalizeText(jobDescription);

      // Validate input
      const validation = textAnalysisSchema.safeParse({ resumeText, jobDescription });
      if (!validation.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: validation.error.issues.map(i => i.message),
        });
        return;
      }

      // Analyze with AI
      const aiResult = await analyzeWithAI(resumeText, jobDescription);

      // Build response with scoring
      const response = buildAnalysisResponse(aiResult);

      res.json(response);
    } catch (error) {
      console.error('Analysis error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('GEMINI_API_KEY')) {
          res.status(500).json({ error: 'AI service not configured. Please set GEMINI_API_KEY.' });
          return;
        }
        res.status(500).json({ error: error.message });
        return;
      }
      
      res.status(500).json({ error: 'An unexpected error occurred during analysis.' });
    }
  }
);

export default router;
