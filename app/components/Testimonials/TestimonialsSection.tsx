import {TestimonialCard, type TestimonialData} from './TestimonialCard';
import {StarRating} from './StarRating';
import {Link} from '@remix-run/react';
import {Root as Divider} from '~/components/align-ui/ui/divider';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselDots,
  type CarouselApi,
  CarouselPrevious,
  CarouselNext,
} from '~/components/shad-cn/ui/carousel';
import {useEffect, useState} from 'react';
import {cn} from '~/lib/utils';
import {TextAnimate} from '~/components/magic-ui/ui/text-animate';
import { useCursorColor } from '~/components/shad-cn/ui/CursorContext';
import Autoplay from 'embla-carousel-autoplay';
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
  const [isMobile, setIsMobile] = useState(false);
  const {setColor, setBorderColor} = useCursorColor();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!api) return;

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const autoplayOptions = {
    delay: 4000,
    stopOnInteraction: false,
    stopOnMouseEnter: false,
  };

  return (
    <section
      className={`bg-[#E69250] py-14 flex justify-center items-center ${className}`}
      onMouseEnter={() => {
        setColor('#E69250');
        setBorderColor('white');
      }}
      onMouseLeave={() => {
        setColor('black');
        setBorderColor('#303172');
      }}
    >
      <div className="w-full !max-w-[1024px] px-4">
        {isMobile ? (
          <Carousel
            opts={{
              align: 'start',
              loop: true,
            }}
            plugins={[Autoplay(autoplayOptions)]}
            className="w-full"
          >
            <div className="text-white mb-8">
              <p className="text-title-h4">avaliações</p>
            </div>
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="basis-4/5">
                  <div className="flex flex-col gap-4">
                    <div className="aspect-square rounded-lg overflow-hidden">
                      <img
                        src={testimonial.image}
                        alt={`${testimonial.authorName}'s testimonial`}
                        className="w-full h-full object-cover rounded-lg"
                        draggable={false}
                      />
                    </div>
                    <div className="flex flex-col items-start gap-4 text-white">
                      <StarRating rating={testimonial.rating} />
                      <p className="text-paragraph-xl font-sans min-h-[10rem]">
                        {testimonial.text}
                      </p>
                      <div className="flex items-center justify-between w-full">
                        <span className="text-label-sm font-sans">
                          {testimonial.authorName}
                        </span>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-[-1rem] bg-white/20 hover:bg-white/40 text-white" />
            <CarouselNext className="right-[-1rem] bg-white/20 hover:bg-white/40 text-white" />
          </Carousel>
        ) : (
          <Carousel
            opts={{
              align: 'start',
              loop: true,
            }}
            plugins={[Autoplay(autoplayOptions)]}
            setApi={setApi}
            className="relative group/testimonials"
          >
            <div className="flex gap-8 md:gap-16 items-center">
              {/* Left Content - Images */}
              <div className="w-full md:w-1/2">
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
              </div>

              {/* Right Content - Text */}
              <div className="w-full md:w-1/2 flex flex-col items-start gap-[20.28px]">
                <div className="flex flex-col items-start gap-[5.46px] self-stretch">
                  <div className="text-white flex w-full justify-between">
                    <p className="text-title-h4">avaliações</p>
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
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <CarouselPrevious className="bg-white/20 hover:bg-white/40 text-white rounded-full opacity-0 group-hover/testimonials:opacity-100 transition-opacity duration-300 left-4 top-1/2 -translate-y-1/2" />
            <CarouselNext className="bg-white/20 hover:bg-white/40 text-white rounded-full opacity-0 group-hover/testimonials:opacity-100 transition-opacity duration-300 right-4 top-1/2 -translate-y-1/2" />
            <CarouselDots className="mt-8" />
          </Carousel>
        )}
      </div>
    </section>
  );
}
