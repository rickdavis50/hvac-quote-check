const STEPS = [
  'Reading document',
  'Extracting details',
  'Analyzing price',
  'Done',
];

interface Props {
  currentStep: number; // 0-3
}

export default function ProcessingSteps({ currentStep }: Props) {
  return (
    <div className="space-y-3 py-8">
      {STEPS.map((step, i) => (
        <div key={step} className="flex items-center gap-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
            ${i < currentStep ? 'bg-green-500 text-white' :
              i === currentStep ? 'bg-blue-500 text-white animate-pulse' :
              'bg-gray-200 text-gray-500'}`}>
            {i < currentStep ? '✓' : i + 1}
          </div>
          <span className={`text-sm ${i <= currentStep ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
            {step}
          </span>
        </div>
      ))}
    </div>
  );
}
