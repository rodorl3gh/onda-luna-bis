import { useState, useEffect, useCallback } from "react";
import ProductTable from "@/components/inventario/ProductTable";
import ProductDialog from "@/components/inventario/ProductDialog";
import MovementDialog from "@/components/inventario/MovementDialog";
import ProduceDialog from "@/components/inventario/ProduceDialog";
import { api } from "@/services/api";
import { cn } from "@/lib/utils";
import type { Producto, MateriaPrima } from "@/types";

export default function InventarioPage() {
  const [data, setData] = useState<Producto[]>([]);
  const [materiasPrimas, setMateriasPrimas] = useState<MateriaPrima[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [movementOpen, setMovementOpen] = useState(false);
  const [produceOpen, setProduceOpen] = useState(false);
  const [editing, setEditing] = useState<Producto | null>(null);
  const [movementTarget, setMovementTarget] = useState<Producto | null>(null);
  const [viewMode, setViewMode] = useState<"lista" | "cuadricula">("lista");
  const [historyOverlayOpen, setHistoryOverlayOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [products, mpData] = await Promise.all([
        api.get<Producto[]>("/productos"),
        api.get<MateriaPrima[]>("/materias-primas"),
      ]);
      setData(products);
      setMateriasPrimas(mpData);
      setMovementTarget((prev) => {
        if (!prev) return prev;
        const updated = products.find((p: Producto) => p.id === prev.id);
        return updated || prev;
      });
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    const i = setInterval(fetchData, 15000);
    return () => clearInterval(i);
  }, [fetchData]);

  const handleCreate = () => { setEditing(null); setDialogOpen(true); };
  const handleEdit = (p: Producto) => { setEditing(p); setDialogOpen(true); };
  const handleDelete = async (p: Producto) => {
    if (!confirm(`Eliminar "${p.name}"? Esta accion no se puede deshacer.`)) return;
    try {
      await api.delete(`/productos/${p.id}`);
      fetchData();
    } catch (e: any) {
      alert(e.message);
    }
  };
  const handleMovement = (p: Producto) => { setMovementTarget(p); setMovementOpen(true); };
  const handleProduce = (p: Producto) => { setMovementTarget(p); setProduceOpen(true); };

  const handleSave = async (formData: any) => {
    if (editing) {
      await api.put(`/productos/${editing.id}`, formData);
    } else {
      await api.post("/productos", formData);
    }
    fetchData();
  };

  const handleMovementSave = async (formData: { type: string; quantity: number; notes?: string }) => {
    if (!movementTarget) return;
    await api.post(`/productos/${movementTarget.id}/movimientos`, formData);
    fetchData();
  };

  const handleProduceSave = async (formData: { type: string; quantity: number; notes?: string }) => {
    if (!movementTarget) return;
    await api.post(`/productos/${movementTarget.id}/movimientos`, formData);
    fetchData();
  };

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[var(--admin-text)] font-display">Inventario</h1>
          <p className="text-xs text-[var(--admin-text-muted)] mt-0.5">
            {data.length} productos — Costo calculado por materias primas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-secondary)] p-0.5">
            <button
              onClick={() => setViewMode("lista")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                viewMode === "lista"
                  ? "bg-[var(--admin-accent)] text-white shadow-sm"
                  : "text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]"
              )}
            >
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Lista
              </span>
            </button>
            <button
              onClick={() => setViewMode("cuadricula")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                viewMode === "cuadricula"
                  ? "bg-[var(--admin-accent)] text-white shadow-sm"
                  : "text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]"
              )}
            >
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
                Cuadricula
              </span>
            </button>
          </div>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--admin-accent)] text-white text-sm font-medium hover:bg-[var(--admin-accent-hover)] transition-colors shadow-[0_4px_12px_rgba(148,193,193,0.2)]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Producto
          </button>
        </div>
      </div>

      <div className="mb-4 p-4 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg-secondary)]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[var(--admin-text)] font-display">
            {movementTarget ? `Historial: ${movementTarget.name}` : "Historial de Movimientos"}
          </h3>
          {movementTarget && movementTarget.movements && movementTarget.movements.length > 5 && (
            <button
              onClick={() => setHistoryOverlayOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border border-[var(--admin-border)] text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-bg-tertiary)] transition-colors"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              <span>Expandir</span>
            </button>
          )}
        </div>
        {movementTarget ? (
          movementTarget.movements && movementTarget.movements.length > 0 ? (
            <div className="space-y-2">
              {movementTarget.movements.slice(0, 5).map((m) => (
                <div key={m.id} className="flex items-center gap-3 text-xs">
                  <span className={cn(
                    "px-2 py-0.5 rounded-full font-medium",
                    m.type === "ENTRADA" || m.type === "PRODUCCION" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400" :
                    m.type === "SALIDA" ? "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400" :
                    "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
                  )}>{m.type}</span>
                  <span className="text-[var(--admin-text)] font-mono">{m.quantity}</span>
                  <span className="text-[var(--admin-text-muted)]">{new Date(m.createdAt).toLocaleDateString("es-MX")}</span>
                  {m.notes && <span className="text-[var(--admin-text-muted)]">— {m.notes}</span>}
                </div>
              ))}
              {movementTarget.movements.length > 5 && (
                <p className="text-[11px] text-[var(--admin-text-muted)]">
                  Y {movementTarget.movements.length - 5} movimientos mas...
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-[var(--admin-text-muted)]">Sin movimientos registrados</p>
          )
        ) : (
          <p className="text-xs text-[var(--admin-text-muted)]">
            Haz clic en <span className="text-[var(--admin-accent)] font-medium">"Mov."</span> en un producto para ver su historial de movimientos
          </p>
        )}
      </div>

      <ProductTable
        data={data}
        loading={loading}
        viewMode={viewMode}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onMovement={handleMovement}
        onProduce={handleProduce}
      />

      {historyOverlayOpen && movementTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setHistoryOverlayOpen(false)} />
          <div className="relative w-full max-w-lg max-h-[80vh] rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg-secondary)] shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[var(--admin-border)]">
              <h3 className="text-sm font-semibold text-[var(--admin-text)] font-display">
                Historial completo: {movementTarget.name}
              </h3>
              <button
                onClick={() => setHistoryOverlayOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--admin-text-muted)] hover:bg-[var(--admin-bg-secondary)] hover:text-[var(--admin-text)] transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {movementTarget.movements && movementTarget.movements.length > 0 ? (
                <div className="space-y-2">
                  {movementTarget.movements.map((m) => (
                    <div key={m.id} className="flex items-center gap-3 text-xs p-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg-secondary)]">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full font-medium shrink-0",
                        m.type === "ENTRADA" || m.type === "PRODUCCION" ? "bg-emerald-100 text-emerald-700" :
                        m.type === "SALIDA" ? "bg-red-100 text-red-700" :
                        "bg-amber-100 text-amber-700"
                      )}>{m.type}</span>
                      <span className="text-[var(--admin-text)] font-mono">
                        {m.type === "ENTRADA" || m.type === "PRODUCCION" ? "+" : m.type === "SALIDA" ? "-" : ""}{m.quantity}
                      </span>
                      <span className="text-[var(--admin-text-muted)]">
                        {new Date(m.createdAt).toLocaleString("es-MX")}
                      </span>
                      {m.notes && (
                        <span className="text-[var(--admin-text-muted)] truncate">— {m.notes}</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[var(--admin-text-muted)] text-center py-8">Sin movimientos registrados</p>
              )}
            </div>
            <div className="p-3 border-t border-[var(--admin-border)]">
              <p className="text-[10px] text-[var(--admin-text-muted)] text-center">
                {movementTarget.movements?.length || 0} movimientos en total
              </p>
            </div>
          </div>
        </div>
      )}

      <ProductDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        editing={editing}
        materiasPrimas={materiasPrimas}
      />

      <MovementDialog
        open={movementOpen}
        onClose={() => setMovementOpen(false)}
        producto={movementTarget}
        onSave={handleMovementSave}
      />

      <ProduceDialog
        open={produceOpen}
        onClose={() => setProduceOpen(false)}
        producto={movementTarget}
        onSave={handleProduceSave}
      />
    </div>
  );
}
