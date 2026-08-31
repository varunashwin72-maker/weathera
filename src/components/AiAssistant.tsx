import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Send, Sparkles, X } from "lucide-react";
import type { WeatherBundle } from "../types";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface AiAssistantProps {
  weather: WeatherBundle | null;
  accent: string;
}

const STARTER_PROMPTS = ["What should I wear today?", "Do I need an umbrella?", "Is it a good day to travel?"];

export function AiAssistant({ weather, accent }: AiAssistantProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorNote, setErrorNote] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, loading]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setErrorNote("");

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weather, messages: nextMessages }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `Request failed (${res.status})`);
      }

      const data = await res.json();
      const reply: string = data?.reply || "I couldn't come up with an answer for that - try rephrasing.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
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

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void sendMessage(input);
  }

  return (
    <div className="fixed bottom-5 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex h-[28rem] w-[21rem] flex-col overflow-hidden rounded-[1.5rem] border border-white/15 bg-slate-950/80 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-2xl ring-1 ring-inset ring-white/10 sm:w-[24rem]"
          >
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{ backgroundColor: `${accent}33`, color: accent }}
              >
                <Bot size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">Weather Assistant</p>
                <p className="text-[11px] text-slate-400">{weather ? `Grounded in ${weather.current.city} right now` : "Search a city to get grounded answers"}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
                aria-label="Close assistant"
              >
                <X size={16} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-slate-400">
                    Ask me anything about the current conditions - what to wear, whether to travel, or what tomorrow looks like.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {STARTER_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => void sendMessage(prompt)}
                        className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-white/10"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      message.role === "user"
                        ? "rounded-br-sm text-slate-950"
                        : "rounded-bl-sm border border-white/10 bg-white/[0.06] text-slate-100"
                    }`}
                    style={message.role === "user" ? { backgroundColor: accent } : undefined}
                  >
                    {message.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.06] px-3 py-2">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                  </div>
                </div>
              )}

              {errorNote && <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">{errorNote}</p>}
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2 border-t border-white/10 p-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about the weather..."
                className="flex-1 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition focus:border-white/25"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex items-center justify-center rounded-xl px-3 py-2 text-slate-950 transition disabled:cursor-not-allowed disabled:opacity-40"
                style={{ backgroundColor: accent }}
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen((prev) => !prev)}
        whileTap={{ scale: 0.92 }}
        className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 text-slate-950 shadow-[0_12px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl transition"
        style={{ backgroundColor: accent }}
        aria-label={open ? "Close weather assistant" : "Open weather assistant"}
      >
        {open ? <X size={22} /> : <Sparkles size={22} />}
      </motion.button>
    </div>
  );
}
