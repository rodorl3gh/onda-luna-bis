import { formatCurrency } from "@/lib/utils";
import type { MateriaPrima } from "@/types";

interface SelectedMP {
  materiaPrimaId: number;
  quantity: string;
}

interface RawMaterialSelectorProps {
  materiasPrimas: MateriaPrima[];
  selected: SelectedMP[];
  show: boolean;
  onToggle: (mpId: number) => void;
  onQuantityChange: (mpId: number, qty: string) => void;
}

export default function RawMaterialSelector({
  materiasPrimas,
  selected,
  show,
  onToggle,
  onQuantityChange,
}: RawMaterialSelectorProps) {
  if (!show) return null;

  return (
    <div className="p-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] max-h-56 overflow-y-auto space-y-1.5">
      {materiasPrimas.length === 0 ? (
        <p className="text-xs text-[var(--admin-text-muted)] text-center py-4">
          No hay materias primas registradas
        </p>
      ) : (
        materiasPrimas.map((mp) => {
          const sel = selected.find((s) => s.materiaPrimaId === mp.id);
          return (
            <div
              key={mp.id}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[var(--admin-bg-tertiary)] transition-colors"
            >
              <input
                type="checkbox"
                checked={!!sel}
                onChange={() => onToggle(mp.id)}
                className="rounded accent-[var(--admin-accent)] shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[var(--admin-text)] truncate">{mp.name}</p>
                <p className="text-[10px] text-[var(--admin-text-muted)]">{formatCurrency(mp.cost)} c/u</p>
              </div>
              {sel && (
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={sel.quantity}
                  onChange={(e) => onQuantityChange(mp.id, e.target.value)}
                  className="w-16 px-2 py-1 rounded-lg border border-[var(--admin-border)] text-xs text-center bg-[var(--admin-bg-secondary)] text-[var(--admin-text)] focus:outline-none focus:border-[var(--admin-accent)]/50 shrink-0"
                  placeholder="1"
                />
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
