import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  costoProduccion: number;
  ventasPeriodo: number;
  gananciaNeta: number;
  totalPedidos: number;
  loading?: boolean;
}

const cardConfig = [
  {
    label: "Costo de Produccion",
    key: "costoProduccion" as const,
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    cls: "from-[var(--admin-accent)]/10 to-[var(--admin-accent)]/5",
    iconBg: "bg-[var(--admin-accent)]/15 text-[var(--admin-accent)]",
  },
  {
    label: "Ventas del Periodo",
    key: "ventasPeriodo" as const,
    icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
    cls: "from-emerald-500/10 to-emerald-500/5",
    iconBg: "bg-emerald-500/15 text-emerald-600",
  },
  {
    label: "Ganancia Neta",
    key: "gananciaNeta" as const,
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    cls: "from-[var(--admin-accent-secondary)]/10 to-[var(--admin-accent-secondary)]/5",
    iconBg: "bg-[var(--admin-accent-secondary)]/15 text-[var(--admin-accent-secondary)]",
  },
  {
    label: "Total de Pedidos",
    key: "totalPedidos" as const,
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    cls: "from-[var(--admin-accent-gold)]/10 to-[var(--admin-accent-gold)]/5",
    iconBg: "bg-[var(--admin-accent-gold)]/15 text-[#b8962e]",
    isNumber: true,
  },
];

export default function StatsCards({ costoProduccion, ventasPeriodo, gananciaNeta, totalPedidos, loading }: StatsCardsProps) {
  const values = { costoProduccion, ventasPeriodo, gananciaNeta, totalPedidos };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cardConfig.map((card) => (
          <div
            key={card.key}
            className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg-secondary)] p-5 animate-pulse"
          >
            <div className="h-4 w-24 bg-[var(--admin-bg-tertiary)] rounded mb-3" />
            <div className="h-8 w-32 bg-[var(--admin-bg-tertiary)] rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cardConfig.map((card) => (
        <div
          key={card.key}
          className={cn(
            "rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg-secondary)] p-5 relative overflow-hidden",
            "hover:border-[var(--admin-border-hover)] transition-all duration-300",
            "shadow-[0_2px_12px_var(--admin-shadow)]"
          )}
        >
          <div className={cn("absolute top-0 right-0 w-24 h-24 rounded-bl-full bg-gradient-to-bl opacity-30", card.cls)} />
          <div className="flex items-start justify-between relative">
            <div>
              <p className="text-xs text-[var(--admin-text-muted)] mb-1">{card.label}</p>
              <p className={cn(
                "text-2xl font-bold text-[var(--admin-text)] font-display",
                card.key === "gananciaNeta" && gananciaNeta < 0 && "text-[#C86A6A]"
              )}>
                {card.key === "totalPedidos" ? totalPedidos : formatCurrency(values[card.key])}
              </p>
            </div>
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", card.iconBg)}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={card.icon} />
              </svg>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
