import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { formatCurrency, formatDateTime, cn } from "@/lib/utils";
import { PEDIDO_STATUS } from "@/types";
import type { Pedido } from "@/types";

interface PedidoTableProps {
  data: Pedido[];
  loading: boolean;
  onEdit: (p: Pedido) => void;
  onDelete: (p: Pedido) => void;
  onStatusChange: (pedidoId: number, newStatus: string) => void;
}

function StatusDropdown({ p, onStatusChange }: { p: Pedido; onStatusChange: PedidoTableProps["onStatusChange"] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (btnRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const currentStatus = PEDIDO_STATUS[p.status] || { label: p.status, cls: "" };

  const toggleOpen = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, left: rect.left + rect.width / 2 });
    }
    setOpen(!open);
  };

  const handleSelect = async (newStatus: string) => {
    if (newStatus === p.status) { setOpen(false); return; }
    setLoading(true);
    try {
      await onStatusChange(p.id, newStatus);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <button
        ref={btnRef}
        onClick={toggleOpen}
        disabled={loading}
        className={cn("status-badge border cursor-pointer hover:opacity-80 transition-opacity", currentStatus.cls)}
      >
        {loading ? (
          <span className="inline-flex items-center gap-1">
            <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
              <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" />
            </svg>
          </span>
        ) : (
          <>
            {currentStatus.label}
            <svg className="w-3 h-3 ml-0.5 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          className="fixed z-[9999] w-36 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-secondary)] shadow-[0_8px_40px_rgba(0,0,0,0.15)] p-1 animate-scale-in"
          style={{ top: pos.top, left: pos.left, transform: "translateX(-50%)" }}
        >
          {Object.entries(PEDIDO_STATUS).map(([key, val]) => (
            <button
              key={key}
              onClick={() => handleSelect(key)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-xs transition-colors",
                key === p.status
                  ? "bg-[var(--admin-accent)]/10 text-[var(--admin-accent)] font-medium"
                  : "text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-tertiary)] hover:text-[var(--admin-text)]"
              )}
            >
              {val.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}

export default function PedidoTable({ data, loading, onEdit, onDelete, onStatusChange }: PedidoTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [page, setPage] = useState(1);
  const perPage = 10;

  let filtered = data;
  if (statusFilter !== "TODOS") {
    filtered = filtered.filter((p) => p.status === statusFilter);
  }
  if (search) {
    filtered = filtered.filter(
      (p) =>
        p.code.toLowerCase().includes(search.toLowerCase()) ||
        p.items?.some((i) => i.producto.name.toLowerCase().includes(search.toLowerCase()))
    );
  }

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
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Buscar por folio o producto..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full max-w-sm px-4 py-2 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-secondary)] text-sm text-[var(--admin-text)] placeholder:text-[var(--admin-placeholder)] focus:outline-none focus:border-[var(--admin-accent)]/50 transition-all"
        />
        <div className="flex bg-[var(--admin-bg-secondary)] border border-[var(--admin-border)] rounded-xl p-1">
          {["TODOS", "PENDIENTE", "EN_PROCESO", "ENTREGADO", "CANCELADO"].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={cn(
                "px-3 py-1.5 text-[11px] rounded-lg transition-all",
                statusFilter === s
                  ? "bg-[var(--admin-accent)] text-white font-medium"
                  : "text-[var(--admin-text-muted)] hover:text-[var(--admin-text-secondary)]"
              )}
            >
              {s === "TODOS" ? "Todos" : PEDIDO_STATUS[s]?.label || s}
            </button>
          ))}
        </div>
      </div>

      {paginated.length === 0 ? (
        <div className="text-center py-12 text-[var(--admin-text-muted)]">
          {search || statusFilter !== "TODOS" ? "No se encontraron resultados" : "No hay pedidos registrados"}
        </div>
      ) : (
        <>
          <div className="hidden md:block rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg-secondary)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--admin-border)]">
                  <th className="text-left px-5 py-3 text-[10px] uppercase tracking-wider text-[var(--admin-text-muted)] font-medium">Folio</th>
                  <th className="text-left px-5 py-3 text-[10px] uppercase tracking-wider text-[var(--admin-text-muted)] font-medium">Productos</th>
                  <th className="text-center px-3 py-3 text-[10px] uppercase tracking-wider text-[var(--admin-text-muted)] font-medium">Estado</th>
                  <th className="text-right px-5 py-3 text-[10px] uppercase tracking-wider text-[var(--admin-text-muted)] font-medium">Total</th>
                  <th className="text-right px-5 py-3 text-[10px] uppercase tracking-wider text-[var(--admin-text-muted)] font-medium">Fecha</th>
                  <th className="text-right px-5 py-3 text-[10px] uppercase tracking-wider text-[var(--admin-text-muted)] font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((p) => (
                  <tr key={p.id} className="border-b border-[var(--admin-border)] last:border-0 hover:bg-[var(--admin-bg-tertiary)]/50 transition-colors">
                    <td className="px-5 py-3 text-[var(--admin-text-muted)] text-xs font-mono">{p.code}</td>
                    <td className="px-5 py-3 text-[var(--admin-text)]">
                      {p.items?.map((i) => i.producto.name).join(", ") || "-"}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="flex justify-center">
                        <StatusDropdown p={p} onStatusChange={onStatusChange} />
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[var(--admin-text)] text-right font-mono text-xs">{formatCurrency(p.total)}</td>
                    <td className="px-5 py-3 text-[var(--admin-text-muted)] text-right text-xs">{formatDateTime(p.createdAt)}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onEdit(p)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border-2 border-[var(--admin-accent)] text-[var(--admin-accent)] hover:bg-[var(--admin-accent)] hover:text-white transition-all"
                        >
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Editar
                        </button>
                        <button
                          onClick={() => onDelete(p)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                        >
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {paginated.map((p) => (
              <div key={p.id} className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-secondary)] p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-xs text-[var(--admin-text-muted)] font-mono">{p.code}</span>
                    <h3 className="text-sm font-semibold text-[var(--admin-text)]">
                      {p.items?.map((i) => i.producto.name).slice(0, 2).join(", ") || "Sin productos"}
                      {(p.items?.length ?? 0) > 2 && ` +${(p.items?.length ?? 0) - 2}`}
                    </h3>
                  </div>
                  <StatusDropdown p={p} onStatusChange={onStatusChange} />
                </div>
                <div className="flex items-center justify-between text-xs text-[var(--admin-text-secondary)] mb-3">
                  <span>Total: <strong className="text-[var(--admin-text)]">{formatCurrency(p.total)}</strong></span>
                  <span>{formatDateTime(p.createdAt)}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => onEdit(p)} className="inline-flex items-center justify-center gap-1 flex-1 py-1.5 rounded-lg text-xs font-medium border-2 border-[var(--admin-accent)] text-[var(--admin-accent)] hover:bg-[var(--admin-accent)] hover:text-white transition-all">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar
                  </button>
                  <button onClick={() => onDelete(p)} className="inline-flex items-center justify-center gap-1 flex-1 py-1.5 rounded-lg text-xs font-medium border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
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
