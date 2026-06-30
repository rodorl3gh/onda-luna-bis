import { Request, Response, NextFunction } from "express";

const ADMIN_TOKEN = "onda-luna-bis-admin-token-v1";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token || token !== ADMIN_TOKEN) {
    res.status(401).json({ error: "No autorizado" });
    return;
  }
  next();
}
