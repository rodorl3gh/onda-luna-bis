import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { BASIC_COLORS } from "@/types";
import type { MateriaPrima } from "@/types";

interface MateriaPrimaDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { name: string; cost: number; minStock: number; color?: string | null }) => Promise<void>;
  editing: MateriaPrima | null;
}

export default function MateriaPrimaDialog({ open, onClose, onSave, editing }: MateriaPrimaDialogProps) {
  const [name, setName] = useState("");
  const [cost, setCost] = useState("");
  const [minStock, setMinStock] = useState("");
  const [color, setColor] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editing) {
      setName(editing.name);
      setCost(String(editing.cost));
      setMinStock(String(editing.minStock));
      setColor(editing.color ?? null);
    } else {
      setName("");
      setCost("");
      setMinStock("5");
      setColor(null);
    }
    setError("");
  }, [editing, open]);

  if (!open) return null;

  const handleColorSelect = (hex: string) => {
    setColor((prev) => (prev === hex ? null : hex));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) { setError("El nombre es obligatorio"); return; }
    const costNum = Number(cost);
    if (isNaN(costNum) || costNum < 0) { setError("El costo debe ser un numero valido y no negativo"); return; }
    const minNum = Number(minStock);
    if (isNaN(minNum) || minNum < 0) { setError("El stock minimo debe ser un numero valido y no negativo"); return; }

    setSaving(true);
    try {
      const data: { name: string; cost: number; minStock: number; color?: string | null } = {
        name: name.trim(),
        cost: costNum,
        minStock: minNum,
      };
      if (color) data.color = color;
      await onSave(data);
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
            {editing ? "Editar Materia Prima" : "Nueva Materia Prima"}
          </h2>
          <button onClick={onClose} className="min-h-[44px] min-w-[44px] w-8 h-8 rounded-lg flex items-center justify-center text-[var(--admin-text-muted)] hover:bg-[var(--admin-bg-tertiary)] transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {editing && (
          <div className="mb-4 p-3 rounded-xl bg-[var(--admin-bg-tertiary)] border border-[var(--admin-border)]">
            <p className="text-xs text-[var(--admin-text-muted)]">ID: <span className="font-mono text-[var(--admin-text)]">{editing.code}</span></p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] text-[var(--admin-text-muted)] uppercase tracking-wider mb-1.5 block">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Mostacillas doradas"
              className="w-full px-4 py-3 sm:py-2.5 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] text-sm text-[var(--admin-text)] placeholder:text-[var(--admin-placeholder)] focus:outline-none focus:border-[var(--admin-accent)]/50 focus:ring-1 focus:ring-[var(--admin-accent)]/20 transition-all min-h-[44px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-[var(--admin-text-muted)] uppercase tracking-wider mb-1.5 block">Costo (MXN)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0.00"
                inputMode="decimal"
                className="w-full px-4 py-3 sm:py-2.5 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] text-sm text-[var(--admin-text)] placeholder:text-[var(--admin-placeholder)] focus:outline-none focus:border-[var(--admin-accent)]/50 focus:ring-1 focus:ring-[var(--admin-accent)]/20 transition-all min-h-[44px]"
              />
            </div>
            <div>
              <label className="text-[10px] text-[var(--admin-text-muted)] uppercase tracking-wider mb-1.5 block">Stock Minimo</label>
              <input
                type="number"
                step="1"
                min="0"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                placeholder="5"
                inputMode="numeric"
                className="w-full px-4 py-3 sm:py-2.5 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] text-sm text-[var(--admin-text)] placeholder:text-[var(--admin-placeholder)] focus:outline-none focus:border-[var(--admin-accent)]/50 focus:ring-1 focus:ring-[var(--admin-accent)]/20 transition-all min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-[var(--admin-text-muted)] uppercase tracking-wider mb-1.5 flex items-center gap-2">
              Color <span className="text-[var(--admin-text-muted)]/50 font-normal normal-case tracking-normal lowercase">(opcional)</span>
              {color && (
                <span
                  className="w-4 h-4 rounded-full border border-[var(--admin-border)] flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
              )}
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {BASIC_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => handleColorSelect(c.value)}
                  title={c.name}
                  className={cn(
                    "w-9 h-9 sm:w-8 sm:h-8 rounded-full border-2 transition-all flex-shrink-0 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0",
                    color === c.value
                      ? "border-[var(--admin-text)] scale-110 shadow-md"
                      : "border-transparent hover:scale-105 hover:shadow-sm"
                  )}
                  style={{ backgroundColor: c.value }}
                />
              ))}
              <div className="relative">
                <input
                  type="color"
                  value={color || "#000000"}
                  onChange={(e) => setColor(e.target.value || null)}
                  className="w-9 h-9 sm:w-8 sm:h-8 rounded-full cursor-pointer border-0 p-0 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-0"
                />
              </div>
            </div>
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
              disabled={saving}
              className="flex-1 py-3 sm:py-2.5 rounded-xl bg-[#2CB5A8] text-white text-sm font-medium hover:bg-[#249E93] disabled:opacity-40 transition-colors min-h-[44px]"
            >
              {saving ? "Guardando..." : editing ? "Guardar Cambios" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
