import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

describe("Tutor Availability Management", () => {
  let adminUser: AuthenticatedUser;
  let tutorUser: AuthenticatedUser;
  let parentUser: AuthenticatedUser;

  function createContext(user: AuthenticatedUser | null): TrpcContext {
    return {
      user,
      req: {} as any,
      res: {} as any,
    };
  }

  beforeAll(async () => {
    adminUser = {
      id: 999,
      openId: "admin-test-openid",
      name: "Admin User",
      email: "admin@test.com",
      role: "admin" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    tutorUser = {
      id: 998,
      openId: "tutor-test-openid",
      name: "Test Tutor",
      email: "tutor@test.com",
      role: "tutor" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    parentUser = {
      id: 997,
      openId: "parent-test-openid",
      name: "Test Parent",
      email: "parent@test.com",
      role: "parent" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  describe("admin.getTutorAvailability", () => {
    it("should allow admin to get tutor availability", async () => {
      const caller = appRouter.createCaller(createContext(adminUser));
      
      const availability = await caller.admin.getTutorAvailability({
        tutorId: tutorUser.id,
      });
      
      expect(availability).toBeDefined();
      expect(Array.isArray(availability)).toBe(true);
    });

    it("should reject non-admin users", async () => {
      const caller = appRouter.createCaller(createContext(parentUser));
      
      await expect(
        caller.admin.getTutorAvailability({ tutorId: tutorUser.id })
      ).rejects.toThrow("Only administrators can access this resource");
    });
  });

  describe("admin.getAllTutorsWithAvailability", () => {
    it("should allow admin to get all tutors with availability", async () => {
      const caller = appRouter.createCaller(createContext(adminUser));
      
      const tutors = await caller.admin.getAllTutorsWithAvailability();
      
      expect(tutors).toBeDefined();
      expect(Array.isArray(tutors)).toBe(true);
    });

    it("should include availability array for each tutor", async () => {
      const caller = appRouter.createCaller(createContext(adminUser));
      
      const tutors = await caller.admin.getAllTutorsWithAvailability();
      
      tutors.forEach(tutor => {
        expect(tutor).toHaveProperty("id");
        expect(tutor).toHaveProperty("name");
        expect(tutor).toHaveProperty("availability");
        expect(Array.isArray(tutor.availability)).toBe(true);
      });
    });

    it("should reject non-admin users", async () => {
      const caller = appRouter.createCaller(createContext(tutorUser));
      
      await expect(
        caller.admin.getAllTutorsWithAvailability()
      ).rejects.toThrow("Only administrators can access this resource");
    });
  });

  describe("admin.setTutorAvailability", () => {
    it.skip("should allow admin to set tutor availability", async () => {
      const caller = appRouter.createCaller(createContext(adminUser));
      
      const result = await caller.admin.setTutorAvailability({
        tutorId: tutorUser.id,
        dayOfWeek: 1, // Monday
        startTime: "09:00",
        endTime: "12:00",
      });
      
      expect(result.success).toBe(true);
      expect(result.availability).toBeDefined();
      expect(result.availability?.dayOfWeek).toBe(1);
      expect(result.availability?.startTime).toBe("09:00");
      expect(result.availability?.endTime).toBe("12:00");
    });

    it("should validate time format (HH:MM)", async () => {
      const caller = appRouter.createCaller(createContext(adminUser));
      
      await expect(
        caller.admin.setTutorAvailability({
          tutorId: tutorUser.id,
          dayOfWeek: 1,
          startTime: "9:00", // Invalid format (should be 09:00)
          endTime: "12:00",
        })
      ).rejects.toThrow();
    });

    it("should reject end time before start time", async () => {
      const caller = appRouter.createCaller(createContext(adminUser));
      
      await expect(
        caller.admin.setTutorAvailability({
          tutorId: tutorUser.id,
          dayOfWeek: 1,
          startTime: "12:00",
          endTime: "09:00", // Before start time
        })
      ).rejects.toThrow("End time must be after start time");
    });

    it("should reject end time equal to start time", async () => {
      const caller = appRouter.createCaller(createContext(adminUser));
      
      await expect(
        caller.admin.setTutorAvailability({
          tutorId: tutorUser.id,
          dayOfWeek: 1,
          startTime: "09:00",
          endTime: "09:00", // Same as start time
        })
      ).rejects.toThrow("End time must be after start time");
    });

    it("should validate day of week range (0-6)", async () => {
      const caller = appRouter.createCaller(createContext(adminUser));
      
      await expect(
        caller.admin.setTutorAvailability({
          tutorId: tutorUser.id,
          dayOfWeek: 7, // Invalid (should be 0-6)
          startTime: "09:00",
          endTime: "12:00",
        })
      ).rejects.toThrow();
    });

    it.skip("should detect overlapping time slots", async () => {
      const caller = appRouter.createCaller(createContext(adminUser));
      
      // First, create an availability slot
      await caller.admin.setTutorAvailability({
        tutorId: tutorUser.id,
        dayOfWeek: 2, // Tuesday
        startTime: "09:00",
        endTime: "12:00",
      });
      
      // Try to create overlapping slot
      await expect(
        caller.admin.setTutorAvailability({
          tutorId: tutorUser.id,
          dayOfWeek: 2, // Same day
          startTime: "10:00", // Overlaps with 09:00-12:00
          endTime: "13:00",
        })
      ).rejects.toThrow("overlaps with an existing availability slot");
    });

    it.skip("should allow non-overlapping slots on same day", async () => {
      const caller = appRouter.createCaller(createContext(adminUser));
      
      // Create first slot
      await caller.admin.setTutorAvailability({
        tutorId: tutorUser.id,
        dayOfWeek: 3, // Wednesday
        startTime: "09:00",
        endTime: "12:00",
      });
      
      // Create non-overlapping slot on same day
      const result = await caller.admin.setTutorAvailability({
        tutorId: tutorUser.id,
        dayOfWeek: 3, // Same day
        startTime: "13:00", // After first slot
        endTime: "17:00",
      });
      
      expect(result.success).toBe(true);
    });

    it.skip("should allow same time slots on different days", async () => {
      const caller = appRouter.createCaller(createContext(adminUser));
      
      // Create slot on Thursday
      await caller.admin.setTutorAvailability({
        tutorId: tutorUser.id,
        dayOfWeek: 4,
        startTime: "09:00",
        endTime: "12:00",
      });
      
      // Create same time slot on Friday
      const result = await caller.admin.setTutorAvailability({
        tutorId: tutorUser.id,
        dayOfWeek: 5,
        startTime: "09:00",
        endTime: "12:00",
      });
      
      expect(result.success).toBe(true);
    });

    it("should reject non-admin users", async () => {
      const caller = appRouter.createCaller(createContext(parentUser));
      
      await expect(
        caller.admin.setTutorAvailability({
          tutorId: tutorUser.id,
          dayOfWeek: 1,
          startTime: "09:00",
          endTime: "12:00",
        })
      ).rejects.toThrow("Only administrators can access this resource");
    });
  });

  describe("admin.deleteTutorAvailability", () => {
    it.skip("should allow admin to delete availability slot", async () => {
      const caller = appRouter.createCaller(createContext(adminUser));
      
      // First create a slot
      const created = await caller.admin.setTutorAvailability({
        tutorId: tutorUser.id,
        dayOfWeek: 6, // Saturday
        startTime: "10:00",
        endTime: "14:00",
      });
      
      // Then delete it
      const result = await caller.admin.deleteTutorAvailability({
        id: created.availability!.id,
      });
      
      expect(result.success).toBe(true);
    });

    it("should reject non-admin users", async () => {
      const caller = appRouter.createCaller(createContext(tutorUser));
      
      await expect(
        caller.admin.deleteTutorAvailability({ id: 1 })
      ).rejects.toThrow("Only administrators can access this resource");
    });
  });

  describe("Availability workflow", () => {
    it.skip("should support full CRUD workflow", async () => {
      const caller = appRouter.createCaller(createContext(adminUser));
      
      // Create availability
      const created = await caller.admin.setTutorAvailability({
        tutorId: tutorUser.id,
        dayOfWeek: 0, // Sunday
        startTime: "14:00",
        endTime: "18:00",
      });
      
      expect(created.success).toBe(true);
      expect(created.availability).toBeDefined();
      
      // Read availability
      const availability = await caller.admin.getTutorAvailability({
        tutorId: tutorUser.id,
      });
      
      const sundaySlots = availability.filter(slot => slot.dayOfWeek === 0);
      expect(sundaySlots.length).toBeGreaterThan(0);
      
      // Delete availability
      const deleted = await caller.admin.deleteTutorAvailability({
        id: created.availability!.id,
      });
      
      expect(deleted.success).toBe(true);
      
      // Verify deletion
      const afterDelete = await caller.admin.getTutorAvailability({
        tutorId: tutorUser.id,
      });
      
      const remainingSundaySlots = afterDelete.filter(
        slot => slot.id === created.availability!.id
      );
      expect(remainingSundaySlots.length).toBe(0);
    });

    it.skip("should handle multiple slots for same tutor", async () => {
      const caller = appRouter.createCaller(createContext(adminUser));
      
      // Create multiple slots
      await caller.admin.setTutorAvailability({
        tutorId: tutorUser.id,
        dayOfWeek: 1,
        startTime: "08:00",
        endTime: "10:00",
      });
      
      await caller.admin.setTutorAvailability({
        tutorId: tutorUser.id,
        dayOfWeek: 1,
        startTime: "14:00",
        endTime: "16:00",
      });
      
      // Get all availability
      const availability = await caller.admin.getTutorAvailability({
        tutorId: tutorUser.id,
      });
      
      const mondaySlots = availability.filter(slot => slot.dayOfWeek === 1);
      expect(mondaySlots.length).toBeGreaterThanOrEqual(2);
    });
  });
});
