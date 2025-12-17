import { spotifyContent } from '../../data/demoData';
import './SpotifySection.css';

export function SpotifySection() {
  return (
    <section id="music" className="spotify">
      <div className="spotify__container">
        <div className="spotify__icon">🎵</div>
        <h2 className="spotify__heading">{spotifyContent.heading}</h2>
        <p className="spotify__description">{spotifyContent.description}</p>

        <p className="spotify__note">
          {spotifyContent.note}
        </p>
      </div>
    </section>
  );
}
