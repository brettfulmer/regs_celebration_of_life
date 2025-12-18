import { useCallback } from 'react';
import { siteConfig } from '../../data/demoData';
import './AddToCalendar.css';

// Event details from config
const EVENT_TITLE = "Celebrating Reg Fulmer";
const EVENT_LOCATION = `${siteConfig.eventDetails.venue}, ${siteConfig.eventDetails.address.replace('\n', ', ')}`;
const EVENT_DESCRIPTION = "A warm, relaxed celebration of Reg Fulmer's life. Come as you are, share stories, and remember Reg your way.\\n\\nMore info: https://www.regfulmer.com/";

// Event date: Monday, 12th January 2026, 2:00 PM - 5:00 PM AEDT (UTC+11)
// 2:00 PM AEDT = 3:00 AM UTC, 5:00 PM AEDT = 6:00 AM UTC
const EVENT_START_UTC = '20260112T030000Z';
const EVENT_END_UTC = '20260112T060000Z'; // 3 hours: 2pm-5pm AEDT

// For ICS file (using local time with timezone)
const EVENT_START_LOCAL = '20260112T140000';
const EVENT_END_LOCAL = '20260112T170000'; // 5:00 PM

interface AddToCalendarProps {
  compact?: boolean;
}

export function AddToCalendar({ compact = false }: AddToCalendarProps) {
  const handleGoogleCalendar = useCallback(() => {
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: EVENT_TITLE,
      dates: `${EVENT_START_UTC}/${EVENT_END_UTC}`,
      details: EVENT_DESCRIPTION.replace(/\\n/g, '\n'),
      location: EVENT_LOCATION,
      ctz: 'Australia/Sydney',
    });

    window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank');
  }, []);

  const handleOutlookCalendar = useCallback(() => {
    const params = new URLSearchParams({
      path: '/calendar/action/compose',
      rru: 'addevent',
      subject: EVENT_TITLE,
      startdt: '2026-01-12T14:00:00+11:00',
      enddt: '2026-01-12T17:00:00+11:00',
      body: EVENT_DESCRIPTION.replace(/\\n/g, '\n'),
      location: EVENT_LOCATION,
    });

    window.open(`https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`, '_blank');
  }, []);

  const handleYahooCalendar = useCallback(() => {
    const params = new URLSearchParams({
      v: '60',
      title: EVENT_TITLE,
      st: '20260112T030000Z',
      et: '20260112T060000Z',
      desc: EVENT_DESCRIPTION.replace(/\\n/g, '\n'),
      in_loc: EVENT_LOCATION,
    });

    window.open(`https://calendar.yahoo.com/?${params.toString()}`, '_blank');
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
      `DESCRIPTION:${EVENT_DESCRIPTION}`,
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

  if (compact) {
    return (
      <div className="add-to-calendar add-to-calendar--compact">
        <div className="add-to-calendar__buttons">
          <button
            type="button"
            className="add-to-calendar__btn"
            onClick={handleGoogleCalendar}
            aria-label="Add to Google Calendar"
            title="Google Calendar"
          >
            <svg className="add-to-calendar__icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.5 3h-3V1.5H15V3H9V1.5H7.5V3h-3C3.675 3 3 3.675 3 4.5v15c0 .825.675 1.5 1.5 1.5h15c.825 0 1.5-.675 1.5-1.5v-15c0-.825-.675-1.5-1.5-1.5zm0 16.5h-15V9h15v10.5zm0-12h-15v-3h3V6H9V4.5h6V6h1.5V4.5h3v3z"/>
            </svg>
            Google
          </button>
          <button
            type="button"
            className="add-to-calendar__btn"
            onClick={handleOutlookCalendar}
            aria-label="Add to Outlook Calendar"
            title="Outlook Calendar"
          >
            <svg className="add-to-calendar__icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 3C5.9 3 5 3.9 5 5v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H7zm0 2h10v14H7V5zm2 2v2h2V7H9zm4 0v2h2V7h-2zm-4 4v2h2v-2H9zm4 0v2h2v-2h-2zm-4 4v2h2v-2H9z"/>
            </svg>
            Outlook
          </button>
          <button
            type="button"
            className="add-to-calendar__btn"
            onClick={handleDownloadICS}
            aria-label="Download calendar file (Apple/Other)"
            title="Apple Calendar & Others"
          >
            <svg className="add-to-calendar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            .ics
          </button>
        </div>
      </div>
    );
  }

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
          onClick={handleOutlookCalendar}
          aria-label="Add to Outlook Calendar"
        >
          <svg className="add-to-calendar__icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 3C5.9 3 5 3.9 5 5v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H7zm0 2h10v14H7V5zm2 2v2h2V7H9zm4 0v2h2V7h-2zm-4 4v2h2v-2H9zm4 0v2h2v-2h-2zm-4 4v2h2v-2H9z"/>
          </svg>
          Outlook
        </button>
        <button
          type="button"
          className="add-to-calendar__btn"
          onClick={handleYahooCalendar}
          aria-label="Add to Yahoo Calendar"
        >
          <svg className="add-to-calendar__icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          Yahoo
        </button>
        <button
          type="button"
          className="add-to-calendar__btn"
          onClick={handleDownloadICS}
          aria-label="Download calendar file (Apple Calendar & Others)"
        >
          <svg className="add-to-calendar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          .ics (Apple/Other)
        </button>
      </div>
    </div>
  );
}
