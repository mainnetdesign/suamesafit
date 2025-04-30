'use client';
import {useEffect, useRef, useState} from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  animate,
} from 'framer-motion';
import {useStickyRef} from './sticky-ref-context';
import {useStickyCursorColor} from './sticky-cursor-color-context';

export default function StickyCursor() {
  const stickyElement = useStickyRef();
  const { color: contextColor } = useStickyCursorColor();
  const [isHovered, setIsHovered] = useState(false);
  const [targetColor, setTargetColor] = useState<string>(contextColor); // default color from context
  const [cursorRect, setCursorRect] = useState({
    width: 15,
    height: 15,
  });
  const [targetRect, setTargetRect] = useState({
    left: 0,
    top: 0,
  });
  const [targetBorderRadius, setTargetBorderRadius] = useState('50%');
  const [gradientAngle, setGradientAngle] = useState(0);
  const gradientAnimRef = useRef<number | null>(null);
  const cursor = useRef<HTMLDivElement>(null);

  // For smooth movement when not stuck
  const motionLeft = useMotionValue(0);
  const motionTop = useMotionValue(0);
  const springLeft = useSpring(motionLeft, {damping: 20, stiffness: 300, mass: 0.5});
  const springTop = useSpring(motionTop, {damping: 20, stiffness: 300, mass: 0.5});

  // For smooth border radius morphing
  const motionBorderRadius = useMotionValue('50%');
  const springBorderRadius = useSpring(motionBorderRadius, {damping: 30, stiffness: 300, mass: 0.5});

  // Magnetic pull effect
  const [isMagnetic, setIsMagnetic] = useState(false);
  const [magneticPos, setMagneticPos] = useState<{left: number; top: number} | null>(null);

  useEffect(() => {
    if (!isHovered && stickyElement.current) {
      const handleMouseMove = (e: MouseEvent) => {
        const rect = stickyElement.current!.getBoundingClientRect();
        const center = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
        const dx = e.clientX - center.x;
        const dy = e.clientY - center.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 80) {
          setIsMagnetic(true);
          // Move cursor 30% of the way toward the center
          setMagneticPos({
            left: e.clientX - cursorRect.width / 2 - dx * 0.3,
            top: e.clientY - cursorRect.height / 2 - dy * 0.3,
          });
        } else {
          setIsMagnetic(false);
          setMagneticPos(null);
        }
        if (!isMagnetic && !isHovered) {
          motionLeft.set(e.clientX - cursorRect.width / 2);
          motionTop.set(e.clientY - cursorRect.height / 2);
        }
      };
      window.addEventListener('mousemove', handleMouseMove);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
      };
    }
  }, [isHovered, stickyElement, cursorRect.width, cursorRect.height, motionLeft, motionTop, isMagnetic]);

  // Always sync the default color with context
  useEffect(() => {
    if (!isHovered) setTargetColor(contextColor);
  }, [contextColor, isHovered]);

  // Animate border radius on hover change
  useEffect(() => {
    if (isHovered) {
      motionBorderRadius.set(targetBorderRadius);
    } else {
      motionBorderRadius.set('50%');
    }
  }, [isHovered, targetBorderRadius, motionBorderRadius]);

  // Animate gradient angle when hovered
  useEffect(() => {
    if (isHovered) {
        console.log('Gradient angle:', gradientAngle);
      let running = true;
      const animateGradient = () => {
        setGradientAngle((prev) => (prev + 2) % 360);
        if (running) {
          gradientAnimRef.current = requestAnimationFrame(animateGradient);
        }
      };
      gradientAnimRef.current = requestAnimationFrame(animateGradient);
      return () => {
        running = false;
        if (gradientAnimRef.current) cancelAnimationFrame(gradientAnimRef.current);
      };
    } else {
      setGradientAngle(0);
    }
  }, [isHovered]);

  const manageMouseOver = () => {
    setIsHovered(true);
    if (stickyElement.current) {
      const rect = stickyElement.current.getBoundingClientRect();
      const computedStyle = getComputedStyle(stickyElement.current);
      setTargetColor(contextColor);
      setCursorRect({
        width: rect.width,
        height: rect.height,
      });
      setTargetRect({
        left: rect.left,
        top: rect.top,
      });
      setTargetBorderRadius(computedStyle.borderRadius || '0px');
    }
  };

  const manageMouseLeave = () => {
    setIsHovered(false);
    setTargetColor(contextColor);
    setCursorRect({
      width: 15,
      height: 15,
    });
    setTargetRect({
      left: 0,
      top: 0,
    });
    setTargetBorderRadius('50%');
    if (cursor.current) {
      animate(
        cursor.current,
        {scaleX: 1, scaleY: 1},
        {duration: 0.1, type: 'spring'},
      );
    }
  };

  // Attach listeners to sticky element
  useEffect(() => {
    if (!stickyElement.current) return;
    stickyElement.current.addEventListener('mouseenter', manageMouseOver);
    stickyElement.current.addEventListener('mouseleave', manageMouseLeave);
    return () => {
      if (!stickyElement.current) return;
      stickyElement.current.removeEventListener('mouseenter', manageMouseOver);
      stickyElement.current.removeEventListener('mouseleave', manageMouseLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stickyElement]);

  // When stuck, snap to target position/size
  const style = isHovered
    ? {
        left: targetRect.left,
        top: targetRect.top,
        width: cursorRect.width,
        height: cursorRect.height,
        borderRadius: springBorderRadius,
        background: `linear-gradient(${gradientAngle}deg, rgba(0,255,234,0.5), rgba(255,0,0,0.5) 80%)`,
        position: 'fixed' as const,
        zIndex: 1000, // above the target
        pointerEvents: 'none' as const,
        transition: 'all 0.2s cubic-bezier(.4,2,.6,1)',
        boxShadow: '0 0 32px 8px ' + targetColor, // glow when stuck
        border: 'none', // hide border when stuck
        opacity: 1,
      }
    : {
        left: undefined,
        top: undefined,
        width: cursorRect.width,
        height: cursorRect.height,
        borderRadius: springBorderRadius,
        background: targetColor,
        position: 'fixed' as const,
        zIndex: 0,
        pointerEvents: 'none' as const,
        transition: 'all 0.2s cubic-bezier(.4,2,.6,1)',
        boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)',
        border: '2px solid #ff0000',
        opacity: 0.85,
      };

  return (
    <motion.div
      style={
        isHovered
          ? style
          : isMagnetic && magneticPos
          ? {
              ...style,
              left: magneticPos.left,
              top: magneticPos.top,
            }
          : {
              ...style,
              left: springLeft,
              top: springTop,
            }
      }
      ref={cursor}
    >
      {isHovered && (
        <span
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '2rem',
            pointerEvents: 'none',
            color: '#fff',
            textShadow: '0 2px 8px rgba(0,0,0,0.25)',
            zIndex: 2,
          }}
        >
          {/* Star icon (emoji) */}
          ⭐
        </span>
      )}
    </motion.div>
  );
}
