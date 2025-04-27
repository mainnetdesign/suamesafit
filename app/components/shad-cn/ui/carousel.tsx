import * as React from "react"
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { RiArrowLeftLine, RiArrowRightLine } from "react-icons/ri"
import { renderToString } from "react-dom/server"

import { cn } from "~/lib/utils"
import { Button } from "~/components/shad-cn/ui/button"

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
  selectedIndex: number
  scrollSnaps: number[]
  scrollTo: (index: number) => void
} & CarouselProps

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(
  (
    {
      orientation = "horizontal",
      opts,
      setApi,
      plugins,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [carouselRef, api] = useEmblaCarousel(
      {
        ...opts,
        axis: orientation === "horizontal" ? "x" : "y",
      },
      plugins
    )
    const [canScrollPrev, setCanScrollPrev] = React.useState(false)
    const [canScrollNext, setCanScrollNext] = React.useState(false)
    const [selectedIndex, setSelectedIndex] = React.useState(0)
    const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([])

    const scrollTo = React.useCallback(
      (index: number) => {
        api?.scrollTo(index)
      },
      [api]
    )

    const onSelect = React.useCallback((api: CarouselApi) => {
      if (!api) {
        return
      }

      setSelectedIndex(api.selectedScrollSnap())
      setScrollSnaps(api.scrollSnapList())
      setCanScrollPrev(api.canScrollPrev())
      setCanScrollNext(api.canScrollNext())
    }, [])

    const scrollPrev = React.useCallback(() => {
      api?.scrollPrev()
    }, [api])

    const scrollNext = React.useCallback(() => {
      api?.scrollNext()
    }, [api])

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault()
          scrollPrev()
        } else if (event.key === "ArrowRight") {
          event.preventDefault()
          scrollNext()
        }
      },
      [scrollPrev, scrollNext]
    )

    React.useEffect(() => {
      if (!api || !setApi) {
        return
      }

      setApi(api)
    }, [api, setApi])

    React.useEffect(() => {
      if (!api) {
        return
      }

      onSelect(api)
      api.on("reInit", onSelect)
      api.on("select", onSelect)

      return () => {
        api?.off("select", onSelect)
      }
    }, [api, onSelect])

    return (
      <CarouselContext.Provider
        value={{
          carouselRef,
          api,
          opts,
          orientation:
            orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
          selectedIndex,
          scrollSnaps,
          scrollTo,
        }}
      >
        <div
          ref={ref}
          onKeyDownCapture={handleKeyDown}
          className={cn("relative", className)}
          role="region"
          aria-roledescription="carousel"
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    )
  }
)
Carousel.displayName = "Carousel"

const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel()

  return (
    <div ref={carouselRef} className="overflow-hidden rounded-lg">
      <div
        ref={ref}
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className
        )}
        {...props}
      />
    </div>
  )
})
CarouselContent.displayName = "CarouselContent"

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { orientation } = useCarousel()

  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      {...props}
    />
  )
})
CarouselItem.displayName = "CarouselItem"

const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button> & { iconSize?: number }
>(({ className, variant = "outline", size = "icon", iconSize = 16, ...props }, ref) => {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute min-h-8 min-w-8 h-auto w-auto bg-transparent hover:bg-transparent border-0",
        orientation === "horizontal"
          ? "-left-12 top-1/2 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft style={{ height: `${iconSize}px`, width: `${iconSize}px` }} />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
})
CarouselPrevious.displayName = "CarouselPrevious"

const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button> & { iconSize?: number }
>(({ className, variant = "outline", size = "icon", iconSize = 16, ...props }, ref) => {
  const { orientation, scrollNext, canScrollNext } = useCarousel()

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute min-h-8 min-w-8 h-auto w-auto bg-transparent hover:bg-transparent border-0",
        orientation === "horizontal"
          ? "-right-12 top-1/2 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight style={{ height: `${iconSize}px`, width: `${iconSize}px` }} />
      <span className="sr-only">Next slide</span>
    </Button>
  )
})
CarouselNext.displayName = "CarouselNext"

function mergeRefs<T = any>(
  refs: Array<React.MutableRefObject<T> | React.LegacyRef<T>>
): React.RefCallback<T> {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(value);
      } else if (ref != null) {
        (ref as React.MutableRefObject<T | null>).current = value;
      }
    });
  };
}

interface CursorPosition {
  x: number;
  y: number;
}

interface CarouselCursorTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  direction: 'prev' | 'next';
  cursorIcon?: React.ReactElement;
  cursorColor?: string;
  cursorSize?: number;
  children: React.ReactNode;
}

const CarouselCursorTrigger = React.forwardRef<
  HTMLButtonElement,
  CarouselCursorTriggerProps
>(({ 
  direction, 
  cursorIcon,
  cursorColor = 'white',
  cursorSize = 24,
  children,
  className,
  style,
  ...props 
}, ref) => {
  const { scrollPrev, scrollNext, canScrollPrev, canScrollNext } = useCarousel();
  const [isHovering, setIsHovering] = React.useState(false);
  const [cursorPos, setCursorPos] = React.useState<CursorPosition>({ x: 0, y: 0 });
  const containerRef = React.useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    if (direction === 'prev') {
      scrollPrev();
    } else {
      scrollNext();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleClick();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    setCursorPos({
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
    });
  };

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);

  const isDisabled = direction === 'prev' ? !canScrollPrev : !canScrollNext;
  const DefaultIcon = direction === 'prev' ? RiArrowLeftLine : RiArrowRightLine;
  const Icon = cursorIcon || <DefaultIcon />;

  // Combine refs
  React.useEffect(() => {
    if (!ref || !containerRef.current) return;
    
    if (typeof ref === 'function') {
      ref(containerRef.current);
    } else {
      ref.current = containerRef.current;
    }
  }, [ref]);

  return (
    <button
      ref={containerRef}
      className={cn(
        "relative focus:outline-none text-left transition-opacity cursor-none overflow-hidden",
        isDisabled && "pointer-events-none opacity-50",
        className
      )}
      style={style}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label={`${direction === 'prev' ? 'Previous' : 'Next'} slide`}
      disabled={isDisabled}
      {...props}
    >
      {children}
      {isHovering && (
        <div
          className="pointer-events-none absolute z-50 transition-transform duration-100"
          style={{
            left: `${cursorPos.x}px`,
            top: `${cursorPos.y}px`,
            width: cursorSize,
            height: cursorSize,
            transform: `translate(-50%, -50%)`,
          }}
        >
          {React.cloneElement(Icon, {
            color: cursorColor,
            size: cursorSize,
            style: {
              color: cursorColor,
              width: cursorSize,
              height: cursorSize,
              ...Icon.props.style,
            },
          })}
        </div>
      )}
    </button>
  );
});
CarouselCursorTrigger.displayName = "CarouselCursorTrigger";

interface CarouselCursorNavigationProps {
  prevIcon?: React.ReactElement;
  nextIcon?: React.ReactElement;
  cursorColor?: string;
  cursorSize?: number;
  children: React.ReactNode;
}

const CarouselCursorNavigation = React.forwardRef<
  HTMLDivElement,
  CarouselCursorNavigationProps & React.HTMLAttributes<HTMLDivElement>
>(({ 
  prevIcon,
  nextIcon,
  cursorColor = 'white',
  cursorSize = 24,
  children,
  className,
  ...props 
}, ref) => {
  const childrenArray = React.Children.toArray(children);
  const [leftContent, rightContent] = childrenArray;

  return (
    <div
      ref={ref}
      className={cn("flex gap-8 md:gap-16 items-center", className)}
      {...props}
    >
      <CarouselCursorTrigger
        direction="prev"
        cursorIcon={prevIcon}
        cursorColor={cursorColor}
        cursorSize={cursorSize}
        className="w-full md:w-1/2 hover:opacity-80"
      >
        {leftContent}
      </CarouselCursorTrigger>
      
      <CarouselCursorTrigger
        direction="next"
        cursorIcon={nextIcon}
        cursorColor={cursorColor}
        cursorSize={cursorSize}
        className="w-full md:w-1/2 hover:opacity-80"
      >
        {rightContent}
      </CarouselCursorTrigger>
    </div>
  );
});
CarouselCursorNavigation.displayName = "CarouselCursorNavigation";

const CarouselDots = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { selectedIndex, scrollSnaps, scrollTo } = useCarousel()

  return (
    <div
      ref={ref}
      className={cn("flex justify-center gap-2 mt-4", className)}
      {...props}
    >
      {scrollSnaps.map((_, index) => (
        <button
          key={index}
          className={cn(
            "h-2 w-2 rounded-full transition-all",
            selectedIndex === index 
              ? "bg-white w-4" 
              : "bg-white/50 hover:bg-white/75"
          )}
          aria-label={`Go to slide ${index + 1}`}
          onClick={() => scrollTo(index)}
        />
      ))}
    </div>
  )
})
CarouselDots.displayName = "CarouselDots"

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
  CarouselCursorTrigger,
  CarouselCursorNavigation,
}
