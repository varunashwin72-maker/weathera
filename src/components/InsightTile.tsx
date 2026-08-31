import { type ReactNode } from "react";

interface InsightTileProps {
  icon: ReactNode;
  title: string;
  description: string;
  accent: string;
  highlighted?: boolean;
}

export function InsightTile({ icon, title, description, accent, highlighted = false }: InsightTileProps) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        highlighted ? "border-cyan-400/40 bg-cyan-400/[0.06]" : "border-white/10 bg-white/[0.03]"
      }`}
    >
      <div className="mb-2 flex items-center gap-2">
        <span style={{ color: accent }}>{icon}</span>
        <span className="text-sm font-semibold" style={{ color: highlighted ? "#67e8f9" : "#fff" }}>
          {title}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-slate-400">{description}</p>
    </div>
  );
}
