import { useCallback } from 'react';
import { siteConfig } from '../../data/demoData';
import './AddToCalendar.css';

// Event details from config
const EVENT_TITLE = "Celebrating Reg Fulmer";
const EVENT_LOCATION = `${siteConfig.eventDetails.venue}, ${siteConfig.eventDetails.address.replace('\n', ', ')}`;
const EVENT_DESCRIPTION = "A warm, relaxed celebration of Reg Fulmer's life. Come as you are, share stories, and remember Reg your way.";

// Event date: Monday, 12th January 2026, 2:00 PM AEDT (UTC+11)
// Format for Google Calendar: 20260112T030000Z (UTC time)
// 2:00 PM AEDT = 3:00 AM UTC
const EVENT_START_UTC = '20260112T030000Z';
const EVENT_END_UTC = '20260112T070000Z'; // 4 hours duration (6:00 PM AEDT)

// For ICS file (using local time with timezone)
const EVENT_START_LOCAL = '20260112T140000';
const EVENT_END_LOCAL = '20260112T180000';

export function AddToCalendar() {
  const handleGoogleCalendar = useCallback(() => {
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: EVENT_TITLE,
      dates: `${EVENT_START_UTC}/${EVENT_END_UTC}`,
      details: EVENT_DESCRIPTION,
      location: EVENT_LOCATION,
      ctz: 'Australia/Sydney',
    });

    window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank');
  }, []);

  const handleDownloadICS = useCallback(() => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Reg Fulmer Memorial//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VTIMEZONE',
      'TZID:Australia/Sydney',
      'BEGIN:STANDARD',
      'DTSTART:19700405T030000',
      'RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=1SU',
      'TZOFFSETFROM:+1100',
      'TZOFFSETTO:+1000',
      'END:STANDARD',
      'BEGIN:DAYLIGHT',
      'DTSTART:19701004T020000',
      'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=1SU',
      'TZOFFSETFROM:+1000',
      'TZOFFSETTO:+1100',
      'END:DAYLIGHT',
      'END:VTIMEZONE',
      'BEGIN:VEVENT',
      `DTSTART;TZID=Australia/Sydney:${EVENT_START_LOCAL}`,
      `DTEND;TZID=Australia/Sydney:${EVENT_END_LOCAL}`,
      `SUMMARY:${EVENT_TITLE}`,
      `DESCRIPTION:${EVENT_DESCRIPTION.replace(/\n/g, '\\n')}`,
      `LOCATION:${EVENT_LOCATION.replace(/,/g, '\\,')}`,
      `URL:https://www.regfulmer.com/`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'reg-fulmer-celebration.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  return (
    <div className="add-to-calendar">
      <span className="add-to-calendar__label">Add to calendar:</span>
      <div className="add-to-calendar__buttons">
        <button
          type="button"
          className="add-to-calendar__btn"
          onClick={handleGoogleCalendar}
          aria-label="Add to Google Calendar"
        >
          <svg className="add-to-calendar__icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.5 3h-3V1.5H15V3H9V1.5H7.5V3h-3C3.675 3 3 3.675 3 4.5v15c0 .825.675 1.5 1.5 1.5h15c.825 0 1.5-.675 1.5-1.5v-15c0-.825-.675-1.5-1.5-1.5zm0 16.5h-15V9h15v10.5zm0-12h-15v-3h3V6H9V4.5h6V6h1.5V4.5h3v3z"/>
          </svg>
          Google
        </button>
        <button
          type="button"
          className="add-to-calendar__btn"
          onClick={handleDownloadICS}
          aria-label="Download calendar file"
        >
          <svg className="add-to-calendar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download .ics
        </button>
      </div>
    </div>
  );
}
