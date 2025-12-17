import './AssistantSection.css';

export function AssistantSection() {
  return (
    <section id="assistant" className="section assistant">
      <div className="container container--narrow">
        <div className="section-title">
          <h2>Need a Hand?</h2>
          <p>
            Got a question about the day — what to wear, how to get there, or what to expect?
            Tap the little chat button in the bottom-right.
          </p>
        </div>

        <div className="assistant__card">
          <h3 className="assistant__card-title">Try asking</h3>
          <ul className="assistant__suggestions">
            <li>“What kind of event is this?”</li>
            <li>“Where is it and what time should I arrive?”</li>
            <li>“Is it okay to bring kids or a partner?”</li>
          </ul>
          <p className="assistant__note">
            If something isn’t locked in yet, the assistant will tell you honestly.
          </p>
        </div>
      </div>
    </section>
  );
}
