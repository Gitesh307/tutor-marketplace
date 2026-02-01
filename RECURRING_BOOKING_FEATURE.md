# Recurring Session Booking Feature

## Overview
Parents can now book multiple tutoring sessions at once with weekly or bi-weekly patterns, eliminating the need to book each session individually. The system creates all sessions in a single transaction and sends confirmation emails for the entire series.

## Implementation

### Frontend Component

**Component:** `BookableCalendar`  
**Location:** `/client/src/components/BookableCalendar.tsx`

**New Features:**
1. **Frequency Selector** - Choose between:
   - One-time session (single booking)
   - Weekly (every 7 days)
   - Bi-weekly (every 14 days)

2. **Session Count Input** - Specify number of sessions (2-52)

3. **Preview Table** - Shows all scheduled sessions before confirmation with:
   - Session number
   - Date
   - Time

4. **Smart Confirmation Dialog** - Adapts based on booking type:
   - Single session: Shows standard confirmation
   - Recurring: Shows table of all sessions with total count

### Backend API

**Endpoint:** `session.quickBookRecurring`  
**Type:** Parent-only protected procedure  
**Location:** `/server/routers.ts` (lines 814-925)

**Input:**
```typescript
{
  courseId: number;
  tutorId: number;
  sessions: Array<{
    scheduledAt: number; // Unix timestamp in milliseconds
  }>;
  duration: number; // Session duration in minutes
  notes?: string; // Optional booking notes
}
```

**Behavior:**
1. Checks if parent has an existing subscription for the course
2. Creates a new subscription if none exists (reuses existing if found)
3. Creates all sessions in a loop
4. Tracks successful and failed bookings
5. Sends confirmation email for the first session (representing the series)
6. Returns summary with session IDs and failure count

**Response:**
```typescript
{
  sessionIds: number[]; // IDs of successfully created sessions
  subscriptionId: number;
  totalBooked: number; // Number of successful bookings
  totalFailed: number; // Number of failed bookings
  failedSessions: number[]; // Session numbers that failed (1-indexed)
}
```

## Usage Example

### Weekly Sessions
Parent selects:
- Frequency: Weekly
- Number of Sessions: 8
- Start Date: Monday, January 27, 2026
- Time: 3:00 PM

Result: 8 sessions created, every Monday at 3 PM for 8 weeks

### Bi-weekly Sessions
Parent selects:
- Frequency: Bi-weekly
- Number of Sessions: 6
- Start Date: Wednesday, January 29, 2026
- Time: 4:30 PM

Result: 6 sessions created, every other Wednesday at 4:30 PM for 12 weeks

## User Experience Flow

1. **Select Booking Options**
   - Parent chooses frequency (one-time, weekly, bi-weekly)
   - If recurring, enters number of sessions

2. **Pick Start Date**
   - Calendar shows available dates
   - Selected date becomes the first session

3. **Choose Time Slot**
   - Grid of 30-minute slots from 8 AM to 8 PM
   - Click on preferred time

4. **Review Preview**
   - Confirmation dialog shows all scheduled sessions
   - Table displays session number, date, and time
   - Total session count displayed

5. **Confirm Booking**
   - Single click books all sessions
   - Toast notification shows success/failure count
   - Email confirmation sent to both parent and tutor

## Email Notifications

When recurring sessions are booked, the system sends:

1. **Parent Confirmation Email**
   - Details of the first session (representing the series)
   - Calendar invite (.ics attachment)
   - Note indicating this is part of a recurring series

2. **Tutor Notification Email**
   - Student/parent information
   - First session details
   - Calendar invite (.ics attachment)
   - Note about recurring nature of booking

## Error Handling

- **Partial Failures**: If some sessions fail to create, the system:
  - Creates all successful sessions
  - Returns list of failed session numbers
  - Shows warning toast with success/failure count
  - Allows parent to retry failed sessions

- **Empty Sessions Array**: Returns zero bookings without error

- **Subscription Reuse**: Automatically finds and reuses existing subscription for the same course

## Database Schema

Sessions are stored in the `sessions` table with:
- `subscriptionId` - Links to parent's subscription
- `tutorId` - Assigned tutor
- `parentId` - Booking parent
- `scheduledAt` - Unix timestamp of session start
- `duration` - Session length in minutes
- `status` - Default: 'scheduled'

All recurring sessions share the same `subscriptionId` and `tutorId`.

## Future Enhancements

1. **Custom Patterns** - Allow parents to select specific days of the week (e.g., "Monday and Wednesday")
2. **End Date Selection** - Choose end date instead of number of sessions
3. **Skip Holidays** - Automatically skip school holidays and breaks
4. **Bulk Rescheduling** - Reschedule entire series at once
5. **Series Management** - View, edit, or cancel all sessions in a series together
6. **Conflict Detection** - Check tutor availability before creating sessions
7. **Payment Plans** - Offer discounts for booking multiple sessions upfront

## Technical Notes

- Frontend calculates all session dates based on frequency and count
- Backend creates sessions sequentially (not in parallel) to maintain order
- Email is sent only for the first session to avoid spam
- Failed sessions don't roll back successful ones (partial success allowed)
- Subscription is created with `paymentStatus: 'pending'` if it doesn't exist
