// ============================================
// RSVP SECTION COMPONENT
// ============================================

import { useState } from 'react';
import type { FormEvent } from 'react';
import { useRSVP } from '../../hooks/useRSVP';
import './RSVPSection.css';

export function RSVPSection() {
  const { isSubmitting, submitRSVP } = useRSVP();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    guests: ''
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const result = await submitRSVP(formData);

    if (result.success) {
      setMessage({ type: 'success', text: result.message });
      setHasSubmitted(true);
      setFormData({ name: '', email: '', phone: '', guests: '' });
    } else {
      setMessage({ type: 'error', text: result.message });
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (message) setMessage(null);
  };

  return (
    <section id="rsvp" className="section section--ocean rsvp">
      <div className="container">
        <div className="section-title">
          <h2>Let Us Know You're Coming</h2>
          <p>
            RSVP to be kept up to date with all the details as plans are confirmed.
            We'll send you updates via email and text as the celebration comes together.
          </p>
        </div>

        <div className="rsvp__content">
          {hasSubmitted ? (
            <div className="rsvp__success-message">
              <div className="rsvp__success-icon">✓</div>
              <h3>Thanks for your RSVP!</h3>
              <p>We're looking forward to seeing you at the celebration.</p>
              <button
                type="button"
                className="rsvp__another-button"
                onClick={() => setHasSubmitted(false)}
              >
                Add another person
              </button>
            </div>
          ) : (
            <form className="rsvp__form" onSubmit={handleSubmit}>
              <div className="rsvp__field">
                <label htmlFor="rsvp-name" className="rsvp__label">
                  Your Name <span className="rsvp__required">*</span>
                </label>
                <input
                  id="rsvp-name"
                  type="text"
                  className="rsvp__input"
                  placeholder="Full name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="rsvp__field">
                <label htmlFor="rsvp-email" className="rsvp__label">
                  Email Address <span className="rsvp__required">*</span>
                </label>
                <input
                  id="rsvp-email"
                  type="email"
                  className="rsvp__input"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="rsvp__field">
                <label htmlFor="rsvp-phone" className="rsvp__label">
                  Phone Number <span className="rsvp__required">*</span>
                </label>
                <input
                  id="rsvp-phone"
                  type="tel"
                  className="rsvp__input"
                  placeholder="+61 412 345 678"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="rsvp__field">
                <label htmlFor="rsvp-guests" className="rsvp__label">
                  How many people coming (including yourself) <span className="rsvp__required">*</span>
                </label>
                <input
                  id="rsvp-guests"
                  type="number"
                  className="rsvp__input"
                  placeholder="1"
                  min="1"
                  value={formData.guests}
                  onChange={(e) => handleChange('guests', e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>

              {message && (
                <div className={`rsvp__message rsvp__message--${message.type}`} role="alert">
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                className="rsvp__submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : "I'll be attending"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
