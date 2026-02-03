import express from "express";
import { requireAuth } from "../middleware/auth";

export const userRouter = express.Router();

userRouter.get("/profile", requireAuth, (req, res) => {
  const user = (req as any).user;
  const { passwordHash, ...safeUser } = user || {};
  res.json({ user: safeUser });
});
