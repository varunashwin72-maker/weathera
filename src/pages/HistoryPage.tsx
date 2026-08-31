import { History, Trash2, ArrowRight } from "lucide-react";
import { GlassCard } from "../components/GlassCard";

interface HistoryPageProps {
  history: string[];
  onSelect: (city: string) => void;
  onClear: () => void;
}

export function HistoryPage({ history, onSelect, onClear }: HistoryPageProps) {
  return (
    <GlassCard className="mx-auto w-full max-w-5xl p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2 text-cyan-300">
            <History size={16} />
            <span className="text-xs font-mono uppercase tracking-widest">Recent searches</span>
          </div>
          <h2 className="text-2xl font-semibold text-white">Weather history</h2>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center text-white/60 backdrop-blur-sm">
          Your recent searches will appear here.
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((city) => (
            <button
              key={city}
              onClick={() => onSelect(city)}
              className="flex w-full items-center justify-between rounded-2xl border border-white/15 bg-white/[0.05] px-4 py-3 text-left text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] backdrop-blur-md transition hover:bg-white/[0.1]"
            >
              <span className="font-medium">{city}</span>
              <span className="flex items-center gap-2 text-sm text-white/50">
                View weather <ArrowRight size={16} />
              </span>
            </button>
          ))}
        </div>
      )}

      {history.length > 0 && (
        <button onClick={onClear} className="mt-5 flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-2 text-sm text-white/70 backdrop-blur-md transition hover:bg-white/10">
          <Trash2 size={14} /> Clear history
        </button>
      )}
    </GlassCard>
  );
}
