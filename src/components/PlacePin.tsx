import { MapPin, Search } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { slugify } from "@/data/vibes";

export function PlacePin({
  name,
  neighborhood,
  status,
}: {
  name: string;
  neighborhood: string;
  status?: "verified" | "unverified" | "crowdsource";
}) {
  const isCrowdsource = status === "crowdsource";
  const isUnverified = status === "unverified";

  return (
    <Link
      to={isCrowdsource ? "" : "/place/$slug"}
      params={isCrowdsource ? {} : { slug: slugify(name) }}
      className={`glass-dark inline-flex max-w-[80vw] items-center gap-2 rounded-full py-1.5 pl-2 pr-4 shadow-pin active:scale-95 transition-transform ${
        isCrowdsource ? "border border-primary/50 animate-pulse bg-primary/10" : ""
      }`}
    >
      <span
        className={`grid h-7 w-7 place-items-center rounded-full bg-gradient-sunset shadow-glow-coral ${
          isCrowdsource ? "bg-primary" : ""
        }`}
      >
        {isCrowdsource ? (
          <Search className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={3} />
        ) : (
          <MapPin className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={3} />
        )}
      </span>
      <div className="flex min-w-0 flex-col leading-tight text-left">
        <span className="truncate font-display text-sm font-bold">
          {isCrowdsource ? "Unknown Location" : name}
          {isUnverified && <span className="ml-1 text-[10px] text-accent">(Unverified)</span>}
        </span>
        <span className="truncate text-[10px] uppercase tracking-widest text-foreground/70">
          {isCrowdsource ? "Help tag it! 📍 @location" : neighborhood}
        </span>
      </div>
    </Link>
  );
}
