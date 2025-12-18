// ============================================
// PAGE VIEW TRACKING HOOK
// ============================================

import { useEffect } from 'react';

// Generate or retrieve a session ID
function getSessionId(): string {
  const key = 'reg_session_id';
  let sessionId = sessionStorage.getItem(key);
  
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(key, sessionId);
  }
  
  return sessionId;
}

// Track a page view
async function trackPageView(page: string = '/') {
  try {
    const sessionId = getSessionId();
    const referrer = document.referrer || undefined;
    
    await fetch('/.netlify/functions/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        page,
        referrer,
      }),
    });
  } catch (error) {
    // Silently fail - don't affect user experience
    console.debug('[tracking] Failed to track page view:', error);
  }
}

export function usePageTracking() {
  useEffect(() => {
    // Track the initial page view
    trackPageView(window.location.pathname);
    
    // We could also track hash changes if needed
    // But for a single-page app, the initial view is usually sufficient
  }, []);
}

export { trackPageView };
