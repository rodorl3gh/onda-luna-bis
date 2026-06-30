import { useState, useEffect, useCallback } from "react";
import StatsCards from "@/components/dashboard/StatsCards";
import InventoryControl from "@/components/dashboard/InventoryControl";
import { api } from "@/services/api";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import type { DashboardStats, Pedido } from "@/types";
import { PEDIDO_STATUS } from "@/types";

function getMexicoToday(): string {
  const d = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" }));
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState(getMexicoToday());
  const [dateTo, setDateTo] = useState(getMexicoToday());

  const fetchStats = useCallback(async (from?: string, to?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const data = await api.get<DashboardStats>(`/dashboard/stats?${params}`);
      setStats(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStats(dateFrom, dateTo);
  }, []);

  const handleFilter = () => {
    fetchStats(dateFrom, dateTo);
  };

  const presets = [
    { label: "Hoy", get: () => { const d = getMexicoToday(); setDateFrom(d); setDateTo(d); } },
    { label: "7 dias", get: () => {
      const to = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" }));
      const from = new Date(to);
      from.setDate(from.getDate() - 7);
      setDateFrom(from.toISOString().split("T")[0]);
      setDateTo(to.toISOString().split("T")[0]);
    }},
    { label: "30 dias", get: () => {
      const to = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" }));
      const from = new Date(to);
      from.setDate(from.getDate() - 30);
      setDateFrom(from.toISOString().split("T")[0]);
      setDateTo(to.toISOString().split("T")[0]);
    }},
  ];

  const pedidos: Pedido[] = stats?.ultimosPedidos ?? [];

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[var(--admin-text)] font-display">Dashboard</h1>
          <p className="text-xs text-[var(--admin-text-muted)] mt-0.5">
            {stats ? `Mostrando del ${new Date(stats.rango.from).toLocaleDateString("es-MX")} al ${new Date(stats.rango.to).toLocaleDateString("es-MX")}` : "Resumen del negocio"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-[var(--admin-bg-secondary)] border border-[var(--admin-border)] rounded-xl p-1">
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  p.get();
                  setTimeout(() => fetchStats(dateFrom, dateTo), 0);
                }}
                className="px-3 py-1.5 text-[11px] rounded-lg transition-all text-[var(--admin-text-muted)] hover:text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-tertiary)]"
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg-secondary)] text-xs text-[var(--admin-text)] focus:outline-none focus:border-[var(--admin-accent)]/50"
            />
            <span className="text-[var(--admin-text-muted)] text-xs">a</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg-secondary)] text-xs text-[var(--admin-text)] focus:outline-none focus:border-[var(--admin-accent)]/50"
            />
            <button
              onClick={handleFilter}
              className="px-4 py-1.5 rounded-lg bg-[var(--admin-accent)] text-white text-xs font-medium hover:bg-[var(--admin-accent-hover)] transition-colors"
            >
              Filtrar
            </button>
          </div>
        </div>
      </div>

      <StatsCards
        costoProduccion={stats?.costoProduccion ?? 0}
        ventasPeriodo={stats?.ventasPeriodo ?? 0}
        gananciaNeta={stats?.gananciaNeta ?? 0}
        totalPedidos={stats?.totalPedidos ?? 0}
        loading={loading}
      />

      <div className="mb-4">
        <h2 className="text-sm font-semibold text-[var(--admin-text)] font-display mb-1">Control de Inventario</h2>
        <p className="text-xs text-[var(--admin-text-muted)]">Estado actual de productos y materias primas</p>
      </div>

      <InventoryControl
        productos={stats?.controlInventario.productos ?? { ok: 0, warning: 0, critical: 0 }}
        materiasPrimas={stats?.controlInventario.materiasPrimas ?? { ok: 0, warning: 0, critical: 0 }}
        loading={loading}
      />

      <div className="mt-8 mb-4">
        <h2 className="text-sm font-semibold text-[var(--admin-text)] font-display mb-1">Ultimos Pedidos</h2>
        <p className="text-xs text-[var(--admin-text-muted)]">Actividad reciente de pedidos</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg-secondary)] p-5 animate-pulse"
            >
              <div className="h-4 w-20 bg-[var(--admin-bg-tertiary)] rounded mb-3" />
              <div className="h-3 w-28 bg-[var(--admin-bg-tertiary)] rounded mb-2" />
              <div className="h-3 w-16 bg-[var(--admin-bg-tertiary)] rounded mb-3" />
              <div className="h-3 w-full bg-[var(--admin-bg-tertiary)] rounded" />
            </div>
          ))}
        </div>
      ) : pedidos.length === 0 ? (
        <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg-secondary)] p-8 text-center">
          <p className="text-xs text-[var(--admin-text-muted)]">No hay pedidos registrados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {pedidos.map((pedido) => (
            <div
              key={pedido.id}
              className={cn(
                "rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg-secondary)] p-5",
                "hover:border-[var(--admin-border-hover)] transition-all duration-300",
                "shadow-[0_2px_12px_var(--admin-shadow)]"
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-semibold text-[var(--admin-accent)]">
                  {pedido.code}
                </span>
                <span
                  className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full border font-medium",
                    PEDIDO_STATUS[pedido.status]?.cls
                  )}
                >
                  {PEDIDO_STATUS[pedido.status]?.label ?? pedido.status}
                </span>
              </div>

              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold text-[var(--admin-text)] font-display">
                  {formatCurrency(pedido.total)}
                </span>
                <span className="text-[10px] text-[var(--admin-text-muted)]">
                  {formatDate(pedido.createdAt)}
                </span>
              </div>

              <div className="pt-3 border-t border-[var(--admin-border)]">
                <ul className="space-y-1">
                  {pedido.items.slice(0, 3).map((item) => (
                    <li key={item.id} className="flex justify-between text-[11px]">
                      <span className="text-[var(--admin-text-secondary)] truncate mr-2">
                        {item.producto?.name ?? `Producto #${item.productoId}`}
                      </span>
                      <span className="text-[var(--admin-text-muted)] shrink-0">
                        x{item.quantity}
                      </span>
                    </li>
                  ))}
                  {pedido.items.length > 3 && (
                    <li className="text-[10px] text-[var(--admin-text-muted)] pt-0.5">
                      +{pedido.items.length - 3} productos mas
                    </li>
                  )}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
