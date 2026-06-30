import { Router, Request, Response } from "express";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

const SALT = "onda-luna-bis_salt_";

function hashPass(password: string): string {
  return crypto.createHash("sha256").update(SALT + password).digest("hex");
}

const ADMIN_TOKEN = "onda-luna-bis-admin-token-v1";

router.post("/login", async (req: Request, res: Response) => {
  const { user, pass } = req.body;

  if (!user || !pass) {
    res.status(400).json({ success: false, error: "Usuario y contraseña requeridos" });
    return;
  }

  const found = await prisma.user.findUnique({ where: { username: user } });
  if (!found) {
    res.status(401).json({ success: false, error: "Credenciales inválidas" });
    return;
  }

  const inputHash = hashPass(pass);
  if (inputHash !== found.passwordHash) {
    res.status(401).json({ success: false, error: "Credenciales inválidas" });
    return;
  }

  res.json({ success: true, token: ADMIN_TOKEN });
});

export default router;
