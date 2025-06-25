import {TestimonialCard, type TestimonialData} from './TestimonialCard';
import {StarRating} from './StarRating';
import {Link} from '@remix-run/react';
import {Root as Divider} from '~/components/align-ui/ui/divider';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselDots,
  CarouselCursorNavigation,
  type CarouselApi,
} from '~/components/shad-cn/ui/carousel';
import {useEffect, useState} from 'react';
import {cn} from '~/lib/utils';
import {TextAnimate} from '~/components/magic-ui/ui/text-animate';
import { useCursorColor } from '~/components/shad-cn/ui/CursorContext';
// import {RiArrowLeftSLine, RiArrowRightSLine} from 'react-icons/ri';

interface TestimonialsSectionProps {
  testimonials: TestimonialData[];
  className?: string;
}

export function TestimonialsSection({
  testimonials,
  className = '',
}: TestimonialsSectionProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const { setColor, setBorderColor } = useCursorColor();

  useEffect(() => {
    if (!api) return;

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <section
      className={`bg-[#E69250] py-14 flex justify-center items-center ${className}`}
      onMouseEnter={() => { setColor('#E69250'); setBorderColor('white'); }}
      onMouseLeave={() => { setColor('black'); setBorderColor('#303172'); }}
    >
      <div className="w-full !max-w-[1024px]">
        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          setApi={setApi}
          className="relative"
        >
          <CarouselCursorNavigation
            // prevIcon={<RiArrowLeftSLine />}
            // nextIcon={<RiArrowRightSLine />}
            cursorColor="rgba(255, 255, 255, 0.9)"
            cursorSize={48}
          >
            {/* Left Content - Images */}
            <CarouselContent className="w-full">
              {testimonials.map((testimonial) => (
                <CarouselItem key={testimonial.id}>
                  <div className="aspect-square rounded-lg overflow-hidden">
                    <img
                      src={testimonial.image}
                      alt={`${testimonial.authorName}'s testimonial`}
                      className="w-full h-full object-cover rounded-lg"
                      draggable={false}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Right Content - Text */}
            <div className="flex flex-col items-start gap-[20.28px]">
              <div className="flex flex-col items-start gap-[5.46px] self-stretch">
                <div className="text-white flex w-full justify-between">
                  <p className="text-title-h4">
                    avaliações
                  </p>
                  
                </div>

                
              </div>

              <div className="relative flex flex-col items-start gap-[8.58px] self-stretch min-h-[300px]">
                <div key={testimonials[current].id} className="w-full">
                  <StarRating
                    rating={testimonials[current].rating}
                    className="text-white mb-4"
                  />

                  <TextAnimate
                    key={`text-${current}`}
                    animation="blurInUp"
                    by="line"
                    duration={0.4}
                    className="text-paragraph-xl font-sans text-white min-h-32 h-fit"
                  >
                    {`${testimonials[current].text}`}
                  </TextAnimate>

                  <div className="flex items-center justify-between text-white w-full mt-6">
                    <TextAnimate
                      key={`author-${current}`}
                      animation="slideRight"
                      by="word"
                      duration={0.3}
                      delay={0.2}
                      className="text-label-sm font-sans"
                    >
                      {testimonials[current].authorName}
                    </TextAnimate>
                    
                    {testimonials[current].productLink && (
                      <Link
                        to={`/products/${testimonials[current].productLink.handle}`}
                        className="flex items-center hover:text-white"
                      >
                        <TextAnimate
                          key={`product-${current}`}
                          animation="slideLeft"
                          by="word"
                          duration={0.3}
                          delay={0.2}
                          className="text-label-sm font-sans"
                        >
                          {`${testimonials[current].productLink.title} →`}
                        </TextAnimate>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CarouselCursorNavigation>
          <CarouselDots className="mt-8" />
        </Carousel>
      </div>
    </section>
  );
}
