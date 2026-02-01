import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";

// Helper to create test context
function createAuthContext(user: { id: number; name: string; email: string; role: string }) {
  return {
    user,
    req: {} as any,
    res: {} as any,
  };
}

describe("Course Management", () => {
  describe("Admin Course CRUD", () => {
    it("should allow admin to create a course", async () => {
      const adminContext = createAuthContext({
        id: 1,
        name: "Admin User",
        email: "admin@test.com",
        role: "admin",
      });

      const caller = appRouter.createCaller(adminContext);
      const result = await caller.admin.createCourse({
        title: "Advanced Mathematics",
        description: "College-level math course",
        subject: "Mathematics",
        gradeLevel: "College",
        price: "99.99",
        duration: 60,
        sessionsPerWeek: 2,
        totalSessions: 12,
      });

      expect(result).toBeDefined();
    });

    it("should allow admin to get all courses with tutors", async () => {
      const adminContext = createAuthContext({
        id: 1,
        name: "Admin User",
        email: "admin@test.com",
        role: "admin",
      });

      const caller = appRouter.createCaller(adminContext);
      const result = await caller.admin.getAllCoursesWithTutors({});

      expect(Array.isArray(result)).toBe(true);
    });

    it("should allow admin to filter courses by subject", async () => {
      const adminContext = createAuthContext({
        id: 1,
        name: "Admin User",
        email: "admin@test.com",
        role: "admin",
      });

      const caller = appRouter.createCaller(adminContext);
      const result = await caller.admin.getAllCoursesWithTutors({
        subject: "Mathematics",
      });

      expect(Array.isArray(result)).toBe(true);
      result.forEach((course: any) => {
        if (course.subject) {
          expect(course.subject).toBe("Mathematics");
        }
      });
    });

    it("should allow admin to search courses", async () => {
      const adminContext = createAuthContext({
        id: 1,
        name: "Admin User",
        email: "admin@test.com",
        role: "admin",
      });

      const caller = appRouter.createCaller(adminContext);
      const result = await caller.admin.getAllCoursesWithTutors({
        search: "math",
      });

      expect(Array.isArray(result)).toBe(true);
    });

    it("should deny non-admin access to course management", async () => {
      const parentContext = createAuthContext({
        id: 2,
        name: "Parent User",
        email: "parent@test.com",
        role: "parent",
      });

      const caller = appRouter.createCaller(parentContext);

      await expect(
        caller.admin.createCourse({
          title: "Test Course",
          subject: "Mathematics",
          price: "50.00",
        })
      ).rejects.toThrow();
    });
  });

  describe("Tutor Assignment", () => {
    it("should allow admin to get all tutors for assignment", async () => {
      const adminContext = createAuthContext({
        id: 1,
        name: "Admin User",
        email: "admin@test.com",
        role: "admin",
      });

      const caller = appRouter.createCaller(adminContext);
      const result = await caller.admin.getAllTutorsForAssignment();

      expect(Array.isArray(result)).toBe(true);
    });

    it("should allow admin to assign tutor to course", async () => {
      const adminContext = createAuthContext({
        id: 1,
        name: "Admin User",
        email: "admin@test.com",
        role: "admin",
      });

      const caller = appRouter.createCaller(adminContext);
      
      // Note: This test assumes course ID 1 and tutor ID 1 exist
      // In a real test environment, you'd create these first
      const result = await caller.admin.assignCourseToTutor({
        courseId: 1,
        tutorId: 1,
        isPrimary: false,
      });

      expect(result.success).toBe(true);
    });

    it("should allow admin to get course assignments", async () => {
      const adminContext = createAuthContext({
        id: 1,
        name: "Admin User",
        email: "admin@test.com",
        role: "admin",
      });

      const caller = appRouter.createCaller(adminContext);
      const result = await caller.admin.getCourseAssignments({
        courseId: 1,
      });

      expect(Array.isArray(result)).toBe(true);
    });

    it("should allow admin to unassign tutor from course", async () => {
      const adminContext = createAuthContext({
        id: 1,
        name: "Admin User",
        email: "admin@test.com",
        role: "admin",
      });

      const caller = appRouter.createCaller(adminContext);
      const result = await caller.admin.unassignCourseFromTutor({
        courseId: 1,
        tutorId: 1,
      });

      expect(result.success).toBe(true);
    });

    it("should deny non-admin access to tutor assignment", async () => {
      const tutorContext = createAuthContext({
        id: 2,
        name: "Tutor User",
        email: "tutor@test.com",
        role: "tutor",
      });

      const caller = appRouter.createCaller(tutorContext);

      await expect(
        caller.admin.assignCourseToTutor({
          courseId: 1,
          tutorId: 1,
        })
      ).rejects.toThrow();
    });
  });
});
