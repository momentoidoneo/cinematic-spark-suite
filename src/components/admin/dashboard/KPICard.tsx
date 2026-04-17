import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  change?: number; // pct vs previous period
  hint?: string;
  link?: string;
  highlight?: boolean;
  invertChange?: boolean; // true when increase is bad (e.g., bounce rate)
}

const KPICard = ({ label, value, icon: Icon, change, hint, link, highlight, invertChange }: Props) => {
  const showChange = typeof change === "number" && isFinite(change);
  const positive = showChange ? (invertChange ? change < 0 : change > 0) : false;
  const negative = showChange ? (invertChange ? change > 0 : change < 0) : false;
  const ChangeIcon = !showChange ? Minus : change > 0 ? ArrowUp : change < 0 ? ArrowDown : Minus;

  const inner = (
    <div
      className={`group rounded-xl border p-4 transition-all hover:border-primary/40 hover:shadow-lg ${
        highlight ? "bg-primary/10 border-primary/30 animate-pulse" : "bg-card border-border"
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <Icon className="w-5 h-5 text-primary opacity-80" />
        {showChange && (
          <span
            className={`flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded ${
              positive
                ? "bg-accent/15 text-accent"
                : negative
                ? "bg-destructive/15 text-destructive"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <ChangeIcon className="w-3 h-3" />
            {Math.abs(change).toFixed(0)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
      {hint && <p className="text-[10px] text-muted-foreground/70 mt-1">{hint}</p>}
    </div>
  );

  return link ? <Link to={link}>{inner}</Link> : <div>{inner}</div>;
};

export default KPICard;
