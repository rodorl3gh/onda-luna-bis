import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
  getAllMateriasPrimas,
  createMateriaPrima,
  updateMateriaPrima,
  deleteMateriaPrima,
  getMovimientos,
  createMovimiento,
} from "../services/materiaPrimaService.js";

const router = Router();

router.use(authMiddleware);

router.get("/", async (_req: Request, res: Response) => {
  try {
    const data = await getAllMateriasPrimas();
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const created = await createMateriaPrima(req.body);
    res.status(201).json(created);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const updated = await updateMateriaPrima(Number(req.params.id), req.body);
    res.json(updated);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await deleteMateriaPrima(Number(req.params.id));
    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/:id/movimientos", async (req: Request, res: Response) => {
  try {
    const data = await getMovimientos(Number(req.params.id));
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/:id/movimientos", async (req: Request, res: Response) => {
  try {
    const movement = await createMovimiento(Number(req.params.id), req.body);
    res.status(201).json(movement);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
