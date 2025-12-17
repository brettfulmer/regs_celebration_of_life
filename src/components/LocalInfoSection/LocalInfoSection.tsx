import { localPlaces } from '../../data/demoData';
import './LocalInfoSection.css';

function labelForType(type: string) {
  switch (type) {
    case 'cafe':
      return 'Cafe';
    case 'bar':
      return 'Bar';
    case 'restaurant':
      return 'Food';
    case 'accommodation':
      return 'Stay';
    case 'beach':
      return 'Swim';
    case 'attraction':
      return 'Nearby';
    default:
      return 'Place';
  }
}

export function LocalInfoSection() {
  return (
    <section id="around" className="section local">
      <div className="container">
        <div className="section-title">
          <h2>Around Maroubra</h2>
          <p>
            If you're making a day of it — here are a few nearby spots close to Horizons.
          </p>
        </div>

        <div className="local__grid" role="list">
          {localPlaces.map((place) => (
            <article key={place.id} className="local-card" role="listitem">
              <div className="local-card__top">
                <span className="local-card__badge">{labelForType(place.type)}</span>
                {place.distance && <span className="local-card__distance">{place.distance}</span>}
              </div>
              <h3 className="local-card__title">{place.name}</h3>
              <p className="local-card__body">{place.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
