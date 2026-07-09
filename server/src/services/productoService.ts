import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface ProductoData {
  name: string;
  salePrice?: number;
  marginPercent?: number;
  color?: string | null;
  materiasPrimas?: { materiaPrimaId: number; quantity: number }[];
}

export function calcularMargen(productionCost: number, salePrice: number) {
  const margin = salePrice - productionCost;
  const marginPercent = productionCost > 0 ? (margin / productionCost) * 100 : 0;
  return {
    margin: Math.round(margin * 100) / 100,
    marginPercent: Math.round(marginPercent * 100) / 100,
  };
}

export function calcularPrecioPorPorcentaje(productionCost: number, marginPercent: number) {
  if (marginPercent < 0) throw new Error("El porcentaje de ganancia no puede ser negativo");
  const salePrice = productionCost * (1 + marginPercent / 100);
  return Math.round(salePrice * 100) / 100;
}

export function calcularCostoProduccion(materiasPrimas: { materiaPrimaId: number; quantity: number }[]): Promise<number>;
export async function calcularCostoProduccion(
  materiasPrimas: { materiaPrimaId: number; quantity: number }[]
): Promise<number> {
  let total = 0;
  for (const mp of materiasPrimas) {
    const materia = await prisma.materiaPrima.findUnique({ where: { id: mp.materiaPrimaId } });
    if (materia) {
      total += materia.cost * mp.quantity;
    }
  }
  return Math.round(total * 100) / 100;
}

export async function generateProductoCode(): Promise<string> {
  const last = await prisma.producto.findFirst({ orderBy: { id: "desc" } });
  const nextId = last ? last.id + 1 : 1;
  return `PR-${String(nextId).padStart(6, "0")}`;
}

export async function getAllProductos() {
  return prisma.producto.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      materiasPrimas: { include: { materiaPrima: true } },
    },
  });
}

export async function getProductoById(id: number) {
  return prisma.producto.findUnique({
    where: { id },
    include: {
      materiasPrimas: { include: { materiaPrima: true } },
    },
  });
}

export async function createProducto(data: ProductoData) {
  const code = await generateProductoCode();
  let productionCost = 0;

  if (data.materiasPrimas && data.materiasPrimas.length > 0) {
    productionCost = await calcularCostoProduccion(data.materiasPrimas);
  }

  let salePrice = 0;
  let margin = 0;
  let marginPercent = 0;

  if (data.salePrice !== undefined && data.salePrice > 0) {
    salePrice = data.salePrice;
    const calc = calcularMargen(productionCost, salePrice);
    margin = calc.margin;
    marginPercent = calc.marginPercent;
  } else if (data.marginPercent !== undefined && data.marginPercent > 0) {
    marginPercent = data.marginPercent;
    salePrice = calcularPrecioPorPorcentaje(productionCost, marginPercent);
    margin = salePrice - productionCost;
  }

  if (salePrice < 0) throw new Error("El precio de venta no puede ser negativo");

  const producto = await prisma.producto.create({
    data: {
      code,
      name: data.name,
      productionCost,
      salePrice,
      margin,
      marginPercent,
      color: data.color ?? null,
    },
  });

  if (data.materiasPrimas && data.materiasPrimas.length > 0) {
    await prisma.productoMateriaPrima.createMany({
      data: data.materiasPrimas.map((mp) => ({
        productoId: producto.id,
        materiaPrimaId: mp.materiaPrimaId,
        quantity: mp.quantity,
      })),
    });
  }

  return getProductoById(producto.id);
}

export async function updateProducto(id: number, data: Partial<ProductoData>) {
  const existing = await prisma.producto.findUnique({
    where: { id },
    include: { materiasPrimas: { include: { materiaPrima: true } } },
  });
  if (!existing) throw new Error("Producto no encontrado");

  let productionCost = existing.productionCost;

  if (data.materiasPrimas !== undefined) {
    productionCost = data.materiasPrimas.length > 0
      ? await calcularCostoProduccion(data.materiasPrimas)
      : 0;

    await prisma.productoMateriaPrima.deleteMany({ where: { productoId: id } });
    if (data.materiasPrimas.length > 0) {
      await prisma.productoMateriaPrima.createMany({
        data: data.materiasPrimas.map((mp) => ({
          productoId: id,
          materiaPrimaId: mp.materiaPrimaId,
          quantity: mp.quantity,
        })),
      });
    }
  }

  let salePrice = existing.salePrice;
  let margin = existing.margin;
  let marginPercent = existing.marginPercent;

  if (data.salePrice !== undefined) {
    salePrice = data.salePrice;
    const calc = calcularMargen(productionCost, salePrice);
    margin = calc.margin;
    marginPercent = calc.marginPercent;
  } else if (data.marginPercent !== undefined) {
    marginPercent = data.marginPercent;
    salePrice = calcularPrecioPorPorcentaje(productionCost, marginPercent);
    margin = salePrice - productionCost;
  } else if (productionCost !== existing.productionCost) {
    const calc = calcularMargen(productionCost, salePrice);
    margin = calc.margin;
  }

  if (salePrice < 0) throw new Error("El precio de venta no puede ser negativo");

  return prisma.producto.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      productionCost,
      salePrice,
      margin,
      marginPercent,
      ...(data.color !== undefined && { color: data.color }),
    },
    include: {
      materiasPrimas: { include: { materiaPrima: true } },
    },
  });
}

export async function deleteProducto(id: number) {
  return prisma.producto.delete({ where: { id } });
}

