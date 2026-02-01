import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";
import type { TrpcContext } from "./_core/context";

describe("session.quickBookRecurring", () => {
  let parentUserId: number;
  let tutorUserId: number;
  let courseId: number;

  beforeAll(async () => {
    // Create test parent user
    parentUserId = await db.createUser({
      openId: "test-parent-recurring-" + Date.now(),
      name: "Test Parent",
      email: "parent-recurring@test.com",
      role: "parent",
    }) || 0;

    // Create test tutor user
    tutorUserId = await db.createUser({
      openId: "test-tutor-recurring-" + Date.now(),
      name: "Test Tutor",
      email: "tutor-recurring@test.com",
      role: "tutor",
    }) || 0;

    // Create test course
    courseId = await db.createCourse({
      title: "Test Recurring Course",
      description: "Course for testing recurring bookings",
      subject: "Mathematics",
      price: "50.00",
      duration: 60,
      isActive: true,
    }) || 0;

    // Link tutor to course
    await db.addTutorToCourse(courseId, tutorUserId);
  });

  afterAll(async () => {
    // Cleanup: delete test data
    const database = await db.getDb();
    if (database) {
      // Delete sessions, subscriptions, course, and users created during test
      await database.execute(`DELETE FROM sessions WHERE parentId = ${parentUserId}`);
      await database.execute(`DELETE FROM subscriptions WHERE parentId = ${parentUserId}`);
      await database.execute(`DELETE FROM course_tutors WHERE courseId = ${courseId}`);
      await database.execute(`DELETE FROM courses WHERE id = ${courseId}`);
      await database.execute(`DELETE FROM users WHERE id IN (${parentUserId}, ${tutorUserId})`);
    }
  });

  it("should book multiple recurring sessions (weekly)", async () => {
    const ctx: TrpcContext = {
      user: {
        id: parentUserId,
        openId: "test-parent",
        email: "parent-recurring@test.com",
        name: "Test Parent",
        loginMethod: "manus",
        role: "parent",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: {} as any,
      res: {} as any,
    };
    const caller = appRouter.createCaller(ctx);

    const now = new Date();
    const sessions = [];
    
    // Create 4 weekly sessions
    for (let i = 0; i < 4; i++) {
      const sessionDate = new Date(now);
      sessionDate.setDate(sessionDate.getDate() + (i * 7)); // Weekly
      sessionDate.setHours(14, 0, 0, 0); // 2 PM
      sessions.push({ scheduledAt: sessionDate.getTime() });
    }

    const result = await caller.session.quickBookRecurring({
      courseId,
      tutorId: tutorUserId,
      sessions,
      duration: 60,
      notes: "Test recurring booking",
    });

    expect(result).toBeDefined();
    expect(result.totalBooked).toBe(4);
    expect(result.totalFailed).toBe(0);
    expect(result.sessionIds).toHaveLength(4);
    expect(result.subscriptionId).toBeGreaterThan(0);
  });

  it("should book multiple recurring sessions (bi-weekly)", async () => {
    const ctx: TrpcContext = {
      user: {
        id: parentUserId,
        openId: "test-parent",
        email: "parent-recurring@test.com",
        name: "Test Parent",
        loginMethod: "manus",
        role: "parent",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: {} as any,
      res: {} as any,
    };
    const caller = appRouter.createCaller(ctx);

    const now = new Date();
    const sessions = [];
    
    // Create 3 bi-weekly sessions
    for (let i = 0; i < 3; i++) {
      const sessionDate = new Date(now);
      sessionDate.setDate(sessionDate.getDate() + (i * 14)); // Bi-weekly
      sessionDate.setHours(15, 30, 0, 0); // 3:30 PM
      sessions.push({ scheduledAt: sessionDate.getTime() });
    }

    const result = await caller.session.quickBookRecurring({
      courseId,
      tutorId: tutorUserId,
      sessions,
      duration: 90,
    });

    expect(result).toBeDefined();
    expect(result.totalBooked).toBe(3);
    expect(result.totalFailed).toBe(0);
    expect(result.sessionIds).toHaveLength(3);
  });

  it("should reuse existing subscription for recurring bookings", async () => {
    const ctx: TrpcContext = {
      user: {
        id: parentUserId,
        openId: "test-parent",
        email: "parent-recurring@test.com",
        name: "Test Parent",
        loginMethod: "manus",
        role: "parent",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: {} as any,
      res: {} as any,
    };
    const caller = appRouter.createCaller(ctx);

    // First booking creates subscription
    const now = new Date();
    const firstSessions = [
      { scheduledAt: new Date(now.getTime() + 1000 * 60 * 60 * 24).getTime() }, // Tomorrow
    ];

    const firstResult = await caller.session.quickBookRecurring({
      courseId,
      tutorId: tutorUserId,
      sessions: firstSessions,
      duration: 60,
    });

    const firstSubscriptionId = firstResult.subscriptionId;

    // Second booking should reuse subscription
    const secondSessions = [
      { scheduledAt: new Date(now.getTime() + 1000 * 60 * 60 * 48).getTime() }, // 2 days later
    ];

    const secondResult = await caller.session.quickBookRecurring({
      courseId,
      tutorId: tutorUserId,
      sessions: secondSessions,
      duration: 60,
    });

    expect(secondResult.subscriptionId).toBe(firstSubscriptionId);
  });

  it("should handle empty sessions array", async () => {
    const ctx: TrpcContext = {
      user: {
        id: parentUserId,
        openId: "test-parent",
        email: "parent-recurring@test.com",
        name: "Test Parent",
        loginMethod: "manus",
        role: "parent",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: {} as any,
      res: {} as any,
    };
    const caller = appRouter.createCaller(ctx);

    const result = await caller.session.quickBookRecurring({
      courseId,
      tutorId: tutorUserId,
      sessions: [],
      duration: 60,
    });

    expect(result.totalBooked).toBe(0);
    expect(result.totalFailed).toBe(0);
    expect(result.sessionIds).toHaveLength(0);
  });
});
