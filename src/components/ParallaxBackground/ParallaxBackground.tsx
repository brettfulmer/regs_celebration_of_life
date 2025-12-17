import { useEffect, useState } from 'react';
import './ParallaxBackground.css';

// Static images from public/images for parallax background
const PARALLAX_IMAGES = [
  '/images/FB_IMG_1592999293577.jpg',
  '/images/FB_IMG_1700981427072.jpg',
  '/images/IMG_20190713_145235.jpg',
  '/images/IMG_20190921_193936.jpg',
  '/images/IMG_20190921_194541.jpg',
  '/images/IMG_20190921_194606.jpg',
  '/images/IMG_20190921_194825.jpg',
  '/images/IMG_20190923_193728.jpg',
  '/images/IMG_20200127_202456.jpg',
  '/images/IMG_20200210_203344.jpg',
  '/images/IMG_20240613_124648_567.jpg',
  '/images/IMG_2512.jpg',
  '/images/IMG_2567.JPG',
  '/images/PXL_20221128_021228523.PORTRAIT.jpg',
  '/images/PXL_20240613_033105947.PORTRAIT.jpg',
  '/images/PXL_20250225_101309318.PORTRAIT.jpg',
  '/images/PXL_20250228_235450451.PORTRAIT.jpg',
  '/images/PXL_20250303_202214042.PORTRAIT.jpg',
];

// Generate random positions and rotations for each image
const imagePositions = PARALLAX_IMAGES.map((_, index) => {
  // Distribute images across the viewport height (staggered reveals)
  const triggerScroll = 200 + (index * 300); // Each image triggered every ~300px of scroll
  
  // Random horizontal position (10-90% to keep away from edges)
  const left = 10 + Math.random() * 80;
  
  // Random vertical offset relative to trigger point
  const topOffset = -100 + Math.random() * 200;
  
  // Random rotation (-12 to 12 degrees for polaroid effect)
  const rotation = -12 + Math.random() * 24;
  
  // Random scale (0.8 to 1.2)
  const scale = 0.8 + Math.random() * 0.4;
  
  // Random parallax speed (0.3 to 0.7 - slower than scroll)
  const parallaxSpeed = 0.3 + Math.random() * 0.4;

  return {
    src: PARALLAX_IMAGES[index],
    triggerScroll,
    left,
    topOffset,
    rotation,
    scale,
    parallaxSpeed,
  };
});

export function ParallaxBackground() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="parallax-bg" aria-hidden="true">
      {imagePositions.map((pos, index) => {
        // Calculate opacity based on scroll position
        const scrollDiff = scrollY - pos.triggerScroll;
        const opacity = Math.max(0, Math.min(0.35, scrollDiff / 600)); // Fade in gradually, max 0.35
        
        // Calculate parallax offset
        const parallaxY = scrollY * pos.parallaxSpeed;
        
        // Only render if opacity > 0 (performance optimization)
        if (opacity <= 0) return null;

        return (
          <div
            key={index}
            className="parallax-bg__image"
            style={{
              left: `${pos.left}%`,
              top: `${pos.triggerScroll + pos.topOffset}px`,
              transform: `translateY(${-parallaxY}px) rotate(${pos.rotation}deg) scale(${pos.scale})`,
              opacity,
            }}
          >
            <div className="parallax-bg__frame">
              <img
                src={pos.src}
                alt=""
                loading="lazy"
                className="parallax-bg__img"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
