# Virtual Group Sessions - Logical Flow

## Overview
Virtual Group Sessions allow tutors/premium users to create scheduled revision sessions that students can register for and join via Jitsi Meet (free video conferencing).

## Complete Flow

### 1. **Setup Phase** (One-time)
- Run SQL migration: `Frontend/supabase/create_virtual_sessions_table.sql`
- Creates `virtual_sessions` table in Supabase
- Sets up Row Level Security (RLS) policies

### 2. **Session Creation Flow** (Premium Users/Tutors)
```
User clicks "Create Session" 
  → Dialog opens
  → User fills in:
     - Title (required)
     - Description (optional)
     - Subject (optional)
     - Tutor Name (required)
     - Scheduled Time (required)
     - Duration (default: 60 minutes)
     - Max Attendees (default: 50)
  → System generates unique meeting room ID
  → Creates Jitsi Meet URL: https://meet.jit.si/{room-id}
  → Saves to database
  → Session appears in "Upcoming Sessions"
```

### 3. **Registration Flow** (All Users)
```
User sees upcoming session
  → Clicks "Register Now"
  → System adds user ID to registered_users array
  → User sees "Registered" status
  → Can join when session time arrives
```

### 4. **Joining Session Flow** (Registered Users)
```
Session time arrives (or session is marked "live")
  → "Join Session" button appears
  → User clicks button
  → Opens Jitsi Meet in new window
  → User joins video call with tutor and other students
  → Can use video, audio, screen share, chat (all built into Jitsi)
```

### 5. **Session States**
- **upcoming**: Session is scheduled for future
- **live**: Session is currently happening
- **completed**: Session has ended
- **cancelled**: Session was cancelled

## Technical Implementation

### Database Schema
- `virtual_sessions` table stores all session data
- `meeting_room_id`: Unique identifier for Jitsi room
- `meeting_url`: Full Jitsi Meet URL
- `registered_users`: Array of user IDs who registered

### Jitsi Meet Integration
- **Free**: Uses public Jitsi Meet service (meet.jit.si)
- **No API keys needed**: Works out of the box
- **Features included**:
  - Video/audio calls
  - Screen sharing
  - Chat
  - Recording (if enabled)
  - Up to 75 participants per room

### Security
- RLS policies ensure:
  - Anyone can view upcoming/live sessions
  - Only creators can create/update/delete their sessions
  - Users can register for any session

## Why You're Seeing "No Sessions Scheduled"

**Current State:**
1. The `virtual_sessions` table doesn't exist yet (SQL migration not run)
2. OR the table exists but is empty (no sessions created)

**To Fix:**
1. **Run the SQL migration** in Supabase SQL Editor:
   - File: `Frontend/supabase/create_virtual_sessions_table.sql`
   - This creates the table structure

2. **Create a session** (if you're premium):
   - Click "Create Session" button
   - Fill in the form
   - Session will be saved to database

3. **Or use sample data** (for testing):
   - The code includes sample sessions that show when table doesn't exist
   - These are for demo purposes only

## Future Enhancements
- Embed Jitsi Meet directly in app (iframe)
- Session recordings
- Email notifications for registered users
- Calendar integration
- Session history/replay

