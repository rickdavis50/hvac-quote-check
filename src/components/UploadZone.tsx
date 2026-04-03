import { useCallback, useState } from 'react';

interface Props {
  onFileSelected: (file: File) => void;
  disabled: boolean;
}

export default function UploadZone({ onFileSelected, disabled }: Props) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) onFileSelected(file);
    },
    [onFileSelected, disabled]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFileSelected(file);
    },
    [onFileSelected]
  );

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer
        ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className="space-y-4">
        <div className="text-4xl">📄</div>
        <div>
          <p className="text-lg font-medium text-gray-900">
            Drop your HVAC quote here
          </p>
          <p className="text-sm text-gray-500 mt-1">
            PDF or photo of your quote — we'll extract everything automatically
          </p>
        </div>
        <label className={`inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-medium
          ${disabled ? '' : 'hover:bg-blue-700 cursor-pointer'}`}>
          Choose File
          <input
            type="file"
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleChange}
            disabled={disabled}
          />
        </label>
      </div>
    </div>
  );
}
