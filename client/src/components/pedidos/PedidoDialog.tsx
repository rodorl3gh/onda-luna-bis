import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import { PEDIDO_STATUS } from "@/types";
import type { Pedido, Producto } from "@/types";

interface PedidoDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    status?: string;
    notes?: string;
    items: { productoId: number; quantity: number }[];
  }) => Promise<void>;
  editing: Pedido | null;
  productos: Producto[];
}

export default function PedidoDialog({ open, onClose, onSave, editing, productos }: PedidoDialogProps) {
  const [status, setStatus] = useState("PENDIENTE");
  const [notes, setNotes] = useState("");
  const [selectedItems, setSelectedItems] = useState<{ productoId: number; quantity: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showProductSelector, setShowProductSelector] = useState(false);

  useEffect(() => {
    if (editing) {
      setStatus(editing.status);
      setNotes(editing.notes || "");
      setSelectedItems(
        editing.items?.map((i) => ({
          productoId: i.productoId,
          quantity: String(i.quantity),
        })) || []
      );
    } else {
      setStatus("PENDIENTE");
      setNotes("");
      setSelectedItems([]);
    }
    setError("");
    setShowProductSelector(false);
  }, [editing, open]);

  if (!open) return null;

  const handleAddProduct = (productoId: number) => {
    setSelectedItems((prev) => {
      if (prev.find((p) => p.productoId === productoId)) return prev;
      return [...prev, { productoId, quantity: "1" }];
    });
  };

  const handleRemoveProduct = (productoId: number) => {
    setSelectedItems((prev) => prev.filter((p) => p.productoId !== productoId));
  };

  const handleQtyChange = (productoId: number, qty: string) => {
    setSelectedItems((prev) =>
      prev.map((p) => (p.productoId === productoId ? { ...p, quantity: qty } : p))
    );
  };

  const getProductName = (id: number) => productos.find((p) => p.id === id)?.name || "Desconocido";
  const getProductPrice = (id: number) => productos.find((p) => p.id === id)?.salePrice || 0;

  const total = selectedItems.reduce((sum, item) => {
    return sum + getProductPrice(item.productoId) * (Number(item.quantity) || 0);
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (selectedItems.length === 0) { setError("Agrega al menos un producto"); return; }

    const items = selectedItems.map((i) => ({
      productoId: i.productoId,
      quantity: Number(i.quantity) || 1,
    }));

    if (items.some((i) => i.quantity <= 0)) {
      setError("Las cantidades deben ser mayores a 0"); return;
    }

    setSaving(true);
    try {
      await onSave({ status, notes: notes.trim() || undefined, items });
      onClose();
    } catch (e: any) {
      setError(e.message);
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 pt-[5vh] backdrop-blur-sm overflow-y-auto">
      <div className="bg-[var(--admin-bg-secondary)] border border-[var(--admin-border)] rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-scale-in my-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-[var(--admin-text)] font-display">
            {editing ? `Editar ${editing.code}` : "Nuevo Pedido"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--admin-text-muted)] hover:bg-[var(--admin-bg-tertiary)] transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] text-[var(--admin-text-muted)] uppercase tracking-wider mb-1.5 block">Estado</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] text-sm text-[var(--admin-text)] focus:outline-none focus:border-[var(--admin-accent)]/50 transition-all"
            >
              {Object.entries(PEDIDO_STATUS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] text-[var(--admin-text-muted)] uppercase tracking-wider">
                Productos
              </label>
              <button
                type="button"
                onClick={() => setShowProductSelector(!showProductSelector)}
                className="text-xs text-[var(--admin-accent)] hover:text-[var(--admin-accent-hover)] font-medium transition-colors"
              >
                {showProductSelector ? "Cerrar" : "+ Agregar Producto"}
              </button>
            </div>

            {showProductSelector && (
              <div className="mb-3 p-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] max-h-48 overflow-y-auto space-y-1">
                {productos.map((prod) => (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => handleAddProduct(prod.id)}
                    disabled={!!selectedItems.find((s) => s.productoId === prod.id)}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-[var(--admin-text)] hover:bg-[var(--admin-bg-tertiary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-between"
                  >
                    <span>{prod.name}</span>
                    <span className="text-[var(--admin-text-muted)]">{formatCurrency(prod.salePrice)}</span>
                  </button>
                ))}
              </div>
            )}

            {selectedItems.length > 0 ? (
              <div className="space-y-2">
                {selectedItems.map((item) => (
                  <div key={item.productoId} className="flex items-center gap-2 p-2 rounded-lg bg-[var(--admin-bg-tertiary)]">
                    <span className="flex-1 text-xs text-[var(--admin-text)]">{getProductName(item.productoId)}</span>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleQtyChange(item.productoId, e.target.value)}
                      className="w-16 px-2 py-1 rounded-lg border border-[var(--admin-border)] text-xs text-center bg-[var(--admin-bg-secondary)] text-[var(--admin-text)] focus:outline-none focus:border-[var(--admin-accent)]/50"
                    />
                    <span className="text-xs text-[var(--admin-text-muted)] w-20 text-right font-mono">
                      {formatCurrency(getProductPrice(item.productoId) * (Number(item.quantity) || 0))}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveProduct(item.productoId)}
                      className="text-red-400 hover:text-red-500 p-1"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--admin-text-muted)] py-3">No hay productos agregados</p>
            )}

            {selectedItems.length > 0 && (
              <div className="mt-3 p-3 rounded-xl bg-[var(--admin-bg-tertiary)] border border-[var(--admin-border)] flex items-center justify-between">
                <span className="text-xs text-[var(--admin-text-muted)]">Total</span>
                <span className="text-sm font-bold text-[var(--admin-text)] font-mono">{formatCurrency(total)}</span>
              </div>
            )}
          </div>

          <div>
            <label className="text-[10px] text-[var(--admin-text-muted)] uppercase tracking-wider mb-1.5 block">Notas</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas del pedido..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] text-sm text-[var(--admin-text)] placeholder:text-[var(--admin-placeholder)] focus:outline-none focus:border-[var(--admin-accent)]/50 focus:ring-1 focus:ring-[var(--admin-accent)]/20 transition-all resize-none"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20 text-red-500 text-xs">{error}</div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[var(--admin-border)] text-sm text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-tertiary)] transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-[var(--admin-accent)] text-white text-sm font-medium hover:bg-[var(--admin-accent-hover)] disabled:opacity-40 transition-colors">
              {saving ? "Guardando..." : editing ? "Guardar Cambios" : "Crear Pedido"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
