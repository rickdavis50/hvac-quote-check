interface Props {
  rating: 'Low' | 'Fair' | 'High';
}

const STYLES = {
  Low: 'bg-green-100 text-green-800 border-green-200',
  Fair: 'bg-blue-100 text-blue-800 border-blue-200',
  High: 'bg-red-100 text-red-800 border-red-200',
};

const LABELS = {
  Low: 'Good Price',
  Fair: 'Fair Price',
  High: 'High Price',
};

export default function RatingBadge({ rating }: Props) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${STYLES[rating]}`}>
      {LABELS[rating]}
    </span>
  );
}
