import { useEffect, useRef } from 'react';
import { heroContent } from '../../data/demoData';
import { ShareButtons } from '../ShareButtons';
import './Hero.css';

export function Hero() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (reduceMotion) return;

    let rafId = 0;

    const update = () => {
      const el = sectionRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
      const offset = (progress - 0.5) * 24; // subtle parallax
      el.style.setProperty('--hero-parallax', `${offset}px`);
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <section ref={sectionRef} id="home" className="hero">
      {/* Background with hero image of Reg */}
      <div className="hero__background">
        <div className="hero__background-image" style={{
          backgroundImage: 'url(https://cdn.builder.io/api/v1/image/assets%2F7f4f17bc2420491a95f23b47a94e6efc%2Facb7164a17ef40eab078c7688776fd2d?format=webp&width=800)',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
        }} />
      </div>

      <div className="hero__content">
        {/* Profile Image */}
        <div className="hero__image-wrapper">
          <img 
            src="/images/RegFulmer.png"
            alt={heroContent.heroImageAlt}
            className="hero__image"
          />
        </div>

        {/* Headline */}
        <h1 className="hero__headline">{heroContent.headline}</h1>
        
        {/* Subheadline */}
        <p className="hero__subheadline">{heroContent.subheadline}</p>
        
        {/* Intro paragraph */}
        <p className="hero__intro">{heroContent.introParagraph}</p>

        {/* CTA Buttons */}
        <div className="hero__cta">
          <a href="#details" className="btn btn--primary">
            See Celebration Details
          </a>
          <a href="#rsvp" className="btn btn--secondary">
            RSVP
          </a>
        </div>

        {/* Share buttons */}
        <div className="hero__share">
          <ShareButtons />
        </div>
      </div>

      {/* Wave decoration at bottom */}
      <svg className="hero__wave" viewBox="0 0 1440 100" preserveAspectRatio="none">
        <path d="M0,40 C320,100 420,0 740,50 C1060,100 1120,20 1440,60 L1440,100 L0,100 Z" />
      </svg>
    </section>
  );
}
