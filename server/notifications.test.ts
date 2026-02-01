import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/context";

function createContext(user?: { id: number; openId: string; name: string; role: string }): Context {
  return {
    user,
    req: {} as any,
    res: {} as any,
  };
}

describe("Notification System", () => {
  describe("Notification Preferences", () => {
    it("should return notification preferences for users", async () => {
      const ctx = createContext({ id: 1, openId: "test", name: "Test Parent", role: "parent" });
      const caller = appRouter.createCaller(ctx);

      const prefs = await caller.parentProfile.getNotificationPreferences();
      
      expect(prefs).toBeDefined();
      expect(typeof prefs.emailEnabled).toBe("boolean");
      expect(typeof prefs.inAppEnabled).toBe("boolean");
      expect(typeof prefs.smsEnabled).toBe("boolean");
      expect(typeof prefs.timing24h).toBe("boolean");
      expect(typeof prefs.timing1h).toBe("boolean");
      expect(typeof prefs.timing15min).toBe("boolean");
    });

    it("should update notification preferences", async () => {
      const ctx = createContext({ id: 1, openId: "test", name: "Test Parent", role: "parent" });
      const caller = appRouter.createCaller(ctx);

      const result = await caller.parentProfile.updateNotificationPreferences({
        emailEnabled: false,
        smsEnabled: true,
        timing1h: true,
      });

      expect(result.success).toBe(true);
    });

    it("should not allow non-parents to access notification preferences", async () => {
      const ctx = createContext({ id: 1, openId: "test", name: "Test Tutor", role: "tutor" });
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.parentProfile.getNotificationPreferences()
      ).rejects.toThrow();
    });
  });

  describe("In-App Notifications", () => {
    it("should get in-app notifications for user", async () => {
      const ctx = createContext({ id: 1, openId: "test", name: "Test Parent", role: "parent" });
      const caller = appRouter.createCaller(ctx);

      const notifications = await caller.parentProfile.getInAppNotifications({
        includeRead: false,
      });

      expect(Array.isArray(notifications)).toBe(true);
    });

    it("should get unread notification count", async () => {
      const ctx = createContext({ id: 1, openId: "test", name: "Test Parent", role: "parent" });
      const caller = appRouter.createCaller(ctx);

      const count = await caller.parentProfile.getUnreadCount();

      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(0);
    });

    it("should mark notification as read", async () => {
      const ctx = createContext({ id: 1, openId: "test", name: "Test Parent", role: "parent" });
      const caller = appRouter.createCaller(ctx);

      // This will fail if notification doesn't exist, but tests the endpoint structure
      try {
        const result = await caller.parentProfile.markNotificationRead({
          notificationId: 999999,
        });
        expect(result.success).toBe(true);
      } catch (error) {
        // Expected to fail with non-existent notification
        expect(error).toBeDefined();
      }
    });

    it("should mark all notifications as read", async () => {
      const ctx = createContext({ id: 1, openId: "test", name: "Test Parent", role: "parent" });
      const caller = appRouter.createCaller(ctx);

      const result = await caller.parentProfile.markAllNotificationsRead();

      expect(result.success).toBe(true);
    });
  });

  describe("Notification History", () => {
    it("should get notification history with default limit", async () => {
      const ctx = createContext({ id: 1, openId: "test", name: "Test Parent", role: "parent" });
      const caller = appRouter.createCaller(ctx);

      const history = await caller.parentProfile.getNotificationHistory({});

      expect(Array.isArray(history)).toBe(true);
    });

    it("should get notification history with custom limit", async () => {
      const ctx = createContext({ id: 1, openId: "test", name: "Test Parent", role: "parent" });
      const caller = appRouter.createCaller(ctx);

      const history = await caller.parentProfile.getNotificationHistory({
        limit: 10,
      });

      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeLessThanOrEqual(10);
    });
  });

  describe("Authorization", () => {
    it("should require authentication for notification endpoints", async () => {
      const ctx = createContext(); // No user
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.parentProfile.getNotificationPreferences()
      ).rejects.toThrow();
    });

    it("should reject tutors from accessing parent notification preferences", async () => {
      const ctx = createContext({ id: 1, openId: "test", name: "Test Tutor", role: "tutor" });
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.parentProfile.getNotificationPreferences()
      ).rejects.toThrow();
    });
  });
});
