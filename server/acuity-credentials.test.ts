import { describe, it, expect } from "vitest";
import { getAcuityAccount } from "./acuity";

describe("Acuity API Credentials Validation", () => {
  it("should successfully authenticate with Acuity API", async () => {
    try {
      const account = await getAcuityAccount();
      
      // Verify we got account information back
      expect(account).toBeDefined();
      expect(account).toHaveProperty("id");
      expect(account).toHaveProperty("email");
      
      console.log("✓ Acuity API credentials are valid");
      console.log(`  Account: ${account.email}`);
      console.log(`  Business: ${account.name || "N/A"}`);
    } catch (error) {
      // If authentication fails, provide helpful error message
      console.error("✗ Acuity API authentication failed");
      console.error("  Please check your ACUITY_USER_ID and ACUITY_API_KEY");
      console.error(`  Error: ${error}`);
      throw error;
    }
  }, 10000); // 10 second timeout for API call
});
