interface Props {
  rating: 'Low' | 'Fair' | 'High';
}

const STYLES = {
  Low: 'bg-rating-good/10 text-rating-good border-rating-good/20',
  Fair: 'bg-warm-500/10 text-warm-700 border-warm-500/20',
  High: 'bg-rating-high/10 text-rating-high border-rating-high/20',
};

const LABELS = {
  Low: 'Good Price',
  Fair: 'Fair Price',
  High: 'High Price',
};

export default function RatingBadge({ rating }: Props) {
  return (
    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium border tracking-wide ${STYLES[rating]}`}>
      {LABELS[rating]}
    </span>
  );
}
