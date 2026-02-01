import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createMockContext(user?: AuthenticatedUser): TrpcContext {
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

describe("Sample Data Verification", () => {
  it("should have sample tutors in the database", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const tutors = await caller.tutorProfile.list();
    
    expect(tutors.length).toBeGreaterThan(0);
    console.log(`✅ Found ${tutors.length} tutors in database`);
  });

  it("should have sample courses in the database", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const courses = await caller.course.list();
    
    expect(courses.length).toBeGreaterThan(0);
    console.log(`✅ Found ${courses.length} courses in database`);
  });

  it("should have tutors with proper profile data", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const tutors = await caller.tutorProfile.list();
    
    if (tutors.length > 0) {
      const firstTutor = tutors[0];
      expect(firstTutor.name).toBeDefined();
      expect(firstTutor.subjects).toBeDefined();
      expect(firstTutor.hourlyRate).toBeDefined();
      console.log(`✅ Sample tutor: ${firstTutor.name} - $${firstTutor.hourlyRate}/hr`);
    }
  });

  it("should have courses with proper data", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const courses = await caller.course.list();
    
    if (courses.length > 0) {
      const firstCourse = courses[0];
      expect(firstCourse.title).toBeDefined();
      expect(firstCourse.subject).toBeDefined();
      expect(firstCourse.price).toBeDefined();
      console.log(`✅ Sample course: ${firstCourse.title} - $${firstCourse.price}`);
    }
  });

  it("should be able to search for tutors by subject", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const results = await caller.tutorProfile.search({
      subject: "Mathematics",
    });
    
    expect(Array.isArray(results)).toBe(true);
    console.log(`✅ Found ${results.length} math tutors`);
  });
});
