# Supabase Email Branding Configuration

## Issue
Email verification emails currently show "Study Hub" instead of "Scientia.ai"

## Solution
The email branding is configured in the Supabase Dashboard. To change it:

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Email Templates**
3. Update the following templates:
   - **Confirm signup** - Change "Study Hub" to "Scientia.ai"
   - **Magic Link** - Change "Study Hub" to "Scientia.ai"  
   - **Change Email Address** - Change "Study Hub" to "Scientia.ai"
   - **Reset Password** - Change "Study Hub" to "Scientia.ai"

4. In each template, look for:
   - Subject line: Update any references to "Study Hub"
   - Email body: Update any references to "Study Hub"
   - Footer: Update company name to "Scientia.ai"

## Alternative: Custom SMTP
If you want more control, you can:
1. Set up custom SMTP in Supabase (Settings → Auth → SMTP Settings)
2. Use a service like Resend, SendGrid, or AWS SES
3. Configure custom email templates with full branding control

## Code Changes Made
- Updated Signup.tsx success message to mention "Scientia.ai"
- All code references now use "Scientia.ai"

## Note
The actual email sender name and branding must be changed in Supabase Dashboard as it's not configurable via code.
