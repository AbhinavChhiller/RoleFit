import pdf from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * Extract text from PDF buffer
 */
export async function extractFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer);
    return data.text.trim();
  } catch (error) {
    throw new Error(`Failed to extract text from PDF: ${error}`);
  }
}

/**
 * Extract text from DOCX buffer
 */
export async function extractFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  } catch (error) {
    throw new Error(`Failed to extract text from DOCX: ${error}`);
  }
}

/**
 * Extract text from file based on mimetype
 */
export async function extractTextFromFile(
  buffer: Buffer,
  mimetype: string
): Promise<string> {
  if (mimetype === 'application/pdf') {
    return extractFromPDF(buffer);
  }
  
  if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimetype === 'application/msword'
  ) {
    return extractFromDOCX(buffer);
  }
  
  if (mimetype === 'text/plain') {
    return buffer.toString('utf-8').trim();
  }
  
  throw new Error(`Unsupported file type: ${mimetype}`);
}

/**
 * Normalize text by removing excess whitespace
 */
export function normalizeText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}
