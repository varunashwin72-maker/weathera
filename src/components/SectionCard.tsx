import { type ReactNode } from "react";
import { motion } from "framer-motion";

interface SectionCardProps {
  title: string;
  content?: string;
  description?: string;
  icon?: ReactNode;
  children?: ReactNode;
  accent?: string;
}

export function SectionCard({ title, content, description, icon, children, accent = "#8b5cf6" }: SectionCardProps) {
  return (
    <motion.section
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25 }}
      className="relative overflow-hidden rounded-[1.75rem] border border-white/25 bg-white/[0.11] p-5 shadow-[0_20px_60px_rgba(2,6,23,0.35)] backdrop-blur-2xl ring-1 ring-inset ring-white/10"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      <div className="relative mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {description ? <p className="mt-1 text-sm text-slate-100/75">{description}</p> : null}
        </div>
        {icon ? (
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 backdrop-blur-md"
            style={{ backgroundColor: `${accent}22`, color: accent, boxShadow: `0 0 20px ${accent}33` }}
          >
            {icon}
          </div>
        ) : null}
      </div>
      {content ? <p className="relative text-sm text-slate-100/85">{content}</p> : <div className="relative">{children}</div>}
    </motion.section>
  );
}
