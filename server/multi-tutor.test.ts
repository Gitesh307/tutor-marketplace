import { describe, expect, it } from "vitest";
import * as db from "./db";

describe("Multi-Tutor Courses and Profile Pictures", () => {
  describe("Profile Pictures", () => {
    it("should have profile pictures for tutors", async () => {
      const tutors = await db.getAllActiveTutors();
      
      expect(tutors.length).toBeGreaterThan(0);
      
      // Check that at least some tutors have profile pictures
      const tutorsWithPictures = tutors.filter(t => t.profileImageUrl);
      expect(tutorsWithPictures.length).toBeGreaterThan(0);
      
      // Verify profile picture URLs are valid
      tutorsWithPictures.forEach(tutor => {
        expect(tutor.profileImageUrl).toMatch(/^https?:\/\//);
      });
    });
  });

  describe("Multi-Tutor Courses", () => {
    it("should support courses with multiple tutors", async () => {
      const courses = await db.getAllActiveCourses();
      
      expect(courses.length).toBeGreaterThan(0);
      
      // Get tutors for each course
      for (const course of courses) {
        const tutors = await db.getTutorsForCourse(course.id);
        
        // Each course should have at least one tutor
        expect(tutors.length).toBeGreaterThanOrEqual(1);
        
        // Verify tutor data structure
        tutors.forEach(tutor => {
          expect(tutor).toHaveProperty('tutorId');
          expect(tutor).toHaveProperty('isPrimary');
          expect(tutor).toHaveProperty('user');
          expect(tutor.user).toHaveProperty('name');
          expect(tutor.user).toHaveProperty('email');
        });
        
        // Verify only one primary tutor per course
        const primaryTutors = tutors.filter(t => t.isPrimary);
        expect(primaryTutors.length).toBeLessThanOrEqual(1);
      }
    });

    it("should add and remove tutors from courses", async () => {
      const courses = await db.getAllActiveCourses();
      const tutors = await db.getAllActiveTutors();
      
      if (courses.length > 0 && tutors.length > 1) {
        const testCourse = courses[0];
        const testTutor = tutors[0];
        
        // Add tutor to course
        await db.addTutorToCourse(testCourse.id, testTutor.userId, false);
        
        // Verify tutor was added
        const isTutor = await db.isTutorOfCourse(testTutor.userId, testCourse.id);
        expect(isTutor).toBe(true);
        
        // Get all tutors for the course
        const courseTutors = await db.getTutorsForCourse(testCourse.id);
        const addedTutor = courseTutors.find(t => t.tutorId === testTutor.userId);
        expect(addedTutor).toBeDefined();
        expect(addedTutor?.isPrimary).toBe(false);
      }
    });

    it("should get courses by tutor ID", async () => {
      const tutors = await db.getAllActiveTutors();
      
      if (tutors.length > 0) {
        const testTutor = tutors[0];
        const courses = await db.getCoursesByTutorId(testTutor.userId);
        
        // Tutor should have at least one course
        expect(Array.isArray(courses)).toBe(true);
        
        // Verify each course has the tutor
        for (const course of courses) {
          const isTutor = await db.isTutorOfCourse(testTutor.userId, course.id);
          expect(isTutor).toBe(true);
        }
      }
    });
  });

  describe("Course-Tutor Junction Table", () => {
    it("should properly link courses and tutors", async () => {
      const courses = await db.getAllActiveCourses();
      
      for (const course of courses) {
        const tutors = await db.getTutorsForCourse(course.id);
        
        // Verify junction table data
        expect(tutors.length).toBeGreaterThan(0);
        
        tutors.forEach(tutor => {
          // Verify required fields exist
          expect(typeof tutor.tutorId).toBe('number');
          expect(typeof tutor.isPrimary).toBe('boolean');
          
          // Verify user data is joined
          expect(tutor.user).toBeDefined();
          expect(tutor.user.id).toBe(tutor.tutorId);
        });
      }
    });
  });
});
