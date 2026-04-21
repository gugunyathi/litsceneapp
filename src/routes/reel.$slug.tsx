import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import { VIBE_POSTS, slugify, getReelPostsForPlace } from "@/data/vibes";
import { SwipeableFeedCard } from "@/components/SwipeableFeedCard";

export const Route = createFileRoute("/reel/$slug")({
  loader: ({ params }) => {
    // Only videos for this specific spot, from latest to oldest, max 1 hour old
    const posts = getReelPostsForPlace(params.slug);

    if (posts.length === 0) throw notFound();

    return { posts, placeName: posts[0].placeName };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Reels" }] };
    return {
      meta: [{ title: `${loaderData.placeName} Reels — VibeCheck` }],
    };
  },
  component: ReelPlayerPage,
});

function ReelPlayerPage() {
  const { posts, placeName } = Route.useLoaderData();
  const navigate = useNavigate();
  const [muted, setMuted] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const goHome = useCallback(() => {
    const returnId = sessionStorage.getItem("reelReturnPostId");
    sessionStorage.removeItem("reelReturnPostId");
    navigate({ to: "/", search: returnId ? { returnPostId: returnId } : {} });
  }, [navigate]);

  // observe which card is in view
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-card-idx]"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.intersectionRatio > 0.6) {
            const idx = Number((e.target as HTMLElement).dataset.cardIdx);
            setActiveIdx(idx);
          }
        });
      },
      { root, threshold: [0, 0.6, 1] }
    );
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [posts.length]);

  // Sentinel: when scrolled past last reel, go back home
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          goHome();
        }
      },
      { threshold: 0.5 }
    );
    io.observe(sentinel);
    return () => io.disconnect();
  }, [goHome]);

  return (
    <div className="relative h-[100svh] w-full overflow-hidden bg-background">
      {/* Top bar */}
      <header className="absolute inset-x-0 top-0 z-20 flex items-center gap-2 p-3 pt-[max(0.75rem,env(safe-area-inset-top))] bg-gradient-to-b from-background/80 to-transparent pointer-events-none">
        <button
          onClick={goHome}
          aria-label="Back"
          className="grid h-9 w-9 place-items-center rounded-full glass-dark pointer-events-auto"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="glass-dark inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 shadow-soft">
          <span className="font-display text-[11px] font-bold uppercase tracking-widest text-primary-foreground">
            {placeName} · Reels
          </span>
        </div>
      </header>

      {/* feed */}
      <div
        ref={containerRef}
        className="snap-y snap-mandatory no-scrollbar h-full w-full overflow-y-scroll overscroll-contain"
      >
        {posts.map((post, i) => (
          <div key={post.id} data-card-idx={i} className="snap-start h-[100svh] w-full relative">
            <SwipeableFeedCard
              initialPost={post}
              active={i === activeIdx}
              muted={muted}
              onToggleMute={() => setMuted((m) => !m)}
            />
            
            {/* Realtime indicator */}
            <div className="absolute top-16 left-4 z-10 glass-dark px-2 py-1 rounded">
              <span className="text-[10px] text-white/80 font-bold uppercase">Realtime Reel</span>
            </div>
          </div>
        ))}

        {/* Sentinel: scrolling past last reel navigates back to home */}
        <div
          ref={sentinelRef}
          className="snap-start h-[100svh] w-full flex flex-col items-center justify-center gap-4 bg-background/90"
        >
          <p className="text-4xl">🎬</p>
          <p className="font-display text-lg font-bold">That's all the reels!</p>
          <p className="text-sm text-foreground/60">Heading back to the feed…</p>
        </div>
      </div>
    </div>
  );
}
