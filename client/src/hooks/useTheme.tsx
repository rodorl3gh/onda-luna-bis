import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

type AdminTheme = "dark" | "light";

interface ThemeContextValue {
  theme: AdminTheme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  toggleTheme: () => {},
});

export function useAdminTheme() {
  return useContext(ThemeContext);
}

export function AdminThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<AdminTheme>("light");

  useEffect(() => {
    const saved = localStorage.getItem("admin_theme") as AdminTheme | null;
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
    }
  }, []);

  useEffect(() => {
    document.body.classList.add("admin-mode");
    if (theme === "dark") {
      document.body.classList.add("admin-dark");
    } else {
      document.body.classList.remove("admin-dark");
    }
    localStorage.setItem("admin_theme", theme);
    return () => {
      document.body.classList.remove("admin-mode", "admin-dark");
    };
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
