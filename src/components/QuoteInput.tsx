import { useCallback, useState } from 'react';
import type { AnalyzeInput } from '../lib/api';

interface Props {
  onSubmit: (input: AnalyzeInput) => void;
  disabled: boolean;
}

type Mode = 'file' | 'text';

export default function QuoteInput({ onSubmit, disabled }: Props) {
  const [mode, setMode] = useState<Mode>('file');
  const [dragOver, setDragOver] = useState(false);
  const [text, setText] = useState('');

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (file && !disabled) onSubmit({ file });
    },
    [onSubmit, disabled]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFile(e.dataTransfer.files[0]);
    },
    [handleFile]
  );

  const handleTextSubmit = useCallback(() => {
    if (text.trim() && !disabled) onSubmit({ text: text.trim() });
  }, [onSubmit, text, disabled]);

  const tabClass = (active: boolean) =>
    `px-5 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
      active ? 'bg-cream-50 text-warm-900 border border-b-0 border-cream-300' : 'text-warm-500 hover:text-warm-700'
    }`;

  return (
    <div>
      <div className="flex gap-1 px-2">
        <button className={tabClass(mode === 'file')} onClick={() => setMode('file')}>
          Upload a file
        </button>
        <button className={tabClass(mode === 'text')} onClick={() => setMode('text')}>
          Paste the text
        </button>
      </div>

      <div className="bg-cream-50 border border-cream-300 rounded-2xl rounded-tl-none p-8">
        {mode === 'file' ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all
              ${dragOver ? 'border-gold-500 bg-gold-400/10' : 'border-cream-400'}
              ${disabled ? 'opacity-50' : ''}`}
          >
            <p className="font-serif text-2xl text-warm-800">Drop your HVAC quote here</p>
            <p className="text-sm text-warm-500 mt-2 font-light">
              PDF, photo, or text file — scanned documents are fine
            </p>
            <label className={`inline-block mt-6 px-8 py-3 bg-warm-700 text-cream-50 rounded-lg font-medium text-sm tracking-wide
              ${disabled ? '' : 'hover:bg-warm-800 cursor-pointer'} transition-colors`}>
              Choose File
              <input
                type="file"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.txt"
                onChange={(e) => handleFile(e.target.files?.[0])}
                disabled={disabled}
              />
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={'Paste the full quote — line items, total, contractor name, and the home address…\n\nGot it by email? Copy the whole thing in.'}
              rows={9}
              disabled={disabled}
              className="w-full border border-cream-300 rounded-xl px-4 py-3 bg-white/60 text-warm-800 text-sm leading-relaxed focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-colors placeholder:text-warm-500/50"
            />
            <button
              onClick={handleTextSubmit}
              disabled={disabled || !text.trim()}
              className="px-8 py-3 bg-warm-700 text-cream-50 rounded-lg font-medium text-sm tracking-wide hover:bg-warm-800 disabled:opacity-50 transition-colors"
            >
              Check this quote
            </button>
          </div>
        )}

        <p className="mt-5 text-xs text-warm-500/80 font-light">
          We read the job-site location straight from the quote's address — no extra fields to fill in.
        </p>
      </div>
    </div>
  );
}
