import { useState, useEffect } from 'react';
import './AdminPortal.css';
import { apiGet, apiPost, apiPatch, apiDelete } from '../../utils/api';

interface Stats {
  rsvps: {
    total: number;
    totalGuests: number;
    confirmed: number;
    confirmedGuests: number;
    unconfirmed: number;
    unconfirmedGuests: number;
    smsSent: number;
    recent: number;
    list: Array<{
      id: string;
      name: string;
      email: string;
      phone: string;
      guests: number;
      confirmed: boolean;
      confirmed_at: string | null;
      sms_sent: boolean;
      sms_sent_at: string | null;
      created_at: string;
    }>;
  };
  memories: {
    total: number;
    approved: number;
    pending: number;
    withPhotos: number;
    recent: number;
  };
  sms: {
    totalMessages: number;
    inbound: number;
    outbound: number;
    bulkSent: number;
    optOuts: number;
    recent: number;
  };
  activity: {
    last7Days: {
      rsvps: number;
      memories: number;
      sms: number;
    };
  };
}

interface Memory {
  id: string;
  name: string;
  message: string;
  relationship?: string;
  image_path?: string;
  approved: boolean;
  featured: boolean;
  created_at: string;
}

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

type TabType = 'dashboard' | 'sms-send' | 'sms-logs' | 'rsvps' | 'memories';

// SMS Templates
const SMS_TEMPLATES = {
  reminder: "Hi {name}! Just a friendly reminder to confirm your RSVP for Reg's Celebration of Life on Mon 12 Jan 2026, 2pm at Coogee Legion Club. Reply YES to confirm. 🕊️",
  update: "Hi {name}! Update for Reg's Celebration of Life: [YOUR MESSAGE HERE]. See https://regscelebrationoflife.netlify.app/ for details. 🕊️",
  thankyou: "Hi {name}! Thank you for confirming your attendance at Reg's Celebration of Life. We look forward to seeing you on Mon 12 Jan 2026 at 2pm. 🕊️",
  finalDetails: "Hi {name}! Final details for Reg's Celebration of Life: Mon 12 Jan 2026, 2pm at Coogee Legion Club, 200 Arden St, Coogee. Parking available nearby. See you there! 🕊️"
};

export function AdminPortal() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  
  // SMS state
  const [recipientsText, setRecipientsText] = useState('');
  const [message, setMessage] = useState('');
  const [includeOptOut, setIncludeOptOut] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sendResults, setSendResults] = useState<SendResult[]>([]);
  const [logs, setLogs] = useState<SMSLog[]>([]);
  
  // Memories state
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoadingMemories, setIsLoadingMemories] = useState(false);
  
  // Reminder state
  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const [reminderResults, setReminderResults] = useState<SendResult[] | null>(null);
  
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const adminPassword = 'reg2025memorial';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === adminPassword) {
      setIsAuthenticated(true);
      setError('');
      loadStats();
    } else {
      setError('Invalid password');
    }
  };

  const loadStats = async () => {
    setIsLoadingStats(true);
    try {
      const response = await apiGet('/.netlify/functions/admin-stats', {
        'Authorization': `Bearer ${adminPassword}`
      });

      if (!response.ok) {
        throw new Error('Failed to load stats');
      }

      const data = await response.json();
      setStats(data);
    } catch (err: any) {
      console.error('Failed to load stats:', err);
      setError(err.message || 'Failed to load statistics');
    } finally {
      setIsLoadingStats(false);
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
    } catch (err: any) {
      setError(err.message || 'Failed to load logs');
    }
  };

  const loadMemories = async () => {
    setIsLoadingMemories(true);
    try {
      const response = await apiGet('/.netlify/functions/admin-memories', {
        'Authorization': `Bearer ${adminPassword}`
      });

      if (!response.ok) throw new Error('Failed to load memories');

      const data = await response.json();
      setMemories(data.memories || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load memories');
    } finally {
      setIsLoadingMemories(false);
    }
  };

  const handleApproveMemory = async (id: string, approved: boolean) => {
    try {
      const response = await apiPatch('/.netlify/functions/admin-memories', 
        { id, approved },
        { 'Authorization': `Bearer ${adminPassword}` }
      );

      if (!response.ok) throw new Error('Failed to update memory');

      setMemories(prev => prev.map(m => m.id === id ? { ...m, approved } : m));
      setSuccessMessage(`Memory ${approved ? 'approved' : 'unapproved'}`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this memory? This cannot be undone.')) return;

    try {
      const response = await apiDelete('/.netlify/functions/admin-memories',
        { id },
        { 'Authorization': `Bearer ${adminPassword}` }
      );

      if (!response.ok) throw new Error('Failed to delete memory');

      setMemories(prev => prev.filter(m => m.id !== id));
      setSuccessMessage('Memory deleted');
      loadStats();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteRSVP = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}'s RSVP?`)) return;

    try {
      const response = await apiDelete('/.netlify/functions/admin-rsvps',
        { id },
        { 'Authorization': `Bearer ${adminPassword}` }
      );

      if (!response.ok) throw new Error('Failed to delete RSVP');

      setSuccessMessage('RSVP deleted');
      loadStats();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleToggleConfirmation = async (id: string, currentStatus: boolean) => {
    try {
      const response = await apiPatch('/.netlify/functions/admin-rsvps',
        { id, confirmed: !currentStatus },
        { 'Authorization': `Bearer ${adminPassword}` }
      );

      if (!response.ok) throw new Error('Failed to update RSVP');

      setSuccessMessage(`RSVP ${!currentStatus ? 'confirmed' : 'unconfirmed'}`);
      loadStats();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSendReminders = async () => {
    if (!confirm(`Send reminder SMS to ${stats?.rsvps.unconfirmed || 0} unconfirmed RSVPs?`)) return;

    setIsSendingReminder(true);
    setReminderResults(null);
    setError('');

    try {
      const response = await apiPost('/.netlify/functions/sms-reminder',
        { type: 'unconfirmed' },
        { 'Authorization': `Bearer ${adminPassword}` }
      );

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to send reminders');

      setReminderResults(data.results || []);
      setSuccessMessage(`Sent ${data.sent} reminders (${data.failed} failed, ${data.skipped} skipped)`);
      loadStats();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSendingReminder(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await apiGet('/.netlify/functions/admin-rsvps?format=csv', {
        'Authorization': `Bearer ${adminPassword}`
      });

      if (!response.ok) throw new Error('Failed to export');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rsvps-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const applyTemplate = (templateKey: keyof typeof SMS_TEMPLATES) => {
    setMessage(SMS_TEMPLATES[templateKey]);
  };

  const loadUnconfirmedAsRecipients = () => {
    if (!stats) return;
    const unconfirmed = stats.rsvps.list.filter(r => !r.confirmed && r.phone);
    const text = unconfirmed.map(r => `${r.phone},${r.name}`).join('\n');
    setRecipientsText(text);
  };

  const parseRecipients = (): Recipient[] => {
    const lines = recipientsText.trim().split('\n');
    return lines
      .map(line => {
        const trimmed = line.trim();
        if (!trimmed) return null;
        
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
        loadStats(); // Refresh stats after sending
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send SMS');
    } finally {
      setIsSending(false);
    }
  };

  const formatPhoneNumber = (phone: string) => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadStats();
      const interval = setInterval(loadStats, 60000); // Refresh every minute
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (activeTab === 'sms-logs') {
      loadLogs();
    }
    if (activeTab === 'memories') {
      loadMemories();
    }
  }, [activeTab]);

  if (!isAuthenticated) {
    return (
      <section id="admin" className="section admin-portal">
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
    <section id="admin" className="section admin-portal">
      <div className="container">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <button className="btn btn--small" onClick={loadStats}>
            🔄 Refresh
          </button>
        </div>

        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'dashboard' ? 'admin-tab--active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className={`admin-tab ${activeTab === 'rsvps' ? 'admin-tab--active' : ''}`}
            onClick={() => setActiveTab('rsvps')}
          >
            👥 RSVPs ({stats?.rsvps.total || 0})
          </button>
          <button
            className={`admin-tab ${activeTab === 'memories' ? 'admin-tab--active' : ''}`}
            onClick={() => setActiveTab('memories')}
          >
            💭 Memories ({stats?.memories.total || 0})
          </button>
          <button
            className={`admin-tab ${activeTab === 'sms-send' ? 'admin-tab--active' : ''}`}
            onClick={() => setActiveTab('sms-send')}
          >
            📤 Send SMS
          </button>
          <button
            className={`admin-tab ${activeTab === 'sms-logs' ? 'admin-tab--active' : ''}`}
            onClick={() => setActiveTab('sms-logs')}
          >
            📨 SMS Logs
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="admin-content">
            {isLoadingStats ? (
              <div className="loading">Loading statistics...</div>
            ) : stats ? (
              <>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                      <div className="stat-value">{stats.rsvps.totalGuests || stats.rsvps.total}</div>
                      <div className="stat-label">Total Guests</div>
                      <div className="stat-detail">
                        {stats.rsvps.total} RSVPs
                      </div>
                      {stats.rsvps.recent > 0 && (
                        <div className="stat-recent">+{stats.rsvps.recent} this week</div>
                      )}
                    </div>
                  </div>

                  <div className="stat-card stat-card--success">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                      <div className="stat-value">{stats.rsvps.confirmedGuests || 0}</div>
                      <div className="stat-label">Confirmed Guests</div>
                      <div className="stat-detail">
                        {stats.rsvps.confirmed || 0} RSVPs confirmed
                      </div>
                    </div>
                  </div>

                  <div className="stat-card stat-card--warning">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-content">
                      <div className="stat-value">{stats.rsvps.unconfirmedGuests || 0}</div>
                      <div className="stat-label">Awaiting Confirmation</div>
                      <div className="stat-detail">
                        {stats.rsvps.unconfirmed || 0} RSVPs pending
                      </div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">💭</div>
                    <div className="stat-content">
                      <div className="stat-value">{stats.memories.total}</div>
                      <div className="stat-label">Total Memories</div>
                      <div className="stat-detail">
                        {stats.memories.approved} approved • {stats.memories.pending} pending
                      </div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">📸</div>
                    <div className="stat-content">
                      <div className="stat-value">{stats.memories.withPhotos}</div>
                      <div className="stat-label">Memories with Photos</div>
                      {stats.memories.recent > 0 && (
                        <div className="stat-recent">+{stats.memories.recent} this week</div>
                      )}
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">💬</div>
                    <div className="stat-content">
                      <div className="stat-value">{stats.sms.totalMessages}</div>
                      <div className="stat-label">Total SMS</div>
                      <div className="stat-detail">
                        {stats.sms.inbound} received • {stats.sms.outbound} sent
                      </div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">📤</div>
                    <div className="stat-content">
                      <div className="stat-value">{stats.sms.bulkSent}</div>
                      <div className="stat-label">Bulk SMS Sent</div>
                      {stats.sms.optOuts > 0 && (
                        <div className="stat-detail">{stats.sms.optOuts} opt-outs</div>
                      )}
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">📈</div>
                    <div className="stat-content">
                      <div className="stat-value">
                        {stats.activity.last7Days.rsvps + stats.activity.last7Days.memories + stats.activity.last7Days.sms}
                      </div>
                      <div className="stat-label">Activity (7 days)</div>
                      <div className="stat-detail">
                        {stats.activity.last7Days.rsvps} RSVPs • {stats.activity.last7Days.memories} memories
                      </div>
                    </div>
                  </div>
                </div>

                <div className="dashboard-sections">
                  <div className="dashboard-section">
                    <h3>Quick Actions</h3>
                    <div className="quick-actions">
                      <button 
                        className="action-btn action-btn--primary" 
                        onClick={handleSendReminders}
                        disabled={isSendingReminder || !stats?.rsvps.unconfirmed}
                      >
                        {isSendingReminder ? '⏳ Sending...' : `📲 Send Reminders (${stats?.rsvps.unconfirmed || 0} pending)`}
                      </button>
                      <button className="action-btn" onClick={handleExportCSV}>
                        📥 Export RSVPs (CSV)
                      </button>
                      <button className="action-btn" onClick={() => setActiveTab('sms-send')}>
                        📤 Send Bulk SMS
                      </button>
                      <button className="action-btn" onClick={() => setActiveTab('rsvps')}>
                        👥 View All RSVPs
                      </button>
                      <button className="action-btn" onClick={() => setActiveTab('memories')}>
                        💭 Manage Memories
                      </button>
                      <a 
                        href="https://regscelebrationoflife.netlify.app/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="action-btn"
                      >
                        🌐 View Public Site
                      </a>
                    </div>
                  </div>

                  {reminderResults && reminderResults.length > 0 && (
                    <div className="dashboard-section">
                      <h3>Reminder Results</h3>
                      <div className="reminder-results">
                        {reminderResults.map((r, i) => (
                          <div key={i} className={`reminder-result ${r.success ? 'success' : 'failed'}`}>
                            <span>{r.name}</span>
                            <span>{r.success ? '✓ Sent' : `✗ ${r.error}`}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="no-data">No statistics available</div>
            )}
          </div>
        )}

        {/* RSVPs Tab */}
        {activeTab === 'rsvps' && stats && (
          <div className="admin-content">
            <div className="content-header">
              <h2>RSVP List ({stats.rsvps.total} RSVPs • {stats.rsvps.totalGuests || stats.rsvps.total} guests)</h2>
              <div className="content-actions">
                <button className="btn btn--small" onClick={handleExportCSV}>
                  📥 Export CSV
                </button>
                <button 
                  className="btn btn--small btn--primary" 
                  onClick={handleSendReminders}
                  disabled={isSendingReminder || !stats.rsvps.unconfirmed}
                >
                  📲 Send Reminders
                </button>
              </div>
            </div>
            <div className="rsvp-summary">
              <span className="badge badge-success">✅ {stats.rsvps.confirmedGuests || 0} confirmed</span>
              <span className="badge badge-warning">⏳ {stats.rsvps.unconfirmedGuests || 0} pending</span>
            </div>
            {stats.rsvps.list.length === 0 ? (
              <p className="no-data">No RSVPs yet.</p>
            ) : (
              <div className="data-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Guests</th>
                      <th>Status</th>
                      <th>SMS</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.rsvps.list.map((rsvp) => (
                      <tr key={rsvp.id} className={rsvp.confirmed ? 'row-confirmed' : 'row-pending'}>
                        <td>{rsvp.name}</td>
                        <td>{rsvp.email}</td>
                        <td>{formatPhoneNumber(rsvp.phone)}</td>
                        <td>{rsvp.guests || 1}</td>
                        <td>
                          <button 
                            className={`status-badge ${rsvp.confirmed ? 'status-confirmed' : 'status-pending'}`}
                            onClick={() => handleToggleConfirmation(rsvp.id, rsvp.confirmed)}
                            title="Click to toggle"
                          >
                            {rsvp.confirmed ? '✅ Confirmed' : '⏳ Pending'}
                          </button>
                        </td>
                        <td>
                          {rsvp.sms_sent ? (
                            <span className="status-badge status-sent" title={rsvp.sms_sent_at ? `Sent ${formatDate(rsvp.sms_sent_at)}` : ''}>
                              📤 Sent
                            </span>
                          ) : (
                            <span className="status-badge status-not-sent">—</span>
                          )}
                        </td>
                        <td>{formatDate(rsvp.created_at)}</td>
                        <td>
                          <button 
                            className="btn-icon btn-icon--danger" 
                            onClick={() => handleDeleteRSVP(rsvp.id, rsvp.name)}
                            title="Delete RSVP"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Memories Tab */}
        {activeTab === 'memories' && (
          <div className="admin-content">
            <div className="content-header">
              <h2>Memory Management</h2>
              <button className="btn btn--small" onClick={loadMemories}>
                🔄 Refresh
              </button>
            </div>
            <div className="memory-stats">
              <span className="badge badge-success">{memories.filter(m => m.approved).length} Approved</span>
              <span className="badge badge-warning">{memories.filter(m => !m.approved).length} Pending</span>
              <span className="badge badge-info">{memories.filter(m => m.image_path).length} With Photos</span>
            </div>
            
            {isLoadingMemories ? (
              <div className="loading">Loading memories...</div>
            ) : memories.length === 0 ? (
              <p className="no-data">No memories submitted yet.</p>
            ) : (
              <div className="memories-grid">
                {memories.map((memory) => (
                  <div key={memory.id} className={`memory-card ${memory.approved ? 'memory-card--approved' : 'memory-card--pending'}`}>
                    {memory.image_path && (
                      <div className="memory-card__image">
                        <img 
                          src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/memories/${memory.image_path}`} 
                          alt="Memory" 
                        />
                      </div>
                    )}
                    <div className="memory-card__content">
                      <div className="memory-card__header">
                        <strong>{memory.name}</strong>
                        {memory.relationship && <span className="memory-card__relationship">{memory.relationship}</span>}
                      </div>
                      <p className="memory-card__message">{memory.message}</p>
                      <div className="memory-card__footer">
                        <span className="memory-card__date">{formatDate(memory.created_at)}</span>
                        <span className={`status-badge ${memory.approved ? 'status-confirmed' : 'status-pending'}`}>
                          {memory.approved ? '✅ Approved' : '⏳ Pending'}
                        </span>
                      </div>
                      <div className="memory-card__actions">
                        {!memory.approved ? (
                          <button 
                            className="btn btn--small btn--success" 
                            onClick={() => handleApproveMemory(memory.id, true)}
                          >
                            ✓ Approve
                          </button>
                        ) : (
                          <button 
                            className="btn btn--small btn--warning" 
                            onClick={() => handleApproveMemory(memory.id, false)}
                          >
                            ↩ Unapprove
                          </button>
                        )}
                        <button 
                          className="btn btn--small btn--danger" 
                          onClick={() => handleDeleteMemory(memory.id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SMS Send Tab */}
        {activeTab === 'sms-send' && (
          <div className="admin-content">
            <div className="sms-form">
              <h2>Send Bulk SMS</h2>
              
              <div className="form-section">
                <h3>Quick Load Recipients</h3>
                <div className="quick-load-buttons">
                  <button 
                    className="btn btn--small"
                    onClick={loadUnconfirmedAsRecipients}
                    disabled={!stats?.rsvps.unconfirmed}
                  >
                    Load Unconfirmed ({stats?.rsvps.unconfirmed || 0})
                  </button>
                </div>
              </div>

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

              <div className="form-section">
                <h3>Message Templates</h3>
                <div className="template-buttons">
                  <button className="btn btn--small" onClick={() => applyTemplate('reminder')}>
                    📲 Reminder
                  </button>
                  <button className="btn btn--small" onClick={() => applyTemplate('thankyou')}>
                    🙏 Thank You
                  </button>
                  <button className="btn btn--small" onClick={() => applyTemplate('finalDetails')}>
                    📋 Final Details
                  </button>
                  <button className="btn btn--small" onClick={() => applyTemplate('update')}>
                    📢 Update
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="message">Message</label>
                <textarea
                  id="message"
                  className="form-textarea"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Your message... Use {name} for personalization"
                  rows={4}
                />
                <div className="form-hint">
                  {message.length} characters • Use {'{name}'} to personalize
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
                <div className="data-table">
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
        )}

        {/* SMS Logs Tab */}
        {activeTab === 'sms-logs' && (
          <div className="admin-content">
            <div className="content-header">
              <h2>SMS Message Logs</h2>
              <button className="btn btn--small" onClick={loadLogs}>
                Refresh
              </button>
            </div>

            {logs.length === 0 ? (
              <p className="no-data">No messages logged yet.</p>
            ) : (
              <div className="data-table">
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
