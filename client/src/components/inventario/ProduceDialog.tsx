import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import type { Producto } from "@/types";

interface ProduceDialogProps {
  open: boolean;
  onClose: () => void;
  producto: Producto | null;
  onSave: (data: { type: string; quantity: number; notes?: string }) => Promise<void>;
}

export default function ProduceDialog({ open, onClose, producto, onSave }: ProduceDialogProps) {
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!open || !producto) return null;

  const qty = Number(quantity) || 0;
  const mps = producto.materiasPrimas || [];
  const sinMateriales = mps.length === 0;

  const faltantes = mps.filter((mp) => (mp.materiaPrima?.stock ?? 0) < mp.quantity * qty);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isNaN(qty) || qty <= 0) { setError("La cantidad debe ser mayor a 0"); return; }
    if (sinMateriales) { setError("Este producto no tiene materias primas asignadas. Edítalo primero."); return; }
    if (faltantes.length > 0) { setError("No hay suficiente materia prima para esta cantidad"); return; }

    setSaving(true);
    try {
      await onSave({ type: "PRODUCCION", quantity: qty, notes: notes.trim() || undefined });
      setQuantity("");
      setNotes("");
      onClose();
    } catch (e: any) {
      setError(e.message);
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-2 sm:p-4 pt-[5vh] backdrop-blur-sm overflow-y-auto">
      <div className="bg-[var(--admin-bg-secondary)] border border-[var(--admin-border)] rounded-2xl p-4 sm:p-6 w-full max-w-md shadow-2xl animate-scale-in my-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-[var(--admin-text)] font-display">
            Producir — {producto.name}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] w-8 h-8 rounded-lg flex items-center justify-center text-[var(--admin-text-muted)] hover:bg-[var(--admin-bg-tertiary)] transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 p-3 rounded-xl bg-[var(--admin-bg-tertiary)] border border-[var(--admin-border)] flex items-center justify-between">
          <span className="text-xs text-[var(--admin-text-muted)]">Stock actual</span>
          <span className="text-sm font-bold text-[var(--admin-text)] font-mono">{producto.stock}</span>
        </div>

        {sinMateriales ? (
          <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-amber-600 text-xs mb-4">
            Este producto no tiene materias primas asignadas. Edítalo y agrega sus materiales para poder producir.
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] text-[var(--admin-text-muted)] uppercase tracking-wider mb-1.5 block">
              ¿Cuántas piezas se hicieron?
            </label>
            <input
              type="number"
              step="1"
              min="1"
              inputMode="numeric"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Ej: 10"
              className="w-full px-4 py-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] text-sm text-[var(--admin-text)] placeholder:text-[var(--admin-placeholder)] focus:outline-none focus:border-[var(--admin-accent)]/50 focus:ring-1 focus:ring-[var(--admin-accent)]/20 transition-all min-h-[44px]"
            />
          </div>

          {!sinMateriales && qty > 0 && (
            <div className="p-3 rounded-xl bg-[var(--admin-bg-tertiary)] border border-[var(--admin-border)] space-y-2">
              <p className="text-[10px] text-[var(--admin-text-muted)] uppercase tracking-wider">
                Materia prima que se descontará
              </p>
              {mps.map((mp) => {
                const usado = mp.quantity * qty;
                const disponible = mp.materiaPrima?.stock ?? 0;
                const falta = disponible < usado;
                return (
                  <div key={mp.id} className="flex items-center justify-between text-xs">
                    <span className="text-[var(--admin-text)]">{mp.materiaPrima?.name}</span>
                    <span className={falta ? "text-red-500 font-mono" : "text-[var(--admin-text-muted)] font-mono"}>
                      {usado} / {disponible}
                    </span>
                  </div>
                );
              })}
              <div className="flex items-center justify-between pt-2 border-t border-[var(--admin-border)] text-xs">
                <span className="text-[var(--admin-text-muted)]">Costo de producción</span>
                <span className="font-bold text-[var(--admin-text)] font-mono">
                  {formatCurrency(producto.productionCost * qty)}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="text-[10px] text-[var(--admin-text-muted)] uppercase tracking-wider mb-1.5 block">Observaciones</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas (opcional)..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] text-sm text-[var(--admin-text)] placeholder:text-[var(--admin-placeholder)] focus:outline-none focus:border-[var(--admin-accent)]/50 focus:ring-1 focus:ring-[var(--admin-accent)]/20 transition-all resize-none"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20 text-red-500 text-xs">{error}</div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 sm:py-2.5 rounded-xl border border-[var(--admin-border)] text-sm text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-tertiary)] transition-colors min-h-[44px]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || sinMateriales || faltantes.length > 0}
              className="flex-1 py-3 sm:py-2.5 rounded-xl bg-[var(--admin-accent)] text-white text-sm font-medium hover:bg-[var(--admin-accent-hover)] disabled:opacity-40 transition-colors min-h-[44px]"
            >
              {saving ? "Registrando..." : "Registrar Producción"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
