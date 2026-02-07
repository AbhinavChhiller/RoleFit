import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { validateFile, ALLOWED_FILE_TYPES } from '@/lib/validators';
import { cn } from '@/lib/utils';

interface ResumeInputProps {
  value: string;
  onChange: (value: string) => void;
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  error?: string;
}

export function ResumeInput({
  value,
  onChange,
  onFileSelect,
  selectedFile,
  error,
}: ResumeInputProps) {
  const [fileError, setFileError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('paste');

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const validationError = validateFile(file);
        if (validationError) {
          setFileError(validationError);
          return;
        }
        setFileError(null);
        onFileSelect(file);
        onChange(''); // Clear text when file is selected
      }
    },
    [onFileSelect, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ALLOWED_FILE_TYPES.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxFiles: 1,
    multiple: false,
  });

  const clearFile = () => {
    onFileSelect(null);
    setFileError(null);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'paste') {
      onFileSelect(null);
      setFileError(null);
    } else {
      onChange('');
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Resume</label>
      
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="paste">Paste Text</TabsTrigger>
          <TabsTrigger value="upload">Upload File</TabsTrigger>
        </TabsList>
        
        <TabsContent value="paste" className="mt-3">
          <Textarea
            placeholder="Paste your resume content here..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              "min-h-[200px] resize-y",
              error && "border-destructive"
            )}
          />
        </TabsContent>
        
        <TabsContent value="upload" className="mt-3">
          {selectedFile ? (
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={clearFile}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50",
                (error || fileError) && "border-destructive"
              )}
            >
              <input {...getInputProps()} />
              <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm font-medium">
                {isDragActive ? 'Drop the file here' : 'Drag & drop your resume'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF, DOCX, DOC, or TXT (max 5MB)
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {(error || fileError) && (
        <p className="text-sm text-destructive">{error || fileError}</p>
      )}
    </div>
  );
}
