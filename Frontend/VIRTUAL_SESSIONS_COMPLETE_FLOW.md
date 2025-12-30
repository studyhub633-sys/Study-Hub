# Virtual Group Sessions - Complete Flow

## Overview
Virtual Group Sessions now follow this complete flow:
1. **Empty State** → User sees no sessions
2. **Create New** → User creates a session and links resources
3. **Email Verification** → System sends verification email
4. **Verification** → User verifies via email link
5. **Session Visible** → Session appears for all users

## Complete Flow Diagram

```
Empty State
    ↓
Create Session Dialog
    ├─ Fill Basic Info (title, tutor, time, etc.)
    ├─ Select Resources (past papers, knowledge organizers, flashcards)
    └─ Submit
        ↓
Session Created (email_verified = false)
    ↓
Verification Email Sent
    ├─ Contains session details
    ├─ Contains verification link
    └─ Contains meeting URL
        ↓
User Clicks Verification Link
    ↓
Session Verified (email_verified = true)
    ↓
Session Visible to All Users
    ├─ Shows linked resources
    ├─ Users can register
    └─ Users can join when time arrives
```

## Implementation Details

### 1. Database Schema
The `virtual_sessions` table includes:
- **Basic Info**: title, description, subject, tutor_name, scheduled_time
- **Meeting Info**: meeting_room_id, meeting_url, max_attendees
- **Resource Links**: 
  - `linked_past_papers` (UUID array)
  - `linked_knowledge_organizers` (UUID array)
  - `linked_flashcards` (UUID array)
- **Verification**: `email_verified`, `verification_token`
- **Status**: upcoming, live, completed, cancelled

### 2. Resource Selection
When creating a session:
- System fetches user's resources:
  - Past Papers (up to 50 most recent)
  - Knowledge Organizers (up to 50 most recent)
  - Flashcards (grouped by topic/subject, up to 100)
- User can select multiple resources via checkboxes
- Resources are categorized by type with icons

### 3. Email Verification
- After session creation, verification email is sent
- Email contains:
  - Session title and details
  - Scheduled time
  - Meeting URL
  - Verification link
- Session is hidden from public until verified
- Creator can see their unverified sessions

### 4. Display
- Verified sessions show:
  - Linked resources count (badges)
  - Registration count
  - Join/Register buttons
- Unverified sessions (creator only):
  - Shows "Pending Verification" status
  - Not visible to other users

## API Endpoints

### Email Verification
- **Endpoint**: `/api/email/send-verification`
- **Method**: POST
- **Body**: 
  ```json
  {
    "sessionId": "uuid",
    "sessionTitle": "Session Title",
    "scheduledTime": "ISO date string",
    "meetingUrl": "https://meet.jit.si/room-id"
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "message": "Verification email sent",
    "verificationToken": "token"
  }
  ```

## Next Steps (To Complete Email Integration)

1. **Integrate Email Service**:
   - Add Resend, SendGrid, or Supabase Email
   - Update `/api/email/send-verification.js` to actually send emails
   - Configure email templates

2. **Create Verification Page**:
   - Create `/verify-session` route
   - Verify token and update session
   - Show success/error message

3. **Email Template**:
   - Professional HTML email template
   - Include session details
   - Include verification button
   - Include meeting link

## Current Status

✅ **Completed**:
- Database schema with resource links
- Resource fetching and selection UI
- Session creation with resource linking
- Email verification API endpoint (structure)
- Display of linked resources
- RLS policies for verified/unverified sessions

⏳ **Pending**:
- Actual email sending (needs email service integration)
- Verification page/route
- Email template design

## Usage

1. **Run SQL Migration**: Execute `Frontend/supabase/create_virtual_sessions_table.sql`
2. **Create Session**: 
   - Click "Create Session"
   - Fill in details
   - Select resources (optional)
   - Submit
3. **Verify Session**: 
   - Check email for verification link
   - Click link to verify
   - Session becomes visible to all users
4. **Register/Join**: 
   - Users can register for verified sessions
   - Join when session time arrives

