import { formatCurrency } from "@/lib/utils";
import { PEDIDO_STATUS } from "@/types";
import { cn } from "@/lib/utils";
import type { Pedido } from "@/types";

interface PedidoDetailProps {
  pedido: Pedido;
  onClose: () => void;
}

export default function PedidoDetail({ pedido, onClose }: PedidoDetailProps) {
  const status = PEDIDO_STATUS[pedido.status] || { label: pedido.status, cls: "" };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-[var(--admin-bg-secondary)] border border-[var(--admin-border)] rounded-2xl p-6 w-full max-w-md shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-[var(--admin-text)] font-display">{pedido.code}</h2>
            <p className="text-xs text-[var(--admin-text-muted)]">{new Date(pedido.createdAt).toLocaleString("es-MX")}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("status-badge border", status.cls)}>{status.label}</span>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--admin-text-muted)] hover:bg-[var(--admin-bg-tertiary)] transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {pedido.items && pedido.items.length > 0 ? (
          <div className="space-y-2 mb-4">
            {pedido.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--admin-bg-tertiary)]">
                <div>
                  <p className="text-sm text-[var(--admin-text)] font-medium">{item.producto.name}</p>
                  <p className="text-xs text-[var(--admin-text-muted)]">
                    {item.quantity} x {formatCurrency(item.producto.salePrice)}
                  </p>
                </div>
                <span className="text-sm font-bold text-[var(--admin-text)] font-mono">
                  {formatCurrency(item.subtotal)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[var(--admin-text-muted)] mb-4">Sin productos</p>
        )}

        <div className="p-4 rounded-xl bg-[var(--admin-accent)]/5 border border-[var(--admin-accent)]/10 flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-[var(--admin-text)]">Total</span>
          <span className="text-lg font-bold text-[var(--admin-text)] font-mono">{formatCurrency(pedido.total)}</span>
        </div>

        {pedido.notes && (
          <div className="p-3 rounded-xl bg-[var(--admin-bg-tertiary)] border border-[var(--admin-border)] mb-4">
            <p className="text-[10px] text-[var(--admin-text-muted)] uppercase tracking-wider mb-1">Notas</p>
            <p className="text-sm text-[var(--admin-text)]">{pedido.notes}</p>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl border border-[var(--admin-border)] text-sm text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-tertiary)] transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
