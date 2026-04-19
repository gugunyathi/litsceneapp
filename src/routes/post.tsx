import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Camera, MapPin, Sparkles, Tag, Link as LinkIcon, Loader2 } from "lucide-react";
import { CATEGORIES, VIBE_POSTS } from "@/data/vibes";
import { BottomNav } from "@/components/BottomNav";
import { useState } from "react";
import { toast } from "sonner";
import { useFirebase } from "@/lib/FirebaseContext";

export const Route = createFileRoute("/post")({
  head: () => ({
    meta: [
      { title: "Drop a Vibe — VibeCheck" },
      { name: "description", content: "Post a short video and earn vibe points." },
      { property: "og:title", content: "Drop a Vibe — VibeCheck" },
      { property: "og:description", content: "Show the world what's popping." },
    ],
  }),
  component: PostPage,
});

const DEFAULT_SAMPLE_VIDEOS = [
  "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
];

function PostPage() {
  const [tab, setTab] = useState<"record" | "link">("record");
  const [url, setUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [importedVideo, setImportedVideo] = useState<string | null>(null);

  const [place, setPlace] = useState("");
  const [category, setCategory] = useState("club");
  const [score, setScore] = useState<1 | 2 | 3>(3);
  const navigate = useNavigate();
  const { requireAuth } = useFirebase();

  const handleImport = () => {
    if (!url) return;
    setIsProcessing(true);

    // Simulate scraping and extracting raw MP4 from social URL
    setTimeout(() => {
      const mockExtractedMp4 =
        DEFAULT_SAMPLE_VIDEOS[Math.floor(Math.random() * DEFAULT_SAMPLE_VIDEOS.length)];
      setImportedVideo(mockExtractedMp4);
      setIsProcessing(false);
      toast.success("Video extracted successfully", {
        description: "Ready to drop on the timeline.",
      });
    }, 1800);
  };

  const handlePost = () => {
    if (!requireAuth()) return;

    if (tab === "link" && !importedVideo) {
      toast.error("Finish importing your video first");
      return;
    }

    const newId = `imported-${Date.now()}`;
    // Add to static array so it appears on timeline immediately
    VIBE_POSTS.unshift({
      id: newId,
      videoUrl: importedVideo || DEFAULT_SAMPLE_VIDEOS[0], // fallback for record tab
      poster: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80&auto=format",
      placeName: place || "Imported Spot",
      category: category as "club" | "restaurant" | "event" | "rooftop" | "beach",
      neighborhood: "Downtown",
      city: "Miami",
      lat: 25.7617,
      lng: -80.1918,
      vibeScore: score,
      postedAt: new Date().toISOString(),
      username: "@you",
      caption: `Imported from ${url.includes("tiktok") ? "TikTok" : url.includes("instagram") ? "Instagram" : url.includes("snapchat") ? "Snapchat" : url.includes("youtube") ? "YouTube" : "web"} 🔥`,
      likes: 0,
      comments: 0,
      isLive: false,
    });

    toast.success("Vibe Dropped! +50 🔥", {
      description: "It's live on the timeline.",
    });

    navigate({ to: "/" });
  };

  return (
    <div className="min-h-[100svh] w-full bg-background pb-32">
      <header className="px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <Link to="/" className="text-xs uppercase tracking-widest text-foreground/60">
          ← cancel
        </Link>
        <h1 className="mt-2 font-display text-3xl font-black tracking-tighter">
          Drop a <span className="text-gradient-sunset">vibe</span>
        </h1>
        <p className="mt-1 text-sm text-foreground/70">
          Record or import from Instagram, TikTok, Snapchat, or X.
        </p>
      </header>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 border-b border-border/40">
          <button
            onClick={() => setTab("record")}
            className={`flex flex-1 items-center justify-center gap-2 pb-3 font-display text-xs font-bold uppercase tracking-widest ${
              tab === "record"
                ? "border-b-2 border-primary text-primary"
                : "border-b-2 border-transparent text-foreground/60"
            }`}
          >
            <Camera className="h-3.5 w-3.5" />
            Camera
          </button>
          <button
            onClick={() => setTab("link")}
            className={`flex flex-1 items-center justify-center gap-2 pb-3 font-display text-xs font-bold uppercase tracking-widest ${
              tab === "link"
                ? "border-b-2 border-primary text-primary"
                : "border-b-2 border-transparent text-foreground/60"
            }`}
          >
            <LinkIcon className="h-3.5 w-3.5" />
            Paste Link
          </button>
        </div>
      </div>

      <div className="px-4">
        {tab === "record" ? (
          <button className="relative grid aspect-[9/12] w-full place-items-center overflow-hidden rounded-3xl border-2 border-dashed border-primary/40 bg-gradient-card transition-all active:scale-[0.99]">
            <div className="absolute inset-0 bg-gradient-glow opacity-60" />
            <div className="relative flex flex-col items-center gap-3">
              <div className="grid h-20 w-20 place-items-center rounded-full bg-gradient-sunset shadow-glow-coral animate-float">
                <Camera className="h-9 w-9 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <p className="font-display text-lg font-bold">Tap to record</p>
              <p className="text-xs uppercase tracking-widest text-foreground/60">
                up to 60 seconds · vertical
              </p>
            </div>
          </button>
        ) : (
          <div className="flex flex-col gap-4">
            {!importedVideo ? (
              <div className="relative flex flex-col aspect-[9/12] w-full items-center justify-center overflow-hidden rounded-3xl border border-border/40 bg-foreground/5 p-6 text-center">
                <div className="mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-foreground/10">
                  <LinkIcon className="h-8 w-8 text-foreground/70" />
                </div>
                <h3 className="mb-2 font-display text-lg font-bold">Import Social Video</h3>
                <p className="mb-6 text-xs text-foreground/60 leading-snug">
                  Paste a link from Instagram, TikTok, Snapchat, Facebook, X, or YouTube Shorts.
                  We'll extract the raw MP4 so it plays natively in the timeline.
                </p>
                <div className="w-full space-y-3">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://tiktok.com/..."
                    className="w-full rounded-2xl border border-border/40 bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  />
                  <button
                    onClick={handleImport}
                    disabled={!url || isProcessing}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 font-display text-xs font-bold uppercase tracking-widest text-primary-foreground disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Extracting...
                      </>
                    ) : (
                      "Import Video"
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative aspect-[9/12] w-full overflow-hidden rounded-3xl border border-border/40 bg-black">
                <video
                  src={importedVideo}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-full w-full object-cover"
                />
                <div className="absolute right-3 top-3 rounded-full bg-black/50 px-2 py-1 backdrop-blur-md">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white">
                    Extracted
                  </span>
                </div>
                <button
                  onClick={() => {
                    setImportedVideo(null);
                    setUrl("");
                  }}
                  className="absolute left-3 top-3 rounded-full bg-black/50 px-3 py-1.5 text-xs text-white backdrop-blur-md"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <section className="space-y-4 px-4 pt-6">
        <Field icon={MapPin} label="Where you at?">
          <input
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            placeholder="Search places…"
            className="w-full bg-transparent text-sm font-medium placeholder:text-foreground/50 focus:outline-none"
          />
        </Field>

        <Field icon={Tag} label="Category">
          <div className="-mx-1 flex flex-wrap gap-1.5">
            {CATEGORIES.filter((c) => c.id !== "all").map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`rounded-full px-3 py-1 text-[11px] font-display font-bold uppercase tracking-widest transition-colors ${
                  category === c.id ? "bg-primary text-primary-foreground" : "glass"
                }`}
              >
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
        </Field>

        <Field icon={Sparkles} label="Vibe score">
          <div className="flex gap-2">
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                onClick={() => setScore(n as 1 | 2 | 3)}
                className={`flex-1 rounded-2xl py-3 text-2xl shadow-soft active:scale-95 transition-opacity ${
                  score === n
                    ? "bg-gradient-card opacity-100"
                    : "bg-gradient-card opacity-40 hover:opacity-100"
                }`}
              >
                {"🔥".repeat(n)}
              </button>
            ))}
          </div>
        </Field>

        <button
          onClick={handlePost}
          className="w-full rounded-full bg-gradient-sunset py-4 font-display text-base font-black uppercase tracking-widest text-primary-foreground shadow-glow-coral active:scale-[0.98]"
        >
          Post & earn 50 🔥
        </button>
      </section>

      <BottomNav />
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof MapPin;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-2xl border border-border/40 p-4">
      <div className="mb-2 flex items-center gap-2 text-foreground/70">
        <Icon className="h-4 w-4" />
        <span className="text-[10px] font-display font-bold uppercase tracking-[0.25em]">
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}
