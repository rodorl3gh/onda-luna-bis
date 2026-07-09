import { useState, useEffect, useCallback } from "react";
import PedidoTable from "@/components/pedidos/PedidoTable";
import PedidoDialog from "@/components/pedidos/PedidoDialog";
import StatsCards from "@/components/dashboard/StatsCards";
import { MenuButton } from "@/components/layout/AdminLayout";
import { api } from "@/services/api";
import type { DashboardStats, Pedido, Producto } from "@/types";

export default function PedidosPage() {
  const [data, setData] = useState<Pedido[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Pedido | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [pedidos, prods] = await Promise.all([
        api.get<Pedido[]>("/pedidos"),
        api.get<Producto[]>("/productos"),
      ]);
      setData(pedidos);
      setProductos(prods);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const s = await api.get<DashboardStats>("/dashboard/stats");
      setStats(s);
    } catch (e) {
      console.error(e);
    }
    setStatsLoading(false);
  }, []);

  useEffect(() => { fetchData(); fetchStats(); }, [fetchData, fetchStats]);
  useEffect(() => {
    const i = setInterval(fetchData, 15000);
    const j = setInterval(fetchStats, 15000);
    return () => { clearInterval(i); clearInterval(j); };
  }, [fetchData, fetchStats]);

  const handleCreate = () => { setEditing(null); setDialogOpen(true); };
  const handleEdit = (p: Pedido) => { setEditing(p); setDialogOpen(true); };
  const handleDelete = async (p: Pedido) => {
    if (!confirm(`Eliminar pedido "${p.code}"? Esta accion no se puede deshacer.`)) return;
    try {
      await api.delete(`/pedidos/${p.id}`);
      fetchData();
      fetchStats();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleStatusChange = async (pedidoId: number, newStatus: string) => {
    await api.put(`/pedidos/${pedidoId}`, { status: newStatus });
    fetchData();
    fetchStats();
  };

  const handleSave = async (formData: {
    status?: string;
    notes?: string;
    items: { productoId: number; quantity: number }[];
  }) => {
    if (editing) {
      await api.put(`/pedidos/${editing.id}`, formData);
    } else {
      await api.post("/pedidos", formData);
    }
    fetchData();
    fetchStats();
  };

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <MenuButton />
          <div>
            <h1 className="text-xl font-semibold text-[var(--admin-text)] font-display">Pedidos</h1>
            <p className="text-xs text-[var(--admin-text-muted)] mt-0.5">
              {data.length} pedidos — Folio automatico: PED-000001
            </p>
          </div>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-[var(--admin-accent)] text-[var(--admin-accent)] text-sm font-medium hover:bg-[var(--admin-accent)] hover:text-white transition-all shadow-[0_4px_12px_rgba(148,193,193,0.15)]"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Pedido
        </button>
      </div>

      <StatsCards
        costoProduccion={stats?.costoProduccion ?? 0}
        ventasPeriodo={stats?.ventasPeriodo ?? 0}
        gananciaNeta={stats?.gananciaNeta ?? 0}
        totalPedidos={stats?.totalPedidos ?? 0}
        loading={statsLoading && !stats}
      />

      <PedidoTable
        data={data}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
      />

      <PedidoDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        editing={editing}
        productos={productos}
      />
    </div>
  );
}
