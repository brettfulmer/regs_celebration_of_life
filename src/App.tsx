import './App.css'

import { AudioProvider } from './hooks/useAudioPlayer'
import { Navigation } from './components/Navigation'
import { Hero } from './components/Hero'
import { EventInfoSection } from './components/EventInfoSection'
import { RSVPSection } from './components/RSVPSection'
import { LocalInfoSection } from './components/LocalInfoSection'
import { MemoriesSection } from './components/MemoriesSection'
import { FAQSection } from './components/FAQSection'
import { AssistantSection } from './components/AssistantSection'
import { AssistantWidget } from './components/AssistantWidget'
import { ParallaxBackground } from './components/ParallaxBackground'
import { AdminPortal } from './components/AdminPortal'
import { useState, useEffect } from 'react'

function App() {
  const [isAdminMode, setIsAdminMode] = useState(false);

  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      setIsAdminMode(hash === '#admin-sms' || hash === '#admin');
    };

    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  if (isAdminMode) {
    return (
      <div className="app">
        <AdminPortal />
      </div>
    );
  }

  return (
    <AudioProvider>
      <div className="app">
      <ParallaxBackground />
      <Navigation />

      <main className="app__main">
        <Hero />
        <MemoriesSection />
        <EventInfoSection />
        <RSVPSection />
        <LocalInfoSection />
        <FAQSection />
        <AssistantSection />
      </main>

      <footer className="app__footer">
        <div className="container container--narrow">
          <p className="app__footer-text">
            Built as a warm place to remember Reg — stories, laughs, and love.
          </p>
        </div>
      </footer>

      <AssistantWidget />
      </div>
    </AudioProvider>
  )
}

export default App
