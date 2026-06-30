import { useState, useEffect, type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AdminThemeProvider } from "@/hooks/useTheme";
import Sidebar from "@/components/layout/Sidebar";

const API = "/api";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const saved = localStorage.getItem("admin_token");
    if (saved) setIsAdmin(true);
  }, []);

  useEffect(() => {
    if (isAdmin && location.pathname === "/admin") {
      navigate("/admin", { replace: true });
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <main className="flex h-screen items-center justify-center bg-[var(--admin-bg)] relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[var(--admin-accent)]/5 rounded-full blur-[120px]" />

        <div className="relative w-full max-w-sm p-8 rounded-2xl bg-[var(--admin-bg-secondary)] border border-[var(--admin-border)] shadow-[0_8px_40px_var(--admin-shadow)] animate-scale-in">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[var(--admin-accent)] flex items-center justify-center text-white font-bold text-xl mx-auto mb-3 shadow-[0_4px_16px_rgba(148,193,193,0.3)] font-display">
              L
            </div>
            <h1 className="text-lg font-semibold text-[var(--admin-text)] font-display">
              Bisuteria Luna
            </h1>
            <p className="text-xs text-[var(--admin-text-muted)] mt-1">
              Panel de Administracion
            </p>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              setLoading(true);
              try {
                const res = await fetch(`${API}/auth/login`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ user, pass }),
                });
                const data = await res.json();
                if (data.success) {
                  localStorage.setItem("admin_token", data.token);
                  localStorage.setItem("admin_user", user);
                  setIsAdmin(true);
                } else {
                  setError(data.error || "Credenciales invalidas");
                }
              } catch {
                setError("Error de conexion");
              }
              setLoading(false);
            }}
            className="space-y-4"
          >
            <div>
              <label className="text-[10px] text-[var(--admin-text-muted)] uppercase tracking-wider mb-1.5 block">
                Usuario
              </label>
              <input
                type="text"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                placeholder="Ingresa tu usuario"
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] text-sm text-[var(--admin-text)] placeholder:text-[var(--admin-placeholder)] focus:outline-none focus:border-[var(--admin-accent)]/50 focus:ring-1 focus:ring-[var(--admin-accent)]/20 transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] text-[var(--admin-text-muted)] uppercase tracking-wider mb-1.5 block">
                Contrasena
              </label>
              <input
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="Ingresa tu contrasena"
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] text-sm text-[var(--admin-text)] placeholder:text-[var(--admin-placeholder)] focus:outline-none focus:border-[var(--admin-accent)]/50 focus:ring-1 focus:ring-[var(--admin-accent)]/20 transition-all"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20 text-red-400 text-xs text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[var(--admin-accent)] text-white text-sm rounded-xl hover:bg-[var(--admin-accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-all shadow-[0_4px_12px_rgba(148,193,193,0.2)] hover:shadow-[0_4px_20px_rgba(148,193,193,0.35)] active:scale-[0.98] mt-2"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          <p className="text-center text-[10px] text-[var(--admin-placeholder)] mt-6">
            Acceso exclusivo para administradores
          </p>
        </div>
      </main>
    );
  }

  return (
    <AdminThemeProvider>
      <div className="flex h-screen bg-[var(--admin-bg)]">
        <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden mb-4 w-10 h-10 rounded-xl bg-[var(--admin-bg-secondary)] border border-[var(--admin-border)] flex items-center justify-center text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {children}
        </div>
      </div>
    </AdminThemeProvider>
  );
}
