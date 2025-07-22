# LEARN-X Analytics Integration Guide

## Overview
This guide explains how to configure LEARN-X to send analytics events to the Glass LIMS analytics pipeline via PGMQ.

## Configuration Steps for LEARN-X

### 1. Environment Variables
Add these environment variables to your LEARN-X backend configuration:

```bash
# Glass LIMS Supabase Configuration (for analytics events)
GLASS_LIMS_SUPABASE_URL=https://fbcnvebsrbtgxxumrrma.supabase.co
GLASS_LIMS_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiY252ZWJzcmJ0Z3h4dW1ycm1hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDg2ODMwMiwiZXhwIjoyMDY2NDQ0MzAyfQ.W0sGDbmEDdTtFWaIqKxvOX58dn1N06qJQS1p97mTxvU

# Enable analytics (should be true for production)
ANALYTICS_ENABLED=true

# Optional: Business API for parallel event sending
# BUSINESS_API_URL=https://yourbusiness.com/api
# BUSINESS_API_KEY=your-api-key
```

### 2. Verify Event Emitter Configuration
The LEARN-X event emitter should already be configured to use these variables. Verify in `microlessons/backend/services/analytics/event_emitter.py`:

```python
# Should use Glass LIMS credentials when available
glass_lims_url = settings.glass_lims_supabase_url
glass_lims_key = settings.glass_lims_supabase_key
```

### 3. Test the Connection
Use the test endpoint to verify events are flowing:

```bash
# Test event emission
curl -X POST http://localhost:8000/analytics/test-event \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "test_event",
    "data": {
      "test": true,
      "timestamp": "2025-01-21T16:00:00Z"
    }
  }'
```

### 4. Verify in Glass LIMS
Check that events are being received:

```sql
-- Connect to Glass LIMS Supabase SQL Editor
-- Check recent events in queue
SELECT pgmq.read('analytics_events', 30, 10);

-- Check processed events
SELECT event_type, COUNT(*) 
FROM analytics_events 
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY event_type
ORDER BY COUNT(*) DESC;
```

## Event Flow Architecture

```
LEARN-X Frontend (analytics.ts)
    ↓ HTTP POST to /analytics/events
LEARN-X Backend (analytics.py router)
    ↓ Async task
LEARN-X Event Emitter (event_emitter.py)
    ↓ Supabase RPC call
Glass LIMS Supabase (PGMQ)
    ↓ Queue: analytics_events
Glass LIMS PGMQ Consumer
    ↓ Process & Store
Glass LIMS Analytics Dashboard
```

## Events Currently Being Tracked

Based on our investigation, LEARN-X is actively tracking:

### ✅ Authentication Events
- `USER_LOGIN` - When users log in
- `USER_LOGOUT` - When users log out
- `USER_REGISTERED` - When new users register
- `email_verified` - When users verify email

### ✅ Learning Engagement
- `LESSON_STARTED` - When lesson viewer opens
- `LESSON_PROGRESS` - At 25%, 50%, 75% milestones
- `LESSON_COMPLETED` - When lesson is completed
- `LESSON_ABANDONED` - When user leaves incomplete
- `SESSION_VIEWED` - When viewing learning sessions

### ✅ Interactive Features
- `TEXT_HIGHLIGHTED` - Text selection in lessons
- `NOTE_CREATED` - When notes are created
- `CHAT_MESSAGE_SENT` - Chat interactions
- Quiz events (started, answered, completed)
- Lesson ratings and feedback

### ✅ Voice & Audio
- `VOICE_GENERATED` - TTS generation
- `VOICE_PLAYED` - Audio playback

### ❌ Not Yet Implemented
- Subscription/payment events (no payment system yet)
- Some Canvas integration events
- Some onboarding flow events

## Troubleshooting

### Events Not Appearing in Glass LIMS?

1. **Check LEARN-X logs** for event emission errors:
   ```bash
   # Look for analytics errors in LEARN-X backend logs
   grep -i "analytics" logs/backend.log
   ```

2. **Verify environment variables** are set correctly:
   ```python
   # In LEARN-X Python shell
   from core.settings import settings
   print(settings.glass_lims_supabase_url)  # Should not be None
   print(settings.analytics_enabled)  # Should be True
   ```

3. **Check PGMQ queue directly**:
   ```sql
   -- In Glass LIMS Supabase SQL Editor
   SELECT pgmq.metrics('analytics_events');
   ```

4. **Verify the queue exists**:
   ```sql
   -- Should return queue information
   SELECT * FROM pgmq.meta WHERE queue_name = 'analytics_events';
   ```

### Common Issues

1. **Wrong RPC function name**: Ensure using `pgmq.send` not `pgmq_send`
2. **Missing credentials**: Both URL and service key must be set
3. **Network issues**: Check firewall/proxy settings
4. **Queue not created**: Run PGMQ setup migrations if needed

## Contact

For issues with the Glass LIMS analytics pipeline, contact the LIMS development team.