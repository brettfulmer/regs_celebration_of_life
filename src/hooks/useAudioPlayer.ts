import { useContext, createContext, useState, useRef, useEffect, createElement } from 'react';
import type { ReactNode } from 'react';

interface AudioContextType {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
  togglePlayPause: () => void;
  currentTime: number;
  duration: number;
  volume: number;
  setVolume: (volume: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const attemptAutoplay = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.log('Autoplay blocked, will play on user interaction');

        const playOnInteraction = async () => {
          try {
            await audio.play();
            setIsPlaying(true);
          } catch (err) {
            console.error('Failed to play audio:', err);
          }
        };

        document.addEventListener('click', playOnInteraction, { once: true });
        document.addEventListener('touchstart', playOnInteraction, { once: true });
        document.addEventListener('keydown', playOnInteraction, { once: true });
      }
    };

    if (audio.readyState >= 2) {
      attemptAutoplay();
    } else {
      audio.addEventListener('canplay', attemptAutoplay, { once: true });
    }
  }, []);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const value: AudioContextType = {
    audioRef,
    isPlaying,
    togglePlayPause,
    currentTime,
    duration,
    volume,
    setVolume: handleVolumeChange,
  };

  return createElement(
    AudioContext.Provider,
    { value },
    createElement('audio', {
      ref: audioRef,
      src: 'https://cdn.builder.io/o/assets%2F7f4f17bc2420491a95f23b47a94e6efc%2F4f766daa58f14c67b576baa37b9ae972?alt=media&token=e2e607dd-a79a-4c80-a987-22805a8635a1&apiKey=7f4f17bc2420491a95f23b47a94e6efc',
      autoPlay: true,
      loop: true,
      preload: 'auto',
      playsInline: true,
    }),
    children
  );
}

export function useAudioPlayer() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within AudioProvider');
  }
  return context;
}
