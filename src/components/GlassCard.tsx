import { type ReactNode } from "react";
import { motion } from "framer-motion";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}

/**
 * Shared dark panel surface used across the whole app: near-black slate
 * fill, a hairline border, soft shadow, minimal blur. Matches the "Aurora
 * Weather OS" reference design - flat and calm rather than bright glass.
 */
export function GlassCard({ children, className = "", delay = 0, hover = false }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={hover ? { y: -4, transition: { duration: 0.25 } } : undefined}
      className={`relative overflow-hidden rounded-[28px] border border-white/10 bg-[#10151f]/80 shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl ${className}`}
    >
      <div className="relative">{children}</div>
    </motion.div>
  );
}
