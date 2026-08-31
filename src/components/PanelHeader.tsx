interface PanelHeaderProps {
  title: string;
  subtitle?: string;
  dotColor?: string;
}

export function PanelHeader({ title, subtitle, dotColor = "#a78bfa" }: PanelHeaderProps) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
      </div>
      <span className="mt-2 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: dotColor, boxShadow: `0 0 10px ${dotColor}` }} />
    </div>
  );
}
