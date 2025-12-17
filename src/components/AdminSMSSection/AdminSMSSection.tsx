import { useState } from 'react';
import './AdminSMSSection.css';
import { apiGet, apiPost } from '../../utils/api';

interface Recipient {
  phone: string;
  name?: string;
}

interface SendResult {
  phone: string;
  name?: string;
  success: boolean;
  messageSid?: string;
  status?: string;
  error?: string;
}

interface SMSLog {
  id: string;
  timestamp: string;
  direction: 'inbound' | 'outbound';
  from_number: string;
  to_number: string;
  message_body: string;
  status: string;
  is_bulk: boolean;
}

export function AdminSMSSection() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [recipientsText, setRecipientsText] = useState('');
  const [message, setMessage] = useState('');
  const [includeOptOut, setIncludeOptOut] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sendResults, setSendResults] = useState<SendResult[]>([]);
  const [logs, setLogs] = useState<SMSLog[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [error, setError] = useState('');

  const adminPassword = 'reg2025memorial'; // Default password

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === adminPassword) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid password');
    }
  };

  const parseRecipients = (): Recipient[] => {
    const lines = recipientsText.trim().split('\n');
    return lines
      .map(line => {
        const trimmed = line.trim();
        if (!trimmed) return null;
        
        // Support CSV format: phone,name or just phone
        if (trimmed.includes(',')) {
          const [phone, name] = trimmed.split(',').map(s => s.trim());
          return { phone, name };
        }
        
        return { phone: trimmed };
      })
      .filter((r): r is Recipient => r !== null && r.phone.length > 0);
  };

  const getPreviewMessage = () => {
    let preview = message.trim();
    if (includeOptOut) {
      preview += '\n\nReply STOP to opt out.';
    }
    return preview;
  };

  const handleSend = async () => {
    setError('');
    setSendResults([]);
    
    const recipients = parseRecipients();
    if (recipients.length === 0) {
      setError('Please add at least one recipient');
      return;
    }

    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    setIsSending(true);

    try {
      const response = await apiPost(
        '/.netlify/functions/sms-bulk-send',
        {
          recipients,
          message: message.trim(),
          include_opt_out: includeOptOut
        },
        {
          'Authorization': `Bearer ${adminPassword}`
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send SMS');
      }

      setSendResults(data.results || []);
      
      if (data.sent > 0) {
        setRecipientsText('');
        setMessage('');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send SMS');
    } finally {
      setIsSending(false);
    }
  };

  const loadLogs = async () => {
    try {
      const response = await apiGet('/.netlify/functions/sms-logs', {
        'Authorization': `Bearer ${adminPassword}`
      });

      if (!response.ok) {
        throw new Error('Failed to load logs');
      }

      const data = await response.json();
      setLogs(data.logs || []);
      setShowLogs(true);
    } catch (err: any) {
      setError(err.message || 'Failed to load logs');
    }
  };

  const formatPhoneNumber = (phone: string) => {
    // Format +61XXXXXXXXX to more readable format
    if (phone.startsWith('+61')) {
      return phone.replace('+61', '0');
    }
    return phone;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-AU', {
      dateStyle: 'short',
      timeStyle: 'short'
    });
  };

  if (!isAuthenticated) {
    return (
      <section id="admin-sms" className="section admin-sms">
        <div className="container container--narrow">
          <div className="admin-login">
            <h2>Admin Access Required</h2>
            <form onSubmit={handleLogin} className="admin-login-form">
              <div className="form-group">
                <label className="form-label" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  autoFocus
                />
              </div>
              {error && <div className="error-message">{error}</div>}
              <button type="submit" className="btn btn--warm">
                Login
              </button>
            </form>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="admin-sms" className="section admin-sms">
      <div className="container">
        <div className="section-title">
          <h2>Admin SMS Management</h2>
          <p>Send bulk SMS notifications and view message logs</p>
        </div>

        <div className="admin-tabs">
          <button
            className={`admin-tab ${!showLogs ? 'admin-tab--active' : ''}`}
            onClick={() => setShowLogs(false)}
          >
            Send SMS
          </button>
          <button
            className={`admin-tab ${showLogs ? 'admin-tab--active' : ''}`}
            onClick={() => loadLogs()}
          >
            View Logs
          </button>
        </div>

        {!showLogs ? (
          <div className="admin-send">
            <div className="admin-form">
              <div className="form-group">
                <label className="form-label" htmlFor="recipients">
                  Recipients
                  <span className="form-hint">One phone number per line. Format: +61XXXXXXXXX or phone,name</span>
                </label>
                <textarea
                  id="recipients"
                  className="form-textarea"
                  value={recipientsText}
                  onChange={(e) => setRecipientsText(e.target.value)}
                  placeholder="+61412345678&#10;+61498765432,John Smith"
                  rows={6}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="message">Message</label>
                <textarea
                  id="message"
                  className="form-textarea"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Your message..."
                  rows={4}
                />
                <div className="form-hint">
                  {message.length} characters
                </div>
              </div>

              <div className="form-group">
                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={includeOptOut}
                    onChange={(e) => setIncludeOptOut(e.target.checked)}
                  />
                  <span>Include opt-out instructions</span>
                </label>
              </div>

              {message && (
                <div className="message-preview">
                  <h3>Preview</h3>
                  <div className="preview-content">
                    {getPreviewMessage()}
                  </div>
                </div>
              )}

              {error && <div className="error-message">{error}</div>}

              <button
                type="button"
                className="btn btn--warm"
                onClick={handleSend}
                disabled={isSending || !recipientsText.trim() || !message.trim()}
              >
                {isSending ? 'Sending...' : `Send to ${parseRecipients().length} recipient${parseRecipients().length !== 1 ? 's' : ''}`}
              </button>
            </div>

            {sendResults.length > 0 && (
              <div className="send-results">
                <h3>Send Results</h3>
                <div className="results-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Phone</th>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sendResults.map((result, idx) => (
                        <tr key={idx} className={result.success ? 'success' : 'error'}>
                          <td>{formatPhoneNumber(result.phone)}</td>
                          <td>{result.name || '-'}</td>
                          <td>
                            {result.success ? (
                              <span className="status-badge status-success">✓ Sent</span>
                            ) : (
                              <span className="status-badge status-error">✗ Failed</span>
                            )}
                          </td>
                          <td>{result.error || result.status || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="admin-logs">
            <div className="logs-header">
              <h3>Message Logs</h3>
              <button className="btn btn--small" onClick={loadLogs}>
                Refresh
              </button>
            </div>

            {logs.length === 0 ? (
              <p className="no-logs">No messages logged yet.</p>
            ) : (
              <div className="logs-table">
                <table>
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Direction</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Message</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className={`log-${log.direction}`}>
                        <td>{formatTimestamp(log.timestamp)}</td>
                        <td>
                          <span className={`direction-badge direction-${log.direction}`}>
                            {log.direction === 'inbound' ? '📥' : '📤'} {log.direction}
                          </span>
                        </td>
                        <td>{formatPhoneNumber(log.from_number)}</td>
                        <td>{formatPhoneNumber(log.to_number)}</td>
                        <td className="message-cell">{log.message_body}</td>
                        <td>{log.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
