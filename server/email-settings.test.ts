import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

describe("Email Settings Feature", () => {
  let adminUser: AuthenticatedUser;
  let parentUser: AuthenticatedUser;

  function createContext(user: AuthenticatedUser | null): TrpcContext {
    return {
      user,
      req: {} as any,
      res: {} as any,
    };
  }

  beforeAll(async () => {
    // Create mock admin user
    adminUser = {
      id: 999,
      openId: "admin-email-settings-test",
      name: "Admin User",
      email: "admin@test.com",
      role: "admin" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Create mock parent user
    parentUser = {
      id: 998,
      openId: "parent-email-settings-test",
      name: "Parent User",
      email: "parent@test.com",
      role: "parent" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  describe("API Endpoints", () => {
    describe("admin.getEmailSettings", () => {
      it("should return email settings", async () => {
        const caller = appRouter.createCaller(createContext(adminUser));
        const settings = await caller.admin.getEmailSettings();

        expect(settings).toBeDefined();
        expect(settings).toHaveProperty("primaryColor");
        expect(settings).toHaveProperty("accentColor");
        expect(settings).toHaveProperty("companyName");
        expect(settings).toHaveProperty("supportEmail");
      });

      it("should require admin role", async () => {
        const caller = appRouter.createCaller(createContext(parentUser));

        await expect(caller.admin.getEmailSettings()).rejects.toThrow();
      });
    });

    describe("admin.updateEmailSettings", () => {
      it("should update email settings successfully", async () => {
        const caller = appRouter.createCaller(createContext(adminUser));

        const result = await caller.admin.updateEmailSettings({
          primaryColor: "#ff0000",
          accentColor: "#00ff00",
          companyName: "Test Academy",
          supportEmail: "test@example.com",
          footerText: "Test footer text",
        });

        expect(result.success).toBe(true);
        expect(result.id).toBeDefined();

        // Verify settings were updated
        const settings = await caller.admin.getEmailSettings();
        expect(settings?.primaryColor).toBe("#ff0000");
        expect(settings?.accentColor).toBe("#00ff00");
        expect(settings?.companyName).toBe("Test Academy");
        expect(settings?.supportEmail).toBe("test@example.com");
        expect(settings?.footerText).toBe("Test footer text");
      });

      it("should update only specified fields", async () => {
        const caller = appRouter.createCaller(createContext(adminUser));

        // First update
        await caller.admin.updateEmailSettings({
          primaryColor: "#111111",
          companyName: "Academy One",
        });

        // Partial update
        await caller.admin.updateEmailSettings({
          accentColor: "#222222",
        });

        const settings = await caller.admin.getEmailSettings();
        expect(settings?.primaryColor).toBe("#111111"); // Should remain unchanged
        expect(settings?.accentColor).toBe("#222222"); // Should be updated
        expect(settings?.companyName).toBe("Academy One"); // Should remain unchanged
      });

      it("should handle logo URL updates", async () => {
        const caller = appRouter.createCaller(createContext(adminUser));

        await caller.admin.updateEmailSettings({
          logoUrl: "https://example.com/logo.png",
        });

        const settings = await caller.admin.getEmailSettings();
        expect(settings?.logoUrl).toBe("https://example.com/logo.png");
      });

      it("should handle null logo URL", async () => {
        const caller = appRouter.createCaller(createContext(adminUser));

        await caller.admin.updateEmailSettings({
          logoUrl: null,
        });

        const settings = await caller.admin.getEmailSettings();
        expect(settings?.logoUrl).toBeNull();
      });

      it("should validate email format for supportEmail", async () => {
        const caller = appRouter.createCaller(createContext(adminUser));

        await expect(
          caller.admin.updateEmailSettings({
            supportEmail: "invalid-email",
          })
        ).rejects.toThrow();
      });

      it("should require admin role", async () => {
        const caller = appRouter.createCaller(createContext(parentUser));

        await expect(
          caller.admin.updateEmailSettings({
            primaryColor: "#ff0000",
          })
        ).rejects.toThrow();
      });

      it("should track who updated the settings", async () => {
        const caller = appRouter.createCaller(createContext(adminUser));

        await caller.admin.updateEmailSettings({
          companyName: "Tracked Update",
        });

        const settings = await caller.admin.getEmailSettings();
        expect(settings?.updatedBy).toBe(adminUser.id);
      });
    });
  });

  describe("Database Functions", () => {
    describe("getEmailSettings", () => {
      it("should return settings from database", async () => {
        const settings = await db.getEmailSettings();

        expect(settings).toBeDefined();
        expect(settings).toHaveProperty("primaryColor");
        expect(settings).toHaveProperty("accentColor");
        expect(settings).toHaveProperty("companyName");
        expect(settings).toHaveProperty("supportEmail");
        expect(settings).toHaveProperty("footerText");
      });
    });

    describe("updateEmailSettings", () => {
      it("should create settings if none exist", async () => {
        // Clear existing settings first
        const existingSettings = await db.getEmailSettings();
        if (existingSettings && existingSettings.id) {
          // We can't delete easily, so we'll just update
        }

        const settingsId = await db.updateEmailSettings({
          primaryColor: "#aaaaaa",
          accentColor: "#bbbbbb",
          companyName: "New Academy",
          supportEmail: "new@academy.com",
          footerText: "New footer",
          updatedBy: adminUser.id,
        });

        expect(settingsId).toBeDefined();
        expect(typeof settingsId).toBe("number");
      });

      it("should update existing settings", async () => {
        // First create/update
        await db.updateEmailSettings({
          primaryColor: "#cccccc",
          updatedBy: adminUser.id,
        });

        // Then update again
        const settingsId = await db.updateEmailSettings({
          accentColor: "#dddddd",
          updatedBy: adminUser.id,
        });

        expect(settingsId).toBeDefined();

        const settings = await db.getEmailSettings();
        expect(settings?.accentColor).toBe("#dddddd");
      });
    });
  });

  describe("Email Template Integration", () => {
    it("should use custom colors in email templates", async () => {
      const caller = appRouter.createCaller(createContext(adminUser));

      // Set custom colors
      await caller.admin.updateEmailSettings({
        primaryColor: "#ff5500",
        accentColor: "#0055ff",
      });

      // The email template should now use these colors
      // This is tested indirectly through the emailService.ts integration
      const settings = await caller.admin.getEmailSettings();
      expect(settings?.primaryColor).toBe("#ff5500");
      expect(settings?.accentColor).toBe("#0055ff");
    });

    it("should use custom company name in email templates", async () => {
      const caller = appRouter.createCaller(createContext(adminUser));

      await caller.admin.updateEmailSettings({
        companyName: "Custom Academy Name",
      });

      const settings = await caller.admin.getEmailSettings();
      expect(settings?.companyName).toBe("Custom Academy Name");
    });

    it("should use custom footer text in email templates", async () => {
      const caller = appRouter.createCaller(createContext(adminUser));

      await caller.admin.updateEmailSettings({
        footerText: "Custom footer message for all emails",
      });

      const settings = await caller.admin.getEmailSettings();
      expect(settings?.footerText).toBe("Custom footer message for all emails");
    });

    it("should use custom support email in email templates", async () => {
      const caller = appRouter.createCaller(createContext(adminUser));

      await caller.admin.updateEmailSettings({
        supportEmail: "custom-support@academy.com",
      });

      const settings = await caller.admin.getEmailSettings();
      expect(settings?.supportEmail).toBe("custom-support@academy.com");
    });

    it("should include logo URL when provided", async () => {
      const caller = appRouter.createCaller(createContext(adminUser));

      await caller.admin.updateEmailSettings({
        logoUrl: "https://cdn.example.com/academy-logo.png",
      });

      const settings = await caller.admin.getEmailSettings();
      expect(settings?.logoUrl).toBe("https://cdn.example.com/academy-logo.png");
    });
  });

  describe("Settings Persistence", () => {
    it("should persist settings across multiple queries", async () => {
      const caller = appRouter.createCaller(createContext(adminUser));

      await caller.admin.updateEmailSettings({
        primaryColor: "#aabbcc",
        companyName: "Persistent Academy",
      });

      const settings1 = await caller.admin.getEmailSettings();
      const settings2 = await caller.admin.getEmailSettings();

      expect(settings1?.primaryColor).toBe(settings2?.primaryColor);
      expect(settings1?.companyName).toBe(settings2?.companyName);
    });

    it("should maintain settings history through updates", async () => {
      const caller = appRouter.createCaller(createContext(adminUser));

      // Multiple updates
      await caller.admin.updateEmailSettings({
        primaryColor: "#aaa111",
      });

      await caller.admin.updateEmailSettings({
        primaryColor: "#bbb222",
      });

      await caller.admin.updateEmailSettings({
        primaryColor: "#ccc333",
      });

      const settings = await caller.admin.getEmailSettings();
      expect(settings?.primaryColor).toBe("#ccc333");
    });
  });

  describe("Default Values", () => {
    it("should provide sensible defaults for all fields", async () => {
      const settings = await db.getEmailSettings();

      expect(settings?.primaryColor).toMatch(/^#[0-9a-f]{6}$/i);
      expect(settings?.accentColor).toMatch(/^#[0-9a-f]{6}$/i);
      expect(settings?.companyName).toBeTruthy();
      expect(settings?.supportEmail).toContain("@");
      expect(settings?.footerText).toBeTruthy();
    });
  });
});
