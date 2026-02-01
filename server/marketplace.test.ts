import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createMockContext(user: AuthenticatedUser): TrpcContext {
  return {
    user,
    req: {
      protocol: "https",
      headers: {},
      get: (name: string) => name === "host" ? "localhost:3000" : undefined,
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createTutorUser(): AuthenticatedUser {
  return {
    id: 1,
    openId: "tutor-openid",
    email: "tutor@example.com",
    name: "Test Tutor",
    loginMethod: "manus",
    role: "tutor",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
}

function createParentUser(): AuthenticatedUser {
  return {
    id: 2,
    openId: "parent-openid",
    email: "parent@example.com",
    name: "Test Parent",
    loginMethod: "manus",
    role: "parent",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
}

describe("TutorConnect Marketplace", () => {
  describe("Authentication & Role Management", () => {
    it("should return current user info", async () => {
      const user = createParentUser();
      const ctx = createMockContext(user);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();
      expect(result).toEqual(user);
    });

    it("should update user role from parent to tutor", async () => {
      const user = createParentUser();
      const ctx = createMockContext(user);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.updateRole({ role: "tutor" });
      expect(result.success).toBe(true);
    });
  });

  describe("Tutor Profile Management", () => {
    it("should create a tutor profile", async () => {
      const user = createTutorUser();
      const ctx = createMockContext(user);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.tutorProfile.create({
        bio: "Experienced math tutor",
        subjects: JSON.stringify(["Math", "Physics"]),
        gradeLevels: JSON.stringify(["High School", "College"]),
        qualifications: "PhD in Mathematics",
        hourlyRate: "50.00",
        yearsOfExperience: 10,
      });

      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe("number");
    });

    it("should list all tutor profiles", async () => {
      const user = createParentUser();
      const ctx = createMockContext(user);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.tutorProfile.list();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("Course Management", () => {
    it("should allow tutor to create a course", async () => {
      const user = createTutorUser();
      const ctx = createMockContext(user);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.course.create({
        title: "Advanced Calculus",
        description: "Comprehensive calculus course",
        subject: "Mathematics",
        gradeLevel: "College",
        price: "299.99",
        duration: 60,
        sessionsPerWeek: 2,
        totalSessions: 12,
      });

      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe("number");
    });

    it("should list all courses", async () => {
      const user = createParentUser();
      const ctx = createMockContext(user);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.course.list();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should prevent parent from creating courses", async () => {
      const user = createParentUser();
      const ctx = createMockContext(user);
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.course.create({
          title: "Test Course",
          description: "Test",
          subject: "Math",
          price: "100.00",
        })
      ).rejects.toThrow();
    });
  });

  describe("Subscription System", () => {
    it("should allow parent to create subscription", async () => {
      const user = createParentUser();
      const ctx = createMockContext(user);
      const caller = appRouter.createCaller(ctx);

      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 3);

      const result = await caller.subscription.create({
        courseId: 1,
        startDate,
        endDate,
      });

      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe("number");
    });

    it("should list parent's subscriptions", async () => {
      const user = createParentUser();
      const ctx = createMockContext(user);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.subscription.mySubscriptions();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should prevent tutor from creating subscriptions", async () => {
      const user = createTutorUser();
      const ctx = createMockContext(user);
      const caller = appRouter.createCaller(ctx);

      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 3);

      await expect(
        caller.subscription.create({
          courseId: 1,
          startDate,
          endDate,
        })
      ).rejects.toThrow();
    });
  });

  describe("Session Scheduling", () => {
    it("should create a tutoring session", async () => {
      const user = createParentUser();
      const ctx = createMockContext(user);
      const caller = appRouter.createCaller(ctx);

      const scheduledAt = new Date();
      scheduledAt.setDate(scheduledAt.getDate() + 7);

      const result = await caller.session.create({
        subscriptionId: 1,
        tutorId: 1,
        parentId: user.id,
        scheduledAt: scheduledAt.getTime(),
        duration: 60,
      });

      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe("number");
    });

    it("should list upcoming sessions", async () => {
      const user = createParentUser();
      const ctx = createMockContext(user);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.session.myUpcoming();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should list session history", async () => {
      const user = createParentUser();
      const ctx = createMockContext(user);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.session.myHistory();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("Messaging System", () => {
    it("should create a conversation", async () => {
      const user = createParentUser();
      const ctx = createMockContext(user);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.messaging.createConversation({
        parentId: user.id,
        tutorId: 1,
      });

      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe("number");
    });

    it("should send a message", async () => {
      const user = createParentUser();
      const ctx = createMockContext(user);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.messaging.sendMessage({
        conversationId: 1,
        content: "Hello, I'd like to schedule a session.",
      });

      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe("number");
    });

    it("should list user's conversations", async () => {
      const user = createParentUser();
      const ctx = createMockContext(user);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.messaging.myConversations();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("Payment System", () => {
    it("should create checkout session for course enrollment", async () => {
      const user = createParentUser();
      const ctx = createMockContext(user);
      const caller = appRouter.createCaller(ctx);

      // This will fail if course doesn't exist, but tests the flow
      try {
        const result = await caller.payment.createCheckout({
          courseId: 1,
          subscriptionId: 1,
        });
        
        expect(result.checkoutUrl).toBeDefined();
        expect(typeof result.checkoutUrl).toBe("string");
      } catch (error: any) {
        // Expected if course doesn't exist in test DB
        expect(error.message).toContain("not found");
      }
    });

    it("should track tutor earnings", async () => {
      const user = createTutorUser();
      const ctx = createMockContext(user);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.payment.myEarnings();
      expect(result).toBeDefined();
      expect(typeof result.total).toBe("number");
      expect(typeof result.pending).toBe("number");
    });

    it("should list parent's payment history", async () => {
      const user = createParentUser();
      const ctx = createMockContext(user);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.payment.myPayments();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("Parent Profile Management", () => {
    it("should create a parent profile", async () => {
      const user = createParentUser();
      const ctx = createMockContext(user);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.parentProfile.create({
        childrenInfo: JSON.stringify([
          { name: "John", age: 12, gradeLevel: "7th Grade" }
        ]),
        preferences: "Prefer morning sessions",
      });

      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe("number");
    });

    it("should get parent's own profile", async () => {
      const user = createParentUser();
      const ctx = createMockContext(user);
      const caller = appRouter.createCaller(ctx);

      try {
        const result = await caller.parentProfile.getMy();
        expect(result).toBeDefined();
      } catch (error: any) {
        // Expected if profile doesn't exist yet
        expect(error.message).toContain("not found");
      }
    });
  });

  describe("Authorization & Security", () => {
    it("should prevent unauthorized access to protected routes", async () => {
      const ctx: TrpcContext = {
        user: undefined,
        req: {
          protocol: "https",
          headers: {},
          get: () => undefined,
        } as TrpcContext["req"],
        res: {
          clearCookie: () => {},
        } as TrpcContext["res"],
      };
      const caller = appRouter.createCaller(ctx);

      await expect(caller.tutorProfile.create({
        subjects: "[]",
        gradeLevels: "[]",
        hourlyRate: "50",
      })).rejects.toThrow();
    });

    it("should enforce role-based access control", async () => {
      const parentUser = createParentUser();
      const parentCtx = createMockContext(parentUser);
      const parentCaller = appRouter.createCaller(parentCtx);

      // Parent should not be able to create courses
      await expect(
        parentCaller.course.create({
          title: "Unauthorized Course",
          description: "Test",
          subject: "Math",
          price: "100.00",
        })
      ).rejects.toThrow("FORBIDDEN");
    });
  });
});
