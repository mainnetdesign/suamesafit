import {TestimonialCard, type TestimonialData} from './TestimonialCard';
import {useEffect, useState} from 'react';
import {StarRating} from './StarRating';
import {Link} from '@remix-run/react';

interface TestimonialsSectionProps {
  testimonials: TestimonialData[];
  className?: string;
}

export function TestimonialsSection({
  testimonials,
  className = '',
}: TestimonialsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((current) => 
        current === testimonials.length - 1 ? 0 : current + 1
      );
    }, 5000); // Change every 5 seconds

    return () => clearInterval(timer);
  }, [testimonials.length]);

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className={`bg-[#1B4332] py-16 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center">
          {/* Left side - Image */}
          <div className="w-full md:w-1/2">
            <div className="aspect-square rounded-lg overflow-hidden">
              <img
                src={currentTestimonial.image}
                alt={`${currentTestimonial.authorName}'s testimonial`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right side - Testimonial content */}
          <div className="w-full md:w-1/2 flex flex-col items-start gap-8">
            <div className="text-white">
              <h2 className="text-lg uppercase tracking-wide mb-2">
                Testimonials
              </h2>
              <p className="text-2xl">
                4.5 Out of 5 Stars from Over 325 Reviews
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <StarRating rating={currentTestimonial.rating} />

              <blockquote className="text-2xl font-serif text-white">
                &quot;{currentTestimonial.text}&quot;
              </blockquote>

              <div className="flex items-center justify-between text-white/80 w-full">
                <span>{currentTestimonial.authorName}</span>
                {currentTestimonial.productLink && (
                  <Link
                    to={`/products/${currentTestimonial.productLink.handle}`}
                    className="flex items-center hover:text-white"
                  >
                    {currentTestimonial.productLink.title} →
                  </Link>
                )}
              </div>
            </div>

            {/* Navigation dots */}
            <div className="flex gap-2">
              {testimonials.map((_, idx) => (
                <button
                  key={_.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    idx === currentIndex ? 'bg-white' : 'bg-white/30'
                  }`}
                  aria-label={`Go to testimonial ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 