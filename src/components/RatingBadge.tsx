interface Props {
  rating: 'Low' | 'Fair' | 'High';
}

// Verdict stamp: square, bordered, inked — like a document stamp, not a pill.
const STYLES = {
  Low: 'border-verdict-good text-verdict-good',
  Fair: 'border-ink/50 text-ink-soft',
  High: 'border-verdict-high text-verdict-high',
};

const LABELS = {
  Low: 'Below fair',
  Fair: 'Fair price',
  High: 'High price',
};

export default function RatingBadge({ rating }: Props) {
  return (
    <span
      className={`inline-block -rotate-2 border-2 px-4 py-1.5 text-[13px] font-semibold uppercase tracking-micro ${STYLES[rating]}`}
    >
      {LABELS[rating]}
    </span>
  );
}
