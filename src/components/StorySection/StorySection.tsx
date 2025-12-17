import { storySections } from '../../data/demoData';
import './StorySection.css';

export function StorySection() {
  return (
    <section id="story" className="story">
      <div className="story__container">
        <header className="story__header">
          <h2 className="story__title">His Story</h2>
          <p className="story__subtitle">
            The life of a man who made every day a little brighter for everyone around him.
          </p>
        </header>

        <div className="story__grid">
          {storySections.map((section) => (
            <article key={section.id} className="story-card">
              {section.icon && (
                <div className="story-card__icon">{section.icon}</div>
              )}
              <h3 className="story-card__title">{section.title}</h3>
              <p className="story-card__content">{section.content}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
