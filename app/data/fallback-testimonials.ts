import type {TestimonialData} from '~/components/Testimonials/TestimonialCard';

import testimonial1 from '../assets/testimonials/testimonial1.jpeg';
import testimonial2 from '../assets/testimonials/testimonial2.jpeg';
import testimonial3 from '../assets/testimonials/testimonial3.jpeg';

export const FALLBACK_TESTIMONIALS: TestimonialData[] = [
  {
    id: '1',
    rating: 5,
    text: 'Eu e meu marido trabalhamos o dia todo e, com as marmitas, ganhamos tempo e continuamos comendo bem. Não trocamos por nada!',
    authorName: 'Daniela K. e João V.',
    image: testimonial1,
  },
  {
    id: '2',
    rating: 5,
    text: 'Vivia de iFood e não tinha como fazer uma dieta saudável. Agora com as marmitas da Erike e Jana, posso comer bem e continuar com a dieta de forma fácil!',
    authorName: 'Marcos S.',
    image: testimonial2,
  },
  {
    id: '3',
    rating: 5,
    text: 'Eu como nutricionista sempre recomendo pros meus pacientes a comer as marmitas da Erike e Jana. São deliciosas e saudáveis!',
    authorName: 'João M.',
    image: testimonial3,
  },
]; 