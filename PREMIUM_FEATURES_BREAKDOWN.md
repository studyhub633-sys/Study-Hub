# Premium Features Requirements Breakdown

## Overview
This document breaks down the client's requirements for premium features and "Coming Soon" features, organized by implementation status.

## 📊 Quick Summary

| Feature | Status | Action Needed |
|---------|--------|---------------|
| Grade 9 Premium Notes | ✅ Implemented | Add content (client will provide) |
| Unlimited AI Generation (Premium) | ✅ Implemented | None |
| Homework Tracker | ✅ Implemented | None |
| AI Study Plans | ✅ Implemented | None |
| Ad-Free Experience | ✅ Listed | Verify ad system integration |
| More Past Papers | ⚠️ Needs Content | Add to database |
| More Flashcards | ⚠️ Needs Content | Add to database |
| More Knowledge Organisers | ⚠️ Needs Content | Add to database |
| More AI Questions (Free) | ❓ Needs Clarification | Clarify requirement |
| Coming Soon: Work Experience | ✅ Displayed | Build feature later |
| Coming Soon: 2026 Papers | ✅ Displayed | Build feature later |

---

## ✅ **ALREADY IMPLEMENTED** (No Action Needed)

### 1. **Grade 9 Premium Notes**
- **Status**: ✅ Fully implemented
- **Location**: 
  - Database: `Frontend/supabase/add_premium_notes.sql`
  - UI: `Frontend/src/pages/Notes.tsx` (lines 166-190)
  - Premium page: Listed as feature #7
- **How it works**: Premium users can access Grade 9 notes from `global_premium_notes` table
- **Note**: Client mentioned they can provide the notes - these need to be inserted into the database

### 2. **Unlimited AI Question Generation (Premium)**
- **Status**: ✅ Fully implemented
- **Location**: 
  - Usage tracking: `Frontend/api/_utils/ai-usage.js` (lines 21-24)
  - Free limit: 50 requests/day
  - Premium limit: 10,000/day (effectively unlimited)
- **Premium page**: Feature #1 - "Unlimited AI Question Generation"

### 3. **Premium Homework Tracker with Notifications**
- **Status**: ✅ Fully implemented
- **Location**: `Frontend/src/pages/premium/HomeworkTracker.tsx`
- **Features**: 
  - Track homework assignments
  - Due date tracking
  - Notifications (UI shows days until due)
- **Premium page**: Feature #8 - "Homework Tracker"

### 4. **AI-Powered Study Plans**
- **Status**: ✅ Fully implemented
- **Location**: `Frontend/src/pages/premium/StudyPlans.tsx`
- **Features**: 
  - Input exam dates
  - AI generates personalized study schedules
- **Premium page**: Feature #9 - "AI-Powered Study Plans"

### 5. **Fully Ad-Free Experience**
- **Status**: ✅ Listed as premium feature
- **Premium page**: Feature #5 - "Fully Ad-Free Experience"
- **Note**: Implementation depends on ad system integration

### 6. **Unlimited AI Content Generation Highlight**
- **Status**: ✅ Already highlighted
- **Location**: `Frontend/src/pages/Premium.tsx` (lines 484-513)
- **Feature**: Large callout section at bottom of premium page

### 7. **Coming Soon Features Display**
- **Status**: ✅ Already displayed
- **Location**: `Frontend/src/pages/Premium.tsx` (lines 444-472)
- **Features shown**:
  - Scientia.ai Work Experience opportunities
  - 2026 Predicted Papers
- **Note**: Both have "Coming Soon" badges/icons

---

## 🔧 **NEEDS IMPLEMENTATION/UPDATES**

### 1. **More Past Papers** (Before Testing)
- **Status**: ⚠️ Needs content addition
- **Current State**: 
  - Database has past papers seeded in `global_past_papers` table
  - SQL file: `Frontend/supabase/global_past_papers.sql`
  - Currently includes AQA papers for: Mathematics, Biology, Chemistry, Physics, English Literature
  - Papers are from 2022-2024, mostly Higher tier
- **Action Required**: 
  - Add more past papers to `global_past_papers` table
  - Consider adding:
    - More exam boards (Edexcel, OCR, etc.)
    - Foundation tier papers
    - More years (2021, 2020, etc.)
    - More subjects
  - **How to add**: Insert new rows into `global_past_papers` table using the same format:
    ```sql
    INSERT INTO public.global_past_papers (title, subject, year, exam_board, file_url, file_type)
    VALUES 
    ('Paper Title', 'Subject', 2024, 'Exam Board', 'https://...', 'link');
    ```
  - After adding, run the backfill script (lines 441-456 in `global_past_papers.sql`) to add to existing users

### 2. **More Preset Flashcards/Knowledge Organisers** (Before Testing)
- **Status**: ⚠️ Needs content addition
- **Current State**:
  - **Flashcards**: `Frontend/supabase/global_flashcards.sql` has ~100+ flashcards
    - Subjects: Biology, Chemistry, Physics, Mathematics
    - Topics: Cell Biology, Infection, Photosynthesis, Atomic Structure, Forces, etc.
  - **Knowledge Organisers**: `Frontend/supabase/global_knowledge_organizers.sql` has some content
    - Need to check full content
- **Action Required**:
  - **Flashcards**: Add more flashcards to `global_flashcards` table
    - More subjects (History, Geography, English, etc.)
    - More topics within existing subjects
    - More advanced/detailed questions
  - **Knowledge Organisers**: Add more knowledge organisers to `global_knowledge_organizers` table
    - More comprehensive coverage of GCSE topics
    - More subjects
  - **How to add**: 
    - Flashcards: Insert into `global_flashcards` (front, back, subject, topic)
    - Knowledge Organisers: Insert into `global_knowledge_organizers` (title, subject, topic, content as JSONB)
  - After adding, run backfill scripts to add to existing users

### 3. **More AI Questions in Question Bank (Free Users Too)**
- **Status**: ⚠️ Needs clarification/implementation
- **Current State**: 
  - Free users: 50 AI requests/day
  - Premium: Unlimited (10,000/day)
- **Client Request**: "more ai questions in the question bank (and more for free also)"
- **Possible Interpretations**:
  - Increase free user limit (e.g., from 50 to 100/day)?
  - Add more preset/pre-generated questions to question bank?
  - Both?
- **Action Required**: Clarify with client what they mean by "more ai questions in the question bank"

### 4. **Grade 9 Notes Content**
- **Status**: ⚠️ Infrastructure ready, needs content
- **Action Required**: 
  - Client mentioned: "i can give you the notes"
  - Need to insert Grade 9 notes into `global_premium_notes` table
  - SQL file ready: `Frontend/supabase/add_premium_notes.sql`

---

## 📋 **FEATURE SUMMARY BY CATEGORY**

### **Active Premium Features** (Currently Available)
1. ✅ Unlimited AI Question Generation
2. ✅ Groq AI Study Suggestions
3. ✅ Instant Feedback
4. ✅ Progress Analytics
5. ✅ Fully Ad-Free Experience
6. ✅ Priority Support
7. ✅ Grade 9 Premium Notes (infrastructure ready)
8. ✅ Homework Tracker with Notifications
9. ✅ AI-Powered Study Plans

### **Coming Soon Premium Features** (Displayed with "Coming Soon" Badge)
1. ✅ Scientia.ai Work Experience Opportunities
2. ✅ Exclusive 2026 Predicted Papers

---

## 🎯 **IMMEDIATE ACTION ITEMS**

### **Before Testing** (Priority)
1. **Add more past papers** to `global_past_papers` table
   - Current: ~100+ AQA papers (2022-2024, mostly Higher)
   - Add: More boards, Foundation tier, older years, more subjects
   - File: `Frontend/supabase/global_past_papers.sql`
   
2. **Add more preset flashcards** to `global_flashcards` table
   - Current: ~100+ flashcards (Biology, Chemistry, Physics, Math)
   - Add: More subjects, more topics, more advanced content
   - File: `Frontend/supabase/global_flashcards.sql`
   
3. **Add more knowledge organisers** to `global_knowledge_organizers` table
   - Check current content first
   - Add: More comprehensive GCSE coverage, more subjects
   - File: `Frontend/supabase/global_knowledge_organizers.sql`
   
4. **Clarify "more AI questions" requirement** - what exactly does the client want?
   - Increase free user limit? (currently 50/day)
   - Add preset questions to question bank?
   - Both?

### **Content Addition** (Client to Provide)
1. **Grade 9 Notes** - Client will provide notes to insert into database

### **Future Development** (Coming Soon Features)
1. **Scientia.ai Work Experience** - Build out the feature
2. **2026 Predicted Papers** - Build out the feature

---

## 📝 **NOTES & CLARIFICATIONS NEEDED**

1. **"More AI questions in question bank"**: 
   - Does this mean increase free user limit?
   - Or add more preset questions?
   - Or both?

2. **Past Papers & Flashcards**: 
   - How many more are needed?
   - What subjects/topics should be prioritized?

3. **Grade 9 Notes**: 
   - When will the client provide the notes?
   - What format will they be in?

4. **Coming Soon Features**: 
   - When should these be developed?
   - Are they just placeholders for now, or should development start?

---

## 🔍 **CODE REFERENCES**

### Key Files to Review:
- **Premium Page**: `Frontend/src/pages/Premium.tsx`
- **Notes System**: `Frontend/src/pages/Notes.tsx`
- **AI Usage Tracking**: `Frontend/api/_utils/ai-usage.js`
- **Homework Tracker**: `Frontend/src/pages/premium/HomeworkTracker.tsx`
- **Study Plans**: `Frontend/src/pages/premium/StudyPlans.tsx`
- **Database Migrations**: `Frontend/supabase/` directory

### Database Tables:
- `global_premium_notes` - Grade 9 notes
- `global_past_papers` - Past papers
- `global_flashcards` - Preset flashcards
- `global_knowledge_organizers` - Knowledge organisers
- `ai_usage_tracking` - AI usage limits
- `homework` - Homework tracker data
- `study_plans` - Study plans data

