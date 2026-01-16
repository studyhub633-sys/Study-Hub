# Testing Feedback Status

## ✅ **COMPLETED**
1. ✅ **UPGRADE NOW button at top of Premium page** - User has added this

## ⚠️ **NEEDS VERIFICATION/FIXES**

### 1. Dark Mode as Automatic Theme
- **Status**: ThemeContext defaults to dark (line 25), but may need to force it
- **Action**: Verify it's truly automatic on first load

### 2. Some Flashcards Available for Free
- **Status**: Unknown - need to check flashcard access logic
- **Action**: Review flashcard permissions

### 3. Access Premium Grade 9 Notes
- **Status**: Code fetches premium notes (Notes.tsx line 170-193), but may need UI indicator
- **Action**: Add clear UI section/indicator for premium notes

### 4. Past Papers Issues
- **Status**: Multiple issues:
  - Need more papers per subject
  - Need Foundation tier papers
  - Some papers don't load/work
- **Action**: Fix loading, add more papers, add Foundation tier

### 5. School Section on Settings
- **Status**: Unknown - need to check Settings page
- **Action**: Fix school section functionality

### 6. Mind Map Download Format
- **Status**: Unknown - need to find mind map feature
- **Action**: Change download to PNG/PDF instead of text

### 7. AI Message Formatting
- **Status**: Markdown characters (**, #) showing instead of formatted
- **Action**: Add markdown rendering to AI messages

### 8. AI Button on Homepage
- **Status**: Not working
- **Action**: Fix AI button functionality

### 9. Email Verification Name
- **Status**: Need to find where "Study Hub" appears
- **Action**: Change to "Scientia.ai"
