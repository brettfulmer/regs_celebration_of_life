import { useState, useRef, useEffect } from 'react';
import './MusicPlayer.css';

export function MusicPlayer() {
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
    const handleEnded = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    audio.play().catch(() => {
      console.log('Autoplay prevented - user interaction may be required');
    });

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
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

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const formatTime = (time: number) => {
    if (!isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="music-player">
      <audio
        ref={audioRef}
        src="https://cdn.builder.io/o/assets%2F7f4f17bc2420491a95f23b47a94e6efc%2F4f766daa58f14c67b576baa37b9ae972?alt=media&token=e2e607dd-a79a-4c80-a987-22805a8635a1&apiKey=7f4f17bc2420491a95f23b47a94e6efc"
        autoPlay
      />

      <div className="music-player__controls">
        <button
          className="music-player__play-button"
          onClick={togglePlayPause}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        <div className="music-player__progress-container">
          <div className="music-player__time">{formatTime(currentTime)}</div>
          <input
            type="range"
            className="music-player__progress"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleProgressChange}
            aria-label="Track progress"
          />
          <div className="music-player__time">{formatTime(duration)}</div>
        </div>
      </div>

      <div className="music-player__volume-container">
        <label htmlFor="volume-control" className="music-player__volume-label">
          🔊
        </label>
        <input
          id="volume-control"
          type="range"
          className="music-player__volume"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          aria-label="Volume"
        />
      </div>
    </div>
  );
}
