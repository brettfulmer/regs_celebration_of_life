import { siteConfig } from '../../data/demoData';
import { AddToCalendar } from '../AddToCalendar';
import './EventInfoSection.css';

export function EventInfoSection() {
  const details = siteConfig.eventDetails;

  return (
    <section id="details" className="section section--sand event">
      <div className="container">
        <div className="section-title">
          <h2>Celebration of His Life</h2>
          <p>
            This is a relaxed celebration — not a formal sit-down service. Come as you are,
            have a yarn, share a story, and remember Reg your way.
          </p>
        </div>

        <div className="event__grid">
          <div className="event__card">
            <h3 className="event__card-title">The basics</h3>

            <dl className="event__list" aria-label="Celebration details">
              <div className="event__row">
                <dt>Date</dt>
                <dd>{details.date}</dd>
              </div>
              <div className="event__row">
                <dt>Time</dt>
                <dd>
                  {details.time}
                  <div className="event__calendar">
                    <AddToCalendar />
                  </div>
                </dd>
              </div>
              <div className="event__row">
                <dt>Where</dt>
                <dd>
                  <div className="event__venue">{details.venue}</div>
                  <div className="event__address">
                    {details.address.split('\n').map((line, i) => (
                      <span key={i}>
                        {line}
                        {i < details.address.split('\n').length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                </dd>
              </div>
              <div className="event__row">
                <dt>Dress</dt>
                <dd>{details.dressCode}</dd>
              </div>
            </dl>

            <div className="event__note" role="note">
              <p>
                RSVP below to be kept up to date with all the details as they're confirmed.
              </p>
            </div>

            <div className="event__logistics">
              <h4 className="event__logistics-title">Getting there</h4>
              <ul className="event__logistics-list">
                <li>Lift access is available</li>
                <li>Car parking is available out the front</li>
                <li>Rideshare is easy (Uber etc)</li>
                <li>Buses run regularly from Sydney CBD — check <a href="https://transportnsw.info/trip" target="_blank" rel="noopener noreferrer">Transport NSW Trip Planner</a> for live times</li>
              </ul>
            </div>
          </div>

          <div className="event__card event__card--map">
            <h3 className="event__card-title">Map</h3>
            {details.mapEmbedUrl ? (
              <div className="event__map-wrapper">
                <iframe
                  className="event__map"
                  src={details.mapEmbedUrl}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Map to the celebration venue"
                />
              </div>
            ) : (
              <div className="event__map-placeholder" aria-label="Map placeholder">
                Map coming soon.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
