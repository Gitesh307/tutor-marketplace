import { NextFunction, Request, Response } from "express";
import { authenticateRequest } from "../services/authService";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authenticateRequest(req);
    (req as any).user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
  }
}

export function requireRole(role: "admin" | "tutor" | "parent") {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await authenticateRequest(req);
      if (user.role !== role && user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }
      (req as any).user = user;
      next();
    } catch (error) {
      res.status(401).json({ error: "Unauthorized" });
    }
  };
}
