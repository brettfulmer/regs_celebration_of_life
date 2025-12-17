# SMS System Setup Guide

## Overview

Two-way SMS system for Reg's Celebration of Life memorial site:
- **Inbound**: AI-powered responses to questions sent to the Twilio number
- **Outbound**: Bulk SMS notifications from admin page

## Twilio Configuration

### 1. Webhook URLs

Configure these in your Twilio Console for phone number **+61485009396**:

**Messaging Configuration:**
- **A MESSAGE COMES IN**: 
  - Webhook: `https://regscelebrationoflife.netlify.app/.netlify/functions/sms-inbound`
  - HTTP Method: POST

- **STATUS CALLBACK URL** (optional but recommended):
  - Webhook: `https://regscelebrationoflife.netlify.app/.netlify/functions/sms-status`
  - HTTP Method: POST

### 2. Environment Variables

Set these in Netlify Dashboard → Site Settings → Environment Variables:

```
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_FROM_NUMBER=+61XXXXXXXXX
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ADMIN_PASSWORD=your_secure_password
```

## Admin Access

### Accessing the Admin Panel

1. Navigate to: `https://regscelebrationoflife.netlify.app/#admin-sms`
2. Enter password: `reg2025memorial`

### Admin Features

**Send Bulk SMS:**
- Add recipients (one per line): `+61XXXXXXXXX` or `+61XXXXXXXXX,Name`
- Compose message
- Auto-includes opt-out instructions
- Preview before sending
- View send results with delivery status

**View Logs:**
- See all inbound and outbound messages
- Track delivery status
- Monitor conversation history

## API Endpoints

### 1. POST /.netlify/functions/sms-inbound
**Purpose:** Twilio webhook for incoming SMS

**Request:** Twilio POST parameters (From, Body, MessageSid, etc.)

**Response:** TwiML with AI-generated reply

**Features:**
- Verifies Twilio signature
- AI-powered responses using OpenAI GPT-4o-mini
- Handles STOP/opt-out requests
- Logs all messages to Supabase

### 2. POST /.netlify/functions/sms-bulk-send
**Purpose:** Send bulk SMS from admin panel

**Authentication:** Bearer token (admin password)

**Request:**
```json
{
  "recipients": [
    {"phone": "+61412345678", "name": "John Smith"},
    {"phone": "+61498765432"}
  ],
  "message": "Your message here",
  "include_opt_out": true
}
```

**Response:**
```json
{
  "success": true,
  "total": 2,
  "sent": 2,
  "failed": 0,
  "results": [
    {
      "phone": "+61412345678",
      "name": "John Smith",
      "success": true,
      "messageSid": "SM...",
      "status": "queued"
    }
  ]
}
```

**Features:**
- Rate limiting (200ms between messages)
- Respects opt-outs
- Logs all sends
- Returns detailed results

### 3. POST /.netlify/functions/sms-status
**Purpose:** Twilio delivery status callback

**Request:** Twilio status parameters

**Response:** 200 OK

**Features:**
- Updates message status in Supabase
- Tracks delivery, failures, errors

### 4. GET /.netlify/functions/sms-logs
**Purpose:** Retrieve message logs for admin panel

**Authentication:** Bearer token (admin password)

**Response:**
```json
{
  "logs": [
    {
      "id": "uuid",
      "timestamp": "2025-12-17T10:30:00Z",
      "direction": "inbound",
      "from_number": "+61412345678",
      "to_number": "+61485009396",
      "message_body": "What time is the service?",
      "status": "received"
    }
  ]
}
```

## AI Response System

### System Prompt

The AI assistant knows:
- Event: Celebration of Life for Robert "Reg" Fulmer
- Date: Monday, 12th December 2025
- Time: 12:00 PM AEDT
- Venue: Horizons, South Maroubra Surf Life Saving Club
- Address: 1R Marine Parade, Maroubra NSW 2035
- Website: https://regscelebrationoflife.netlify.app/

### Response Guidelines

- Encourages RSVP via website
- Mentions livestream will be available (link on website)
- Provides helpful info about Maroubra area
- Politely redirects sensitive questions to organizers
- Keeps responses SMS-friendly (concise)

## Database Schema

### sms_logs table

```sql
id              uuid
timestamp       timestamptz
direction       text (inbound/outbound)
from_number     text
to_number       text
message_body    text
message_sid     text
status          text
error_message   text
is_bulk         boolean
created_at      timestamptz
```

### sms_opt_outs table

```sql
id              uuid
phone_number    text (unique)
opted_out_at    timestamptz
```

## Opt-Out Handling

**How it works:**
1. User texts: STOP, UNSUBSCRIBE, CANCEL, END, or QUIT
2. Number added to `sms_opt_outs` table
3. Confirmation sent: "You have been unsubscribed..."
4. Future bulk sends skip opted-out numbers
5. Inbound messages from opted-out numbers ignored

**Compliance:**
- All bulk messages include "Reply STOP to opt out"
- Opt-outs are permanent and logged
- Admin can view opt-out status in logs

## Testing

### Test Inbound SMS

1. Text the Twilio number: +61485009396
2. Send a question like: "What time is the service?"
3. Expect AI response within 10 seconds
4. Check admin logs to verify message logged

### Test Bulk Send

1. Go to admin panel
2. Add test recipient(s)
3. Compose short message
4. Check "Include opt-out instructions"
5. Click Send
6. Verify delivery in results table
7. Check phone for received SMS

### Test Opt-Out

1. Text "STOP" to +61485009396
2. Verify opt-out confirmation received
3. Check admin logs - number should be marked
4. Try bulk send to that number - should be skipped

## Troubleshooting

**No AI responses:**
- Check OPENAI_API_KEY is set
- Verify Twilio webhook URL is correct
- Check function logs in Netlify

**Bulk send fails:**
- Verify TWILIO credentials are correct
- Check phone number format (+61XXXXXXXXX)
- Ensure admin password is correct
- Check Netlify function logs

**Messages not logging:**
- Verify Supabase connection
- Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
- Run migration to create tables

## Production Deployment

1. **Deploy to Netlify:**
   ```bash
   git push origin main
   ```

2. **Set environment variables** in Netlify Dashboard

3. **Configure Twilio webhooks** to production URLs

4. **Test all flows:**
   - Inbound SMS → AI response
   - Bulk send → delivery
   - Opt-out → confirmation
   - Admin panel access

5. **Monitor logs** in Netlify Functions tab

## Security Notes

- Admin password is simple (reg2025memorial) - change for production
- Twilio signature verification prevents unauthorized webhook calls
- Admin endpoints require Bearer token authentication
- Supabase RLS policies prevent public access to logs
- Environment variables never exposed to client

## Support

For issues or questions:
- Check Netlify function logs
- Review Supabase table data
- Verify Twilio webhook configuration
- Test with diagnostic tools
