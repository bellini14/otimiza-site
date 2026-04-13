import { useRef, useLayoutEffect, useState, useEffect } from 'react';
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useVelocity,
  useAnimationFrame
} from 'motion/react';

function useElementWidth(ref) {
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    function updateWidth() {
      if (ref.current) {
        setWidth(ref.current.scrollWidth);
      }
    }
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [ref]);

  // Re-measure when images load (important for logo carousels)
  useEffect(() => {
    if (!ref.current) return;

    function handleLoad() {
      if (ref.current) {
        setWidth(ref.current.scrollWidth);
      }
    }

    const images = ref.current.querySelectorAll('img');
    const unloadedImages = Array.from(images).filter((img) => !img.complete);

    if (unloadedImages.length === 0) return;

    unloadedImages.forEach((img) => img.addEventListener('load', handleLoad));
    return () => {
      unloadedImages.forEach((img) => img.removeEventListener('load', handleLoad));
    };
  }, [ref]);

  return width;
}

export function VelocityRow({
    children,
    baseVelocity = 100,
    scrollContainerRef,
    className = '',
    damping,
    stiffness,
    numCopies,
    velocityMapping,
    parallaxClassName,
    scrollerClassName,
    parallaxStyle,
    scrollerStyle
  }) {
    const baseX = useMotionValue(0);
    const scrollOptions = scrollContainerRef ? { container: scrollContainerRef } : {};
    const { scrollY } = useScroll(scrollOptions);
    const scrollVelocity = useVelocity(scrollY);
    const smoothVelocity = useSpring(scrollVelocity, {
      damping: damping ?? 50,
      stiffness: stiffness ?? 400
    });
    const velocityFactor = useTransform(
      smoothVelocity,
      velocityMapping?.input || [0, 1000],
      velocityMapping?.output || [0, 5],
      { clamp: false }
    );

    const copyRef = useRef(null);
    const copyWidth = useElementWidth(copyRef);
    const copyWidthRef = useRef(0);
    
    // Store latest copyWidth to avoid stale closures in useTransform
    useLayoutEffect(() => {
       copyWidthRef.current = copyWidth;
    }, [copyWidth]);

    function wrap(min, max, v) {
      const range = max - min;
      const mod = (((v - min) % range) + range) % range;
      return mod + min;
    }

    const x = useTransform(baseX, v => {
      if (copyWidthRef.current === 0) return '0px';
      return `${wrap(-copyWidthRef.current, 0, v)}px`;
    });

    const directionFactor = useRef(1);
    useAnimationFrame((t, delta) => {
      if (copyWidthRef.current === 0) return; // Skip until measured

      let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

      if (velocityFactor.get() < 0) {
        directionFactor.current = -1;
      } else if (velocityFactor.get() > 0) {
        directionFactor.current = 1;
      }

      moveBy += directionFactor.current * moveBy * velocityFactor.get();
      baseX.set(baseX.get() + moveBy);
    });

    const copies = [];
    for (let i = 0; i < (numCopies ?? 6); i++) {
      copies.push(
        <div className={`shrink-0 ${className}`} key={i} ref={i === 0 ? copyRef : null}>
          {children}
        </div>
      );
    }

    return (
      <div className={`${parallaxClassName} relative overflow-hidden`} style={parallaxStyle}>
        <motion.div
          className={`${scrollerClassName} flex`}
          style={{ x, ...scrollerStyle }}
        >
          {copies}
        </motion.div>
      </div>
    );
  }

export function ScrollVelocity({
  scrollContainerRef,
  texts = [],
  velocity = 100,
  className = '',
  damping = 50,
  stiffness = 400,
  numCopies = 6,
  velocityMapping = { input: [0, 1000], output: [0, 5] },
  parallaxClassName = '',
  scrollerClassName = '',
  parallaxStyle,
  scrollerStyle
}) {
  return (
    <div className="space-y-6 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      {texts.map((content, index) => (
        <VelocityRow
          key={index}
          className={className}
          baseVelocity={index % 2 !== 0 ? -velocity : velocity}
          scrollContainerRef={scrollContainerRef}
          damping={damping}
          stiffness={stiffness}
          numCopies={numCopies}
          velocityMapping={velocityMapping}
          parallaxClassName={parallaxClassName}
          scrollerClassName={scrollerClassName}
          parallaxStyle={parallaxStyle}
          scrollerStyle={scrollerStyle}
        >
          {content}
        </VelocityRow>
      ))}
    </div>
  );
}

export default ScrollVelocity;
