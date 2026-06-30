import pg from "pg";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverDir = path.resolve(__dirname, "..", "server");
const DB_NAME = "onda_luna_bis";

async function databaseExists(client, dbName) {
  const res = await client.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [dbName]
  );
  return (res.rowCount ?? 0) > 0;
}

async function main() {
  console.log("\n  Luna — Onda by GLA");
  console.log("  Configurando base de datos...\n");

  const client = new pg.Client({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "postgres",
    database: "postgres",
  });

  try {
    await client.connect();
  } catch (err) {
    console.error("  No se pudo conectar a PostgreSQL.");
    console.error("  Asegurate de que este corriendo (servicio postgresql-x64-16)");
    process.exit(1);
  }

  const exists = await databaseExists(client, DB_NAME);
  if (!exists) {
    console.log(`  Creando base de datos "${DB_NAME}"...`);
    await client.query(`CREATE DATABASE "${DB_NAME}"`);
    console.log("  Base de datos creada.");
  } else {
    console.log("  Base de datos ya existe.");
  }
  await client.end();

  console.log("\n  Sincronizando schema...");
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

  console.log("\n  Listo. Iniciando servidores...\n");
}

main();
