import { useMemo, useState } from 'react';
import { faqItems } from '../../data/demoData';
import './FAQSection.css';

export function FAQSection() {
  const [openId, setOpenId] = useState<string | null>(faqItems[0]?.id ?? null);

  const items = useMemo(() => faqItems, []);

  return (
    <section id="faq" className="section section--sand faq">
      <div className="container container--narrow">
        <div className="section-title">
          <h2>FAQ</h2>
          <p>
            Quick answers for the basics. If something’s still being finalised, we’ll say so.
          </p>
        </div>

        <div className="faq__list">
          {items.map((item) => {
            const isOpen = item.id === openId;
            const panelId = `faq-panel-${item.id}`;
            const buttonId = `faq-button-${item.id}`;

            return (
              <div key={item.id} className={`faq-item ${isOpen ? 'faq-item--open' : ''}`}>
                <h3 className="faq-item__heading">
                  <button
                    id={buttonId}
                    className="faq-item__button"
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenId((prev) => (prev === item.id ? null : item.id))}
                  >
                    <span className="faq-item__question">{item.question}</span>
                    <span className="faq-item__icon" aria-hidden="true">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                </h3>

                <div
                  id={panelId}
                  className="faq-item__panel"
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!isOpen}
                >
                  <p className="faq-item__answer">{item.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
