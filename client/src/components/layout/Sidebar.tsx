import { NavLink } from "react-router-dom";
import { useAdminTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

const NAV = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    exact: true,
  },
  {
    href: "/admin/materias-primas",
    label: "Materias Primas",
    icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
  },
  {
    href: "/admin/productos",
    label: "Productos",
    icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  },
  {
    href: "/admin/pedidos",
    label: "Pedidos",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
  },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const { theme, toggleTheme } = useAdminTheme();

  return (
    <aside
      className={cn(
        "w-60 border-r flex flex-col shrink-0 z-50 transition-transform duration-300",
        "fixed inset-y-0 left-0 md:relative md:translate-x-0",
        "border-[var(--admin-border)] bg-[var(--admin-bg-secondary)]",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <button
        onClick={onClose}
        className="md:hidden absolute top-4 right-4 w-8 h-8 rounded-lg bg-[var(--admin-bg-tertiary)] flex items-center justify-center text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] transition-colors z-10"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="p-5 border-b border-[var(--admin-border)]">
        <NavLink to="/admin" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-[var(--admin-bg-tertiary)] border border-[var(--admin-border)] flex items-center justify-center shadow-[0_4px_12px_rgba(148,193,193,0.25)] group-hover:shadow-[0_4px_20px_rgba(148,193,193,0.4)] transition-shadow overflow-hidden">
            <img src="/pluma.png" alt="Luna" className="w-7 h-7 object-contain" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-[var(--admin-text)] font-display">
              Luna
            </h1>
            <p className="text-[10px] text-[var(--admin-text-muted)]">Panel Admin</p>
          </div>
        </NavLink>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {NAV.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.exact}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
                isActive
                  ? "bg-[var(--admin-accent)]/10 text-[var(--admin-accent)] font-medium shadow-[inset_0_1px_0_rgba(148,193,193,0.1)]"
                  : "text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-tertiary)] hover:text-[var(--admin-text)]"
              )
            }
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
            </svg>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-[var(--admin-border)] space-y-1">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[var(--admin-text-muted)] hover:bg-[var(--admin-bg-tertiary)] hover:text-[var(--admin-text-secondary)] transition-colors"
          title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          {theme === "dark" ? (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
          {theme === "dark" ? "Modo Claro" : "Modo Oscuro"}
        </button>

        <button
          onClick={() => {
            localStorage.removeItem("admin_token");
            localStorage.removeItem("admin_user");
            window.location.reload();
          }}
          className="w-full px-3 py-2 rounded-xl text-xs text-red-400/70 hover:text-red-400 hover:bg-red-500/8 transition-colors text-left"
        >
          Cerrar Sesion
        </button>

        <div className="pt-2 flex justify-center">
          <span className="onda-badge">Onda by GLA</span>
        </div>
      </div>
    </aside>
  );
}
