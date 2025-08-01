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
import {useCursorColor} from '~/components/shad-cn/ui/CursorContext';
import Autoplay from 'embla-carousel-autoplay';
import {RiInstagramLine, RiLinkedinFill} from 'react-icons/ri';
// import {RiArrowLeftSLine, RiArrowRightSLine} from 'react-icons/ri';

interface TestimonialsSectionProps {
  testimonials: TestimonialData[];
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
    delay: 10000,
    stopOnInteraction: false,
    stopOnMouseEnter: false,
  };

  return (
    <section
      className={`bg-[#E69250] py-14 flex justify-center items-center relative ${className}`}
      onMouseEnter={() => {
        setColor('#E69250');
        setBorderColor('white');
      }}
      onMouseLeave={() => {
        setColor('black');
        setBorderColor('#303172');
      }}
    >
      <div className="w-full !max-w-[1024px] z-10 px-4">
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
                      <div className="flex flex-col items-start gap-2 w-full">
                        <span className="text-label-md font-sans">
                          {testimonial.authorName}
                        </span>
                        {testimonial.socialLink && (() => {
                          const socialInfo = getSocialMediaInfo(testimonial.socialLink);
                          return socialInfo.icon ? (
                            <a
                              href={testimonial.socialLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                            >
                              <socialInfo.icon className="text-paragraph-xs" />
                              <span className="text-paragraph-xs">@{socialInfo.handle}</span>
                            </a>
                          ) : null;
                        })()}
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

                    <div className="flex flex-col items-start gap-2 text-white w-full mt-6">
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
                      {testimonials[current].socialLink && (() => {
                        const socialInfo = getSocialMediaInfo(testimonials[current].socialLink);
                        return socialInfo.icon ? (
                          <a
                            href={testimonials[current].socialLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                          >
                            <socialInfo.icon className="text-sm" />
                            <span className="text-xs">@{socialInfo.handle}</span>
                          </a>
                        ) : null;
                      })()}
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
      {/* SVGs */}
      <div className="absolute w-full h-full overflow-hidden">
        <div data-svg-wrapper className="absolute top-0 left-0">
          <svg
            width="170"
            height="229"
            viewBox="0 0 170 229"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M107.128 103.476C109.207 103.012 112.005 103.04 114.168 102.979C116.005 102.935 115.778 102.816 117.453 104.05C129.187 112.689 146.538 134.823 160.394 134.178C163.092 134.051 165.491 132.806 167.317 130.02C172.423 122.202 165.345 112.085 158.827 107.473C156.408 105.762 154.652 104.51 152.239 103.361C151.044 102.791 150.098 102.377 148.989 101.901C144.152 99.8118 136.62 98.7979 131.559 98.6626C122.801 98.4218 113.863 99.0882 105.147 99.8295C104.73 99.8668 103.877 100.126 103.348 100.11C101.902 100.056 92.2966 92.4724 90.2664 91.0425C72.033 78.2454 54.4608 68.1444 37.8424 51.6009C34.9445 48.7129 27.1278 40.4887 25.1648 37.0116C26.7495 36.9458 28.6966 37.252 30.4328 37.3179C38.2865 37.608 34.1489 35.1531 45.9192 45.5453C52.4842 51.3409 59.336 57.2437 66.2848 60.9133C71.9756 63.9181 81.5046 66.1248 88.1773 59.3922C95.6782 51.8208 92.2104 42.9172 83.2361 37.2484C76.136 32.7645 69.8878 30.5489 62.0023 30.7925C55.9637 30.9785 46.9881 32.8994 39.9432 33.2385C38.0568 33.3313 36.3482 33.4651 34.5579 33.5304C29.7281 33.7031 22.1582 33.3371 18.6264 27.8706C15.9003 23.6528 13.1531 18.4385 10.563 14C8.06838 9.72995 5.58221 4.4354 3.00109 0.463757C1.98156 1.12365 0.744954 2.1821 0.339588 3.14729C0.39404 5.63226 15.0912 29.8171 17.6923 33.6921C24.3973 43.6777 31.3346 51.4054 39.6016 59.1912C44.5941 63.8951 45.8942 67.1155 48.8377 73.2287C51.0339 77.7908 52.1419 78.2542 45.6219 86.0917C36.6815 96.8314 22.202 104.9 21.9768 121.926C21.9248 125.69 22.9338 132.634 26.934 136.024C33.9971 142.008 38.6375 135.439 43.3381 130.551C43.3482 130.543 43.9326 129.91 43.9419 129.896C44.657 128.922 44.2271 129.428 44.4001 128.952L45.1273 127.503C48.1987 123.203 50.3211 118.747 52.0857 113.591C52.4967 112.385 52.6722 111.605 53.0557 110.401C54.4185 106.115 54.9536 101.827 55.4766 97.3313C56.4084 89.2413 55.7463 81.1106 53.0058 73.0898C52.7908 72.4582 52.6219 71.9993 52.3613 71.3591C51.946 70.3219 51.8489 70.3432 51.8547 69.4201C58.4295 74.2417 65.3748 79.4536 72.1389 83.917C73.8372 85.0354 75.5251 86.1989 77.1804 87.3275C80.4474 89.5505 79.6631 88.9381 82.1428 92.5776C86.2528 98.6117 88.1953 99.8093 87.1566 105.678C84.2941 121.783 82.1862 126.022 73.6066 139.333C71.4392 142.699 68.4656 146.782 67.4986 150.275C65.5202 157.422 72.8133 169.655 82.3076 164.977C87.3878 162.475 93.5411 152.907 95.6925 146.933L96.9427 144.002C97.2179 143.099 97.6829 142.205 97.9925 141.229C98.8554 138.51 100.025 135.36 100.101 132.49C100.243 126.929 101.117 127.382 99.7979 120.245C98.5402 113.432 95.9076 105.951 91.5318 100.364C89.9062 98.2851 87.835 96.0752 86.4892 93.9711C86.5568 93.9777 86.7022 94.0658 86.689 94.0101L88.283 94.8155C106.561 107.697 124.193 122.975 135.772 144.045C136.7 145.731 137.227 147.22 138.005 148.907C140.878 155.159 139.739 151.899 136.867 161.616C133.893 171.689 133.023 176.007 131.968 186.744C130.844 198.181 131.655 211.013 136.671 222.641C138.018 225.756 141.48 228.107 143.523 228.461C145.975 228.887 149.23 227.205 151.622 225.102C155.599 221.612 157.692 213.481 157.738 209.028C157.855 197.213 158.322 186.037 154.909 173.716L151.667 164.476C150.232 161.28 147.294 157.183 145.188 154.395C142.389 150.695 142.388 149.122 140.603 145.243C135.972 135.199 129.067 124.966 121.569 117.326C119.088 114.799 117.026 112.455 114.388 110.163C112.665 108.668 108.37 105.109 107.128 103.476Z"
              fill="#E8C273"
            />
          </svg>
        </div>
        <div data-svg-wrapper className="absolute top-0 right-[-25px]">
          <svg
            width="110"
            height="170"
            viewBox="0 0 110 170"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M25.2813 78.5194C25.7704 85.8326 -2.26868 94.5312 1.18681 109.952C3.07274 118.366 11.3195 121.164 21.24 120.262C30.1981 119.442 38.6597 112.893 45.7246 109.989C46.493 117.304 38.3197 146.829 39.9962 156.58C41.3616 164.472 52.2768 168.842 62.9157 169.344C74.2979 169.882 85.0227 165.993 92.6052 159.513C102.986 150.644 108.087 132.782 109.571 117.37C111.353 98.9057 106.39 77.2942 87.653 64.091C82.4239 60.4108 75.3797 58.4128 67.5031 58.5325C57.812 58.678 55.6945 62.082 55.0964 54.1387C54.788 50.0696 55.7861 46.0564 55.9304 42.0385C56.2736 32.6075 55.9924 12.0785 46.8224 3.90631C39.5037 -2.62014 25.9889 1.47772 18.2178 6.76634C-2.14292 20.631 1.4707 44.1096 4.76142 62.8594C5.40258 66.5065 8.90091 71.901 11.9966 74.2078C16.3115 77.4218 19.218 77.2433 25.275 78.5222"
              fill="#E8C273"
            />
          </svg>
        </div>
        <div data-svg-wrapper className="hidden md:block absolute bottom-0 right-[-25px]">
          <svg
            width="187"
            height="203"
            viewBox="0 0 187 203"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M73.3123 106.953C70.6323 107.135 67.1523 106.842 64.4423 106.682C62.1423 106.541 62.4023 106.661 60.5523 105.479C47.6423 97.206 30.4122 77.24 13.0122 76.431C9.62223 76.276 6.38227 77.072 3.55227 79.197C-4.37773 85.163 2.44225 94.206 9.65225 98.647C12.3222 100.295 14.2623 101.5 17.0423 102.683C18.4223 103.269 19.5223 103.703 20.8123 104.204C26.4223 106.398 35.6122 107.964 41.8922 108.566C52.7722 109.612 64.0423 109.927 75.0623 110.157C75.5923 110.167 76.7022 110.035 77.3622 110.099C79.1522 110.284 89.6222 117.48 91.8622 118.858C112.052 131.195 131.952 141.241 149.382 156.518C152.422 159.185 160.532 166.736 162.292 169.799C160.302 169.7 157.932 169.259 155.782 169.036C146.042 168.037 150.722 170.465 138.112 160.74C131.072 155.316 123.712 149.776 115.772 146.072C109.272 143.039 97.8323 140.293 88.1723 145.21C77.3123 150.74 79.8723 158.432 89.9323 163.984C97.8923 168.376 105.242 170.811 115.122 171.373C122.682 171.804 134.262 171.085 143.112 171.487C145.482 171.593 147.642 171.647 149.882 171.767C155.942 172.091 165.302 173.126 168.622 177.985C171.182 181.733 173.572 186.307 175.922 190.225C178.182 193.995 180.222 198.61 182.652 202.141C184.052 201.695 185.812 200.94 186.502 200.181C186.932 198.123 173.422 176.718 170.942 173.265C164.572 164.366 157.462 157.31 148.702 150.077C143.412 145.707 142.432 142.92 139.982 137.585C138.142 133.603 136.862 133.113 146.542 127.268C159.832 119.26 179.492 113.994 183.162 99.949C183.972 96.843 184.092 91.009 179.782 87.821C172.162 82.193 165.072 87.172 158.242 90.756C158.222 90.761 157.372 91.228 157.352 91.238C156.272 91.973 156.912 91.597 156.592 91.974L155.402 93.101C150.712 96.356 147.182 99.832 143.962 103.922C143.202 104.878 142.832 105.506 142.112 106.463C139.562 109.873 138.042 113.364 136.492 117.028C133.722 123.622 132.932 130.404 134.752 137.296C134.892 137.839 135.012 138.234 135.212 138.789C135.522 139.686 135.652 139.677 135.462 140.44C128.222 135.82 120.592 130.841 113.052 126.499C111.152 125.411 109.282 124.286 107.442 123.193C103.812 121.04 104.672 121.622 102.302 118.375C98.3723 112.992 96.1922 111.814 98.6522 107.066C105.432 94.037 108.902 90.738 122.242 80.57C125.622 77.999 130.142 74.913 132.042 72.121C135.932 66.407 129.272 55.594 116.502 58.541C109.662 60.116 100.092 67.426 96.2222 72.154L94.0822 74.454C93.5522 75.174 92.8022 75.868 92.2222 76.644C90.6022 78.807 88.5122 81.297 87.8522 83.66C86.5622 88.241 85.5623 87.783 85.7923 93.807C86.0023 99.558 87.8022 105.994 92.1422 111.033C93.7522 112.908 95.9023 114.935 97.1623 116.803C97.0723 116.791 96.9123 116.704 96.9123 116.752L95.0922 115.932C74.8622 103.52 55.9123 89.191 45.6723 70.662C44.8523 69.179 44.4922 67.898 43.8522 66.429C41.5122 60.985 42.2823 63.789 47.8023 56.038C53.5123 48.003 55.4623 44.519 58.9123 35.751C62.5823 26.41 64.1323 15.729 60.1923 5.63599C59.1323 2.93199 55.2823 0.654976 52.8023 0.163976C49.8323 -0.425024 45.4322 0.649981 42.0322 2.15598C36.3822 4.65498 32.1522 11.17 31.2122 14.845C28.7122 24.595 25.9122 33.784 27.7122 44.295L29.9123 52.243C31.0723 55.022 33.9222 58.692 35.9922 61.199C38.7422 64.527 38.4322 65.827 39.8822 69.204C43.6622 77.951 50.2323 87.075 58.0623 94.112C60.6523 96.44 62.7622 98.576 65.5922 100.725C67.4422 102.127 72.0923 105.484 73.3123 106.953Z"
              fill="#E8C273"
            />
          </svg>
        </div>
        <div data-svg-wrapper className="hidden md:block absolute bottom-0 left-[-25px]">
          <svg
            width="121"
            height="192"
            viewBox="0 0 121 192"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M68.2734 174.853C73.7811 173.571 85.1101 181.818 82.001 187.696L81.8809 187.896C80.6518 190.039 78.4987 191.125 76.2393 191.744C69.6642 193.534 55.0118 184.981 64.8506 176.345C65.5591 175.719 67.0017 175.149 68.2734 174.853ZM35.6982 171.313C35.9239 168.196 41.5439 167.671 45.4561 171.306C47.6661 173.366 51.0063 181.276 47.5312 184.819C45.935 186.443 46.2328 185.486 44.9209 185.414C44.5644 185.397 44.3904 185.418 44.1621 185.334L43.6436 185.016C43.6377 185.013 43.578 184.984 43.5586 184.967C42.8096 184.59 42.8879 184.911 42.7139 183.907C40.7425 183.106 39.7029 183.13 38.1221 180.513C36.8857 178.456 35.5288 173.675 35.6982 171.313ZM94.5293 160.775C102.079 161.048 109.037 164.741 113.756 169.051C122.661 177.204 118.698 184.688 110.214 183.873C106.507 183.515 106.012 181.82 102.685 181.277C98.1081 180.538 94.585 179.311 91.0801 175.452C89.41 173.607 85.3036 167.858 85.5225 165.484L85.5654 165.212C86.0819 162.335 90.1889 160.616 94.5293 160.775ZM41.8555 135.636C45.2633 134.978 48.4748 135.853 51.1729 136.932L53.8936 138.135C56.7517 139.642 60.8402 142.335 63.3721 144.371C68.0027 148.094 71.8665 154.471 69.9473 159.856C69.5745 160.92 69.3238 161.157 67.6719 161.494C66.238 161.788 64.9774 162.202 63.5234 162.446C54.0244 164.052 46.6397 160.856 41.4814 154.672C39.8344 152.698 35.6663 146.047 35.1738 143.74L35.0947 143.333C34.3093 139.08 35.8249 136.798 41.8555 135.636ZM94.3135 117.562C94.9938 111.923 106.174 110.705 113.637 117.079C117.858 120.688 123.841 134.806 116.681 141.369C113.395 144.382 114.056 142.634 111.473 142.57C110.759 142.554 110.429 142.614 109.969 142.454L108.98 141.899C108.978 141.898 108.856 141.838 108.806 141.816C107.34 141.164 107.474 141.737 107.213 139.945L106.503 139.712C103.112 138.595 101.12 138.396 98.3887 134.05C96.1031 130.403 93.7895 121.844 94.3135 117.562ZM61.4463 122.273C64.6714 118.534 73.4444 120.397 76.1172 121.663C78.9765 123.028 80.8257 124.692 82.7979 127.778C84.4068 130.296 89.0663 138.303 86.5557 140.98C85.1 142.531 84.4825 142.675 81.8281 142.646C75.1687 142.592 68.7942 139.802 65.2725 135.212C63.1503 132.443 61.6352 129.577 61.0146 126.275L60.7861 125.108C60.6105 124.033 60.6319 123.224 61.4463 122.273ZM26.3799 108.711C26.1492 100.424 52.014 104.795 50.0303 115.417C49.5966 117.739 47.8328 119.565 44.8115 119.953C40.6944 120.489 36.6584 119.562 33.3545 117.796C30.8085 116.439 33.1487 116.002 31.1221 114.941C28.7105 113.678 26.5674 111.447 26.3779 108.912L26.3799 108.711ZM62.8965 98.6816C67.5891 94.3686 87.0546 96.6581 84.3389 108.748C84.1452 109.618 83.2463 110.733 82.3125 111.515C78.2259 114.911 62.0012 111.606 60.5928 104.805L60.5322 104.562C60.0996 102.041 61.2808 100.159 62.8965 98.6816ZM38.6738 81.4463C42.7601 78.0494 58.9861 81.3553 60.3945 88.1562L60.4541 88.3994C60.8868 90.92 59.7056 92.8024 58.0898 94.2793C53.3967 98.592 33.9318 96.3026 36.6475 84.2129C36.8411 83.343 37.74 82.2278 38.6738 81.4463ZM76.1758 73.0078C80.2929 72.4723 84.329 73.3985 87.6328 75.165C90.1788 76.522 87.8377 76.9591 89.8643 78.0195C92.276 79.2833 94.4199 81.5135 94.6094 84.0488L94.6074 84.25C94.8382 92.5374 68.9733 88.1656 70.957 77.5439C71.3907 75.2216 73.1545 73.3957 76.1758 73.0078ZM4.30566 51.5918C7.59187 48.5786 6.93049 50.3262 9.51465 50.3896C10.2279 50.4059 10.557 50.3471 11.0176 50.5068L12.0059 51.0615C12.0059 51.0615 12.1293 51.1219 12.1807 51.1436C13.6471 51.7966 13.5136 51.2227 13.7744 53.0146L14.4844 53.249C17.8747 54.366 19.8667 54.5642 22.5977 58.9102C24.8832 62.5569 27.1977 71.1156 26.6738 75.3975C25.9941 81.0369 14.8128 82.256 7.34961 75.8818C3.12877 72.2726 -2.85413 58.1553 4.30566 51.5918ZM39.2314 50.7402C45.8908 50.7952 52.2653 53.5852 55.7871 58.1748C57.9092 60.944 59.4244 63.8093 60.0449 67.1113L60.2734 68.2783C60.4491 69.3539 60.4275 70.1625 59.6133 71.1133C56.388 74.853 47.6138 72.99 44.9414 71.7236C42.0822 70.3586 40.2328 68.6951 38.2607 65.6084C36.6516 63.0906 31.9929 55.0831 34.5039 52.4062C35.9597 50.8554 36.5767 50.7115 39.2314 50.7402ZM57.4629 30.5137C66.9618 28.9078 74.3466 32.1041 79.5049 38.2881C81.1519 40.2622 85.3207 46.9124 85.8135 49.2197L85.8926 49.6279C86.6778 53.8804 85.162 56.1619 79.1318 57.3242C75.724 57.9818 72.5125 57.108 69.8145 56.0293L67.0928 54.8252C64.2347 53.3179 60.147 50.6257 57.6152 48.5898C52.9845 44.8673 49.1209 38.4897 51.04 33.1045C51.4128 32.0412 51.6629 31.8033 53.3145 31.4658C54.7483 31.172 56.009 30.758 57.4629 30.5137ZM7.23145 23.9092C-1.6734 15.7557 2.28908 8.27336 10.7734 9.08789C14.4798 9.44634 14.9753 11.1415 18.3027 11.6836C22.8791 12.4232 26.4014 13.6487 29.9062 17.5078C31.5762 19.3527 35.6831 25.1029 35.4639 27.4766L35.4219 27.748C34.9059 30.6251 30.7978 32.3439 26.457 32.1846C18.9078 31.9123 11.9503 28.2187 7.23145 23.9092ZM73.4561 8.1416C75.0525 6.5173 74.7541 7.47439 76.0664 7.5459C76.4231 7.56248 76.5966 7.54293 76.8252 7.62695L77.3428 7.94434C77.3428 7.94434 77.4073 7.97572 77.4277 7.99414C78.1771 8.37142 78.0983 8.0496 78.2725 9.05371C80.2439 9.85483 81.2844 9.82946 82.8652 12.4473C84.1017 14.5039 85.4585 19.2858 85.2891 21.6475C85.0629 24.7645 79.4423 25.289 75.5303 21.6543C73.3203 19.594 69.9812 11.6846 73.4561 8.1416ZM44.748 1.2168C51.3232 -0.572568 65.9746 7.97888 56.1357 16.6152C55.4272 17.2414 53.9846 17.8107 52.7129 18.1074C47.2052 19.3884 35.8768 11.1426 38.9854 5.26465L39.1055 5.06348C40.3345 2.92092 42.4886 1.83584 44.748 1.2168Z"
              fill="#E8C273"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
