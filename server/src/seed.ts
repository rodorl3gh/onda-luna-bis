import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

const SALT = "onda-luna-bis_salt_";
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = "Admin2024*";

function hashPass(password: string): string {
  return crypto.createHash("sha256").update(SALT + password).digest("hex");
}

async function main() {
  console.log("🌱 Seeding database...");

  const adminHash = hashPass(ADMIN_PASS);
  await prisma.user.upsert({
    where: { username: ADMIN_USER },
    update: {},
    create: {
      username: ADMIN_USER,
      passwordHash: adminHash,
      role: "admin",
    },
  });
  console.log(`  ✓ Admin user: ${ADMIN_USER}`);

  const materiasPrimas = [
    { code: "MP-000001", name: "Mostacillas doradas", cost: 12.5, minStock: 10 },
    { code: "MP-000002", name: "Cadena fina plateada", cost: 8.0, minStock: 5 },
    { code: "MP-000003", name: "Broches de presión", cost: 3.5, minStock: 15 },
    { code: "MP-000004", name: "Cuentas de cristal turquesa", cost: 15.0, minStock: 8 },
    { code: "MP-000005", name: "Hilo encerado", cost: 4.0, minStock: 20 },
    { code: "MP-000006", name: "Dijes corazones", cost: 7.5, minStock: 10 },
    { code: "MP-000007", name: "Cordón de cuero sintético", cost: 6.0, minStock: 12 },
    { code: "MP-000008", name: "Perlas cultivadas", cost: 18.0, minStock: 6 },
  ];

  for (const mp of materiasPrimas) {
    const created = await prisma.materiaPrima.upsert({
      where: { code: mp.code },
      update: {},
      create: mp,
    });

    if (!(await prisma.movimientoMP.findFirst({ where: { materiaPrimaId: created.id } }))) {
      const initialStock = mp.minStock * 3;
      await prisma.movimientoMP.create({
        data: {
          materiaPrimaId: created.id,
          type: "ENTRADA",
          quantity: initialStock,
          notes: "Stock inicial",
        },
      });
      await prisma.materiaPrima.update({
        where: { id: created.id },
        data: { stock: initialStock },
      });
    }
  }
  console.log(`  ✓ ${materiasPrimas.length} materias primas con stock inicial`);

  console.log("✅ Seed completo.");
  console.log(`   Admin: ${ADMIN_USER} / ${ADMIN_PASS}`);
  console.log(`   Hash:  ${adminHash}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
