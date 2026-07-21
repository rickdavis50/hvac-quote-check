// Import the library entry directly, not the package index: pdf-parse's index.js
// runs a debug file-read at import time when it thinks it's the main module,
// which crashes under a bundler (Vercel/esbuild). The lib entry has no such side
// effect. Types are re-declared for this subpath in pdf-parse-lib.d.ts.
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

export interface ExtractionInput {
  /** Raw text when the source is text or a text-layer PDF. */
  text: string | null;
  method: 'text' | 'pdf' | 'image';
  /** Original document for Claude vision — lets scanned PDFs and photos work. */
  document: { kind: 'pdf' | 'image'; mediaType: string; dataBase64: string } | null;
}

const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']);

export async function prepareInput(buffer: Buffer, mimeType: string): Promise<ExtractionInput> {
  if (mimeType === 'text/plain') {
    const text = buffer.toString('utf-8').trim();
    if (!text) throw new Error('Empty text document');
    return { text, method: 'text', document: null };
  }

  if (mimeType === 'application/pdf') {
    let text: string | null = null;
    try {
      const parsed = await pdfParse(buffer);
      text = parsed.text.trim() || null;
    } catch {
      text = null; // scanned/encrypted PDFs still go to Claude as a document block
    }
    return {
      text,
      method: 'pdf',
      document: { kind: 'pdf', mediaType: 'application/pdf', dataBase64: buffer.toString('base64') },
    };
  }

  if (IMAGE_TYPES.has(mimeType)) {
    return {
      text: null,
      method: 'image',
      document: { kind: 'image', mediaType: mimeType === 'image/jpg' ? 'image/jpeg' : mimeType, dataBase64: buffer.toString('base64') },
    };
  }

  throw new Error(`Unsupported file type: ${mimeType}`);
}
