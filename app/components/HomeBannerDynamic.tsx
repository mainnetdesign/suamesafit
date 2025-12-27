import {useState, useEffect, useRef} from 'react';
import {Link} from '@remix-run/react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselDots,
  type CarouselApi,
} from '~/components/shad-cn/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

interface BannerSlot {
  enabled: boolean;
  imageDesktop: {
    url: string;
    altText?: string | null;
  } | null;
  imageMobile: {
    url: string;
    altText?: string | null;
  } | null;
  subtitle: string | null;
  title: string | null;
  description: string | null;
  ctaText: string | null;
  link: string | null;
  overlay: boolean;
  limitedTime: boolean;
}

interface HomeBannerDynamicProps {
  slots: BannerSlot[];
}

export function HomeBannerDynamic({slots}: HomeBannerDynamicProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [api, setApi] = useState<CarouselApi>();
  const autoplayRef = useRef<ReturnType<typeof Autoplay> | null>(null);
  const isTransitioningRef = useRef(false);

  useEffect(() => {
    const checkMobile = () => {
      // Breakpoint desktop: 768px (md)
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Todos os banners retornados já estão habilitados
  const enabledBanners = slots;

  if (!enabledBanners.length) {
    return null;
  }

  // Criar instância do autoplay uma vez
  if (!autoplayRef.current) {
    autoplayRef.current = Autoplay({
      delay: 5000,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
      stopOnFocusIn: false,
    });
  }

  // Gerenciar loop infinito que sempre vai para frente
  useEffect(() => {
    if (!api || enabledBanners.length <= 1) return;

    const totalSlides = enabledBanners.length;

    const handleSelect = () => {
      if (isTransitioningRef.current) return;

      const selectedIndex = api.selectedScrollSnap();

      // Se chegou no último slide (duplicado), pular instantaneamente para o primeiro (original)
      if (selectedIndex === totalSlides) {
        isTransitioningRef.current = true;
        api.scrollTo(0, false); // false = sem animação (jump instantâneo)
        setTimeout(() => {
          isTransitioningRef.current = false;
        }, 50);
      }
    };

    api.on('select', handleSelect);

    return () => {
      api.off('select', handleSelect);
    };
  }, [api, enabledBanners.length]);

  // Função helper para renderizar um banner
  const renderBanner = (banner: BannerSlot, key: string | number) => {
    const image = isMobile
      ? banner.imageMobile || banner.imageDesktop
      : banner.imageDesktop || banner.imageMobile;

    if (!image || !image.url) {
      return null;
    }

    const BannerContent = banner.link ? (
      <Link to={banner.link} className="block w-full h-full">
        <img
          src={image.url}
          alt={image.altText || 'Banner'}
          className="w-full h-full object-cover"
          loading="eager"
        />
      </Link>
    ) : (
      <img
        src={image.url}
        alt={image.altText || 'Banner'}
        className="w-full h-full object-cover"
        loading="eager"
      />
    );

    return (
      <CarouselItem key={key} className="basis-full">
        <div className="relative w-full h-[500px] md:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden">
          {BannerContent}
        </div>
      </CarouselItem>
    );
  };

  return (
    <div className="w-full px-4 flex justify-center">
      <div className="w-full max-w-[1200px]">
        <Carousel
          className="w-full group/banner"
          setApi={setApi}
          opts={{
            align: 'start',
            loop: false, // Loop desabilitado - gerenciado manualmente
            duration: 15, // Transição rápida
            dragFree: false,
            watchDrag: false,
          }}
          plugins={autoplayRef.current ? [autoplayRef.current] : []}
        >
        <CarouselContent className="transition-transform duration-150 ease-out">
          {/* Slides originais */}
          {enabledBanners.map((banner, index) => renderBanner(banner, index))}
          
          {/* Duplicar o primeiro slide no final para criar loop infinito */}
          {enabledBanners.length > 1 && renderBanner(enabledBanners[0], 'duplicate-first')}
        </CarouselContent>

        {/* Navegação do carousel */}
        {enabledBanners.length > 1 && (
          <>
            <CarouselPrevious
              className={`bg-white/80 text-text-sub-600 hover:bg-white rounded-full opacity-0 group-hover/banner:opacity-100 transition-opacity duration-300 absolute left-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 ${
                isMobile ? 'hidden' : ''
              }`}
            />
            <CarouselNext
              className={`bg-white/80 text-text-sub-600 hover:bg-white rounded-full opacity-0 group-hover/banner:opacity-100 transition-opacity duration-300 absolute right-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 ${
                isMobile ? 'hidden' : ''
              }`}
            />
            <CarouselDots className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50" />
          </>
        )}
        </Carousel>
      </div>
    </div>
  );
}

