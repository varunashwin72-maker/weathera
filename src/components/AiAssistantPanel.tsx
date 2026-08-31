import { useState } from "react";
import { Sparkles } from "lucide-react";
import type { WeatherBundle } from "../types";

interface AiAssistantPanelProps {
  weather: WeatherBundle | null;
}

const SUGGESTED_PROMPTS = ["Why is it raining today?", "What should I wear today?", "Can I travel today?", "Will it rain tomorrow?"];

export function AiAssistantPanel({ weather }: AiAssistantPanelProps) {
  const [question, setQuestion] = useState("What should I wear today?");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorNote, setErrorNote] = useState("");
  const [history, setHistory] = useState<{ role: "user" | "assistant"; content: string }[]>([]);

  async function ask(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    setErrorNote("");

    const nextHistory = [...history, { role: "user" as const, content: trimmed }];

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weather, messages: nextHistory }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `Request failed (${res.status})`);
      }
      const data = await res.json();
      const answer: string = data?.reply || "I couldn't come up with an answer for that - try rephrasing.";
      setReply(answer);
      setHistory([...nextHistory, { role: "assistant" as const, content: answer }].slice(-12));
    } catch (err) {
      setErrorNote(
        err instanceof Error && err.message.includes("OPENAI_KEY")
          ? "The assistant backend needs an OPENAI_KEY configured on the server (see docs/AI_FEATURES.md)."
          : "The assistant is unreachable right now. Make sure the backend is running (npm run dev:all)."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">AI Assistant</p>
          <h3 className="mt-1 text-xl font-bold text-white">Your weather copilot is ready.</h3>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs text-slate-300">Visible on entry</span>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles size={14} className="text-cyan-300" />
          <span className="text-xs font-medium text-cyan-300">Context: {weather?.current.city ?? "No location yet"}</span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ask(question)}
            placeholder="Ask about the weather..."
            className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-white/25"
          />
          <button
            onClick={() => ask(question)}
            disabled={loading || !question.trim()}
            className="rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "..." : "Ask"}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => {
                setQuestion(prompt);
                void ask(prompt);
              }}
              className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
            >
              {prompt}
            </button>
          ))}
        </div>

        {(reply || errorNote) && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            {errorNote ? (
              <p className="text-sm text-rose-300">{errorNote}</p>
            ) : (
              <>
                <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.15em] text-slate-500">Assistant reply</p>
                <p className="text-sm leading-relaxed text-slate-100">{reply}</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
