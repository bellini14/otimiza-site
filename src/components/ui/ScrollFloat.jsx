import { useEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import './ScrollFloat.css';

gsap.registerPlugin(ScrollTrigger);

const ScrollFloat = ({
  children,
  scrollContainerRef,
  containerClassName = '',
  textClassName = '',
  animationDuration = 1,
  ease = 'back.inOut(2)',
  scrollStart = 'center bottom+=50%',
  scrollEnd = 'bottom bottom-=40%',
  stagger = 0.03,
  as: Component = 'h2',
  reverse = false,
  direction = 'up'
}) => {
  const containerRef = useRef(null);

  const splitText = useMemo(() => {
    const text = typeof children === 'string' ? children : '';
    return text.split('').map((char, index) => (
      <span className="char" key={index}>
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  }, [children]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const scroller = scrollContainerRef && scrollContainerRef.current ? scrollContainerRef.current : window;
    const charElements = el.querySelectorAll('.char');

    const startY = direction === 'down' ? -120 : 120;
    const endY = 0;

    const fromVars = reverse
      ? {
          willChange: 'opacity, transform',
          opacity: 1,
          yPercent: endY,
          scaleY: 1,
          scaleX: 1,
          transformOrigin: direction === 'down' ? '50% 0%' : '50% 100%'
        }
      : {
          willChange: 'opacity, transform',
          opacity: 0,
          yPercent: startY,
          scaleY: 2.3,
          scaleX: 0.7,
          transformOrigin: direction === 'down' ? '50% 100%' : '50% 0%'
        };

    const toVars = reverse
      ? {
          duration: animationDuration,
          ease: ease,
          opacity: 0,
          yPercent: -startY,
          scaleY: 2.3,
          scaleX: 0.7,
          stagger: stagger,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: scrollStart,
            end: scrollEnd,
            scrub: true
          }
        }
      : {
          duration: animationDuration,
          ease: ease,
          opacity: 1,
          yPercent: endY,
          scaleY: 1,
          scaleX: 1,
          stagger: stagger,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: scrollStart,
            end: scrollEnd,
            scrub: true
          }
        };

    const anim = gsap.fromTo(charElements, fromVars, toVars);

    return () => {
      anim.kill();
      if (anim.scrollTrigger) {
        anim.scrollTrigger.kill();
      }
    };
  }, [scrollContainerRef, animationDuration, ease, scrollStart, scrollEnd, stagger, reverse, direction]);

  return (
    <Component ref={containerRef} className={`scroll-float ${containerClassName}`}>
      <span className={`scroll-float-text ${textClassName}`}>{splitText}</span>
    </Component>
  );
};

export default ScrollFloat;
