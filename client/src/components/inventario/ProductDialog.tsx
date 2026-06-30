import { useState, useEffect } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import { BASIC_COLORS } from "@/types";
import type { Producto, MateriaPrima } from "@/types";

interface ProductDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    minStock: number;
    salePrice?: number;
    marginPercent?: number;
    color?: string | null;
    materiasPrimas?: { materiaPrimaId: number; quantity: number }[];
  }) => Promise<void>;
  editing: Producto | null;
  materiasPrimas: MateriaPrima[];
}

interface SelectedMP {
  materiaPrimaId: number;
  quantity: string;
}

export default function ProductDialog({ open, onClose, onSave, editing, materiasPrimas }: ProductDialogProps) {
  const [name, setName] = useState("");
  const [minStock, setMinStock] = useState("5");
  const [salePrice, setSalePrice] = useState("");
  const [marginPercent, setMarginPercent] = useState("");
  const [editingField, setEditingField] = useState<"price" | "margin" | null>(null);
  const [selectedMPs, setSelectedMPs] = useState<SelectedMP[]>([]);
  const [showMPSelector, setShowMPSelector] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [color, setColor] = useState<string | null>(null);

  useEffect(() => {
    if (editing) {
      setName(editing.name);
      setMinStock(String(editing.minStock));
      setSalePrice(editing.salePrice ? String(editing.salePrice) : "");
      setMarginPercent(editing.marginPercent ? String(editing.marginPercent) : "");
      setColor(editing.color ?? null);
      setSelectedMPs(
        editing.materiasPrimas?.map((mp) => ({
          materiaPrimaId: mp.materiaPrimaId,
          quantity: String(mp.quantity),
        })) || []
      );
    } else {
      setName("");
      setMinStock("5");
      setSalePrice("");
      setMarginPercent("");
      setColor(null);
      setSelectedMPs([]);
    }
    setError("");
    setShowMPSelector(false);
    setEditingField(null);
  }, [editing, open]);

  if (!open) return null;

  const calculatedCost = selectedMPs.reduce((sum, mp) => {
    const materia = materiasPrimas.find((m) => m.id === mp.materiaPrimaId);
    const qty = Number(mp.quantity) || 0;
    return sum + (materia?.cost || 0) * qty;
  }, 0);

  const sp = Number(salePrice);
  const mpNum = Number(marginPercent);
  const hasCost = calculatedCost > 0;
  const hasValidPrice = !isNaN(sp) && sp > 0;
  const hasValidMargin = !isNaN(mpNum) && mpNum > 0;

  let computedMargin = 0;
  let computedMarginPct = 0;
  let computedPrice = 0;
  let showComputed = false;

  if (hasCost) {
    if (editingField === "price" && hasValidPrice) {
      computedMargin = sp - calculatedCost;
      computedMarginPct = (computedMargin / calculatedCost) * 100;
      computedPrice = sp;
      showComputed = true;
    } else if (editingField === "margin" && hasValidMargin) {
      computedMargin = calculatedCost * mpNum / 100;
      computedMarginPct = mpNum;
      computedPrice = calculatedCost + computedMargin;
      showComputed = true;
    } else if (hasValidPrice) {
      computedMargin = sp - calculatedCost;
      computedMarginPct = (computedMargin / calculatedCost) * 100;
      computedPrice = sp;
      showComputed = true;
    } else if (hasValidMargin) {
      computedMargin = calculatedCost * mpNum / 100;
      computedMarginPct = mpNum;
      computedPrice = calculatedCost + computedMargin;
      showComputed = true;
    }
  }

  const handlePriceChange = (value: string) => {
    setSalePrice(value);
    setEditingField("price");
    const num = Number(value);
    if (!isNaN(num) && num > 0 && calculatedCost > 0) {
      const margin = num - calculatedCost;
      const pct = (margin / calculatedCost) * 100;
      setMarginPercent(pct.toFixed(1));
    }
  };

  const handleMarginChange = (value: string) => {
    setMarginPercent(value);
    setEditingField("margin");
    const num = Number(value);
    if (!isNaN(num) && num > 0 && calculatedCost > 0) {
      const margin = calculatedCost * num / 100;
      setSalePrice((calculatedCost + margin).toFixed(2));
    }
  };

  const handleToggleMP = (mpId: number) => {
    setSelectedMPs((prev) => {
      const exists = prev.find((m) => m.materiaPrimaId === mpId);
      if (exists) return prev.filter((m) => m.materiaPrimaId !== mpId);
      return [...prev, { materiaPrimaId: mpId, quantity: "1" }];
    });
  };

  const handleQtyChange = (mpId: number, qty: string) => {
    setSelectedMPs((prev) =>
      prev.map((m) => (m.materiaPrimaId === mpId ? { ...m, quantity: qty } : m))
    );
  };

  const handleColorSelect = (hex: string) => {
    setColor((prev) => (prev === hex ? null : hex));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) { setError("El nombre es obligatorio"); return; }
    const minNum = Number(minStock);
    if (isNaN(minNum) || minNum < 0) { setError("El stock minimo debe ser valido"); return; }

    const data: any = {
      name: name.trim(),
      minStock: minNum,
    };

    if (color) data.color = color;

    const salePriceNum = Number(salePrice);
    const marginPctNum = Number(marginPercent);

    if (!isNaN(salePriceNum) && salePriceNum > 0) {
      data.salePrice = salePriceNum;
    } else if (!isNaN(marginPctNum) && marginPctNum > 0) {
      if (marginPctNum >= 100) { setError("El porcentaje de ganancia debe ser menor a 100%"); return; }
      data.marginPercent = marginPctNum;
    } else {
      setError("Ingresa un precio de venta o un porcentaje de ganancia"); return;
    }

    if (selectedMPs.length > 0) {
      const validMPs = selectedMPs.map((smp) => ({
        materiaPrimaId: smp.materiaPrimaId,
        quantity: Number(smp.quantity) || 1,
      }));
      if (validMPs.some((m) => m.quantity <= 0)) {
        setError("Todas las cantidades deben ser mayores a 0"); return;
      }
      data.materiasPrimas = validMPs;
    }

    setSaving(true);
    try {
      await onSave(data);
      onClose();
    } catch (e: any) {
      setError(e.message);
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-2 sm:p-4 pt-[5vh] backdrop-blur-sm overflow-y-auto">
      <div className="bg-[var(--admin-bg-secondary)] border border-[var(--admin-border)] rounded-2xl p-4 sm:p-6 w-full max-w-lg shadow-2xl animate-scale-in my-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-[var(--admin-text)] font-display">
            {editing ? "Editar Producto" : "Nuevo Producto"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] w-8 h-8 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-[var(--admin-text-muted)] hover:bg-[var(--admin-bg-tertiary)] transition-colors"
          >
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
            <label className="text-[10px] text-[var(--admin-text-muted)] uppercase tracking-wider mb-1.5 block">
              Nombre del Producto
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Collar Luna creciente"
              className="w-full px-4 py-3 sm:py-2.5 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] text-sm text-[var(--admin-text)] placeholder:text-[var(--admin-placeholder)] focus:outline-none focus:border-[var(--admin-accent)]/50 focus:ring-1 focus:ring-[var(--admin-accent)]/20 transition-all min-h-[44px]"
            />
          </div>

          {/* Materiales */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] text-[var(--admin-text-muted)] uppercase tracking-wider">
                Materias Primas Utilizadas
              </label>
              <button
                type="button"
                onClick={() => setShowMPSelector(!showMPSelector)}
                className="text-xs text-[var(--admin-accent)] hover:text-[var(--admin-accent-hover)] font-medium transition-colors min-h-[44px] flex items-center"
              >
                {showMPSelector ? "Cerrar lista" : "+ Agregar Materia Prima"}
              </button>
            </div>

            {showMPSelector && (
              <div className="mb-3 p-2 sm:p-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] max-h-48 overflow-y-auto space-y-0.5">
                {materiasPrimas.map((mp) => {
                  const selected = selectedMPs.find((s) => s.materiaPrimaId === mp.id);
                  return (
                    <div
                      key={mp.id}
                      onClick={() => handleToggleMP(mp.id)}
                      className={cn(
                        "flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors min-h-[44px]",
                        selected
                          ? "bg-[var(--admin-accent)]/5"
                          : "hover:bg-[var(--admin-bg-secondary)]"
                      )}
                    >
                      <div
                        className={cn(
                          "w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                          selected
                            ? "bg-[var(--admin-accent)] border-[var(--admin-accent)]"
                            : "border-[var(--admin-border)]"
                        )}
                      >
                        {selected && (
                          <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={cn("flex-1 text-xs", selected ? "text-[var(--admin-text)] font-medium" : "text-[var(--admin-text)]")}>
                        {mp.name}
                      </span>
                      <span className="text-xs text-[var(--admin-text-muted)]">{formatCurrency(mp.cost)}</span>
                      {selected && (
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          value={selected.quantity}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleQtyChange(mp.id, e.target.value);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-16 px-2 py-2 sm:py-1 rounded-lg border border-[var(--admin-border)] text-xs text-center bg-[var(--admin-bg-secondary)] text-[var(--admin-text)] focus:outline-none focus:border-[var(--admin-accent)]/50 min-h-[36px]"
                          placeholder="Cant."
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {selectedMPs.length > 0 && (
              <div className="p-3 rounded-xl bg-[var(--admin-bg-tertiary)] border border-[var(--admin-border)]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-[var(--admin-text-muted)] uppercase tracking-wider">
                    Costo de Produccion
                  </span>
                  <span className="text-sm font-bold text-[var(--admin-text)] font-mono">
                    {formatCurrency(calculatedCost)}
                  </span>
                </div>
                <p className="text-[10px] text-[var(--admin-text-muted)]">Suma de materias primas seleccionadas</p>
              </div>
            )}
          </div>

          {/* Precio / Margen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-[var(--admin-text-muted)] uppercase tracking-wider mb-1.5 block">
                Precio de Venta
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={salePrice}
                onChange={(e) => handlePriceChange(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 sm:py-2.5 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] text-sm text-[var(--admin-text)] placeholder:text-[var(--admin-placeholder)] focus:outline-none focus:border-[var(--admin-accent)]/50 focus:ring-1 focus:ring-[var(--admin-accent)]/20 transition-all min-h-[44px]"
              />
              {showComputed && editingField === "margin" && hasValidMargin && (
                <p className="mt-1 text-[11px] text-[var(--admin-text-muted)]">
                  Precio calculado:{" "}
                  <span className="font-mono text-[var(--admin-text)]">{formatCurrency(computedPrice)}</span>
                </p>
              )}
              {showComputed && editingField === "price" && hasValidPrice && (
                <p className="mt-1 text-[11px] text-[var(--admin-text-muted)]">
                  Margen:{" "}
                  <span className="font-mono text-[var(--admin-text)]">
                    {formatCurrency(computedMargin)} ({computedMarginPct >= 0 ? "+" : ""}{computedMarginPct.toFixed(1)}%)
                  </span>
                </p>
              )}
            </div>
            <div>
              <label className="text-[10px] text-[var(--admin-text-muted)] uppercase tracking-wider mb-1.5 block">
                % Ganancia
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="99.9"
                value={marginPercent}
                onChange={(e) => handleMarginChange(e.target.value)}
                placeholder="0.0"
                className="w-full px-4 py-3 sm:py-2.5 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] text-sm text-[var(--admin-text)] placeholder:text-[var(--admin-placeholder)] focus:outline-none focus:border-[var(--admin-accent)]/50 focus:ring-1 focus:ring-[var(--admin-accent)]/20 transition-all min-h-[44px]"
              />
              {showComputed && editingField === "price" && hasValidPrice && (
                <p className="mt-1 text-[11px] text-[var(--admin-text-muted)]">
                  % Ganancia:{" "}
                  <span className="font-mono text-[var(--admin-text)]">{computedMarginPct.toFixed(1)}%</span>
                </p>
              )}
              {showComputed && editingField === "margin" && hasValidMargin && (
                <p className="mt-1 text-[11px] text-[var(--admin-text-muted)]">
                  Margen:{" "}
                  <span className="font-mono text-[var(--admin-text)]">{formatCurrency(computedMargin)}</span>
                </p>
              )}
            </div>
          </div>

          {/* Color */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-[10px] text-[var(--admin-text-muted)] uppercase tracking-wider">
                Color
              </label>
              {color && (
                <span
                  className="w-4 h-4 rounded-full border border-[var(--admin-border)] flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
              )}
            </div>
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

          {/* Stock Minimo */}
          <div>
            <label className="text-[10px] text-[var(--admin-text-muted)] uppercase tracking-wider mb-1.5 block">
              Stock Minimo
            </label>
            <input
              type="number"
              step="1"
              min="0"
              value={minStock}
              onChange={(e) => setMinStock(e.target.value)}
              className="w-full max-w-[200px] px-4 py-3 sm:py-2.5 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] text-sm text-[var(--admin-text)] placeholder:text-[var(--admin-placeholder)] focus:outline-none focus:border-[var(--admin-accent)]/50 focus:ring-1 focus:ring-[var(--admin-accent)]/20 transition-all min-h-[44px]"
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
              disabled={saving}
              className="flex-1 py-3 sm:py-2.5 rounded-xl bg-[var(--admin-accent)] text-white text-sm font-medium hover:bg-[var(--admin-accent-hover)] disabled:opacity-40 transition-colors min-h-[44px]"
            >
              {saving ? "Guardando..." : editing ? "Guardar Cambios" : "Crear Producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
