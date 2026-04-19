import { MapPin } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { slugify } from "@/data/vibes";

export function PlacePin({ name, neighborhood }: { name: string; neighborhood: string }) {
  return (
    <Link
      to="/place/$slug"
      params={{ slug: slugify(name) }}
      className="glass-dark inline-flex max-w-[80vw] items-center gap-2 rounded-full py-1.5 pl-2 pr-4 shadow-pin active:scale-95 transition-transform"
    >
      <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-sunset shadow-glow-coral">
        <MapPin className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={3} />
      </span>
      <div className="flex min-w-0 flex-col leading-tight text-left">
        <span className="truncate font-display text-sm font-bold">{name}</span>
        <span className="truncate text-[10px] uppercase tracking-widest text-foreground/70">
          {neighborhood}
        </span>
      </div>
    </Link>
  );
}
