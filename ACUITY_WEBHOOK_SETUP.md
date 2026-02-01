# Acuity Scheduling Webhook Setup Guide

This guide explains how to configure Acuity Scheduling webhooks to automatically send booking confirmation emails to both parents and tutors.

## Overview

The system automatically sends professional confirmation emails when appointments are booked through Acuity Scheduling:

- **Parent Email**: Confirmation with session details, calendar invite, and booking management link
- **Tutor Email**: Notification with student/parent info, session details, and calendar invite

## Webhook Endpoint

```
POST /api/acuity/webhook
```

Features:
- Receives Acuity webhook events (scheduled, rescheduled, canceled, changed)
- Verifies webhook signature using HMAC-SHA256
- Fetches full appointment details from Acuity API
- Creates/updates session records in the database
- Sends confirmation emails to both parent and tutor

## Setup Instructions

### Step 1: Configure Environment Variables

Ensure these variables are set (already configured in your Manus project):
- `ACUITY_API_KEY` - Your Acuity API key
- `ACUITY_USER_ID` - Your Acuity user ID

### Step 2: Register Webhook in Acuity

1. Log in to [Acuity Scheduling](https://secure.acuityscheduling.com/)
2. Go to **Business Settings** → **Integrations** → **Webhooks**
3. Click **"Add Webhook"**
4. Enter your webhook URL:
   ```
   https://your-domain.manus.space/api/acuity/webhook
   ```
5. Select events to trigger:
   - ✅ **appointment.scheduled** (required)
   - ✅ **appointment.rescheduled** (recommended)
   - ✅ **appointment.canceled** (recommended)
6. Click **"Save"**

### Step 3: Test the Webhook

1. In Acuity, click **"Test"** next to your webhook
2. Select **"appointment.scheduled"** event
3. Click **"Send Test"**
4. Check server logs for:
   ```
   [Acuity Webhook] Received scheduled event for appointment #...
   [Acuity Webhook] Sent confirmation email to parent: ...
   [Acuity Webhook] Sent notification email to tutor: ...
   ```

## Email Templates

### Parent Confirmation Email

Includes:
- 🎓 Session details (student, course, tutor, date/time, duration)
- 📅 Calendar invite (.ics file)
- 🔗 Booking management link (reschedule/cancel)
- 📊 Dashboard link
- Customizable branding (colors, logo, company name)

### Tutor Notification Email

Includes:
- 📚 Session details (student, parent contact, course, date/time, duration)
- 📅 Calendar invite (.ics file)
- 📊 Dashboard link
- 📧 Parent contact information

## Security

The webhook endpoint verifies all incoming requests:

- **Header**: `x-acuity-signature`
- **Secret**: `ACUITY_API_KEY` environment variable
- **Algorithm**: HMAC-SHA256 with base64 encoding

Invalid signatures are rejected with 401 Unauthorized.

## Troubleshooting

### Webhook Not Receiving Events

1. Verify webhook URL is publicly accessible (not localhost)
2. Check URL uses HTTPS (port 443) or HTTP (port 80)
3. Test with curl:
   ```bash
   curl -d "action=scheduled&id=1&calendarID=1&appointmentTypeID=1" \
     "https://your-domain.manus.space/api/acuity/webhook"
   ```

### Signature Verification Failing

1. Verify `ACUITY_API_KEY` is set correctly
2. Check server logs for `[Acuity Webhook] Invalid signature`
3. Ensure raw request body is preserved before parsing

### Emails Not Sending

1. Check SMTP configuration in `server/emailService.ts`
2. Verify email credentials are configured
3. Check server logs for email sending errors
4. Note: In development, emails are logged but not sent

### Parent/Tutor Not Found

Check server logs for warnings:
```
[Acuity Webhook] Parent not found for email: ...
[Acuity Webhook] No primary tutor found for course ...
```

Solutions:
- Ensure parent email in Acuity matches email in users table
- Verify parent has `role='parent'` in database
- Check tutor is assigned to the course

## Webhook Retry Logic

Acuity automatically retries failed webhooks:

| Retry | Interval |
|-------|----------|
| 1     | 2 seconds |
| 2     | 30 seconds |
| 3     | 1 minute |
| 4     | 5 minutes |
| 5     | 10 minutes |
| 6     | 15 minutes |
| 7     | 30 minutes |
| 8     | 1 hour |
| 9     | 12 hours |

⚠️ **Important**: If webhooks fail continuously for 5 days, Acuity will disable them. Re-enable manually in Integrations page.

## Testing Checklist

- [ ] `ACUITY_API_KEY` and `ACUITY_USER_ID` are configured
- [ ] Webhook registered in Acuity Integrations page
- [ ] Test appointment triggers webhook successfully
- [ ] Parent receives confirmation email with calendar invite
- [ ] Tutor receives notification email with calendar invite
- [ ] Session created in database
- [ ] Booking management link works

## Support Resources

- **Acuity API Docs**: https://developers.acuityscheduling.com/
- **Acuity Help Center**: https://help.acuityscheduling.com/
- **Email Service**: Check SMTP provider documentation
