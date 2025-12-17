import { useState, useEffect } from 'react';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import './Navigation.css';

const navLinks = [
  { href: '#home', label: 'Home' },
  { href: '#memories', label: 'Memories' },
  { href: '#details', label: 'Details' },
  { href: '#rsvp', label: 'RSVP' },
  { href: '#around', label: 'Around Maroubra' },
  { href: '#faq', label: 'FAQ' },
];

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isPlaying, togglePlayPause } = useAudioPlayer();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={`nav ${isScrolled ? 'nav--scrolled' : ''}`}>
      <div className="nav__container">
        {/* Music Player Button */}
        <button
          className="nav__music-button"
          onClick={togglePlayPause}
          aria-label={isPlaying ? 'Pause music' : 'Play music'}
        >
          {isPlaying ? 'PAUSE' : 'PLAY'}
        </button>

        <a href="#home" className="nav__logo">
          Reg <span>Fulmer</span>
        </a>

        <div className="nav__spacer"></div>

        {/* Desktop Navigation */}
        <ul className="nav__links">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="nav__link">
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile Menu Toggle */}
        <button
          className={`nav__mobile-toggle ${isMobileMenuOpen ? 'nav__mobile-toggle--open' : ''}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`nav__mobile-menu ${isMobileMenuOpen ? 'nav__mobile-menu--open' : ''}`}>
        <ul className="nav__mobile-links">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="nav__mobile-link"
                onClick={handleLinkClick}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
