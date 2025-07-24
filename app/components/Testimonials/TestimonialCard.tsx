import {StarRating} from './StarRating';
import {Link} from '@remix-run/react';
import {RiInstagramLine, RiLinkedinFill} from 'react-icons/ri';

export interface TestimonialData {
  id: string;
  rating: number;
  text: string;
  authorName: string;
  image: string;
  socialLink?: string; // Campo opcional para qualquer rede social
}

interface TestimonialCardProps {
  testimonial: TestimonialData;
  className?: string;
}

// Função para detectar o tipo de rede social baseado na URL
function getSocialMediaInfo(socialUrl: string): { type: 'instagram' | 'linkedin' | 'unknown'; handle: string; icon: any } {
  try {
    const cleanUrl = socialUrl.replace(/\/$/, '');
    const handle = cleanUrl.split('/').pop() || '';
    
    if (socialUrl.includes('instagram.com')) {
      return {
        type: 'instagram',
        handle,
        icon: RiInstagramLine
      };
    } else if (socialUrl.includes('linkedin.com')) {
      return {
        type: 'linkedin',
        handle,
        icon: RiLinkedinFill
      };
    }
    
    return {
      type: 'unknown',
      handle,
      icon: null
    };
  } catch {
    return {
      type: 'unknown',
      handle: '',
      icon: null
    };
  }
}

export function TestimonialCard({
  testimonial,
  className = '',
}: TestimonialCardProps) {
  const {rating, text, authorName, socialLink} = testimonial;
  const socialInfo = socialLink ? getSocialMediaInfo(socialLink) : null;

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <StarRating rating={rating} />

      <blockquote className="text-2xl font-serif text-white">
        &quot;{text}&quot;
      </blockquote>

      <div className="flex items-center justify-between text-white/80">
        <span>{authorName}</span>
      </div>

      {/* Social Media Link */}
      {socialLink && socialInfo && socialInfo.icon && (
        <div className="flex items-center gap-2">
          <a
            href={socialLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <socialInfo.icon className="text-lg" />
            <span className="text-sm">@{socialInfo.handle}</span>
          </a>
        </div>
      )}
    </div>
  );
} 