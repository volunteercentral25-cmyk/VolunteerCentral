# Email Verification System Setup Guide

This guide will help you set up the complete email verification system for the CATA Volunteer Central platform.

## Overview

The email verification system consists of:
1. **Flask Email Service** - Handles email sending and verification workflows
2. **Next.js Integration** - Proxy API routes and verification UI
3. **Database Schema** - Verification fields and email logging
4. **Email Templates** - Professional HTML email templates

## Prerequisites

- Node.js and npm installed
- Python 3.9+ installed
- Vercel account (for deployment)
- Gmail account with App Password (for SMTP)
- Supabase project with database access

## Step 1: Database Setup

The database is already configured with the necessary tables and fields. Verify that your `volunteer_hours` table has these columns:

```sql
-- Check if verification columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'volunteer_hours' 
AND column_name IN ('verification_email', 'verified_by', 'verification_date', 'verification_notes');
```

If any columns are missing, run this migration:

```sql
ALTER TABLE volunteer_hours 
ADD COLUMN verification_email TEXT,
ADD COLUMN verified_by TEXT,
ADD COLUMN verification_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN verification_notes TEXT;
```

## Step 2: Gmail SMTP Setup

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Save the 16-character password

## Step 3: Environment Variables

### For Next.js App (.env.local)
```bash
# Existing Supabase variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email Service URL (will be set after deployment)
EMAIL_SERVICE_URL=https://your-email-service.vercel.app
```

### For Flask Email Service (Vercel Environment Variables)
```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# SMTP Configuration
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_16_char_app_password

# Application Configuration
FRONTEND_URL=https://your-nextjs-app.vercel.app
SECRET_KEY=your_32_character_secret_key_here
```

## Step 4: Deploy Flask Email Service

1. **Navigate to the email service directory**:
   ```bash
   cd api/email-service
   ```

2. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

3. **Deploy to Vercel**:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

4. **Set Environment Variables in Vercel**:
   - Go to your Vercel dashboard
   - Select the email service project
   - Go to Settings → Environment Variables
   - Add all the environment variables listed above

## Step 5: Update Next.js App

1. **Update your Next.js app's environment variables**:
   ```bash
   # In your .env.local file
   EMAIL_SERVICE_URL=https://your-email-service.vercel.app
   ```

2. **Deploy your Next.js app** (if not already deployed):
   ```bash
   vercel --prod
   ```

## Step 6: Test the System

### 1. Test Email Service Health
```bash
curl https://your-email-service.vercel.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "email-verification-service"
}
```

### 2. Test Hours Logging
1. Log into your Next.js app
2. Go to the Hours page
3. Log some volunteer hours with an organizational email
4. Verify that the verification email is sent

### 3. Test Email Verification
1. Check the email sent to the verification address
2. Click the "Approve" or "Deny" button
3. Verify that the hours status is updated
4. Check that confirmation emails are sent

## Step 7: Monitor and Debug

### Check Email Logs
```sql
SELECT * FROM email_logs ORDER BY created_at DESC LIMIT 10;
```

### Check Hours Status
```sql
SELECT 
  id, 
  description, 
  hours, 
  status, 
  verification_email, 
  verified_by, 
  verification_date 
FROM volunteer_hours 
ORDER BY created_at DESC;
```

### Vercel Logs
```bash
vercel logs your-email-service
```

## Troubleshooting

### Common Issues

1. **Emails Not Sending**
   - Verify SMTP credentials
   - Check Gmail app password
   - Ensure 2FA is enabled
   - Check Vercel environment variables

2. **Token Verification Failing**
   - Verify SECRET_KEY is set correctly
   - Check token expiration (7 days)
   - Ensure FRONTEND_URL is correct

3. **Database Connection Issues**
   - Verify Supabase credentials
   - Check RLS policies
   - Ensure service role key has proper permissions

4. **Proxy API Issues**
   - Verify EMAIL_SERVICE_URL is correct
   - Check CORS settings
   - Ensure Flask service is running

### Debug Steps

1. **Check Flask Service Logs**:
   ```bash
   vercel logs your-email-service --follow
   ```

2. **Test Email Service Directly**:
   ```bash
   curl -X POST https://your-email-service.vercel.app/send-verification-email \
     -H "Content-Type: application/json" \
     -d '{
       "hours_id": "test-id",
       "verifier_email": "test@organization.com",
       "student_id": "test-student-id"
     }'
   ```

3. **Check Environment Variables**:
   ```bash
   vercel env ls your-email-service
   ```

## Security Considerations

### Email Security
- Use Gmail App Passwords (not regular passwords)
- Enable 2-Factor Authentication
- Use SMTP over TLS (port 587)

### Token Security
- Use a strong SECRET_KEY (32+ characters)
- Tokens expire after 7 days
- HMAC-based signatures prevent tampering

### Database Security
- Use Row Level Security (RLS) policies
- Service role key for admin operations only
- Validate all inputs

## Production Checklist

- [ ] Gmail 2FA enabled
- [ ] App password generated
- [ ] Environment variables set in Vercel
- [ ] Flask service deployed and tested
- [ ] Next.js app updated with EMAIL_SERVICE_URL
- [ ] Email verification workflow tested
- [ ] Error handling verified
- [ ] Logs monitored
- [ ] Security measures implemented

## Support

If you encounter issues:

1. **Check the logs** for detailed error messages
2. **Verify environment variables** are set correctly
3. **Test each component** individually
4. **Review the documentation** in `api/email-service/README.md`

## Next Steps

After successful setup:

1. **Customize email templates** if needed
2. **Set up monitoring** for email delivery rates
3. **Implement rate limiting** for production use
4. **Add analytics** for verification workflows
5. **Consider backup email providers** for redundancy

## Files Created/Modified

### New Files
- `api/email-service/flask_app.py` - Flask email service
- `api/email-service/requirements.txt` - Python dependencies
- `api/email-service/vercel.json` - Vercel configuration
- `api/email-service/README.md` - Service documentation
- `api/email-service/deploy.sh` - Deployment script
- `app/verify-hours/page.tsx` - Verification UI
- `app/api/email-service/[...path]/route.ts` - Proxy API route
- `app/api/student/hours/[id]/route.ts` - Individual hours API
- `app/api/student/profile/[id]/route.ts` - Profile API

### Modified Files
- `app/api/student/hours/route.ts` - Added email integration
- `app/(dashboard)/student/hours/page.tsx` - Added verification email field

The email verification system is now fully integrated and ready for production use!
