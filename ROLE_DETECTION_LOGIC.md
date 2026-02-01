# Role Detection Logic for Enrollment Access

## Overview

The system uses a **database-backed role system** stored in the `users` table to control access to enrollment and other features. The role is checked at multiple levels: database, backend API, and frontend UI.

## Database Schema

### Users Table (`users`)

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  openId VARCHAR(64) NOT NULL UNIQUE,
  name TEXT,
  email VARCHAR(320),
  loginMethod VARCHAR(64),
  role ENUM('parent', 'tutor', 'admin') DEFAULT 'parent' NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

**Key Field**: `role` - An ENUM with three possible values:
- `'parent'` - Can enroll in courses, book sessions, manage children
- `'tutor'` - Can create courses, manage availability, teach sessions
- `'admin'` - Full system access (can act as both parent and tutor)

**Default**: New users are assigned `role = 'parent'` by default

## Role Detection Flow

### 1. Authentication & Session

**File**: `server/_core/context.ts`

When a user makes any API request:
1. The session cookie is read from the request
2. The JWT token is decoded to get the user's `openId`
3. The user record is fetched from the database
4. The `role` field is included in the user object
5. This user object (including role) is attached to `ctx.user`

### 2. Backend API Protection

**File**: `server/routers.ts` (lines 18-40)

Three middleware procedures enforce role-based access:

```typescript
// Only tutors and admins can access
const tutorProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'tutor' && ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Only tutors can access this resource' });
  }
  return next({ ctx });
});

// Only parents and admins can access
const parentProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'parent' && ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Only parents can access this resource' });
  }
  return next({ ctx });
});

// Only admins can access
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Only administrators can access this resource' });
  }
  return next({ ctx });
});
```

**Enrollment endpoints** use `parentProcedure` or check `ctx.user.role` directly.

### 3. Frontend Role Detection

**File**: `client/src/_core/hooks/useAuth.ts`

The `useAuth()` hook fetches user data via `trpc.auth.me.useQuery()`:

```typescript
export function useAuth(options?: UseAuthOptions) {
  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    user: meQuery.data ?? null,  // Contains { id, name, email, role, ... }
    loading: meQuery.isLoading,
    isAuthenticated: Boolean(meQuery.data),
  };
}
```

**File**: `server/routers.ts` (line 46)

The `auth.me` endpoint returns the current user from context:

```typescript
auth: router({
  me: publicProcedure.query(opts => opts.ctx.user),
  // ...
})
```

### 4. UI Conditional Rendering

**File**: `client/src/pages/CourseDetail.tsx` (lines 329-334)

The enrollment button is conditionally rendered based on role:

```typescript
{isAuthenticated ? (
  user?.role === "parent" ? (
    <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" size="lg" onClick={handleEnrollClick}>
          Enroll Now
        </Button>
      </DialogTrigger>
      {/* Enrollment dialog content */}
    </Dialog>
  ) : (
    <div className="text-center py-4">
      <p className="text-sm text-muted-foreground mb-3">
        Only parent accounts can enroll in courses
      </p>
      <Button asChild variant="outline" className="w-full">
        <Link href="/role-selection">
          Switch to Parent Account
        </Link>
      </Button>
    </div>
  )
) : (
  <Button asChild className="w-full" size="lg">
    <a href={getLoginUrl()}>Sign In to Enroll</a>
  </Button>
)}
```

**Logic**:
- If NOT authenticated → Show "Sign In to Enroll"
- If authenticated AND `user.role === "parent"` → Show "Enroll Now" button
- If authenticated AND `user.role !== "parent"` → Show "Only parent accounts can enroll" message

## Role Switching

### Update Role Endpoint

**File**: `server/routers.ts` (lines 52-68)

```typescript
updateRole: protectedProcedure
  .input(z.object({ role: z.enum(['parent', 'tutor']) }))
  .mutation(async ({ ctx, input }) => {
    const success = await db.updateUserRole(ctx.user.id, input.role);
    if (!success) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update role' });
    }
    
    // Send welcome email
    if (ctx.user.email && ctx.user.name) {
      sendWelcomeEmail({
        userEmail: ctx.user.email,
        userName: ctx.user.name,
        userRole: input.role,
      }).catch(console.error);
    }
    
    return { success: true };
  }),
```

### Database Update

**File**: `server/db.ts` (lines 126-136)

```typescript
export async function updateUserRole(userId: number, role: "parent" | "tutor" | "admin") {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.update(users).set({ role }).where(eq(users.id, userId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to update user role:", error);
    return false;
  }
}
```

**Process**:
1. User visits `/role-selection` page
2. Clicks "Continue as Parent" or "Continue as Tutor"
3. Frontend calls `trpc.auth.updateRole.mutate({ role: 'parent' })`
4. Backend updates `users.role` in database
5. **Important**: User must refresh or re-fetch `auth.me` to see updated role in UI

## Common Issues & Solutions

### Issue 1: Role Switch Doesn't Persist

**Symptom**: User clicks "Continue as Parent" but still sees "Only parent accounts can enroll"

**Cause**: The `useAuth()` hook caches the user data and doesn't automatically refetch after role update

**Solution**: After calling `updateRole`, explicitly refresh the auth state:

```typescript
const { refresh } = useAuth();
const updateRoleMutation = trpc.auth.updateRole.useMutation({
  onSuccess: () => {
    refresh(); // Force refetch of user data
    // or navigate to trigger remount
    setLocation('/courses');
  }
});
```

### Issue 2: Database Role Doesn't Match UI

**Symptom**: Database shows `role = 'parent'` but UI shows tutor role

**Diagnosis Steps**:
1. Check database: `SELECT id, name, email, role FROM users WHERE email = 'user@example.com';`
2. Check API response: Open browser console, run:
   ```javascript
   fetch('/api/trpc/auth.me').then(r => r.json()).then(console.log)
   ```
3. Check frontend state: Add console.log in CourseDetail.tsx:
   ```typescript
   console.log('Current user:', user, 'Role:', user?.role);
   ```

**Common Causes**:
- Browser cache holding old user data
- Multiple tabs with different sessions
- Session cookie not updated after role change

**Solutions**:
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Clear cookies and re-login
- Close all tabs and open a new session

### Issue 3: Admin Can't Enroll

**Symptom**: Admin users see "Only parent accounts can enroll"

**Cause**: The UI check is `user?.role === "parent"` which excludes admins

**Solution**: Update the condition to include admins:

```typescript
user?.role === "parent" || user?.role === "admin"
```

## Testing Role Detection

### Manual Testing

1. **Test as Parent**:
   ```sql
   UPDATE users SET role = 'parent' WHERE email = 'test@example.com';
   ```
   - Should see "Enroll Now" button
   - Should be able to access enrollment dialog
   - Should see tutor selection and availability

2. **Test as Tutor**:
   ```sql
   UPDATE users SET role = 'tutor' WHERE email = 'test@example.com';
   ```
   - Should see "Only parent accounts can enroll"
   - Should see "Switch to Parent Account" button
   - Should NOT be able to call enrollment endpoints

3. **Test as Admin**:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'test@example.com';
   ```
   - Currently behaves like tutor for enrollment
   - Has full access to admin dashboard
   - Can bypass role checks in backend

### Automated Testing

Create a test file `server/enrollment-access.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { appRouter } from './routers';

describe('Enrollment Access Control', () => {
  it('allows parents to enroll', async () => {
    const caller = appRouter.createCaller({
      user: { id: 1, role: 'parent', name: 'Test Parent', email: 'parent@test.com' },
      req: {} as any,
      res: {} as any,
    });
    
    // Should not throw
    await expect(caller.course.enrollWithoutPayment({
      courseId: 1,
      studentFirstName: 'John',
      studentLastName: 'Doe',
      studentGrade: '10',
    })).resolves.toBeDefined();
  });

  it('blocks tutors from enrolling', async () => {
    const caller = appRouter.createCaller({
      user: { id: 2, role: 'tutor', name: 'Test Tutor', email: 'tutor@test.com' },
      req: {} as any,
      res: {} as any,
    });
    
    // Should throw FORBIDDEN error
    await expect(caller.course.enrollWithoutPayment({
      courseId: 1,
      studentFirstName: 'John',
      studentLastName: 'Doe',
      studentGrade: '10',
    })).rejects.toThrow('FORBIDDEN');
  });
});
```

## Summary

**Role detection is a 4-layer system**:

1. **Database** (`users.role`): Source of truth
2. **Backend** (`ctx.user.role`): Enforces API access control
3. **Frontend** (`useAuth().user?.role`): Controls UI rendering
4. **Session** (JWT cookie): Carries role between requests

**For enrollment access**:
- Database must have `role = 'parent'` or `'admin'`
- Backend checks `ctx.user.role` in enrollment endpoints
- Frontend checks `user?.role === 'parent'` to show button
- All three layers must agree for enrollment to work

**Key takeaway**: If enrollment isn't working, check all three layers in order: Database → Backend API response → Frontend state.
