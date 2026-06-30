import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import authRoutes from "./routes/auth.js";
import materiasPrimasRoutes from "./routes/materiasPrimas.js";
import productosRoutes from "./routes/productos.js";
import pedidosRoutes from "./routes/pedidos.js";
import dashboardRoutes from "./routes/dashboard.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const HOST = "0.0.0.0";

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/materias-primas", materiasPrimasRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/pedidos", pedidosRoutes);
app.use("/api/dashboard", dashboardRoutes);

const clientDist = path.resolve(__dirname, "../../client/dist");
if (fs.existsSync(clientDist)) {
  console.log("Sirviendo frontend desde " + clientDist);
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
} else {
  console.log("Frontend no encontrado en " + clientDist + ", usando fallback");
  app.get("/", (_req, res) => {
    res.redirect("/api/health");
  });
}

app.listen(Number(PORT), HOST, () => {
  console.log(`\n  Luna — Onda by GLA`);
  console.log(`  Servidor en http://${HOST}:${PORT}\n`);
});
