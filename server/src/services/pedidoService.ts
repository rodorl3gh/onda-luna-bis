import { PrismaClient } from "@prisma/client";

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

export async function createPedido(data: PedidoData) {
  const code = await generatePedidoCode();

  if (!data.items || data.items.length === 0) throw new Error("El pedido debe tener al menos un producto");

  let total = 0;

  const pedido = await prisma.pedido.create({
    data: {
      code,
      status: data.status || "PENDIENTE",
      notes: data.notes || null,
      total: 0,
    },
  });

  const pedidoItems: { quantity: number; subtotal: number; pedidoId: number; productoId: number }[] = [];

  for (const item of data.items) {
    const prod = await prisma.producto.findUnique({ where: { id: item.productoId } });
    if (!prod) throw new Error(`Producto ${item.productoId} no encontrado`);
    const subtotal = prod.salePrice * item.quantity;
    total += subtotal;

    pedidoItems.push({
      pedidoId: pedido.id,
      productoId: item.productoId,
      quantity: item.quantity,
      subtotal,
    });
  }

  await prisma.pedidoProducto.createMany({ data: pedidoItems });

  for (const item of data.items) {
    const prod = await prisma.producto.findUnique({ where: { id: item.productoId } });
    if (!prod) continue;

    const newProductStock = prod.stock - item.quantity;
    if (newProductStock < 0) throw new Error(`Stock insuficiente para producto ${prod.name}`);

    await prisma.movimientoProducto.create({
      data: {
        productoId: item.productoId,
        type: "SALIDA",
        quantity: item.quantity,
        notes: `Pedido ${pedido.code}`,
      },
    });

    await prisma.producto.update({
      where: { id: item.productoId },
      data: { stock: newProductStock },
    });

    const productoMps = await prisma.productoMateriaPrima.findMany({
      where: { productoId: item.productoId },
    });

    for (const pmp of productoMps) {
      const mp = await prisma.materiaPrima.findUnique({ where: { id: pmp.materiaPrimaId } });
      if (!mp) continue;

      const mpQuantity = pmp.quantity * item.quantity;
      const newMpStock = mp.stock - mpQuantity;
      if (newMpStock < 0) throw new Error(`Stock insuficiente de materia prima ${mp.name}`);

      await prisma.movimientoMP.create({
        data: {
          materiaPrimaId: pmp.materiaPrimaId,
          type: "SALIDA",
          quantity: mpQuantity,
          notes: `Pedido ${pedido.code}`,
        },
      });

      await prisma.materiaPrima.update({
        where: { id: pmp.materiaPrimaId },
        data: { stock: newMpStock },
      });
    }
  }

  return prisma.pedido.update({
    where: { id: pedido.id },
    data: { total: Math.round(total * 100) / 100 },
    include: {
      items: { include: { producto: true } },
    },
  });
}

export async function updatePedido(id: number, data: Partial<PedidoData>) {
  if (data.items !== undefined) {
    await prisma.pedidoProducto.deleteMany({ where: { pedidoId: id } });

    let total = 0;
    const pedidoItems: { quantity: number; subtotal: number; pedidoId: number; productoId: number }[] = [];

    for (const item of data.items) {
      const prod = await prisma.producto.findUnique({ where: { id: item.productoId } });
      if (!prod) throw new Error(`Producto ${item.productoId} no encontrado`);
      const subtotal = prod.salePrice * item.quantity;
      total += subtotal;

      pedidoItems.push({
        pedidoId: id,
        productoId: item.productoId,
        quantity: item.quantity,
        subtotal,
      });
    }

    await prisma.pedidoProducto.createMany({ data: pedidoItems });
    await prisma.pedido.update({
      where: { id },
      data: { total: Math.round(total * 100) / 100 },
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
  return prisma.pedido.delete({ where: { id } });
}
