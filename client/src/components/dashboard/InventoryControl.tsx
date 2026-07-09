import { cn } from "@/lib/utils";

interface ControlBlockProps {
  title: string;
  ok: number;
  warning: number;
  critical: number;
  loading?: boolean;
}

function ControlBlock({ title, ok, warning, critical, loading }: ControlBlockProps) {
  const total = ok + warning + critical;

  return (
    <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg-secondary)] p-5">
      <h3 className="text-sm font-semibold text-[var(--admin-text)] font-display mb-4">{title}</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]" />
            <span className="text-xs text-[var(--admin-text-secondary)]">Stock Saludable</span>
          </div>
          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            {loading ? "-" : ok}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.3)]" />
            <span className="text-xs text-[var(--admin-text-secondary)]">Proximo al Minimo</span>
          </div>
          <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
            {loading ? "-" : warning}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.3)]" />
            <span className="text-xs text-[var(--admin-text-secondary)]">Debajo del Minimo</span>
          </div>
          <span className="text-sm font-semibold text-red-600 dark:text-red-400">
            {loading ? "-" : critical}
          </span>
        </div>
      </div>

      {!loading && total > 0 && (
        <div className="mt-4 pt-4 border-t border-[var(--admin-border)]">
          <div className="flex h-2 rounded-full overflow-hidden bg-[var(--admin-bg-tertiary)]">
            <div
              className="bg-emerald-400 transition-all duration-500"
              style={{ width: `${(ok / total) * 100}%` }}
            />
            <div
              className="bg-amber-400 transition-all duration-500"
              style={{ width: `${(warning / total) * 100}%` }}
            />
            <div
              className="bg-red-400 transition-all duration-500"
              style={{ width: `${(critical / total) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface InventoryControlProps {
  materiasPrimas: { ok: number; warning: number; critical: number };
  loading?: boolean;
}

export default function InventoryControl({ materiasPrimas, loading }: InventoryControlProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      <ControlBlock
        title="MATERIAS PRIMAS"
        ok={materiasPrimas.ok}
        warning={materiasPrimas.warning}
        critical={materiasPrimas.critical}
        loading={loading}
      />
    </div>
  );
}
