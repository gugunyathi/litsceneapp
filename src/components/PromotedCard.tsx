import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight } from "lucide-react";
import type { PromoPost } from "@/data/promos";

interface Props {
  promo: PromoPost;
  active: boolean;
  muted: boolean;
  onToggleMute: () => void;
}

const BADGE_STYLES: Record<NonNullable<PromoPost["badgeColor"]>, string> = {
  coral: "bg-gradient-sunset text-primary-foreground shadow-glow-coral",
  magenta: "bg-secondary text-secondary-foreground shadow-glow-magenta",
  gold: "bg-accent text-accent-foreground",
};

export function PromotedCard({ promo, active, muted, onToggleMute }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (active) {
      v.currentTime = 0;
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [active]);

  const badge = BADGE_STYLES[promo.badgeColor ?? "coral"];

  return (
    <section className="relative h-full w-full overflow-hidden bg-background">
      {promo.videoUrl ? (
        <video
          ref={videoRef}
          src={promo.videoUrl}
          poster={promo.poster}
          autoPlay
          loop
          playsInline
          muted={muted}
          onClick={onToggleMute}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <img
          src={promo.poster}
          alt={promo.brand}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-vibe" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-background/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-background via-background/80 to-transparent" />

      {/* Promoted badge top-left */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 p-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <div
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-display font-black uppercase tracking-[0.25em] ${badge}`}
        >
          <Sparkles className="h-3 w-3" />
          Promoted
        </div>
        <div className="glass-dark rounded-full px-2.5 py-1 text-[10px] font-display font-bold uppercase tracking-widest text-foreground/80">
          Ad · {promo.brand}
        </div>
      </div>

      {/* Bottom content + CTA */}
      <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-28">
        <div className="space-y-3">
          <p className="font-display text-[10px] font-black uppercase tracking-[0.35em] text-accent">
            {promo.brand}
          </p>
          <h2 className="font-display text-3xl font-black leading-[1.05] tracking-tighter">
            {promo.headline}
          </h2>
          <p className="max-w-[85%] text-sm leading-snug text-foreground/85">{promo.subline}</p>
          <Link
            to={promo.ctaHref}
            className="group mt-2 inline-flex items-center gap-2 rounded-full bg-gradient-sunset px-5 py-3 font-display text-sm font-black uppercase tracking-widest text-primary-foreground shadow-glow-coral active:scale-95"
          >
            {promo.ctaLabel}
            <ArrowRight className="h-4 w-4 transition-transform group-active:translate-x-0.5" />
          </Link>
          <p className="pt-1 text-[10px] uppercase tracking-widest text-foreground/40">
            Sponsored · Tap to learn more
          </p>
        </div>
      </div>
    </section>
  );
}
