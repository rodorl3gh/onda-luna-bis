import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
  getAllPedidos,
  createPedido,
  updatePedido,
  deletePedido,
} from "../services/pedidoService.js";

const router = Router();

router.use(authMiddleware);

router.get("/", async (_req: Request, res: Response) => {
  try {
    const data = await getAllPedidos();
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const created = await createPedido(req.body);
    res.status(201).json(created);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const updated = await updatePedido(Number(req.params.id), req.body);
    res.json(updated);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await deletePedido(Number(req.params.id));
    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
