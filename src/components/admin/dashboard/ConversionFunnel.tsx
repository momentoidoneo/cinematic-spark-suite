import { ArrowDown } from "lucide-react";

interface FunnelStep {
  label: string;
  value: number;
  hint?: string;
}

const ConversionFunnel = ({ steps }: { steps: FunnelStep[] }) => {
  const max = Math.max(1, ...steps.map((s) => s.value));

  return (
    <div className="space-y-2">
      {steps.map((s, i) => {
        const pct = (s.value / max) * 100;
        const conversion = i > 0 && steps[i - 1].value > 0 ? (s.value / steps[i - 1].value) * 100 : null;
        return (
          <div key={s.label}>
            <div
              className="relative h-12 rounded-lg overflow-hidden bg-muted/30 border border-border"
              style={{ width: `${pct}%`, minWidth: "180px" }}
            >
              <div
                className="absolute inset-0 bg-gradient-to-r from-primary/30 to-primary/10"
              />
              <div className="relative h-full flex items-center justify-between px-4">
                <div>
                  <p className="text-xs font-semibold text-foreground">{s.label}</p>
                  {s.hint && <p className="text-[10px] text-muted-foreground">{s.hint}</p>}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-foreground">{s.value.toLocaleString()}</p>
                  {i > 0 && (
                    <p className="text-[10px] text-accent font-semibold">
                      {conversion === null ? "Sin base" : `${conversion.toFixed(1)}%`}
                    </p>
                  )}
                </div>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className="flex justify-center py-1">
                <ArrowDown className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ConversionFunnel;
