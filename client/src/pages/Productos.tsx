import { useState, useEffect, useCallback } from "react";
import ProductTable from "@/components/inventario/ProductTable";
import ProductDialog from "@/components/inventario/ProductDialog";
import { MenuButton } from "@/components/layout/AdminLayout";
import { api } from "@/services/api";
import { cn } from "@/lib/utils";
import type { Producto, MateriaPrima } from "@/types";

export default function ProductosPage() {
  const [data, setData] = useState<Producto[]>([]);
  const [materiasPrimas, setMateriasPrimas] = useState<MateriaPrima[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Producto | null>(null);
  const [viewMode, setViewMode] = useState<"lista" | "cuadricula">("lista");

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [products, mpData] = await Promise.all([
        api.get<Producto[]>("/productos"),
        api.get<MateriaPrima[]>("/materias-primas"),
      ]);
      setData(products);
      setMateriasPrimas(mpData);
    } catch (e) {
      console.error(e);
    }
    if (!silent) setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    const i = setInterval(() => fetchData(true), 15000);
    return () => clearInterval(i);
  }, [fetchData]);

  const handleCreate = () => { setEditing(null); setDialogOpen(true); };
  const handleEdit = (p: Producto) => { setEditing(p); setDialogOpen(true); };
  const handleDelete = async (p: Producto) => {
    if (!confirm(`Eliminar "${p.name}"? Esta accion no se puede deshacer.`)) return;
    try {
      await api.delete(`/productos/${p.id}`);
      fetchData(true);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleSave = async (formData: any) => {
    if (editing) {
      await api.put(`/productos/${editing.id}`, formData);
    } else {
      await api.post("/productos", formData);
    }
    fetchData(true);
  };

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <MenuButton />
          <div>
            <h1 className="text-xl font-semibold text-[var(--admin-text)] font-display">Productos</h1>
            <p className="text-xs text-[var(--admin-text-muted)] mt-0.5">
              {data.length} productos — Costo calculado por materias primas
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-secondary)] p-0.5">
            <button
              onClick={() => setViewMode("lista")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                viewMode === "lista"
                  ? "bg-[var(--admin-accent)] text-white shadow-sm"
                  : "text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]"
              )}
            >
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Lista
              </span>
            </button>
            <button
              onClick={() => setViewMode("cuadricula")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                viewMode === "cuadricula"
                  ? "bg-[var(--admin-accent)] text-white shadow-sm"
                  : "text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]"
              )}
            >
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
                Cuadricula
              </span>
            </button>
          </div>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--admin-accent)] text-white text-sm font-medium hover:bg-[var(--admin-accent-hover)] transition-colors shadow-[0_4px_12px_rgba(148,193,193,0.2)]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Producto
          </button>
        </div>
      </div>

      <ProductTable
        data={data}
        loading={loading}
        viewMode={viewMode}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ProductDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        editing={editing}
        materiasPrimas={materiasPrimas}
      />
    </div>
  );
}
