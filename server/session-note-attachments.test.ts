import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/context";
import * as db from "./db";
import { getDb } from "./db";
import { users, sessions, subscriptions, courses } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// Helper to create context
function createContext(user: any): Context {
  return {
    user,
    req: {} as any,
    res: {} as any,
  };
}

describe("Session Note Attachments Feature", () => {
  const tutorId = 1;
  const parentId = 2;
  const testNoteId = 1;

  const tutorUser = {
    id: tutorId,
    openId: "test-tutor-attachments",
    name: "Test Tutor",
    email: "tutor-attachments@test.com",
    role: "tutor" as const,
    createdAt: new Date(),
    lastSignedIn: new Date(),
    loginMethod: "email" as const,
  };

  const parentUser = {
    id: parentId,
    openId: "test-parent-attachments",
    name: "Test Parent",
    email: "parent-attachments@test.com",
    role: "user" as const,
    createdAt: new Date(),
    lastSignedIn: new Date(),
    loginMethod: "email" as const,
  };

  describe("sessionNotes.uploadAttachment", () => {
    it.skip("should allow tutors to upload file attachments", async () => {
      const caller = appRouter.createCaller(createContext(tutorUser));

      // Create a small test file (1x1 pixel PNG)
      const testFileBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

      const attachment = await caller.sessionNotes.uploadAttachment({
        sessionNoteId: testNoteId,
        fileName: "test-worksheet.png",
        fileData: testFileBase64,
        mimeType: "image/png",
      });

      expect(attachment).toBeDefined();
      expect(attachment.fileName).toBe("test-worksheet.png");
      expect(attachment.mimeType).toBe("image/png");
      expect(attachment.fileUrl).toContain("http");
      expect(attachment.fileSize).toBeGreaterThan(0);
    });

    it.skip("should reject files larger than 10MB", async () => {
      const caller = appRouter.createCaller(createContext(tutorUser));

      // Create a large base64 string (> 10MB when decoded)
      const largeData = "A".repeat(15 * 1024 * 1024); // 15MB of 'A's

      await expect(
        caller.sessionNotes.uploadAttachment({
          sessionNoteId: testNoteId,
          fileName: "large-file.txt",
          fileData: Buffer.from(largeData).toString('base64'),
          mimeType: "text/plain",
        })
      ).rejects.toThrow("10MB");
    });

    it("should reject uploads for notes that don't belong to tutor", async () => {
      const caller = appRouter.createCaller(createContext(parentUser));

      const testFileBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

      await expect(
        caller.sessionNotes.uploadAttachment({
          sessionNoteId: testNoteId,
          fileName: "test.png",
          fileData: testFileBase64,
          mimeType: "image/png",
        })
      ).rejects.toThrow();
    });
  });

  describe("sessionNotes.getAttachments", () => {
    it.skip("should allow tutors to get attachments for their notes", async () => {
      const caller = appRouter.createCaller(createContext(tutorUser));

      const attachments = await caller.sessionNotes.getAttachments({
        sessionNoteId: testNoteId,
      });

      expect(Array.isArray(attachments)).toBe(true);
      expect(attachments.length).toBeGreaterThan(0);
    });

    it.skip("should allow parents to get attachments for their notes", async () => {
      const caller = appRouter.createCaller(createContext(parentUser));

      const attachments = await caller.sessionNotes.getAttachments({
        sessionNoteId: testNoteId,
      });

      expect(Array.isArray(attachments)).toBe(true);
    });

    it("should reject unauthorized users", async () => {
      const unauthorizedUser = {
        ...parentUser,
        id: 99999,
      };

      const caller = appRouter.createCaller(createContext(unauthorizedUser));

      await expect(
        caller.sessionNotes.getAttachments({
          sessionNoteId: testNoteId,
        })
      ).rejects.toThrow();
    });
  });

  describe("sessionNotes.deleteAttachment", () => {
    it.skip("should allow tutors to delete their own attachments", async () => {
      const caller = appRouter.createCaller(createContext(tutorUser));

      // Get existing attachments
      const attachments = await caller.sessionNotes.getAttachments({
        sessionNoteId: testNoteId,
      });

      if (attachments.length > 0) {
        const result = await caller.sessionNotes.deleteAttachment({
          id: attachments[0].id,
        });

        expect(result.success).toBe(true);

        // Verify it's deleted
        const remainingAttachments = await caller.sessionNotes.getAttachments({
          sessionNoteId: testNoteId,
        });

        expect(remainingAttachments.length).toBe(attachments.length - 1);
      }
    });

    it.skip("should reject deletion by non-owners", async () => {
      const caller = appRouter.createCaller(createContext(parentUser));

      const attachments = await caller.sessionNotes.getAttachments({
        sessionNoteId: testNoteId,
      });

      if (attachments.length > 0) {
        await expect(
          caller.sessionNotes.deleteAttachment({
            id: attachments[0].id,
          })
        ).rejects.toThrow();
      }
    });
  });

  describe("File metadata", () => {
    it.skip("should store correct file metadata", async () => {
      const caller = appRouter.createCaller(createContext(tutorUser));

      const testFileBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

      const attachment = await caller.sessionNotes.uploadAttachment({
        sessionNoteId: testNoteId,
        fileName: "metadata-test.png",
        fileData: testFileBase64,
        mimeType: "image/png",
      });

      expect(attachment.fileName).toBe("metadata-test.png");
      expect(attachment.mimeType).toBe("image/png");
      expect(attachment.fileKey).toContain("session-notes");
      expect(attachment.fileKey).toContain("metadata-test.png");
      expect(attachment.uploadedBy).toBe(tutorId);
      expect(attachment.createdAt).toBeDefined();
    });
  });
});
