import { useCallback, useState } from 'react';
import type { AnalyzeInput } from '../lib/api';
import { useExperiment } from '../lib/experiments';

interface Props {
  onSubmit: (input: AnalyzeInput) => void;
}

type Mode = 'file' | 'text';

export default function QuoteInput({ onSubmit }: Props) {
  const defaultMode: Mode = useExperiment('quote_input_default') === 'text' ? 'text' : 'file';
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [dragOver, setDragOver] = useState(false);
  const [text, setText] = useState('');

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (file) onSubmit({ file });
    },
    [onSubmit]
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
    if (text.trim()) onSubmit({ text: text.trim() });
  }, [onSubmit, text]);

  const tabClass = (active: boolean) =>
    `px-4 py-2 text-[12px] font-medium transition-colors border-b-2 ${
      active ? 'border-copper text-ink' : 'border-transparent text-ink-mute hover:text-ink'
    }`;

  return (
    <div className="sheet">
      <div className="sheet-titleblock">
        <span>Sheet Nº 001 · quote dissection</span>
        <span className="ml-auto">PDF · photo · text</span>
      </div>

      <div className="px-5 pt-3 sm:px-8">
        <div className="flex gap-2">
          <button className={tabClass(mode === 'file')} onClick={() => setMode('file')}>
            Upload the document
          </button>
          <button className={tabClass(mode === 'text')} onClick={() => setMode('text')}>
            Paste the text
          </button>
        </div>
      </div>

      <div className="px-5 pb-8 pt-6 sm:px-8">
        {mode === 'file' ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border border-dashed px-8 py-14 text-center transition-colors ${
              dragOver ? 'border-copper bg-copper-tint/40' : 'border-ink/30'
            }`}
          >
            <p className="font-display text-2xl text-ink">Drop the quote here</p>
            <p className="mt-2 text-[12px] text-ink-mute">
              Scanned pages and phone photos read fine. Crumpled is fine.
            </p>
            <label className="btn-ink mt-6 cursor-pointer">
              Choose file
              <input
                type="file"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.txt"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={'Paste the full quote: line items, total, contractor name, and the job address.\n\nGot it by email? Copy the whole thing in.'}
              rows={9}
              className="w-full border border-ink/30 bg-paper px-4 py-3 text-[13px] leading-relaxed text-ink placeholder:text-ink-faint focus:border-copper"
            />
            <button onClick={handleTextSubmit} disabled={!text.trim()} className="btn-ink disabled:opacity-40">
              Dissect this quote
            </button>
          </div>
        )}

        <p className="mt-5 text-[11px] text-ink-mute">
          The job-site ZIP is read straight off the quote. Nothing else to fill in, nobody calls you.
        </p>
      </div>
    </div>
  );
}
