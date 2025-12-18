import { useState, useEffect, useCallback } from 'react';
import './ExitReminder.css';

export function ExitReminder() {
  const [showReminder, setShowReminder] = useState(false);
  const [hasRSVPd, setHasRSVPd] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Check if user has already RSVP'd (stored in localStorage)
  useEffect(() => {
    const rsvpStatus = localStorage.getItem('reg_rsvp_complete');
    if (rsvpStatus === 'true') {
      setHasRSVPd(true);
    }
  }, []);

  // Detect when user is about to leave
  const handleMouseLeave = useCallback((e: MouseEvent) => {
    // Only trigger when mouse leaves through the top of the page
    if (e.clientY <= 0 && !hasRSVPd && !dismissed) {
      setShowReminder(true);
    }
  }, [hasRSVPd, dismissed]);

  // Handle beforeunload for mobile/tab close
  useEffect(() => {
    // Only add listener if not RSVP'd
    if (!hasRSVPd && !dismissed) {
      document.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseLeave, hasRSVPd, dismissed]);

  // Listen for successful RSVP
  useEffect(() => {
    const handleRSVPComplete = () => {
      setHasRSVPd(true);
      localStorage.setItem('reg_rsvp_complete', 'true');
    };

    window.addEventListener('rsvp-complete', handleRSVPComplete);
    return () => window.removeEventListener('rsvp-complete', handleRSVPComplete);
  }, []);

  const handleDismiss = () => {
    setShowReminder(false);
    setDismissed(true);
    // Remember dismissal for this session
    sessionStorage.setItem('reg_exit_dismissed', 'true');
  };

  const handleRSVP = () => {
    setShowReminder(false);
    // Scroll to RSVP section
    const rsvpSection = document.getElementById('rsvp');
    if (rsvpSection) {
      rsvpSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Check session storage on mount
  useEffect(() => {
    const sessionDismissed = sessionStorage.getItem('reg_exit_dismissed');
    if (sessionDismissed === 'true') {
      setDismissed(true);
    }
  }, []);

  if (!showReminder || hasRSVPd) return null;

  return (
    <div className="exit-reminder-overlay" onClick={handleDismiss}>
      <div className="exit-reminder" onClick={(e) => e.stopPropagation()}>
        <button className="exit-reminder__close" onClick={handleDismiss} aria-label="Close">
          ×
        </button>
        
        <div className="exit-reminder__content">
          <div className="exit-reminder__icon">🕊️</div>
          <h3 className="exit-reminder__title">Before you go...</h3>
          <p className="exit-reminder__text">
            Have you RSVP'd yet? It really helps us plan for the day.
          </p>
          <p className="exit-reminder__subtext">
            Even if you're not 100% sure, let us know you might be coming.
          </p>
          
          <div className="exit-reminder__actions">
            <button className="btn btn--warm" onClick={handleRSVP}>
              RSVP Now
            </button>
            <button className="btn btn--outline" onClick={handleDismiss}>
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
