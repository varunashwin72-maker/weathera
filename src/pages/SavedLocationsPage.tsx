import { ArrowRight, Bookmark, Trash2 } from "lucide-react";
import { GlassCard } from "../components/GlassCard";

interface SavedLocationsPageProps {
  savedLocations: string[];
  onSelect: (city: string) => void;
  onRemove: (city: string) => void;
}

export function SavedLocationsPage({ savedLocations, onSelect, onRemove }: SavedLocationsPageProps) {
  return (
    <GlassCard className="mx-auto w-full max-w-5xl p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2 text-cyan-300">
            <Bookmark size={16} />
            <span className="text-xs font-mono uppercase tracking-widest">Saved locations</span>
          </div>
          <h2 className="text-2xl font-semibold text-white">Your bookmarks</h2>
        </div>
      </div>

      {savedLocations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center text-white/60 backdrop-blur-sm">
          No saved locations yet. Start by searching for a city and saving it.
        </div>
      ) : (
        <div className="space-y-3">
          {savedLocations.map((city) => (
            <div
              key={city}
              className="flex w-full items-center justify-between rounded-2xl border border-white/15 bg-white/[0.05] px-4 py-3 text-left text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] backdrop-blur-md transition hover:bg-white/[0.1]"
            >
              <span className="font-medium">{city}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSelect(city)}
                  className="flex items-center gap-2 text-sm text-white/50 transition hover:text-white"
                >
                  View weather <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => onRemove(city)}
                  className="rounded-full p-1 text-white/50 transition hover:bg-red-500/20 hover:text-red-300"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
