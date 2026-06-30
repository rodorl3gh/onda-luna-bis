import { PrismaClient } from "@prisma/client";
import { getMexicoDayRange } from "../lib/mexico-timezone.js";

const prisma = new PrismaClient();

export async function getDashboardStats(from?: string, to?: string) {
  let range: { from: Date; to: Date };
  if (from && to) {
    const rFrom = getMexicoDayRange(from);
    const rTo = getMexicoDayRange(to);
    range = { from: rFrom.from, to: rTo.to };
  } else {
    range = getMexicoDayRange();
  }

  const pedidosEnRango = await prisma.pedido.findMany({
    where: {
      createdAt: { gte: range.from, lte: range.to },
      status: { not: "CANCELADO" },
    },
    include: { items: { include: { producto: true } } },
  });

  const ventasPeriodo = pedidosEnRango.reduce((sum, p) => sum + p.total, 0);
  const totalPedidos = pedidosEnRango.length;

  const costoTotal = pedidosEnRango.reduce((sum, pedido) => {
    return sum + pedido.items.reduce((itemSum, item) => {
      return itemSum + item.producto.productionCost * item.quantity;
    }, 0);
  }, 0);

  const gananciaNeta = ventasPeriodo - costoTotal;

  const productos = await prisma.producto.findMany();
  const materiasPrimas = await prisma.materiaPrima.findMany();

  const productosOk = productos.filter((p) => p.stock > p.minStock * 1.5).length;
  const productosWarning = productos.filter(
    (p) => p.stock <= p.minStock * 1.5 && p.stock > p.minStock
  ).length;
  const productosCritical = productos.filter((p) => p.stock <= p.minStock).length;

  const mpOk = materiasPrimas.filter((m) => m.stock > m.minStock * 1.5).length;
  const mpWarning = materiasPrimas.filter(
    (m) => m.stock <= m.minStock * 1.5 && m.stock > m.minStock
  ).length;
  const mpCritical = materiasPrimas.filter((m) => m.stock <= m.minStock).length;

  const ultimosPedidos = await prisma.pedido.findMany({
    where: { status: { not: "CANCELADO" } },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: { items: { include: { producto: true } } },
  });

  return {
    costoProduccion: Math.round(costoTotal * 100) / 100,
    ventasPeriodo: Math.round(ventasPeriodo * 100) / 100,
    gananciaNeta: Math.round(gananciaNeta * 100) / 100,
    totalPedidos,
    controlInventario: {
      productos: { ok: productosOk, warning: productosWarning, critical: productosCritical },
      materiasPrimas: { ok: mpOk, warning: mpWarning, critical: mpCritical },
    },
    ultimosPedidos,
    rango: { from: range.from.toISOString(), to: range.to.toISOString() },
  };
}
