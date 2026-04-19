import { CATEGORIES, type Category } from "@/data/vibes";

interface Props {
  active: Category | "all";
  onChange: (c: Category | "all") => void;
}

export function CategoryRail({ active, onChange }: Props) {
  return (
    <div className="no-scrollbar flex w-full gap-2 overflow-x-auto px-4">
      {CATEGORIES.map((c) => {
        const isActive = c.id === active;
        return (
          <button
            key={c.id}
            onClick={() => onChange(c.id)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-display font-bold uppercase tracking-wider transition-all ${
              isActive
                ? "bg-gradient-sunset text-primary-foreground shadow-glow-coral"
                : "glass text-foreground/80"
            }`}
          >
            <span className="mr-1">{c.emoji}</span>
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
