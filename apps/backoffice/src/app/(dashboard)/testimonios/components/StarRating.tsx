import { Star } from 'lucide-react';

export default function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={'w-3.5 h-3.5 ' + (i < rating ? 'text-[#B3855C] fill-[#B3855C]' : 'text-gray-200')} />
      ))}
    </div>
  );
}
