import {RiStarFill, RiStarHalfFill} from '@remixicon/react';

interface StarRatingProps {
  rating: number;
  className?: string;
}

export function StarRating({rating, className = ''}: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={`flex items-center ${className}`}>
      {/* Full stars */}
      {Array.from({length: fullStars}).map((_, i) => (
        <RiStarFill key={`full-${fullStars * i}`} className="w-3 h-3" />
      ))}

      {/* Half star */}
      {hasHalfStar && <RiStarHalfFill className="w-3 h-3" />}

      {/* Empty stars */}
      {Array.from({length: emptyStars}).map((_, i) => (
        <RiStarFill
          key={`empty-${emptyStars * i}`}
          className="w-3 h-3 text-gray-300"
        />
      ))}
    </div>
  );
} 