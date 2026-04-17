import { buildHeatmap } from "@/lib/analytics";
import type { PageViewRow } from "@/lib/analytics";

const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const HeatmapChart = ({ rows }: { rows: PageViewRow[] }) => {
  const grid = buildHeatmap(rows);
  const max = Math.max(1, ...grid.flat());

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <div className="flex gap-1 mb-1 ml-10">
          {Array.from({ length: 24 }, (_, h) => (
            <div key={h} className="w-6 text-[10px] text-muted-foreground text-center">
              {h % 3 === 0 ? h : ""}
            </div>
          ))}
        </div>
        {grid.map((row, d) => (
          <div key={d} className="flex gap-1 items-center mb-1">
            <div className="w-9 text-[11px] text-muted-foreground">{DAYS[d]}</div>
            {row.map((v, h) => {
              const intensity = v / max;
              const bg = v === 0
                ? "hsl(var(--muted) / 0.3)"
                : `hsl(var(--primary) / ${0.15 + intensity * 0.85})`;
              return (
                <div
                  key={h}
                  className="w-6 h-6 rounded text-[10px] flex items-center justify-center text-foreground/80 cursor-default"
                  style={{ backgroundColor: bg }}
                  title={`${DAYS[d]} ${h}:00 — ${v} visitas`}
                >
                  {v > 0 && intensity > 0.5 ? v : ""}
                </div>
              );
            })}
          </div>
        ))}
        <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
          <span>Menos</span>
          {[0.15, 0.35, 0.55, 0.75, 1].map((i) => (
            <div key={i} className="w-4 h-4 rounded" style={{ backgroundColor: `hsl(var(--primary) / ${i})` }} />
          ))}
          <span>Más</span>
        </div>
      </div>
    </div>
  );
};

export default HeatmapChart;
