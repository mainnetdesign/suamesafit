import type {TestimonialData} from '~/components/Testimonials/TestimonialCard';

import testimonial1 from '../assets/testimonials/05-home-01.webp';
import testimonial2 from '../assets/testimonials/05-home-02.webp';
import testimonial3 from '../assets/testimonials/05-home-03.webp';
  
export const FALLBACK_TESTIMONIALS: TestimonialData[] = [
  {
    id: '1',
    rating: 5,
    text: "eu e meu marido trabalhamos o dia todo e, com as marmitas, ganhamos tempo e continuamos comendo bem. Não trocamos por nada!",
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