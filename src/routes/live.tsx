import { createFileRoute, Link } from "@tanstack/react-router";
import { Radio, Users } from "lucide-react";
import { VIBE_POSTS, fireScore, timeAgo, slugify } from "@/data/vibes";
import { BottomNav } from "@/components/BottomNav";
import { FriendsGoing } from "@/components/FriendsGoing";

export const Route = createFileRoute("/live")({
  head: () => ({
    meta: [
      { title: "Live Now — VibeCheck" },
      { name: "description", content: "Tap into livestreams from the vibiest spots right now." },
      { property: "og:title", content: "Live Now — VibeCheck" },
      { property: "og:description", content: "Streaming live from the dance floor." },
    ],
  }),
  component: LivePage,
});

function LivePage() {
  const lives = VIBE_POSTS.filter((p) => p.isLive);
  const upcoming = VIBE_POSTS.filter((p) => !p.isLive).slice(0, 4);

  return (
    <div className="min-h-[100svh] w-full bg-background pb-32">
      <header className="px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <p className="text-[11px] font-display font-bold uppercase tracking-[0.3em] text-secondary">
          Live
        </p>
        <h1 className="font-display text-3xl font-black tracking-tighter">
          On <span className="text-gradient-sunset">Right Now</span>
        </h1>
      </header>

      <div className="grid grid-cols-2 gap-3 px-4">
        {lives.map((l) => (
          <Link
            key={l.id}
            to="/live/$slug"
            params={{ slug: slugify(l.placeName) }}
            className="group relative aspect-[3/4] overflow-hidden rounded-3xl border border-border/40 shadow-soft active:scale-[0.98] transition-transform"
          >
            <img
              src={l.poster}
              alt={l.placeName}
              className="absolute inset-0 h-full w-full object-cover transition-transform group-active:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-vibe" />
            <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-display font-black uppercase tracking-widest text-secondary-foreground shadow-glow-magenta">
              <Radio className="h-2.5 w-2.5 animate-pulse" />
              Live
            </div>
            <div className="absolute right-2 top-2 rounded-full glass-dark px-2 py-0.5 text-xs">
              {fireScore(l.vibeScore)}
            </div>
            <div className="absolute inset-x-0 bottom-0 space-y-1 p-3">
              <h3 className="font-display text-sm font-bold leading-tight">{l.placeName}</h3>
              <p className="text-[10px] uppercase tracking-widest text-foreground/70">
                {l.neighborhood}
              </p>
              <div className="flex items-center gap-1 pt-0.5 text-[10px] text-foreground/80">
                <Users className="h-3 w-3" />
                {320 + ((l.id.charCodeAt(0) * 73) % 580)} watching
              </div>
              <FriendsGoing placeSlug={slugify(l.placeName)} className="pt-1" />
            </div>
          </Link>
        ))}
      </div>

      <h2 className="px-4 pb-3 pt-8 font-display text-xl font-black tracking-tight">
        Recently posted
      </h2>
      <div className="space-y-2 px-4">
        {upcoming.map((p) => (
          <div
            key={p.id}
            className="glass flex items-center gap-3 rounded-2xl border border-border/40 p-3"
          >
            <img src={p.poster} alt={p.placeName} className="h-14 w-14 rounded-xl object-cover" />
            <div className="flex-1">
              <p className="font-display text-sm font-bold">{p.placeName}</p>
              <p className="text-[11px] text-foreground/60">
                {p.neighborhood} · {timeAgo(p.postedAt)}
              </p>
            </div>
            <span className="text-base">{fireScore(p.vibeScore)}</span>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
