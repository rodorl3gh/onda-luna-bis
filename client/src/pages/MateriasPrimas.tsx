import { useState, useEffect, useCallback } from "react";
import MateriaPrimaTable from "@/components/materias-primas/MateriaPrimaTable";
import MateriaPrimaDialog from "@/components/materias-primas/MateriaPrimaDialog";
import MovementDialog from "@/components/materias-primas/MovementDialog";
import { api } from "@/services/api";
import type { MateriaPrima } from "@/types";

export default function MateriasPrimasPage() {
  const [data, setData] = useState<MateriaPrima[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [movementOpen, setMovementOpen] = useState(false);
  const [editing, setEditing] = useState<MateriaPrima | null>(null);
  const [movementTarget, setMovementTarget] = useState<MateriaPrima | null>(null);
  const [historyExpanded, setHistoryExpanded] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.get<MateriaPrima[]>("/materias-primas");
      setData(result);
      if (movementTarget) {
        const updated = result.find((mp: MateriaPrima) => mp.id === movementTarget.id);
        if (updated) setMovementTarget(updated);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [movementTarget]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    const i = setInterval(fetchData, 15000);
    return () => clearInterval(i);
  }, [fetchData]);

  const handleCreate = () => { setEditing(null); setDialogOpen(true); };
  const handleEdit = (mp: MateriaPrima) => { setEditing(mp); setDialogOpen(true); };
  const handleDelete = async (mp: MateriaPrima) => {
    if (!confirm(`Eliminar "${mp.name}"? Esta accion no se puede deshacer.`)) return;
    try {
      await api.delete(`/materias-primas/${mp.id}`);
      if (movementTarget?.id === mp.id) setMovementTarget(null);
      fetchData();
    } catch (e: any) {
      alert(e.message);
    }
  };
  const handleMovement = (mp: MateriaPrima) => { setMovementTarget(mp); setMovementOpen(true); };

  const handleSave = async (formData: { name: string; cost: number; minStock: number; color?: string | null }) => {
    if (editing) {
      await api.put(`/materias-primas/${editing.id}`, formData);
    } else {
      await api.post("/materias-primas", formData);
    }
    fetchData();
  };

  const handleMovementSave = async (formData: { type: string; quantity: number; notes?: string }) => {
    if (!movementTarget) return;
    await api.post(`/materias-primas/${movementTarget.id}/movimientos`, formData);
    fetchData();
  };

  const selectedMP = movementTarget;

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[var(--admin-text)] font-display">Materias Primas</h1>
          <p className="text-xs text-[var(--admin-text-muted)] mt-0.5">
            {data.length} registros — Stock gestionado por movimientos
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--admin-accent)] text-white text-sm font-medium hover:bg-[var(--admin-accent-hover)] transition-colors shadow-[0_4px_12px_rgba(148,193,193,0.2)]"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Materia Prima
        </button>
      </div>

      {selectedMP && (
        <div className="mb-4 p-4 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg-secondary)]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[var(--admin-text)] font-display">
              Historial: {selectedMP.name}
            </h3>
            {selectedMP.movements && selectedMP.movements.length > 0 && (
              <button
                onClick={() => setHistoryExpanded(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-tertiary)] hover:text-[var(--admin-text)] transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                Expandir
              </button>
            )}
          </div>
          {selectedMP.movements && selectedMP.movements.length > 0 ? (
            <div className="space-y-2">
              {selectedMP.movements.slice(0, 5).map((m) => (
                <div key={m.id} className="flex items-center gap-3 text-xs">
                  <span className={`px-2 py-0.5 rounded-full font-medium ${
                    m.type === "ENTRADA" ? "bg-emerald-100 text-emerald-700" :
                    m.type === "SALIDA" ? "bg-red-100 text-red-700" :
                    "bg-amber-100 text-amber-700"
                  }`}>{m.type}</span>
                  <span className="text-[var(--admin-text)] font-mono">{m.quantity}</span>
                  <span className="text-[var(--admin-text-muted)]">{new Date(m.createdAt).toLocaleDateString("es-MX")}</span>
                  {m.notes && <span className="text-[var(--admin-text-muted)]">— {m.notes}</span>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[var(--admin-text-muted)]">Sin movimientos registrados</p>
          )}
        </div>
      )}

      <MateriaPrimaTable
        data={data}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onMovement={handleMovement}
      />

      <MateriaPrimaDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        editing={editing}
      />

      <MovementDialog
        open={movementOpen}
        onClose={() => setMovementOpen(false)}
        materiaPrima={movementTarget}
        onSave={handleMovementSave}
      />

      {historyExpanded && selectedMP && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[var(--admin-bg-secondary)] border border-[var(--admin-border)] rounded-2xl p-6 w-full max-w-lg max-h-[80vh] shadow-2xl animate-scale-in flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--admin-text)] font-display">
                Historial completo — {selectedMP.name}
              </h2>
              <button
                onClick={() => setHistoryExpanded(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--admin-text-muted)] hover:bg-[var(--admin-bg-tertiary)] transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto flex-1 pr-1">
              {selectedMP.movements && selectedMP.movements.length > 0 ? (
                <div className="space-y-2">
                  {selectedMP.movements.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-3 text-xs py-2 px-3 rounded-lg bg-[var(--admin-bg-tertiary)] border border-[var(--admin-border)]"
                    >
                      <span className={`px-2 py-0.5 rounded-full font-medium ${
                        m.type === "ENTRADA" ? "bg-emerald-100 text-emerald-700" :
                        m.type === "SALIDA" ? "bg-red-100 text-red-700" :
                        "bg-amber-100 text-amber-700"
                      }`}>{m.type}</span>
                      <span className="text-[var(--admin-text)] font-mono font-medium">{m.quantity}</span>
                      <span className="text-[var(--admin-text-muted)]">{new Date(m.createdAt).toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      {m.notes && <span className="text-[var(--admin-text-muted)]">— {m.notes}</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--admin-text-muted)] text-center py-8">Sin movimientos registrados</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
