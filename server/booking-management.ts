/**
 * Booking Management Utilities
 * Handles secure token generation and booking management operations
 */

import crypto from "crypto";

/**
 * Generate a secure random token for booking management
 * Uses crypto.randomBytes for cryptographically strong random values
 */
export function generateBookingToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Validate booking token format
 */
export function isValidBookingToken(token: string): boolean {
  return /^[a-f0-9]{64}$/.test(token);
}
