import { useState } from "react";
import { formatCurrency, cn } from "@/lib/utils";
import type { MateriaPrima } from "@/types";

interface MateriaPrimaTableProps {
  data: MateriaPrima[];
  loading: boolean;
  onEdit: (mp: MateriaPrima) => void;
  onDelete: (mp: MateriaPrima) => void;
  onMovement: (mp: MateriaPrima) => void;
}

function getStockStatus(stock: number, min: number) {
  if (stock <= min) return { label: "Critico", cls: "bg-red-100 text-red-700 border-red-200" };
  if (stock <= min * 1.5) return { label: "Bajo", cls: "bg-amber-100 text-amber-700 border-amber-200" };
  return { label: "Saludable", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" };
}

export default function MateriaPrimaTable({ data, loading, onEdit, onDelete, onMovement }: MateriaPrimaTableProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = search
    ? data.filter(
        (mp) =>
          mp.name.toLowerCase().includes(search.toLowerCase()) ||
          mp.code.toLowerCase().includes(search.toLowerCase())
      )
    : data;

  const totalPages = Math.ceil(filtered.length / perPage) || 1;
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 rounded-xl bg-[var(--admin-bg-secondary)] border border-[var(--admin-border)] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre o codigo..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full max-w-sm px-4 py-2 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-secondary)] text-sm text-[var(--admin-text)] placeholder:text-[var(--admin-placeholder)] focus:outline-none focus:border-[var(--admin-accent)]/50 transition-all"
        />
      </div>

      {paginated.length === 0 ? (
        <div className="text-center py-12 text-[var(--admin-text-muted)]">
          {search ? "No se encontraron resultados" : "No hay materias primas registradas"}
        </div>
      ) : (
        <>
          <div className="hidden md:block rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg-secondary)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--admin-border)]">
                  <th className="text-left px-5 py-3 text-[10px] uppercase tracking-wider text-[var(--admin-text-muted)] font-medium">ID</th>
                  <th className="text-left px-5 py-3 text-[10px] uppercase tracking-wider text-[var(--admin-text-muted)] font-medium">Nombre</th>
                  <th className="text-right px-5 py-3 text-[10px] uppercase tracking-wider text-[var(--admin-text-muted)] font-medium">Costo</th>
                  <th className="text-right px-5 py-3 text-[10px] uppercase tracking-wider text-[var(--admin-text-muted)] font-medium">Existencia</th>
                  <th className="text-center px-5 py-3 text-[10px] uppercase tracking-wider text-[var(--admin-text-muted)] font-medium">Estado</th>
                  <th className="text-right px-5 py-3 text-[10px] uppercase tracking-wider text-[var(--admin-text-muted)] font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((mp) => {
                  const status = getStockStatus(mp.stock, mp.minStock);
                  return (
                    <tr
                      key={mp.id}
                      className="border-b border-[var(--admin-border)] last:border-0 hover:bg-[var(--admin-bg-tertiary)]/50 transition-colors"
                      style={mp.color ? { borderLeft: `4px solid ${mp.color}` } : undefined}
                    >
                      <td className="px-5 py-3 text-[var(--admin-text-muted)] text-xs font-mono">{mp.code}</td>
                      <td className="px-5 py-3 text-[var(--admin-text)] font-medium">{mp.name}</td>
                      <td className="px-5 py-3 text-[var(--admin-text)] text-right font-mono">{formatCurrency(mp.cost)}</td>
                      <td className="px-5 py-3 text-[var(--admin-text)] text-right font-mono">{mp.stock}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={cn("status-badge border", status.cls)}>{status.label}</span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onMovement(mp)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#2CB5A8] text-white hover:bg-[#249E93] transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                            Mov.
                          </button>
                          <button
                            onClick={() => onEdit(mp)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-tertiary)] hover:text-[var(--admin-text)] transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Editar
                          </button>
                          <button
                            onClick={() => onDelete(mp)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-red-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {paginated.map((mp) => {
              const status = getStockStatus(mp.stock, mp.minStock);
              return (
                <div key={mp.id} className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-secondary)] overflow-hidden">
                  {mp.color && (
                    <div className="h-1.5 w-full" style={{ backgroundColor: mp.color }} />
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="text-xs text-[var(--admin-text-muted)] font-mono">{mp.code}</span>
                        <h3 className="text-sm font-semibold text-[var(--admin-text)]">{mp.name}</h3>
                      </div>
                      <span className={cn("status-badge border", status.cls)}>{status.label}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[var(--admin-text-secondary)] mb-3">
                      <span>Costo: <strong className="text-[var(--admin-text)]">{formatCurrency(mp.cost)}</strong></span>
                      <span>Existencia: <strong className="text-[var(--admin-text)]">{mp.stock}</strong></span>
                      <span>Min: <strong className="text-[var(--admin-text)]">{mp.minStock}</strong></span>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => onMovement(mp)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#2CB5A8] text-white hover:bg-[#249E93] transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                        Mov.
                      </button>
                      <button
                        onClick={() => onEdit(mp)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-tertiary)] hover:text-[var(--admin-text)] transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                      </button>
                      <button
                        onClick={() => onDelete(mp)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-red-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-[var(--admin-text-muted)]">
            {filtered.length} resultados — Pagina {page} de {totalPages}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-xs border border-[var(--admin-border)] text-[var(--admin-text-secondary)] disabled:opacity-30 hover:bg-[var(--admin-bg-tertiary)] transition-colors"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg text-xs border border-[var(--admin-border)] text-[var(--admin-text-secondary)] disabled:opacity-30 hover:bg-[var(--admin-bg-tertiary)] transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
