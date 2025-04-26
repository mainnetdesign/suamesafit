import type {TestimonialData} from '~/components/Testimonials/TestimonialCard';

import testimonial1 from '../assets/testimonials/05-home-01.webp';
import testimonial2 from '../assets/testimonials/05-home-02.webp';
import testimonial3 from '../assets/testimonials/05-home-03.webp';
  
export const FALLBACK_TESTIMONIALS: TestimonialData[] = [
  {
    id: '1',
    rating: 5,
    text: "This brand has nailed it! Great taste, eco-friendly packaging, and healthy ingredients all in one. It's rare to find a drink that feels this good to enjoy.",
    authorName: 'Dana K.',
    image: testimonial1,
    productLink: {
      title: 'Morning Cappuccino Tea',
      handle: 'morning-cappuccino-tea',
    },
  },
  {
    id: '2',
    rating: 5,
    text: "I love everything about these drinks! The flavors are so fresh and energizing, and it feels great knowing I'm making a sustainable choice.",
    authorName: 'Sarah L.',
    image: testimonial2,
    productLink: {
      title: 'Bold Espresso Bliss',
      handle: 'bold-espresso-bliss',
    },
  },
  {
    id: '3',
    rating: 5,
    text: 'Non-GMO and packed with vitamins—exactly what I need for a clean, refreshing boost each day.',
    authorName: 'Micheal R.',
    image: testimonial3,
    productLink: {
      title: 'Classic Cold Brew',
      handle: 'classic-cold-brew',
    },
  },
]; 