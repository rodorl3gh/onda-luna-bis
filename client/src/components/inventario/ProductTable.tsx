import { useState } from "react";
import { formatCurrency, cn } from "@/lib/utils";
import type { Producto } from "@/types";

interface ProductTableProps {
  data: Producto[];
  loading: boolean;
  viewMode: "lista" | "cuadricula";
  onEdit: (p: Producto) => void;
  onDelete: (p: Producto) => void;
  onMovement: (p: Producto) => void;
  onProduce: (p: Producto) => void;
}

function getStockStatus(stock: number): "ok" | "critical" {
  if (stock <= 0) return "critical";
  return "ok";
}

function getStockDot(status: "ok" | "critical") {
  if (status === "critical") return "bg-red-500";
  return "bg-emerald-500";
}

export default function ProductTable({ data, loading, viewMode, onEdit, onDelete, onMovement, onProduce }: ProductTableProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = viewMode === "cuadricula" ? 12 : 10;

  const filtered = search
    ? data.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.code.toLowerCase().includes(search.toLowerCase())
      )
    : data;

  const totalPages = Math.ceil(filtered.length / perPage) || 1;
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  if (loading) {
    return (
      <div className={viewMode === "cuadricula" ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3" : "space-y-3"}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={viewMode === "cuadricula" ? "h-40 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-secondary)] animate-pulse" : "h-14 rounded-xl bg-[var(--admin-bg-secondary)] border border-[var(--admin-border)] animate-pulse"} />
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
          {search ? "No se encontraron resultados" : "No hay productos registrados"}
        </div>
      ) : viewMode === "lista" ? (
        <>
          <div className="hidden md:block rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg-secondary)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--admin-border)]">
                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-[var(--admin-text-muted)] font-medium">Codigo</th>
                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-[var(--admin-text-muted)] font-medium">Nombre</th>
                  <th className="text-right px-4 py-3 text-[10px] uppercase tracking-wider text-[var(--admin-text-muted)] font-medium">Costo Prod.</th>
                  <th className="text-right px-4 py-3 text-[10px] uppercase tracking-wider text-[var(--admin-text-muted)] font-medium">Precio Vta.</th>
                  <th className="text-right px-4 py-3 text-[10px] uppercase tracking-wider text-[var(--admin-text-muted)] font-medium">Ganancia</th>
                  <th className="text-right px-4 py-3 text-[10px] uppercase tracking-wider text-[var(--admin-text-muted)] font-medium">Stock</th>
                  <th className="text-center px-4 py-3 text-[10px] uppercase tracking-wider text-[var(--admin-text-muted)] font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((p) => {
                  const status = getStockStatus(p.stock);
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-[var(--admin-border)] last:border-0 hover:bg-[var(--admin-bg-tertiary)]/50 transition-colors"
                      style={p.color ? { borderLeftColor: p.color, borderLeftWidth: "4px", borderLeftStyle: "solid" } : undefined}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[var(--admin-text-muted)] font-mono">{p.code}</span>
                          <span className={cn("w-2 h-2 rounded-full shrink-0", getStockDot(status))} title={status === "critical" ? "Sin stock" : "Con stock"} />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[var(--admin-text)] font-medium">{p.name}</td>
                      <td className="px-4 py-3 text-[var(--admin-text)] text-right font-mono text-xs">{formatCurrency(p.productionCost)}</td>
                      <td className="px-4 py-3 text-[var(--admin-text)] text-right font-mono text-xs">{formatCurrency(p.salePrice)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={cn("text-xs font-mono", p.margin >= 0 ? "text-emerald-600" : "text-red-500")}>
                          {p.marginPercent.toFixed(0)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[var(--admin-text)] text-right font-mono text-xs">{p.stock}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onProduce(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[var(--admin-accent)] text-white hover:bg-[var(--admin-accent-hover)] transition-colors"
                          >
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Producir</span>
                          </button>
                          <button
                            onClick={() => onMovement(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-teal-500 text-white hover:bg-teal-600 transition-colors"
                          >
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                            <span>Mov.</span>
                          </button>
                          <button
                            onClick={() => onEdit(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-tertiary)] transition-colors"
                          >
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span>Editar</span>
                          </button>
                          <button
                            onClick={() => onDelete(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                          >
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {paginated.map((p) => {
            const status = getStockStatus(p.stock);
            return (
              <div
                key={p.id}
                className="md:hidden rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-secondary)] p-4"
                style={p.color ? { borderLeftColor: p.color, borderLeftWidth: "4px", borderLeftStyle: "solid" } : undefined}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-xs text-[var(--admin-text-muted)] font-mono">{p.code}</span>
                    <h3 className="text-sm font-semibold text-[var(--admin-text)]">{p.name}</h3>
                  </div>
                  <span className={cn("status-badge border", p.margin >= 0 ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-red-100 text-red-700 border-red-200")}>
                    {p.marginPercent.toFixed(0)}%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-[var(--admin-text-secondary)] mb-3">
                  <span>Costo: <strong className="text-[var(--admin-text)]">{formatCurrency(p.productionCost)}</strong></span>
                  <span>Precio: <strong className="text-[var(--admin-text)]">{formatCurrency(p.salePrice)}</strong></span>
                  <span className="flex items-center gap-1">Stock: <strong className="text-[var(--admin-text)]">{p.stock}</strong><span className={cn("w-2 h-2 rounded-full", getStockDot(status))} /></span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button onClick={() => onProduce(p)} className="inline-flex items-center gap-1 justify-center py-2 rounded-lg text-xs font-medium bg-[var(--admin-accent)] text-white hover:bg-[var(--admin-accent-hover)] transition-colors min-h-[40px]">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Producir</span>
                  </button>
                  <button onClick={() => onMovement(p)} className="inline-flex items-center gap-1 justify-center py-2 rounded-lg text-xs font-medium bg-teal-500 text-white hover:bg-teal-600 transition-colors min-h-[40px]">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                    <span>Mov.</span>
                  </button>
                  <button onClick={() => onEdit(p)} className="inline-flex items-center gap-1 justify-center py-2 rounded-lg text-xs font-medium border border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-tertiary)] transition-colors min-h-[40px]">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Editar</span>
                  </button>
                  <button onClick={() => onDelete(p)} className="inline-flex items-center gap-1 justify-center py-2 rounded-lg text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition-colors min-h-[40px]">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {paginated.map((p) => {
            const status = getStockStatus(p.stock);
            return (
              <div
                key={p.id}
                className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-secondary)] overflow-hidden flex flex-col"
              >
                {p.color && (
                  <div className="h-2 w-full shrink-0" style={{ backgroundColor: p.color }} />
                )}
                <div className="p-3 flex flex-col gap-2 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] text-[var(--admin-text-muted)] font-mono">{p.code}</span>
                    <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", getStockDot(status))} title={status === "critical" ? "Sin stock" : "Con stock"} />
                  </div>
                  <h3 className="text-sm font-semibold text-[var(--admin-text)] leading-tight line-clamp-2">{p.name}</h3>
                  <div className="text-xs text-[var(--admin-text-secondary)] space-y-0.5">
                    <div className="flex justify-between">
                      <span>Costo</span>
                      <span className="text-[var(--admin-text)] font-mono">{formatCurrency(p.productionCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Precio</span>
                      <span className="text-[var(--admin-text)] font-mono">{formatCurrency(p.salePrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Margen</span>
                      <span className={cn("font-mono", p.margin >= 0 ? "text-emerald-600" : "text-red-500")}>
                        {p.marginPercent.toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Stock</span>
                      <span className="text-[var(--admin-text)] font-mono">{p.stock}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1 mt-auto pt-2 border-t border-[var(--admin-border)]">
                    <button
                      onClick={() => onProduce(p)}
                      className="inline-flex items-center gap-0.5 justify-center py-1.5 rounded-lg text-[10px] font-medium bg-[var(--admin-accent)] text-white hover:bg-[var(--admin-accent-hover)] transition-colors"
                    >
                      <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Producir</span>
                    </button>
                    <button
                      onClick={() => onMovement(p)}
                      className="inline-flex items-center gap-0.5 justify-center py-1.5 rounded-lg text-[10px] font-medium bg-teal-500 text-white hover:bg-teal-600 transition-colors"
                    >
                      <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                      <span>Mov.</span>
                    </button>
                    <button
                      onClick={() => onEdit(p)}
                      className="inline-flex items-center gap-0.5 justify-center py-1.5 rounded-lg text-[10px] font-medium border border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-tertiary)] transition-colors"
                    >
                      <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => onDelete(p)}
                      className="inline-flex items-center gap-0.5 justify-center py-1.5 rounded-lg text-[10px] font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                    >
                      <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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
