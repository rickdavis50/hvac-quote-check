import pdfParse from 'pdf-parse';
import Tesseract from 'tesseract.js';

export async function extractText(
  buffer: Buffer,
  mimeType: string
): Promise<{ text: string; method: 'pdf' | 'ocr' | 'text' }> {
  if (mimeType === 'text/plain') {
    const text = buffer.toString('utf-8').trim();
    if (!text) throw new Error('Empty text document');
    return { text, method: 'text' };
  }
  if (mimeType === 'application/pdf') {
    return extractFromPdf(buffer);
  }
  if (mimeType.startsWith('image/')) {
    return extractFromImage(buffer);
  }
  throw new Error(`Unsupported file type: ${mimeType}`);
}

async function extractFromPdf(buffer: Buffer): Promise<{ text: string; method: 'pdf' }> {
  const result = await pdfParse(buffer);
  const text = result.text.trim();
  if (!text) {
    throw new Error('PDF contained no extractable text');
  }
  return { text, method: 'pdf' };
}

async function extractFromImage(buffer: Buffer): Promise<{ text: string; method: 'ocr' }> {
  const { data } = await Tesseract.recognize(buffer, 'eng');
  const text = data.text.trim();
  if (!text) {
    throw new Error('OCR extracted no readable text from image');
  }
  return { text, method: 'ocr' };
}
