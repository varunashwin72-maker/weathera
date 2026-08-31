import type { ForecastEntry } from "../types";

interface ForecastChartProps {
  title: string;
  series: ForecastEntry[];
  accent: string;
}

export function ForecastChart({ title, series, accent }: ForecastChartProps) {
  const maxTemp = Math.max(...series.map(s => s.temp));
  const minTemp = Math.min(...series.map(s => s.temp));
  const tempRange = maxTemp - minTemp || 1;

  return (
    <div className="relative overflow-hidden rounded-[1.3rem] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      <h4 className="relative mb-4 text-sm font-semibold text-white">{title}</h4>
      <div className="relative space-y-3">
        {series.map((entry, idx) => {
          const normalizedTemp = ((entry.temp - minTemp) / tempRange) * 100;
          return (
            <div key={idx} className="flex items-center gap-3">
              <div className="w-12 text-xs text-slate-100/75 text-right">
                <div>{entry.label}</div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-full overflow-hidden rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-sm">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${normalizedTemp}%`,
                        background: `linear-gradient(90deg, ${accent}55, ${accent})`,
                        boxShadow: `0 0 12px ${accent}55`,
                      }}
                    />
                  </div>
                  <span className="w-12 text-xs font-semibold text-white text-right">{entry.temp}°</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
