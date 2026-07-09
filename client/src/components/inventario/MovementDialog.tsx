import { useState } from "react";
import type { Producto } from "@/types";

interface MovementDialogProps {
  open: boolean;
  onClose: () => void;
  producto: Producto | null;
  onSave: (data: { type: string; quantity: number; notes?: string }) => Promise<void>;
}

const TYPES = [
  { value: "ENTRADA", label: "Entrada" },
  { value: "SALIDA", label: "Salida" },
  { value: "AJUSTE", label: "Ajuste" },
];

export default function MovementDialog({ open, onClose, producto, onSave }: MovementDialogProps) {
  const [type, setType] = useState("ENTRADA");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!open || !producto) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) { setError("La cantidad debe ser mayor a 0"); return; }

    if (type === "SALIDA" && qty > producto.stock) {
      setError(`Stock insuficiente. Disponible: ${producto.stock}`);
      return;
    }

    setSaving(true);
    try {
      await onSave({ type, quantity: qty, notes: notes.trim() || undefined });
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
            Movimiento — {producto.name}
          </h2>
          <button onClick={onClose} className="min-h-[44px] min-w-[44px] w-8 h-8 rounded-lg flex items-center justify-center text-[var(--admin-text-muted)] hover:bg-[var(--admin-bg-tertiary)] transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 p-3 rounded-xl bg-[var(--admin-bg-tertiary)] border border-[var(--admin-border)] flex items-center justify-between">
          <span className="text-xs text-[var(--admin-text-muted)]">Stock actual</span>
          <span className="text-sm font-bold text-[var(--admin-text)] font-mono">{producto.stock}</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] text-[var(--admin-text-muted)] uppercase tracking-wider mb-1.5 block">Tipo</label>
            <div className="flex gap-2">
              {TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={`flex-1 py-3 sm:py-2.5 rounded-xl text-xs font-medium transition-all border min-h-[44px] ${
                    type === t.value
                      ? "bg-[var(--admin-accent)] border-[var(--admin-accent)] text-white"
                      : "border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-tertiary)]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] text-[var(--admin-text-muted)] uppercase tracking-wider mb-1.5 block">Cantidad</label>
            <input
              type="number"
              step="1"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={type === "AJUSTE" ? "Nuevo stock total" : "Cantidad"}
              inputMode="numeric"
              className="w-full px-4 py-3 sm:py-2.5 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] text-sm text-[var(--admin-text)] placeholder:text-[var(--admin-placeholder)] focus:outline-none focus:border-[var(--admin-accent)]/50 focus:ring-1 focus:ring-[var(--admin-accent)]/20 transition-all min-h-[44px]"
            />
          </div>

          <div>
            <label className="text-[10px] text-[var(--admin-text-muted)] uppercase tracking-wider mb-1.5 block">Observaciones</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas del movimiento..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] text-sm text-[var(--admin-text)] placeholder:text-[var(--admin-placeholder)] focus:outline-none focus:border-[var(--admin-accent)]/50 focus:ring-1 focus:ring-[var(--admin-accent)]/20 transition-all resize-none"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20 text-red-500 text-xs">{error}</div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 sm:py-2.5 rounded-xl border border-[var(--admin-border)] text-sm text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-tertiary)] transition-colors min-h-[44px]">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-3 sm:py-2.5 rounded-xl bg-[var(--admin-accent)] text-white text-sm font-medium hover:bg-[var(--admin-accent-hover)] disabled:opacity-40 transition-colors min-h-[44px]">
              {saving ? "Guardando..." : "Registrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
