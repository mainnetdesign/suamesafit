/*
	Installed from https://reactbits.dev/ts/tailwind/
*/

import {useSprings, animated, SpringConfig} from '@react-spring/web';
import {useEffect, useRef, useState} from 'react';

interface SplitTextProps {
  text?: string;
  className?: string;
  delay?: number;
  animationFrom?: {opacity: number; transform: string};
  animationTo?: {opacity: number; transform: string};
  easing?: SpringConfig['easing'];
  threshold?: number;
  rootMargin?: string;
  textAlign?: 'left' | 'right' | 'center' | 'justify' | 'start' | 'end';
  onLetterAnimationComplete?: () => void;
  repeat?: number;
  repeatDelay?: number;
}

const SplitText: React.FC<SplitTextProps> = ({
  text = '',
  className = '',
  delay = 100,
  animationFrom = {opacity: 0, transform: 'translate3d(0,40px,0)'},
  animationTo = {opacity: 1, transform: 'translate3d(0,0,0)'},
  easing = (t: number) => t,
  threshold = 0.1,
  rootMargin = '-100px',
  textAlign = 'center',
  onLetterAnimationComplete,
  repeat = 1,
  repeatDelay = 150,
}) => {
  const repeatedTexts = Array.from({ length: repeat }, () => text);
  const wordsArray = repeatedTexts.map((t) => t.split(' '));
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);
  const animatedCount = useRef(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        }
      },
      {threshold, rootMargin},
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const springs = useSprings(
    wordsArray.length,
    wordsArray.map((_, i) => ({
      from: animationFrom,
      to: inView
        ? async (
            next: (props: {
              opacity: number;
              transform: string;
            }) => Promise<void>,
          ) => {
            await next(animationTo);
            animatedCount.current += 1;
            if (
              animatedCount.current === wordsArray.length &&
              onLetterAnimationComplete
            ) {
              onLetterAnimationComplete();
            }
          }
        : animationFrom,
      delay: i * repeatDelay + delay,
      config: {easing},
    })),
  );

  return (
    <p
      ref={ref}
      className={`split-parent overflow-hidden inline ${className}`}
      style={{textAlign, whiteSpace: 'normal', wordWrap: 'break-word'}}
    >
      {wordsArray.map((words, repeatIndex) => (
        <span
          key={repeatIndex}
          style={{display: 'inline-block', whiteSpace: 'nowrap'}}
        >
          <animated.span
            style={springs[repeatIndex] as unknown as React.CSSProperties}
            className="text-title-h1 !text-[51px] tracking-[-0.51px] inline-block transform transition-opacity will-change-transform text-center"
          >
            {words.join(' ')}
          </animated.span>
          <span style={{display: 'inline-block', width: '0.3em'}}>&nbsp;</span>
        </span>
      ))}
    </p>
  );
};

export default SplitText;
