import { type ReactNode } from "react";

interface LifestyleRowProps {
  icon: ReactNode;
  label: string;
  status: string;
  accent: string;
}

export function LifestyleRow({ icon, label, status, accent }: LifestyleRowProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5">
      <div className="flex items-center gap-3">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: `${accent}22`, color: accent }}
        >
          {icon}
        </span>
        <span className="text-sm text-slate-200">{label}</span>
      </div>
      <span className="text-sm font-medium text-white">{status}</span>
    </div>
  );
}
