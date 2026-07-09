import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export interface PedidoData {
  status?: string;
  notes?: string;
  items?: { productoId: number; quantity: number }[];
}

export async function generatePedidoCode(): Promise<string> {
  const last = await prisma.pedido.findFirst({ orderBy: { id: "desc" } });
  const nextId = last ? last.id + 1 : 1;
  return `PED-${String(nextId).padStart(6, "0")}`;
}

export async function getAllPedidos() {
  return prisma.pedido.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: { producto: true },
      },
    },
  });
}

async function calcularConsumoMP(items: { productoId: number; quantity: number }[]) {
  const consumo = new Map<number, number>();
  for (const item of items) {
    const receta = await prisma.productoMateriaPrima.findMany({
      where: { productoId: item.productoId },
    });
    for (const pmp of receta) {
      const usado = pmp.quantity * item.quantity;
      consumo.set(pmp.materiaPrimaId, (consumo.get(pmp.materiaPrimaId) || 0) + usado);
    }
  }
  return consumo;
}

async function validarStockMP(consumo: Map<number, number>) {
  for (const [materiaPrimaId, cantidad] of consumo) {
    const mp = await prisma.materiaPrima.findUnique({ where: { id: materiaPrimaId } });
    if (!mp) throw new Error(`Materia prima ${materiaPrimaId} no encontrada`);
    if (mp.stock < cantidad) {
      throw new Error(
        `Materia prima insuficiente: ${mp.name}. Necesitas ${cantidad}, disponible ${mp.stock}.`
      );
    }
  }
}

export async function createPedido(data: PedidoData) {
  if (!data.items || data.items.length === 0)
    throw new Error("El pedido debe tener al menos un producto");

  const code = await generatePedidoCode();

  let total = 0;
  const pedidoItems: { subtotal: number; productoId: number; quantity: number }[] = [];

  for (const item of data.items) {
    const prod = await prisma.producto.findUnique({ where: { id: item.productoId } });
    if (!prod) throw new Error(`Producto ${item.productoId} no encontrado`);
    const subtotal = prod.salePrice * item.quantity;
    total += subtotal;
    pedidoItems.push({ productoId: item.productoId, quantity: item.quantity, subtotal });
  }

  const consumo = await calcularConsumoMP(data.items);
  await validarStockMP(consumo);

  return prisma.$transaction(async (tx) => {
    const pedido = await tx.pedido.create({
      data: {
        code,
        status: data.status || "PENDIENTE",
        notes: data.notes || null,
        total: Math.round(total * 100) / 100,
      },
    });

    await tx.pedidoProducto.createMany({
      data: pedidoItems.map((i) => ({ ...i, pedidoId: pedido.id })),
    });

    for (const [materiaPrimaId, cantidad] of consumo) {
      const mp = await tx.materiaPrima.findUnique({ where: { id: materiaPrimaId } });
      if (!mp) continue;
      await tx.movimientoMP.create({
        data: {
          materiaPrimaId,
          type: "SALIDA",
          quantity: cantidad,
          notes: `Pedido ${pedido.code}`,
        },
      });
      await tx.materiaPrima.update({
        where: { id: materiaPrimaId },
        data: { stock: mp.stock - cantidad },
      });
    }

    return tx.pedido.findUnique({
      where: { id: pedido.id },
      include: { items: { include: { producto: true } } },
    });
  });
}

async function revertirConsumo(
  tx: Prisma.TransactionClient,
  pedidoCode: string,
  items: { productoId: number; quantity: number }[]
) {
  const consumo = await calcularConsumoMPTx(tx, items);
  for (const [materiaPrimaId, cantidad] of consumo) {
    const mp = await tx.materiaPrima.findUnique({ where: { id: materiaPrimaId } });
    if (!mp) continue;
    await tx.movimientoMP.create({
      data: {
        materiaPrimaId,
        type: "ENTRADA",
        quantity: cantidad,
        notes: `Reverso ${pedidoCode}`,
      },
    });
    await tx.materiaPrima.update({
      where: { id: materiaPrimaId },
      data: { stock: mp.stock + cantidad },
    });
  }
}

async function calcularConsumoMPTx(
  tx: Prisma.TransactionClient,
  items: { productoId: number; quantity: number }[]
) {
  const consumo = new Map<number, number>();
  for (const item of items) {
    const receta = await tx.productoMateriaPrima.findMany({
      where: { productoId: item.productoId },
    });
    for (const pmp of receta) {
      const usado = pmp.quantity * item.quantity;
      consumo.set(pmp.materiaPrimaId, (consumo.get(pmp.materiaPrimaId) || 0) + usado);
    }
  }
  return consumo;
}

export async function updatePedido(id: number, data: Partial<PedidoData>) {
  const existing = await prisma.pedido.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!existing) throw new Error("Pedido no encontrado");

  if (data.items !== undefined) {
    if (data.items.length === 0)
      throw new Error("El pedido debe tener al menos un producto");

    let total = 0;
    const nuevosItems: { subtotal: number; productoId: number; quantity: number }[] = [];
    for (const item of data.items) {
      const prod = await prisma.producto.findUnique({ where: { id: item.productoId } });
      if (!prod) throw new Error(`Producto ${item.productoId} no encontrado`);
      const subtotal = prod.salePrice * item.quantity;
      total += subtotal;
      nuevosItems.push({ productoId: item.productoId, quantity: item.quantity, subtotal });
    }

    const oldItems = existing.items.map((i) => ({ productoId: i.productoId, quantity: i.quantity }));

    return prisma.$transaction(async (tx) => {
      await revertirConsumo(tx, existing.code, oldItems);

      const nuevoConsumo = await calcularConsumoMPTx(tx, data.items!);
      for (const [materiaPrimaId, cantidad] of nuevoConsumo) {
        const mp = await tx.materiaPrima.findUnique({ where: { id: materiaPrimaId } });
        if (!mp) throw new Error(`Materia prima ${materiaPrimaId} no encontrada`);
        if (mp.stock < cantidad) {
          throw new Error(
            `Materia prima insuficiente: ${mp.name}. Necesitas ${cantidad}, disponible ${mp.stock}.`
          );
        }
      }

      for (const [materiaPrimaId, cantidad] of nuevoConsumo) {
        const mp = await tx.materiaPrima.findUnique({ where: { id: materiaPrimaId } });
        if (!mp) continue;
        await tx.movimientoMP.create({
          data: {
            materiaPrimaId,
            type: "SALIDA",
            quantity: cantidad,
            notes: `Pedido ${existing.code}`,
          },
        });
        await tx.materiaPrima.update({
          where: { id: materiaPrimaId },
          data: { stock: mp.stock - cantidad },
        });
      }

      await tx.pedidoProducto.deleteMany({ where: { pedidoId: id } });
      await tx.pedidoProducto.createMany({
        data: nuevosItems.map((i) => ({ ...i, pedidoId: id })),
      });

      await tx.pedido.update({
        where: { id },
        data: {
          total: Math.round(total * 100) / 100,
          ...(data.status !== undefined && { status: data.status }),
          ...(data.notes !== undefined && { notes: data.notes }),
        },
      });

      return tx.pedido.findUnique({
        where: { id },
        include: { items: { include: { producto: true } } },
      });
    });
  }

  return prisma.pedido.update({
    where: { id },
    data: {
      ...(data.status !== undefined && { status: data.status }),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
    include: {
      items: { include: { producto: true } },
    },
  });
}

export async function deletePedido(id: number) {
  const existing = await prisma.pedido.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!existing) throw new Error("Pedido no encontrado");

  const oldItems = existing.items.map((i) => ({ productoId: i.productoId, quantity: i.quantity }));

  return prisma.$transaction(async (tx) => {
    await revertirConsumo(tx, existing.code, oldItems);
    await tx.pedido.delete({ where: { id } });
    return { success: true };
  });
}
