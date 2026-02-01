# Enrollment Flow with Tutor Selection & Availability

## Overview

The course enrollment flow includes comprehensive tutor selection and availability display features. Parents can choose their preferred tutor and view their availability before enrolling.

## Features Implemented

### 1. Tutor Selection in Enrollment Dialog

When a parent clicks "Enroll Now" on a course detail page, they see:

- **List of Available Tutors**: All tutors teaching the course are displayed as selectable cards
- **Tutor Information**: Each card shows:
  - Tutor name and avatar
  - Hourly rate
  - Selection indicator (badge when selected)

### 2. Availability Display

When a tutor is selected:

- **Weekly Availability Calendar**: Shows the tutor's weekly schedule with:
  - Days of the week (Sun-Sat)
  - Available time periods (Morning, Afternoon, Evening)
  - Visual indicators for available days

- **Acuity Integration**: If the tutor has an Acuity scheduling link configured:
  - A link to "View Full Schedule & Book on Acuity" appears
  - Opens in a new tab for real-time availability and booking

### 3. Student Information

After selecting a tutor (optional), parents provide:
- Student first name and last name
- Student grade level
- Option to select from previously enrolled students

### 4. Payment Options

Three payment methods available:
- **Pay in Full**: Complete payment via Stripe
- **Pay in 2 Installments**: Split payment (for courses over $500)
- **Pay Later**: Enroll now, pay from dashboard later

## Code Location

**File**: `client/src/pages/CourseDetail.tsx`

**Key Sections**:
- Lines 345-400: Tutor selection UI
- Lines 379-384: Weekly availability calendar display
- Lines 385-397: Acuity scheduling link integration

## How to Test

### Option 1: Use Parent Account

1. Navigate to `/role-selection`
2. Click "Continue as Parent"
3. Go to any course detail page (e.g., `/course/150001`)
4. Click "Enroll Now"
5. Select a tutor from the list
6. View their availability calendar or Acuity link
7. Fill in student information
8. Choose payment method

### Option 2: Create New Parent Account

1. Sign out if logged in
2. Create a new account and select "I'm a Parent" role
3. Browse courses and click "Enroll Now"
4. Follow the enrollment flow

## Troubleshooting

### "Only parent accounts can enroll" Message

**Cause**: User is logged in with a tutor role

**Solution**:
1. Go to `/role-selection`
2. Click "Continue as Parent"
3. Return to course page

**Note**: If the role switch doesn't persist, check:
- Browser cookies are enabled
- Session storage is working
- Database `users` table has correct `role` value

### No Tutors Showing in Enrollment Dialog

**Cause**: Course has no assigned tutors

**Solution**:
1. Go to Admin Dashboard → Courses
2. Edit the course
3. Assign at least one tutor to the course

### No Availability Data Showing

**Cause**: Selected tutor has no availability records

**Solution**:
1. Tutor should set their availability in Tutor Dashboard
2. Or admin can add availability via database:
   ```sql
   INSERT INTO tutor_availability (tutorId, dayOfWeek, timeOfDay, isAvailable)
   VALUES (1, 'monday', 'morning', 1);
   ```

## API Endpoints Used

- `course.getTutorsWithAvailability`: Fetches tutors and their availability for a course
- `course.createCheckoutSession`: Creates Stripe checkout with selected tutor
- `course.enrollWithoutPayment`: Enrolls without immediate payment
- `course.enrollWithInstallment`: Creates installment payment plan

## Database Schema

### Subscriptions Table
- `preferredTutorId`: Stores the parent's preferred tutor selection

### Tutor Availability Table
- `tutorId`: References user ID
- `dayOfWeek`: Monday-Sunday
- `timeOfDay`: morning, afternoon, evening
- `isAvailable`: Boolean flag

### Tutor Profiles Table
- `acuityLink`: Optional Acuity scheduling URL

## Next Steps

1. **Add Time Slot Selection**: Integrate BookableCalendar component to allow parents to select specific time slots during enrollment
2. **Show Tutor Ratings**: Display tutor ratings and reviews in the selection cards
3. **Filter by Availability**: Add option to filter tutors by specific days/times the parent needs
