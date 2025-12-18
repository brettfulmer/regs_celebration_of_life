import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import './MusicControl.css';

export function MusicControl() {
  const { isPlaying, togglePlayPause } = useAudioPlayer();

  return (
    <button
      className="music-control"
      onClick={togglePlayPause}
      aria-label={isPlaying ? 'Pause music' : 'Play music'}
      title={isPlaying ? 'Pause music' : 'Play music'}
    >
      {isPlaying ? (
        <span className="music-control__icon">⏸️</span>
      ) : (
        <span className="music-control__icon">▶️</span>
      )}
      <span className="music-control__text">{isPlaying ? 'Pause' : 'Play'}</span>
    </button>
  );
}
