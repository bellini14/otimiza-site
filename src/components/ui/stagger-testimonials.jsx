import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const testimonials = [
  {
    tempId: 0,
    testimonial: "A Otimiza trouxe uma clareza operacional que nunca tivemos. Nossos processos agora são 5x mais eficientes e escaláveis.",
    by: "Ricardo Silveira, CEO na TechFlow",
    imgSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces&q=80"
  },
  {
    tempId: 1,
    testimonial: "A segurança e confiabilidade da OTMSuite nos permitiu expandir para novos mercados com tranquilidade total.",
    by: "Camila Arantes, CTO na SecureSystems",
    imgSrc: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces&q=80"
  },
  {
    tempId: 2,
    testimonial: "Implementar a metodologia Otimiza foi o melhor investimento estratégico que fizemos nos últimos anos.",
    by: "Marcos Oliveira, Diretor de Operações na InnovaCorp",
    imgSrc: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=faces&q=80"
  },
  {
    tempId: 3,
    testimonial: "A interface é intuitiva e o suporte é excepcional. Mudou completamente a cultura de produtividade da nossa equipe.",
    by: "Beatriz Santos, CFO na FutureLog",
    imgSrc: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=faces&q=80"
  },
  {
    tempId: 4,
    testimonial: "Uma solução atemporal que resolve problemas reais de gestão com elegância e eficiência.",
    by: "André Mendes, Head de Design na CreativeFlow",
    imgSrc: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=faces&q=80"
  },
  {
    tempId: 5,
    testimonial: "Recuperamos centenas de horas produtivas em poucos meses de uso. O impacto no faturamento foi imediato.",
    by: "Juliana Costa, Gerente de Produto na TimeLess",
    imgSrc: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=faces&q=80"
  },
  {
    tempId: 6,
    testimonial: "A robustez da plataforma Otimiza é impressionante. É o motor que impulsiona nosso crescimento diário.",
    by: "Felipe Almeida, Diretor de Marketing na BrandScale",
    imgSrc: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=faces&q=80"
  },
  {
    tempId: 7,
    testimonial: "Análise de dados precisa e dashboards que realmente ajudam na tomada de decisão. Essencial para nós.",
    by: "Carla Nunes, Cientista de Dados na DataDriven",
    imgSrc: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=faces&q=80"
  },
  {
    tempId: 8,
    testimonial: "Simplesmente a melhor solução de automação e gestão que já utilizamos. Nível global.",
    by: "Roberto Lima, UX Designer na UserFirst",
    imgSrc: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=faces&q=80"
  },
  {
    tempId: 9,
    testimonial: "A escalabilidade é real. O sistema cresce sem fricção, acompanhando nossa demanda global.",
    by: "Thiago Pires, Engenheiro DevOps na CloudScale",
    imgSrc: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=150&h=150&fit=crop&crop=faces&q=80"
  }
];

function TestimonialCard({ position, testimonial, handleMove, cardSize }) {
  const isCenter = position === 0;

  return (
    <div
      onClick={() => handleMove(position)}
      className={cn(
        "absolute left-1/2 top-1/2 cursor-pointer rounded-2xl p-8 bg-white border border-slate-200/60 antialiased",
        isCenter ? "z-10 shadow-2xl shadow-slate-900/10" : "z-0 shadow-sm"
      )}
      style={{
        width: cardSize,
        height: cardSize,
        backfaceVisibility: 'hidden',
        WebkitFontSmoothing: 'antialiased',
        transition: 'transform 600ms cubic-bezier(0.23, 1, 0.32, 1), box-shadow 600ms ease',
        transform: `
          translate(-50%, -50%) 
          translateX(${(cardSize / 1.5) * position}px)
          translateY(${isCenter ? -50 : position % 2 ? 20 : -20}px)
          rotate(${isCenter ? 0 : position % 2 ? 3 : -3}deg)
          translateZ(0)
        `,
      }}
    >
      <div
        className="h-full"
        style={{
          opacity: isCenter ? 1 : 0.4,
          transition: 'opacity 500ms ease'
        }}
      >
        {/* Red accent dot */}
        {isCenter && (
          <div className="absolute top-6 right-6 w-2.5 h-2.5 rounded-full bg-brand-red/60" />
        )}
        <img
          src={testimonial.imgSrc}
          alt={`${testimonial.by.split(',')[0]}`}
          className="mb-4 h-14 w-14 rounded-full bg-slate-100 object-cover object-top ring-2 ring-slate-100"
        />
        <h3 className={cn(
          "text-base sm:text-lg font-medium leading-snug",
          isCenter ? "text-slate-900" : "text-slate-700"
        )}>
          &ldquo;{testimonial.testimonial}&rdquo;
        </h3>
        <p className={cn(
          "absolute bottom-8 left-8 right-8 mt-2 text-sm",
          isCenter ? "text-brand-red font-medium" : "text-slate-400 italic"
        )}>
          - {testimonial.by}
        </p>
      </div>
    </div>
  );
}

export function StaggerTestimonials() {
  const [cardSize, setCardSize] = useState(365);
  const [testimonialsList, setTestimonialsList] = useState(testimonials);
  const [sectionRef, isVisible] = useScrollReveal(0.1);

  const handleMove = (steps) => {
    const newList = [...testimonialsList];
    if (steps > 0) {
      for (let i = steps; i > 0; i--) {
        const item = newList.shift();
        if (!item) return;
        newList.push({ ...item, tempId: Math.random() });
      }
    } else {
      for (let i = steps; i < 0; i++) {
        const item = newList.pop();
        if (!item) return;
        newList.unshift({ ...item, tempId: Math.random() });
      }
    }
    setTestimonialsList(newList);
  };

  useEffect(() => {
    const updateSize = () => {
      const { matches } = window.matchMedia("(min-width: 640px)");
      setCardSize(matches ? 365 : 290);
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-[100vw] left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] overflow-hidden bg-white py-16 sm:py-24"
    >
      {/* Section Header */}
      <div className="mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8 mb-8">
        <div className="text-center">
          <p className={cn(
            "mb-4 inline-block tracking-tight rounded-full bg-brand-red/10 px-4 py-1.5 text-[11px] font-semibold uppercase text-brand-red border border-brand-red/20",
            isVisible ? 'animate-enter' : 'opacity-0'
          )}>
            Cases
          </p>
          <h2 className={cn(
            "mb-6 font-display text-4xl text-slate-900 sm:text-5xl lg:text-6xl",
            isVisible ? 'animate-enter' : 'opacity-0',
            '[animation-delay:150ms]'
          )}>
            Veja nossos cases de sucesso
          </h2>
          <p className={cn(
            "mx-auto max-w-2xl text-base text-slate-600 sm:text-lg",
            isVisible ? 'animate-enter' : 'opacity-0',
            '[animation-delay:300ms]'
          )}>
            Mais de 400 empresas confiam na Otimiza para transformar seus processos e acelerar seus resultados.
          </p>
        </div>
      </div>

      {/* Testimonials Carousel */}
      <div
        className={cn(
          "relative w-full overflow-hidden",
          isVisible ? 'animate-enter' : 'opacity-0',
          '[animation-delay:450ms]'
        )}
        style={{ height: 500 }}
      >
        {/* Left gradient fade */}
        <div
          className="pointer-events-none absolute left-0 top-0 bottom-0 z-20"
          style={{
            width: '15%',
            background: 'linear-gradient(to right, rgb(255 255 255), transparent)'
          }}
        />
        {/* Right gradient fade */}
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 z-20"
          style={{
            width: '15%',
            background: 'linear-gradient(to left, rgb(255 255 255), transparent)'
          }}
        />

        {testimonialsList.map((testimonial, index) => {
          const position = testimonialsList.length % 2
            ? index - (testimonialsList.length + 1) / 2
            : index - testimonialsList.length / 2;
          return (
            <TestimonialCard
              key={testimonial.tempId}
              testimonial={testimonial}
              handleMove={handleMove}
              position={position}
              cardSize={cardSize}
            />
          );
        })}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-3 z-30">
          <button
            onClick={() => handleMove(-1)}
            className={cn(
              "flex h-12 w-12 items-center justify-center transition-all duration-300",
              "bg-white border border-slate-200 text-slate-500",
              "hover:bg-slate-900 hover:border-slate-900 hover:text-white",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2",
              "rounded-full shadow-sm"
            )}
            aria-label="Depoimento anterior"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => handleMove(1)}
            className={cn(
              "flex h-12 w-12 items-center justify-center transition-all duration-300",
              "bg-white border border-slate-200 text-slate-500",
              "hover:bg-slate-900 hover:border-slate-900 hover:text-white",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2",
              "rounded-full shadow-sm"
            )}
            aria-label="Próximo depoimento"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* CTA Button */}
      <div className={cn(
        "flex justify-center mt-8",
        isVisible ? 'animate-enter' : 'opacity-0',
        '[animation-delay:600ms]'
      )}>
        <Link
          to="/cases"
          className="solutions-section__cta"
          style={{ boxShadow: 'none' }}
        >
          Confira todos os cases
          <ArrowRight className="solutions-section__cta-arrow" />
        </Link>
      </div>
    </section>
  );
}

// Scroll reveal hook (reused from the site pattern)
function useScrollReveal(threshold = 0.15) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isVisible];
}
