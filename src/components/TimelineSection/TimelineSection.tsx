import { timelineItems } from '../../data/timeline.ts';
import './TimelineSection.css';

export function TimelineSection() {
  return (
    <section id="timeline" className="section section--ocean timeline">
      <div className="container container--narrow">
        <div className="section-title">
          <h2>A Few Chapters</h2>
          <p>
            Not a full running order of a life (who could?), just some moments that feel like Reg.
          </p>
        </div>

        <ol className="timeline__list" aria-label="A short timeline of Reg's life">
          {timelineItems.map((item) => (
            <li key={item.id} className="timeline__item">
              <div className="timeline__marker" aria-hidden="true" />
              <div className="timeline__content">
                <div className="timeline__meta">
                  <span className="timeline__when">{item.when}</span>
                  <span className="timeline__dot" aria-hidden="true">•</span>
                  <span className="timeline__where">{item.where}</span>
                </div>
                <h3 className="timeline__title">{item.title}</h3>
                <p className="timeline__body">{item.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
