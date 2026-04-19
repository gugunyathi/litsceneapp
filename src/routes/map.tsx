import { createFileRoute, Link } from "@tanstack/react-router";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { VIBE_POSTS, CATEGORIES, type Category, fireScore } from "@/data/vibes";
import { BottomNav } from "@/components/BottomNav";
import { CategoryRail } from "@/components/CategoryRail";

const GOOGLE_MAPS_API_KEY = "AIzaSyDdrrfxqo2QOa2VifcB40GPYmcAdA5l29Q";
const MAP_ID = "vibecheck_dark";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Hot Spots Map — VibeCheck" },
      { name: "description", content: "See the vibiest spots around you on the map." },
      { property: "og:title", content: "Hot Spots Map — VibeCheck" },
      { property: "og:description", content: "Tap a pin to see live vibes." },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  const [category, setCategory] = useState<Category | "all">("all");
  const [selected, setSelected] = useState<string | null>(null);

  const places = useMemo(() => {
    return category === "all" ? VIBE_POSTS : VIBE_POSTS.filter((p) => p.category === category);
  }, [category]);

  const center = { lat: 25.79, lng: -80.17 };
  const selectedPost = places.find((p) => p.id === selected);

  return (
    <div className="relative h-[100svh] w-full overflow-hidden bg-background">
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <Map
          mapId={MAP_ID}
          defaultCenter={center}
          defaultZoom={13}
          gestureHandling="greedy"
          disableDefaultUI
          colorScheme="DARK"
          className="h-full w-full"
        >
          {places.map((p) => (
            <AdvancedMarker
              key={p.id}
              position={{ lat: p.lat, lng: p.lng }}
              onClick={() => setSelected(p.id)}
            >
              <button
                className={`grid place-items-center rounded-full bg-gradient-sunset px-2.5 py-1 text-sm shadow-glow-coral transition-transform ${
                  selected === p.id ? "scale-125" : ""
                }`}
              >
                <span className="leading-none">{fireScore(p.vibeScore)}</span>
              </button>
            </AdvancedMarker>
          ))}
        </Map>
      </APIProvider>

      {/* Header overlay */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-30 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-3 px-4 pb-3">
          <Link
            to="/"
            className="pointer-events-auto grid h-9 w-9 place-items-center rounded-full glass-dark"
            aria-label="Back to feed"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="font-display text-xl font-black tracking-tight">
            Hot Spots <span className="text-gradient-sunset">Near You</span>
          </h1>
        </div>
        <div className="pointer-events-auto">
          <CategoryRail active={category} onChange={setCategory} />
        </div>
      </header>

      {/* Selected place card */}
      {selectedPost && (
        <div className="absolute inset-x-0 bottom-24 z-30 px-4">
          <div className="glass-dark mx-auto max-w-md overflow-hidden rounded-3xl border border-border/40 shadow-soft">
            <div className="flex gap-3 p-3">
              <img
                src={selectedPost.poster}
                alt={selectedPost.placeName}
                className="h-20 w-20 rounded-2xl object-cover"
              />
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <h3 className="font-display text-base font-bold leading-tight">
                    {selectedPost.placeName}
                  </h3>
                  <p className="text-[11px] uppercase tracking-widest text-foreground/60">
                    {selectedPost.neighborhood} · {selectedPost.category}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-base">{fireScore(selectedPost.vibeScore)}</span>
                  <button
                    onClick={() => setSelected(null)}
                    className="rounded-full bg-gradient-sunset px-3 py-1 text-[11px] font-display font-bold uppercase tracking-widest text-primary-foreground"
                  >
                    Watch
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category list at bottom — quick stats */}
      {!selectedPost && (
        <div className="pointer-events-none absolute inset-x-0 bottom-24 z-20 px-4">
          <div className="glass-dark mx-auto max-w-md rounded-2xl border border-border/40 px-4 py-3 shadow-soft">
            <p className="text-[11px] uppercase tracking-widest text-foreground/60">Right now</p>
            <p className="font-display text-lg font-bold">
              {places.length} spots ·{" "}
              <span className="text-gradient-fire">
                {places.filter((p) => p.vibeScore === 3).length} on fire
              </span>
            </p>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
