import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverDir = path.resolve(__dirname, "..", "server");

console.log("\n  Luna — Onda by GLA");
console.log("  Configurando base de datos MySQL...\n");

console.log("  Sincronizando schema...");
execSync("npx prisma db push --accept-data-loss", {
  cwd: serverDir,
  stdio: "inherit",
});

console.log("\n  Insertando datos iniciales...");
try {
  execSync("npx tsx src/seed.ts", { cwd: serverDir, stdio: "inherit" });
} catch {
  console.log("  (seed ya ejecutado o sin cambios)");
}

console.log("\n  Listo.\n");
