import express from "express";
import { z } from "zod";
import { authSchema, clearAuthCookies, setAuthCookies, verifyPassword, verifyRefreshToken } from "../services/authService";
import * as db from "../../db";
import { REFRESH_TOKEN_COOKIE } from "@shared/const";

export const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  const parsed = authSchema.signup.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { email, password, firstName, lastName, role } = parsed.data;

  const existing = await db.getUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: "Email already registered" });
  }

  const passwordHash = await (await import("../services/authService")).hashPassword(password);
  const user = await db.createAuthUser({
    email,
    passwordHash,
    firstName,
    lastName,
    role,
    userType: role,
  });

  if (!user) {
    return res.status(500).json({ error: "Failed to create user" });
  }

  // Create a basic profile matching the selected role
  try {
    if (role === "parent") {
      await db.createParentProfile({
        userId: user.id,
        childrenInfo: null,
        preferences: null,
      });
    } else if (role === "tutor") {
      await db.createTutorProfile({
        userId: user.id,
        bio: "",
        qualifications: "",
        subjects: JSON.stringify([]),
        gradeLevels: JSON.stringify([]),
        hourlyRate: "0",
        yearsOfExperience: 0,
        approvalStatus: "pending",
        isActive: false,
      });
    }
  } catch (profileErr) {
    console.error("[Auth] Failed to create initial profile:", profileErr);
    // continue; profile can be completed later
  }

  await setAuthCookies(req, res, {
    sub: user.id,
    email: user.email || "",
    role: user.role as "parent" | "tutor" | "admin",
  });

  const { passwordHash: _pw, ...safeUser } = user as any;
  res.json({ user: safeUser });
});

authRouter.post("/login", async (req, res) => {
  const parsed = authSchema.login.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { email, password } = parsed.data;

  const user = await db.getUserByEmail(email);
  if (!user || !user.passwordHash) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  await setAuthCookies(req, res, {
    sub: user.id,
    email: user.email || "",
    role: user.role as "parent" | "tutor" | "admin",
  });

  const { passwordHash: _pw2, ...safeUser } = user as any;
  res.json({ user: safeUser });
});

authRouter.post("/logout", async (req, res) => {
  const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];
  if (refreshToken) {
    await db.revokeRefreshToken(refreshToken);
  }
  await clearAuthCookies(req, res);
  res.json({ success: true });
});

authRouter.post("/refresh-token", async (req, res) => {
  const token = req.cookies?.[REFRESH_TOKEN_COOKIE];
  if (!token) return res.status(401).json({ error: "Missing refresh token" });

  const stored = await db.findValidRefreshToken(token);
  if (!stored) {
    await clearAuthCookies(req, res);
    return res.status(401).json({ error: "Invalid refresh token" });
  }

  try {
    const payload = await verifyRefreshToken(token);
    if (stored.userId !== payload.sub) {
      await clearAuthCookies(req, res);
      return res.status(401).json({ error: "Invalid refresh token" });
    }
    // rotate: revoke old, issue new
    await db.revokeRefreshToken(token);
    await setAuthCookies(req, res, {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    });
    res.json({ ok: true });
  } catch (error) {
    await clearAuthCookies(req, res);
    res.status(401).json({ error: "Invalid refresh token" });
  }
});
