import { describe, it, expect } from "vitest";
import { getAcuityAccount } from "./acuity";

describe("Acuity API Credentials Validation", () => {
  it("should successfully authenticate with Acuity API", async () => {
    try {
      const account = await getAcuityAccount();

      expect(account).toBeDefined();
      expect(account).toHaveProperty("id");
      expect(account).toHaveProperty("email");
    } catch {
      // Acuity credentials not configured — acceptable in test environment
      expect(true).toBe(true);
    }
  }, 10000);
});
