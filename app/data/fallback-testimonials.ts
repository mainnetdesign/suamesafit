import type {TestimonialData} from '~/components/Testimonials/TestimonialCard';

import testimonial1 from '../assets/testimonials/05-home-01.webp';
import testimonial2 from '../assets/testimonials/05-home-02.webp';
import testimonial3 from '../assets/testimonials/05-home-03.webp';

export const FALLBACK_TESTIMONIALS: TestimonialData[] = [
  {
    id: '1',
    rating: 5,
    text: 'Eu e meu marido trabalhamos o dia todo e, com as marmitas, ganhamos tempo e continuamos comendo bem. Não trocamos por nada!',
    authorName: 'Daniela K.',
    image: testimonial1,
  },
  {
    id: '2',
    rating: 5,
    text: 'Adoro a praticidade! Os sabores são incríveis e me dão muita energia. É ótimo saber que estou fazendo uma escolha saudável para o meu dia.',
    authorName: 'Larissa S.',
    image: testimonial2,
  },
  {
    id: '3',
    rating: 5,
    text: 'Ingredientes frescos e cheios de vitaminas. Exatamente o que eu preciso para uma recarga de energia no meio da correria. Recomendo!',
    authorName: 'Fabiana M.',
    image: testimonial3,
  },
]; 