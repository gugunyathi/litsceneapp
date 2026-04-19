import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Sparkles, X } from "lucide-react";
import { type Category } from "@/data/vibes";
import { PROMO_POSTS, type PromoPost } from "@/data/promos";
import { fetchAllPosts } from "@/lib/api";
import { SwipeableFeedCard } from "@/components/SwipeableFeedCard";
import { PromotedCard } from "@/components/PromotedCard";
import { CategoryRail } from "@/components/CategoryRail";
import { BottomNav } from "@/components/BottomNav";
import { useFirebase } from "@/lib/FirebaseContext";
import { type VibePost } from "@/data/vibes";
import { useVibeAlgorithm } from "@/hooks/useVibeAlgorithm";

type FeedItem =
  | { kind: "post"; id: string; data: VibePost }
  | { kind: "promo"; id: string; data: PromoPost };

export const Route = createFileRoute("/")({
  loader: async () => {
    // This allows the server to fetch directly from your new Firebase backend!
    const posts = await fetchAllPosts();
    return { posts };
  },
  head: () => ({
    meta: [
      { title: "VibeCheck — see the vibe before you go" },
      {
        name: "description",
        content:
          "Real-time vertical video feed of the vibiest clubs, restaurants, rooftops and events near you. Rated in 🔥.",
      },
      { property: "og:title", content: "VibeCheck — see the vibe before you go" },
      {
        property: "og:description",
        content: "Tap in to see what's actually popping right now.",
      },
    ],
  }),
  component: FeedPage,
});

function FeedPage() {
  const { posts } = Route.useLoaderData();
  const { sortForYou } = useVibeAlgorithm(posts);
  const [category, setCategory] = useState<Category | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [muted, setMuted] = useState(true); // Must start muted for browser autoplay!
  const [activeIdx, setActiveIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const items = useMemo<FeedItem[]>(() => {
    let filtered = posts;

    // Apply search filter first
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) => p.placeName.toLowerCase().includes(q) || p.neighborhood.toLowerCase().includes(q),
      );
    }
    // Otherwise apply category filter
    else if (category !== "all") {
      filtered = filtered.filter((p) => p.category === category);
    }

    let sorted;
    if (category === "all" && searchQuery.trim() === "") {
      // FOR YOU FEED: Uses location, time zone, and preferences
      sorted = sortForYou(filtered);
    } else {
      // Chronological sort for specific searches/categories
      sorted = [...filtered].sort(
        (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime(),
      );
    }

    const out: FeedItem[] = sorted.map((p) => ({ kind: "post", id: p.id, data: p }));

    // Splice in promos only on the pure "all" feed (no search, no category)
    if (category === "all" && searchQuery === "") {
      [...PROMO_POSTS]
        .sort((a, b) => b.insertAfterIndex - a.insertAfterIndex)
        .forEach((promo) => {
          const at = Math.min(promo.insertAfterIndex + 1, out.length);
          out.splice(at, 0, { kind: "promo", id: promo.id, data: promo });
        });
    }
    return out;
  }, [category, searchQuery, posts]);

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
      { root, threshold: [0, 0.6, 1] },
    );
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [items.length]);

  const { requireAuth } = useFirebase();

  // Trigger auth on scroll > 5
  useEffect(() => {
    if (activeIdx >= 5) {
      requireAuth();
    }
    
    // Algorithm: Track views to refine the "For You" feed
    const currentPost = items[activeIdx];
    if (currentPost && currentPost.kind === "post") {
      trackVibeInteraction(currentPost.data.category);
    }
  }, [activeIdx, requireAuth, items]);

  // reset on filter change
  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0, behavior: "auto" });
    setActiveIdx(0);
  }, [category, searchQuery]);

  return (
    <div className="relative h-[100svh] w-full overflow-hidden bg-background">
      {/* top header */}
      <header
        className={`absolute inset-x-0 top-0 z-30 pt-[max(0.75rem,env(safe-area-inset-top))] transition-all duration-300 ${isSearching ? "bg-background/95 backdrop-blur-xl pointer-events-auto shadow-soft" : "pointer-events-none"}`}
      >
        <div className="flex items-center justify-between px-4 pb-3">
          {isSearching ? (
            <div className="flex-1 flex gap-2 items-center w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/50" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search places or neighborhoods..."
                  className="w-full bg-foreground/10 border border-border/50 text-foreground text-sm rounded-full pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-accent"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground/80"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <button
                onClick={() => {
                  setIsSearching(false);
                  setSearchQuery("");
                }}
                className="text-xs font-display font-bold uppercase tracking-widest text-foreground/70 active:scale-95 px-2"
              >
                Done
              </button>
            </div>
          ) : (
            <>

              <div className="pointer-events-auto flex items-center gap-2">
                <button
                  onClick={() => setIsSearching(true)}
                  aria-label="Search"
                  className="grid h-9 w-9 place-items-center rounded-full glass-dark"
                >
                  <Search className="h-4 w-4" />
                </button>
                <button
                  aria-label="For you"
                  className="inline-flex items-center gap-1.5 rounded-full glass-dark px-3 py-1.5 text-xs font-display font-bold uppercase tracking-widest"
                >
                  <Sparkles className="h-3.5 w-3.5 text-accent" />
                  For You
                </button>
              </div>
            </>
          )}
        </div>

        {/* Only show categories when not searching */}
        {!isSearching && (
          <div className="pointer-events-auto">
            <CategoryRail active={category} onChange={setCategory} />
          </div>
        )}
      </header>

      {/* feed */}
      <div
        ref={containerRef}
        className="snap-y-mandatory no-scrollbar h-full w-full overflow-y-scroll overscroll-contain"
      >
        {items.map((item, i) => (
          <div
            key={item.kind + ":" + item.id}
            data-card-idx={i}
            className="snap-start h-[100svh] w-full"
          >
            {item.kind === "post" ? (
              <SwipeableFeedCard
                initialPost={item.data}
                active={i === activeIdx}
                muted={muted}
                onToggleMute={() => setMuted((m) => !m)}
              />
            ) : (
              <PromotedCard
                promo={item.data}
                active={i === activeIdx}
                muted={muted}
                onToggleMute={() => setMuted((m) => !m)}
              />
            )}
          </div>
        ))}
        {items.length === 0 && (
          <div className="grid h-[100svh] place-items-center px-8 text-center">
            <div className="space-y-3">
              <p className="text-5xl">🌵</p>
              <p className="font-display text-xl font-bold">No vibes here yet</p>
              <p className="text-sm text-foreground/60">
                Try another category or check back in a sec.
              </p>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
