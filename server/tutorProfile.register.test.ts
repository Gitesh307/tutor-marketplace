import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import { db } from "./db";
import { users, tutorProfiles } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// Create a test context with a mock user
const createTestContext = (user?: { id: number; openId: string; name: string; email: string; role: "admin" | "user" }) => {
  return {
    user: user || null,
    req: {} as any,
    res: {} as any,
  };
};



describe("tutorProfile.register", () => {
  let testUserId: number | null = null;
  let testTutorProfileId: number | null = null;

  afterAll(async () => {
    // Clean up test data
    if (testTutorProfileId) {
      await db.delete(tutorProfiles).where(eq(tutorProfiles.id, testTutorProfileId));
    }
    if (testUserId) {
      await db.delete(users).where(eq(users.id, testUserId));
    }
  });

  it("should successfully register a new tutor", async () => {
    const caller = appRouter.createCaller(createTestContext());

    const registrationData = {
      name: "Dr. Jane Smith",
      email: "jane.smith@test.com",
      phone: "+1 (555) 123-4567",
      bio: "Experienced mathematics educator with 15 years of teaching experience",
      qualifications: "PhD in Mathematics from Stanford University, Certified SAT tutor",
      yearsOfExperience: 15,
      hourlyRate: 85.00,
      subjects: ["Mathematics", "Physics"],
      gradeLevels: ["High School", "College"],
    };

    const result = await caller.tutorProfile.register(registrationData);

    // Store IDs for cleanup
    testUserId = result.userId;
    testTutorProfileId = result.tutorProfileId;

    // Verify the response
    expect(result).toHaveProperty("userId");
    expect(result).toHaveProperty("tutorProfileId");
    expect(result.userId).toBeTypeOf("number");
    expect(result.tutorProfileId).toBeTypeOf("number");

    // Verify user was created in database
    const createdUser = await db.query.users.findFirst({
      where: eq(users.id, result.userId),
    });

    expect(createdUser).toBeDefined();
    expect(createdUser?.name).toBe(registrationData.name);
    expect(createdUser?.email).toBe(registrationData.email);

    // Verify tutor profile was created in database
    const createdProfile = await db.query.tutorProfiles.findFirst({
      where: eq(tutorProfiles.id, result.tutorProfileId),
    });

    expect(createdProfile).toBeDefined();
    expect(createdProfile?.userId).toBe(result.userId);
    expect(createdProfile?.bio).toBe(registrationData.bio);
    expect(createdProfile?.qualifications).toBe(registrationData.qualifications);
    expect(createdProfile?.yearsOfExperience).toBe(registrationData.yearsOfExperience);
    expect(createdProfile?.hourlyRate).toBe(registrationData.hourlyRate);
    expect(createdProfile?.subjects).toEqual(registrationData.subjects);
    expect(createdProfile?.gradeLevels).toEqual(registrationData.gradeLevels);
    expect(createdProfile?.approvalStatus).toBe("pending");
  });

  it("should reject registration with duplicate email", async () => {
    const caller = appRouter.createCaller(createTestContext());

    const registrationData = {
      name: "Dr. John Doe",
      email: "jane.smith@test.com", // Same email as previous test
      phone: "+1 (555) 999-8888",
      bio: "Another tutor",
      qualifications: "PhD in Physics",
      yearsOfExperience: 10,
      hourlyRate: 75.00,
      subjects: ["Physics"],
      gradeLevels: ["High School"],
    };

    await expect(caller.tutorProfile.register(registrationData)).rejects.toThrow();
  });

  it("should reject registration with invalid data", async () => {
    const caller = appRouter.createCaller(createTestContext());

    const invalidData = {
      name: "",
      email: "invalid-email",
      phone: "",
      bio: "",
      qualifications: "",
      yearsOfExperience: -5,
      hourlyRate: -10,
      subjects: [],
      gradeLevels: [],
    };

    await expect(caller.tutorProfile.register(invalidData as any)).rejects.toThrow();
  });
});
