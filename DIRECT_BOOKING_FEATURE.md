# Direct Session Booking Feature

## Overview
Parents can now directly book tutoring sessions by clicking on available time slots in a tutor's calendar, creating instant bookings without going through a separate scheduling flow.

## Implementation

### Backend API

**Endpoint:** `session.quickBook`  
**Type:** Parent-only protected procedure  
**Location:** `/server/routers.ts` (lines 814-900)

**Input:**
```typescript
{
  courseId: number;
  tutorId: number;
  scheduledAt: number; // Unix timestamp in milliseconds
  duration: number; // Session duration in minutes
  notes?: string; // Optional booking notes
}
```

**Behavior:**
1. Checks if parent has an existing subscription for the course
2. Creates a new subscription if none exists (status: active, paymentStatus: pending)
3. Creates a session booking with the specified date/time
4. Sends confirmation emails to both parent and tutor
5. Returns `{ sessionId, subscriptionId }`

### Frontend Component

**Component:** `BookableCalendar`  
**Location:** `/client/src/components/BookableCalendar.tsx`

**Features:**
- Interactive calendar for date selection
- Grid of clickable time slots (8 AM - 8 PM, 30-minute intervals)
- Visual indicators for available vs unavailable slots
- Confirmation dialog showing session details before booking
- Responsive design for mobile devices

**Props:**
```typescript
{
  tutorId: number;
  tutorName: string;
  courseId: number;
  courseName: string;
  sessionDuration: number; // in minutes
  onBookingComplete: () => void;
}
```

## Usage

### In Tutor Profile Page
```tsx
import { BookableCalendar } from "@/components/BookableCalendar";

<BookableCalendar
  tutorId={tutor.id}
  tutorName={tutor.name}
  courseId={course.id}
  courseName={course.title}
  sessionDuration={60}
  onBookingComplete={() => {
    toast.success("Session booked successfully!");
    router.push("/dashboard");
  }}
/>
```

### In Course Enrollment Flow
```tsx
// After parent selects a tutor during enrollment
{selectedTutor && (
  <BookableCalendar
    tutorId={selectedTutor.id}
    tutorName={selectedTutor.name}
    courseId={course.id}
    courseName={course.title}
    sessionDuration={course.duration || 60}
    onBookingComplete={() => {
      // Handle post-booking actions
    }}
  />
)}
```

## Email Notifications

When a session is booked via `quickBook`, the system automatically sends:

1. **Parent Confirmation Email**
   - Session details (course, tutor, date/time, duration)
   - Calendar invite (.ics attachment)
   - Booking management link

2. **Tutor Notification Email**
   - Student/parent information
   - Session details
   - Calendar invite (.ics attachment)

## Payment Flow

- Sessions booked via `quickBook` create subscriptions with `paymentStatus: 'pending'`
- Parents can complete payment later through their dashboard
- Admin can track pending payments in the admin panel

## Future Enhancements

1. **Real-time availability checking** - Query tutor's actual availability from `tutor_availability` table
2. **Acuity integration** - Sync bookings with tutor's Acuity calendar if configured
3. **Payment at booking** - Add option to pay immediately during the booking flow
4. **Recurring sessions** - Allow parents to book multiple sessions at once
5. **Waitlist** - Enable parents to join a waitlist for fully booked time slots

## Technical Notes

- The `preferredTutorId` field uses `@ts-expect-error` due to a Drizzle ORM type mismatch (schema allows `null`, Insert type expects `undefined`). This is a known Drizzle issue and doesn't affect runtime behavior.
- Time slots are currently mock data (random availability). Implement `getTutorAvailabilityForDate()` in `db.ts` to fetch real availability.
- Sessions are created with `status: 'scheduled'` by default.
