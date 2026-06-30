import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface MateriaPrimaData {
  name: string;
  cost: number;
  minStock: number;
  color?: string | null;
}

export interface MovimientoData {
  type: "ENTRADA" | "SALIDA" | "AJUSTE";
  quantity: number;
  notes?: string;
}

export async function getAllMateriasPrimas() {
  return prisma.materiaPrima.findMany({
    orderBy: { createdAt: "desc" },
    include: { movements: { orderBy: { createdAt: "desc" } } },
  });
}

export async function generateMateriaPrimaCode(): Promise<string> {
  const last = await prisma.materiaPrima.findFirst({
    orderBy: { id: "desc" },
  });
  const nextId = last ? last.id + 1 : 1;
  return `MP-${String(nextId).padStart(6, "0")}`;
}

export async function createMateriaPrima(data: MateriaPrimaData) {
  if (data.cost < 0) throw new Error("El costo no puede ser negativo");
  if (data.minStock < 0) throw new Error("El stock mínimo no puede ser negativo");

  const code = await generateMateriaPrimaCode();
  return prisma.materiaPrima.create({
    data: { code, name: data.name, cost: data.cost, minStock: data.minStock, stock: 0, color: data.color ?? null },
  });
}

export async function updateMateriaPrima(id: number, data: Partial<MateriaPrimaData>) {
  if (data.cost !== undefined && data.cost < 0) throw new Error("El costo no puede ser negativo");
  if (data.minStock !== undefined && data.minStock < 0)
    throw new Error("El stock mínimo no puede ser negativo");

  return prisma.materiaPrima.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.cost !== undefined && { cost: data.cost }),
      ...(data.minStock !== undefined && { minStock: data.minStock }),
      ...(data.color !== undefined && { color: data.color }),
    },
  });
}

export async function deleteMateriaPrima(id: number) {
  return prisma.materiaPrima.delete({ where: { id } });
}

export async function getMovimientos(materiaPrimaId: number) {
  return prisma.movimientoMP.findMany({
    where: { materiaPrimaId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createMovimiento(materiaPrimaId: number, data: MovimientoData) {
  const mp = await prisma.materiaPrima.findUnique({ where: { id: materiaPrimaId } });
  if (!mp) throw new Error("Materia prima no encontrada");

  let newStock = mp.stock;
  if (data.type === "ENTRADA") {
    newStock += data.quantity;
  } else if (data.type === "SALIDA") {
    newStock -= data.quantity;
  } else if (data.type === "AJUSTE") {
    newStock = data.quantity;
  }

  if (newStock < 0) throw new Error("El stock no puede ser negativo");

  const movement = await prisma.movimientoMP.create({
    data: {
      materiaPrimaId,
      type: data.type,
      quantity: data.quantity,
      notes: data.notes || null,
    },
  });

  await prisma.materiaPrima.update({
    where: { id: materiaPrimaId },
    data: { stock: newStock },
  });

  return movement;
}
