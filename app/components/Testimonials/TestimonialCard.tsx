import {StarRating} from './StarRating';
import {Link} from '@remix-run/react';

export interface TestimonialData {
  id: string;
  rating: number;
  text: string;
  authorName: string;
  image: string; // Add this field
  productLink?: {
    title: string;
    handle: string;
  };
}

interface TestimonialCardProps {
  testimonial: TestimonialData;
  className?: string;
}

export function TestimonialCard({testimonial, className = ''}: TestimonialCardProps) {
  const {rating, text, authorName, productLink} = testimonial;
  
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <StarRating rating={rating} />
      
      <blockquote className="text-2xl font-serif text-white">
        &quot;{text}&quot;
      </blockquote>
      
      <div className="flex items-center justify-between text-white/80">
        <span>{authorName}</span>
        {productLink && (
          <Link 
            to={`/products/${productLink.handle}`}
            className="flex items-center hover:text-white"
          >
            {productLink.title} →
          </Link>
        )}
      </div>
    </div>
  );
} 