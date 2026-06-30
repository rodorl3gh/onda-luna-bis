import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { getDashboardStats } from "../services/dashboardService.js";

const router = Router();

router.use(authMiddleware);

router.get("/stats", async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query as { from?: string; to?: string };
    const stats = await getDashboardStats(from, to);
    res.json(stats);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
