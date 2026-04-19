import { fireScore } from "@/data/vibes";

export function VibeBadge({ score }: { score: 1 | 2 | 3 }) {
  const labels = { 1: "Chill", 2: "Buzzing", 3: "ON FIRE" } as const;
  return (
    <div className="glass-dark inline-flex items-center gap-2 rounded-full px-3 py-1.5 shadow-pin">
      <span className="text-base leading-none animate-pulse-glow">{fireScore(score)}</span>
      <span className="text-[10px] font-display font-semibold uppercase tracking-widest text-foreground/90">
        {labels[score]}
      </span>
    </div>
  );
}
