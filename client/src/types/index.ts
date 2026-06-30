export interface MateriaPrima {
  id: number;
  code: string;
  name: string;
  cost: number;
  stock: number;
  minStock: number;
  color: string | null;
  createdAt: string;
  movements: MovimientoMP[];
}

export interface MovimientoMP {
  id: number;
  materiaPrimaId: number;
  type: "ENTRADA" | "SALIDA" | "AJUSTE";
  quantity: number;
  notes: string | null;
  createdAt: string;
}

export interface Producto {
  id: number;
  code: string;
  name: string;
  productionCost: number;
  salePrice: number;
  margin: number;
  marginPercent: number;
  stock: number;
  minStock: number;
  color: string | null;
  createdAt: string;
  materiasPrimas: ProductoMateriaPrima[];
  movements: MovimientoProducto[];
}

export interface ProductoMateriaPrima {
  id: number;
  productoId: number;
  materiaPrimaId: number;
  quantity: number;
  materiaPrima: MateriaPrima;
}

export interface MovimientoProducto {
  id: number;
  productoId: number;
  type: "ENTRADA" | "SALIDA" | "AJUSTE";
  quantity: number;
  notes: string | null;
  createdAt: string;
}

export interface Pedido {
  id: number;
  code: string;
  status: "PENDIENTE" | "EN_PROCESO" | "ENTREGADO" | "CANCELADO";
  notes: string | null;
  total: number;
  createdAt: string;
  items: PedidoProducto[];
}

export interface PedidoProducto {
  id: number;
  pedidoId: number;
  productoId: number;
  quantity: number;
  subtotal: number;
  producto: Producto;
}

export interface DashboardStats {
  costoProduccion: number;
  ventasPeriodo: number;
  gananciaNeta: number;
  totalPedidos: number;
  controlInventario: {
    productos: { ok: number; warning: number; critical: number };
    materiasPrimas: { ok: number; warning: number; critical: number };
  };
  rango: { from: string; to: string };
  ultimosPedidos?: Pedido[];
}

export const BASIC_COLORS = [
  { name: "Turquesa", value: "#2CB5A8" },
  { name: "Rosa", value: "#D48C9D" },
  { name: "Dorado", value: "#D5B87E" },
  { name: "Marrón", value: "#896263" },
  { name: "Azul", value: "#5B8BD4" },
  { name: "Verde", value: "#5BA87D" },
  { name: "Morado", value: "#9B7EC4" },
];

export const PEDIDO_STATUS: Record<string, { label: string; cls: string }> = {
  PENDIENTE: {
    label: "Pendiente",
    cls: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/25",
  },
  EN_PROCESO: {
    label: "En Proceso",
    cls: "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-500/15 dark:text-sky-400 dark:border-sky-500/25",
  },
  ENTREGADO: {
    label: "Entregado",
    cls: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/25",
  },
  CANCELADO: {
    label: "Cancelado",
    cls: "bg-red-100 text-red-800 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/25",
  },
};
