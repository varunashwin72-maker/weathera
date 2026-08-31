import { type ReactNode } from "react";
import { motion } from "framer-motion";

interface MetricTileProps {
  label: string;
  value: string;
  secondary?: string;
  icon: ReactNode;
  accent?: string;
}

export function MetricTile({ label, value, secondary, icon, accent = "#a78bfa" }: MetricTileProps) {
  return (
    <motion.div
      whileHover={{ y: -2, backgroundColor: "rgba(255,255,255,0.05)" }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-slate-400">{label}</p>
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: `${accent}22`, color: accent }}
        >
          {icon}
        </span>
      </div>
      <p className="text-xl font-semibold text-white">{value}</p>
      {secondary && <p className="mt-1 text-xs text-slate-500">{secondary}</p>}
    </motion.div>
  );
}
