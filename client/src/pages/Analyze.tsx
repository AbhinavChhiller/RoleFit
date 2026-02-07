import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ResumeInput } from '@/components/ResumeInput';
import { ScoreCard } from '@/components/ScoreCard';
import { SkillGap } from '@/components/SkillGap';
import { Suggestions } from '@/components/Suggestions';
import { analysisFormSchema, type AnalysisFormData } from '@/lib/validators';
import { analyzeResume, analyzeResumeFile, type AnalysisResponse } from '@/lib/api';

export function Analyze() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<AnalysisFormData>({
    resolver: zodResolver(analysisFormSchema),
    defaultValues: {
      resumeText: '',
      jobDescription: '',
    },
  });

  const resumeText = form.watch('resumeText');
  const jobDescription = form.watch('jobDescription');

  const canSubmit = (resumeText.length >= 50 || selectedFile) && jobDescription.length >= 5;

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let response: AnalysisResponse;

      if (selectedFile) {
        // Analyze with file
        response = await analyzeResumeFile(selectedFile, jobDescription);
      } else {
        // Analyze with text
        const validation = analysisFormSchema.safeParse({
          resumeText,
          jobDescription,
        });

        if (!validation.success) {
          setError(validation.error.issues.map(i => i.message).join(', '));
          return;
        }

        response = await analyzeResume(resumeText, jobDescription);
      }

      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setSelectedFile(null);
    form.reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent mb-2">
            Resume Match Analysis
          </h1>
          <p className="text-muted-foreground">
            See how well your resume matches a job description
          </p>
        </div>

        {!result ? (
          /* Input Form */
          <div className="grid md:grid-cols-2 gap-6">
            {/* Resume Input */}
            <Card>
              <CardHeader>
                <CardTitle>Your Resume</CardTitle>
                <CardDescription>
                  Paste your resume or upload a file
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResumeInput
                  value={resumeText}
                  onChange={(value) => form.setValue('resumeText', value)}
                  onFileSelect={setSelectedFile}
                  selectedFile={selectedFile}
                  error={form.formState.errors.resumeText?.message}
                />
              </CardContent>
            </Card>

            {/* Job Description Input */}
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
                <CardDescription>
                  Paste the job posting you're interested in
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Textarea
                    placeholder="Paste the job description here..."
                    value={jobDescription}
                    onChange={(e) => form.setValue('jobDescription', e.target.value)}
                    className="min-h-[280px] resize-y"
                  />
                  {form.formState.errors.jobDescription && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.jobDescription.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Results */
          <div className="space-y-6">
            <Button variant="outline" onClick={handleReset} className="mb-4">
              ← Analyze Another
            </Button>
            
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <ScoreCard score={result.score} />
              </div>
              <div className="lg:col-span-2 space-y-6">
                <SkillGap skills={result.skills} />
                <Suggestions
                  suggestions={result.suggestions}
                  roleMismatch={result.roleMismatch}
                  roleMismatchReason={result.roleMismatchReason}
                />
              </div>
            </div>
          </div>
        )}

        {/* Analyze Button */}
        {!result && (
          <div className="mt-8 text-center">
            {error && (
              <p className="text-destructive mb-4">{error}</p>
            )}
            <Button
              size="lg"
              onClick={handleAnalyze}
              disabled={!canSubmit || isLoading}
              className="px-8 py-6 text-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Analyze Match
                </>
              )}
            </Button>
            <p className="text-sm text-muted-foreground mt-3">
              Powered by AI • Results in seconds
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
