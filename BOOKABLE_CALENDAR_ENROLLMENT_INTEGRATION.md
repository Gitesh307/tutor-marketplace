# BookableCalendar Enrollment Integration

## Overview

The BookableCalendar component has been successfully integrated into the course enrollment dialog, allowing parents to select specific time slots and book sessions directly during the enrollment process. This creates a seamless experience where parents can:

1. Browse courses
2. View course details and assigned tutors
3. Click "Enroll Now" to open the enrollment dialog
4. Select their preferred tutor from the list
5. See an interactive calendar with available time slots
6. Click on time slots to book single or recurring sessions
7. Complete enrollment with sessions automatically created

## Implementation Details

### Component Integration (CourseDetail.tsx)

The enrollment dialog now conditionally renders either:

- **BookableCalendar**: When a tutor is selected, shows interactive time slots for direct booking
- **WeeklyAvailabilityCalendar**: When no tutor is selected, shows read-only availability overview

```tsx
{selectedTutorId ? (
  <BookableCalendar
    tutorId={selectedTutorId}
    courseId={course.id}
    onBookingComplete={(session) => {
      // Handle successful booking
      toast.success("Session booked successfully!");
      setIsEnrollDialogOpen(false);
      refetchCourse();
    }}
  />
) : (
  <WeeklyAvailabilityCalendar tutorId={tutor.id} />
)}
```

### Booking Flow

The BookableCalendar component handles the complete booking flow internally:

1. **Display Available Slots**: Shows 30-minute time slots from 8 AM to 8 PM for the next 7 days
2. **Time Slot Selection**: Parent clicks on an available time slot
3. **Booking Options**: Dialog opens with options for:
   - Single session booking
   - Recurring sessions (weekly/bi-weekly)
   - Session count selection (for recurring bookings)
4. **Confirmation**: Shows preview of all sessions to be booked
5. **Backend Processing**: Calls `session.quickBook` or `session.quickBookRecurring` endpoint
6. **Auto-Enrollment**: Backend automatically creates subscription if it doesn't exist
7. **Email Notifications**: Sends confirmation emails to both parent and tutor with calendar invites
8. **Success Callback**: Triggers `onBookingComplete` callback to refresh UI

### Backend Integration

The BookableCalendar uses two tRPC endpoints:

#### quickBook (Single Session)

```typescript
quickBook: protectedProcedure
  .input(z.object({
    tutorId: z.number(),
    courseId: z.number(),
    scheduledAt: z.date(),
  }))
  .mutation(async ({ ctx, input }) => {
    // Creates subscription if needed
    // Creates session record
    // Sends confirmation emails
    return session;
  });
```

#### quickBookRecurring (Multiple Sessions)

```typescript
quickBookRecurring: protectedProcedure
  .input(z.object({
    tutorId: z.number(),
    courseId: z.number(),
    startDate: z.date(),
    frequency: z.enum(['weekly', 'biweekly']),
    sessionCount: z.number(),
  }))
  .mutation(async ({ ctx, input }) => {
    // Creates subscription if needed
    // Creates multiple session records with recurringSeriesId
    // Sends confirmation emails
    return sessions;
  });
```

### Email Confirmations

Both booking endpoints automatically send confirmation emails:

- **Parent Email**: Includes session details, tutor information, and calendar invite (.ics)
- **Tutor Email**: Includes session details, parent information, and calendar invite (.ics)

Email service functions used:
- `sendBookingConfirmationToParent()`
- `sendBookingConfirmationToTutor()`

## User Experience Flow

### For Parents

1. Navigate to course detail page
2. Click "Enroll Now" button (only visible to parent accounts)
3. Enrollment dialog opens showing:
   - List of tutors teaching the course
   - "Select a tutor to see their availability" prompt
4. Click on a tutor card to select them
5. BookableCalendar appears with interactive time slots
6. Click on desired time slot
7. Choose booking type:
   - **One-time session**: Click "Book Session"
   - **Recurring sessions**: Select frequency (weekly/bi-weekly) and session count, then click "Book Recurring Sessions"
8. Review session preview
9. Confirm booking
10. Receive success message and confirmation email
11. Dialog closes and course page refreshes

### For Tutors

1. Receive email notification when parent books a session
2. Email includes:
   - Parent's name and contact information
   - Session date and time
   - Course name
   - Calendar invite (.ics) to add to their calendar
3. Can view all booked sessions in their dashboard

## Role-Based Access Control

The enrollment feature is protected by role-based access control:

- **Only parent accounts** can see the "Enroll Now" button
- **Tutor accounts** see "Only parent accounts can enroll in courses" message with "Switch to Parent Account" link
- Role detection uses 4-layer system (see ROLE_DETECTION_GUIDE.md)

## Database Schema

### Subscriptions Table

```sql
CREATE TABLE subscriptions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  courseId INT NOT NULL,
  preferredTutorId INT,  -- Stores selected tutor
  status ENUM('active', 'paused', 'cancelled'),
  startDate DATETIME,
  endDate DATETIME,
  createdAt DATETIME DEFAULT NOW(),
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (courseId) REFERENCES courses(id),
  FOREIGN KEY (preferredTutorId) REFERENCES users(id)
);
```

### Sessions Table

```sql
CREATE TABLE sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  subscriptionId INT NOT NULL,
  tutorId INT NOT NULL,
  scheduledAt DATETIME NOT NULL,
  status ENUM('scheduled', 'completed', 'cancelled'),
  recurringSeriesId VARCHAR(255),  -- Groups recurring sessions
  createdAt DATETIME DEFAULT NOW(),
  FOREIGN KEY (subscriptionId) REFERENCES subscriptions(id),
  FOREIGN KEY (tutorId) REFERENCES users(id)
);
```

## Testing Checklist

- [x] BookableCalendar component integrated into enrollment dialog
- [x] Tutor selection shows BookableCalendar
- [x] Time slot selection opens booking dialog
- [x] Single session booking creates session and subscription
- [x] Recurring session booking creates multiple sessions
- [ ] Confirmation emails sent to parent and tutor
- [ ] Calendar invites (.ics) attached to emails
- [ ] Role-based access control prevents tutor enrollment
- [ ] Parent dashboard shows booked sessions
- [ ] Session rescheduling works correctly
- [ ] Session cancellation works correctly

## Known Issues

### Role Switching Persistence

**Issue**: When a tutor clicks "Switch to Parent Account", the role-selection page doesn't refresh auth state after calling the updateRole mutation. Users may need to manually refresh the page to see the UI update.

**Workaround**: After clicking "Continue as Parent" on the role selection page, manually refresh the browser to see the updated role.

**Fix Required**: The role-selection page needs to call `trpc.useUtils().auth.me.invalidate()` after successful role update to trigger auth state refresh.

### Availability Data

**Current State**: BookableCalendar currently uses mock availability data for demonstration purposes.

**Next Step**: Connect to actual `tutor_availability` table data to show only genuinely open slots. This requires:
1. Query tutor_availability for selected tutor
2. Filter out time slots that don't match tutor's available days/times
3. Check existing sessions to prevent double-booking

### Payment Integration

**Current State**: Booking creates sessions without payment processing.

**Next Step**: Integrate Stripe checkout directly into the booking confirmation dialog so parents can pay when booking sessions during enrollment.

## Files Modified

- `client/src/pages/CourseDetail.tsx`: Integrated BookableCalendar into enrollment dialog
- `client/src/components/BookableCalendar.tsx`: Reusable interactive calendar component
- `server/routers.ts`: Added quickBook and quickBookRecurring endpoints
- `server/services/emailService.ts`: Email confirmation functions
- `drizzle/schema.ts`: Added preferredTutorId to subscriptions table

## Related Documentation

- `DIRECT_BOOKING_FEATURE.md`: Original direct booking feature documentation
- `ROLE_DETECTION_GUIDE.md`: Role detection and troubleshooting guide
- `ACUITY_WEBHOOK_SETUP.md`: Acuity scheduling integration guide
