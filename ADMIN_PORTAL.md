# Admin Portal Documentation

## Overview

Comprehensive admin dashboard for managing all aspects of Reg's Celebration of Life memorial site.

## Access

**URL:** `https://regscelebrationoflife.netlify.app/#admin` or `#admin-sms`

**Password:** `reg2025memorial`

## Features

### 📊 Dashboard Tab

**Overview Statistics:**
- **Total RSVPs** - Count of all RSVPs submitted
- **Total Memories** - All memories (approved + pending)
- **Memories with Photos** - Count of photo submissions
- **Total SMS** - All SMS messages (inbound + outbound)
- **Bulk SMS Sent** - Count of bulk notifications sent
- **Activity (7 days)** - Recent activity across all categories

**Quick Actions:**
- Send Bulk SMS
- View All RSVPs
- Manage Memories
- View Public Site (opens in new tab)

**Real-time Updates:**
- Stats auto-refresh every 60 seconds
- Manual refresh button available
- Shows "this week" activity indicators

### 👥 RSVPs Tab

**Features:**
- Complete list of all RSVPs
- Shows: Name, Email, Phone, Submission Date
- Sortable table
- Formatted Australian phone numbers (0XXX XXX XXX)
- Formatted dates in Australian locale

**Use Cases:**
- Contact attendees
- Plan catering/seating
- Send event updates
- Export for spreadsheet (copy/paste from table)

### 💭 Memories Tab

**Information Displayed:**
- Total memories count
- Approved memories (badge)
- Pending memories (badge)
- Memories with photos (badge)

**Current Behavior:**
- Auto-approval enabled (MEMORIES_AUTO_APPROVE=true)
- All submissions immediately visible
- To manually approve, access Supabase dashboard

**Moderation:**
For manual memory moderation:
1. Set MEMORIES_AUTO_APPROVE=false in environment
2. Use Supabase dashboard to approve/reject
3. Or create custom approval UI (future enhancement)

### 📤 Send SMS Tab

**Bulk SMS Sender:**

**Recipient Input:**
- One phone number per line
- Format: `+61XXXXXXXXX`
- Or with name: `+61XXXXXXXXX,John Smith`
- Paste from CSV or spreadsheet

**Message Composition:**
- Text area for message
- Character counter
- Preview with opt-out text
- Checkbox: "Include opt-out instructions" (recommended: ON)

**Send Process:**
- Shows recipient count before sending
- Rate limiting: 200ms between messages
- Auto-skips opted-out numbers
- Results table shows success/failure per number

**Send Results:**
- ✓ Sent (green) - Successfully queued
- ✗ Failed (red) - Error occurred
- Shows error messages or delivery status
- Refresh stats after successful send

### 📨 SMS Logs Tab

**Message History:**
- All inbound and outbound SMS
- Direction indicators (📥 inbound / 📤 outbound)
- Timestamp (Australian format)
- From/To phone numbers
- Message content
- Delivery status

**Features:**
- Filtered views (inbound/outbound)
- Real-time status updates
- Refresh button
- Last 100 messages displayed

**Use Cases:**
- Monitor AI responses to guest questions
- Track bulk send delivery
- Review conversation history
- Audit messaging activity

## Statistics Details

### RSVP Stats

```typescript
{
  total: number;        // All RSVPs
  recent: number;       // Last 7 days
  list: Array<{
    name: string;
    email: string;
    phone: string;
    created_at: string;
  }>;
}
```

### Memory Stats

```typescript
{
  total: number;        // All memories
  approved: number;     // Publicly visible
  pending: number;      // Awaiting approval
  withPhotos: number;   // Has image_path or polaroid_path
  recent: number;       // Last 7 days
}
```

### SMS Stats

```typescript
{
  totalMessages: number;  // All SMS
  inbound: number;        // Received
  outbound: number;       // Sent
  bulkSent: number;       // From bulk sender
  optOuts: number;        // Unsubscribed numbers
  recent: number;         // Last 7 days
}
```

## Navigation

**Tab Structure:**
1. 📊 Dashboard - Overview & stats
2. 👥 RSVPs (count) - Guest list
3. 💭 Memories (count) - Memory management
4. 📤 Send SMS - Bulk messaging
5. 📨 SMS Logs - Message history

**Keyboard Navigation:**
- Click tabs to switch views
- Use browser back/forward (URL hash updates)

## Security

**Authentication:**
- Simple password protection
- Bearer token for API requests
- Session persists until page reload

**API Security:**
- Admin endpoints require `Authorization: Bearer reg2025memorial`
- Twilio webhooks verify signature
- Supabase uses service role key (admin access)
- RLS policies prevent public data access

**Password Management:**
- Change via ADMIN_PASSWORD environment variable
- Default: `reg2025memorial`
- Update in Netlify Dashboard → Environment Variables

## Best Practices

### Sending Bulk SMS

**Before Sending:**
1. Test with 1-2 numbers first
2. Review preview carefully
3. Keep messages under 160 characters when possible
4. Send during reasonable hours (9am-8pm AEDT)
5. Always include opt-out instructions

**After Sending:**
1. Check results table for failures
2. Review SMS logs for delivery status
3. Monitor opt-outs
4. Refresh dashboard stats

### Managing RSVPs

**Regular Tasks:**
1. Export list weekly for planning
2. Cross-reference with memories
3. Contact non-responders if needed
4. Update seating/catering numbers

**Privacy:**
- Don't share RSVP list publicly
- Protect email/phone data
- Use BCC for group emails
- Respect opt-out preferences for SMS

### Monitoring Activity

**Daily Checks:**
- Dashboard for new activity
- SMS logs for guest questions
- Pending memories (if manual approval)

**Weekly Review:**
- Total RSVP count
- Memory submissions
- SMS engagement
- Adjust communication strategy

## API Endpoints

### GET /.netlify/functions/admin-stats

**Purpose:** Retrieve all dashboard statistics

**Authentication:** Bearer token (admin password)

**Response:**
```json
{
  "rsvps": { "total": 25, "recent": 5, "list": [...] },
  "memories": { "total": 15, "approved": 15, "pending": 0, "withPhotos": 8, "recent": 3 },
  "sms": { "totalMessages": 45, "inbound": 20, "outbound": 25, "bulkSent": 15, "optOuts": 2, "recent": 12 },
  "activity": { "last7Days": { "rsvps": 5, "memories": 3, "sms": 12 } },
  "timestamp": "2025-12-17T10:30:00Z"
}
```

### GET /.netlify/functions/sms-logs

**Purpose:** Retrieve SMS message history

**Authentication:** Bearer token

**Response:**
```json
{
  "logs": [
    {
      "id": "uuid",
      "timestamp": "2025-12-17T10:00:00Z",
      "direction": "inbound",
      "from_number": "+61412345678",
      "to_number": "+61485009396",
      "message_body": "What time is the service?",
      "status": "received",
      "is_bulk": false
    }
  ]
}
```

### POST /.netlify/functions/sms-bulk-send

**Purpose:** Send bulk SMS

**Authentication:** Bearer token

**Request:**
```json
{
  "recipients": [
    { "phone": "+61412345678", "name": "John" }
  ],
  "message": "Event reminder...",
  "include_opt_out": true
}
```

**Response:** See SMS_SETUP.md

## Troubleshooting

### Stats Not Loading

**Symptoms:** Dashboard shows "Loading..." or "No statistics available"

**Solutions:**
1. Check browser console for errors
2. Verify ADMIN_PASSWORD is correct
3. Ensure all environment variables are set
4. Check Netlify function logs
5. Verify Supabase connection

### RSVPs Not Appearing

**Causes:**
- Supabase query error
- Table doesn't exist
- RLS policies too restrictive

**Fix:**
- Check Supabase dashboard → Table Editor
- Verify `rsvps` table exists
- Run schema migration if needed

### Memories Count Incorrect

**Causes:**
- Auto-approve setting
- Pending vs approved confusion

**Check:**
- MEMORIES_AUTO_APPROVE environment variable
- Supabase `memories` table → approved column
- Dashboard shows both approved + pending

### SMS Send Failures

**Common Issues:**
- Invalid phone format
- Twilio credentials incorrect
- Rate limiting
- Opted-out numbers

**Debug:**
- Check results table for specific errors
- Review Netlify function logs
- Verify Twilio balance
- Check phone number format (+61XXX)

## Mobile Access

**Responsive Design:**
- Optimized for tablets and phones
- Touch-friendly buttons
- Scrollable tables
- Collapsible sections

**Recommended:**
- Use landscape mode for tables
- iPad/tablet for best experience
- Desktop for bulk SMS operations

## Future Enhancements

**Potential Additions:**
- [ ] Export RSVPs to CSV
- [ ] Memory moderation UI (approve/reject)
- [ ] Charts & graphs for trends
- [ ] Scheduled SMS sending
- [ ] Email notifications for new RSVPs
- [ ] Page view tracking
- [ ] SMS templates library
- [ ] Automated event reminders
- [ ] Guest check-in system

## Support

**Getting Help:**
1. Check this documentation
2. Review DEPLOYMENT_CHECKLIST.md
3. Check SMS_SETUP.md for SMS issues
4. Review Netlify function logs
5. Check Supabase dashboard

**Common Resources:**
- Netlify Dashboard: https://app.netlify.com
- Supabase Dashboard: https://supabase.com/dashboard
- Twilio Console: https://console.twilio.com

**Documentation Files:**
- ADMIN_PORTAL.md (this file)
- SMS_SETUP.md - SMS system details
- STORAGE_SETUP.md - Image storage
- DEPLOYMENT_CHECKLIST.md - Deployment guide
- DEVELOPMENT.md - Development setup

---

**Last Updated:** December 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
