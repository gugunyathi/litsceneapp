import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Heart,
  Send,
  Users,
  Radio,
  Flame,
  Share2,
  Volume2,
  VolumeX,
  X,
  Check,
  CalendarPlus,
  Trophy,
  ChevronRight,
} from "lucide-react";
import { VIBE_POSTS, slugify, timeAgo, fireScore } from "@/data/vibes";
import { addBooking } from "@/data/bookings";
import { useRankChanges } from "@/data/friends";
import { toast } from "sonner";

export const Route = createFileRoute("/live/$slug")({
  loader: ({ params }) => {
    const post = VIBE_POSTS.find((p) => p.isLive && slugify(p.placeName) === params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => {
    const post = loaderData?.post;
    if (!post) return { meta: [{ title: "Live — VibeCheck" }] };
    return {
      meta: [
        { title: `🔴 LIVE: ${post.placeName} — VibeCheck` },
        { name: "description", content: `Streaming live from ${post.placeName} right now.` },
        { property: "og:title", content: `🔴 LIVE: ${post.placeName}` },
        { property: "og:description", content: post.caption },
        { property: "og:image", content: post.poster },
        { property: "twitter:image", content: post.poster },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="grid min-h-[100svh] place-items-center bg-background px-6 text-center">
      <div className="space-y-3">
        <p className="text-5xl">📡</p>
        <p className="font-display text-xl font-bold">Stream's offline</p>
        <p className="text-sm text-foreground/60">This vibe wrapped up. Try another live spot.</p>
        <Link
          to="/live"
          className="inline-block rounded-full bg-gradient-sunset px-5 py-2 font-display text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-glow-coral"
        >
          Back to Live
        </Link>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="grid min-h-[100svh] place-items-center bg-background px-6 text-center">
      <div className="space-y-3">
        <p className="font-display text-xl font-bold">Stream error</p>
        <p className="text-sm text-foreground/60">{error.message}</p>
        <Link to="/live" className="inline-block underline">
          Back to Live
        </Link>
      </div>
    </div>
  ),
  component: LivePlayerPage,
});

interface ChatMessage {
  id: string;
  user: string;
  text: string;
  fire?: number;
  isMe?: boolean;
  isTip?: boolean;
}

const SEED_USERS = [
  "@danceflo0r",
  "@tropicaltori",
  "@bassdrop",
  "@miamimoon",
  "@neonkid",
  "@partypapi",
  "@vibegrl",
];

const SEED_MESSAGES = [
  "this DJ is COOKING",
  "wait who's the headliner tonight?? 🔥",
  "on my way 15 min out",
  "the lighting omg",
  "🔥🔥🔥",
  "tell me there's still room at the bar",
  "best night of the month frrr",
  "is the rooftop open too?",
];

function randomViewers(seed: number) {
  // deterministic seed-based start
  return 320 + ((seed * 73) % 580);
}

function LivePlayerPage() {
  const { post } = Route.useLoaderData();
  const videoRef = useRef<HTMLVideoElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const [muted, setMuted] = useState(false);
  const [viewers, setViewers] = useState(() => randomViewers(post.id.charCodeAt(0)));
  const navigate = useNavigate();
  const [firePoints, setFirePoints] = useState(120);
  const [tipBurst, setTipBurst] = useState<{ id: number; amount: number }[]>([]);
  const [tipModal, setTipModal] = useState(false);
  const [draft, setDraft] = useState("");
  const [reactions, setReactions] = useState<
    { id: number; emoji: string; left: number; sway: number; mine?: boolean }[]
  >([]);
  const [going, setGoing] = useState(false);
  const [tippers, setTippers] = useState<Record<string, number>>(() => ({
    "@danceflo0r": 320,
    "@neonkid": 215,
    "@bassdrop": 140,
    "@miamimoon": 85,
    "@vibegrl": 40,
    "@tropicaltori": 380,
    "@partypapi": 260,
    "@latenightlena": 195,
    "@brickellbabe": 175,
    "@ravelogs": 155,
    "@miamigremlin": 130,
    "@dancefloordiary": 110,
    "@sunsethunter": 95,
    "@bottlepop": 78,
    "@encoreking": 62,
    "@palmavenue": 55,
    "@afterhoursgrl": 48,
    "@fomofiend": 36,
    "@vipline": 30,
    "@coastalclub": 25,
    "@nochescaliente": 18,
  }));
  const [leaderOpen, setLeaderOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    SEED_MESSAGES.slice(0, 5).map((text, i) => ({
      id: `s-${i}`,
      user: SEED_USERS[i % SEED_USERS.length],
      text,
    })),
  );

  const sortedTippers = useMemo(
    () =>
      Object.entries(tippers)
        .sort((a, b) => b[1] - a[1])
        .map(([handle, amount]) => ({ handle, amount })),
    [tippers],
  );
  const topTippers = useMemo(
    () => sortedTippers.slice(0, 3).map((t) => [t.handle, t.amount] as const),
    [sortedTippers],
  );
  const rankChanges = useRankChanges(sortedTippers);

  const REACTIONS = ["🔥", "💃", "🍾", "🪩", "❤️", "🤯"];

  const emitReaction = (emoji: string, mine = false) => {
    const id = Date.now() + Math.random();
    const left = mine ? 50 + (Math.random() * 16 - 8) : Math.random() * 70 + 15;
    const sway = Math.random() * 60 - 30;
    setReactions((r) => [...r.slice(-30), { id, emoji, left, sway, mine }]);
    window.setTimeout(() => {
      setReactions((r) => r.filter((x) => x.id !== id));
    }, 3600);
  };

  const [followers, setFollowers] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    const fetchFollowers = async () => {
      // Placeholder API
      await new Promise((resolve) => setTimeout(resolve, 800));
      if (!active) return;
      const hash = post.username.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
      setFollowers(hash * 42 + 2500);
    };
    fetchFollowers();
    return () => {
      active = false;
    };
  }, [post.username]);

  // play stream
  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, []);

  // viewer count drift
  useEffect(() => {
    const id = setInterval(() => {
      setViewers((v) => Math.max(50, v + Math.floor(Math.random() * 9 - 3)));
    }, 2500);
    return () => clearInterval(id);
  }, []);

  // simulated incoming chat
  useEffect(() => {
    const id = setInterval(() => {
      setMessages((prev) => {
        const next: ChatMessage = {
          id: `r-${Date.now()}`,
          user: SEED_USERS[Math.floor(Math.random() * SEED_USERS.length)],
          text: SEED_MESSAGES[Math.floor(Math.random() * SEED_MESSAGES.length)],
        };
        return [...prev.slice(-40), next];
      });
    }, 4500);
    return () => clearInterval(id);
  }, []);

  // simulated reactions from other viewers
  useEffect(() => {
    const id = setInterval(() => {
      const burst = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < burst; i++) {
        setTimeout(
          () => emitReaction(REACTIONS[Math.floor(Math.random() * REACTIONS.length)]),
          i * 180,
        );
      }
    }, 1800);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // simulated tips coming in from other viewers (updates leaderboard)
  useEffect(() => {
    const id = setInterval(() => {
      const user = SEED_USERS[Math.floor(Math.random() * SEED_USERS.length)];
      const amount = [5, 5, 10, 25, 50][Math.floor(Math.random() * 5)];
      setTippers((t) => ({ ...t, [user]: (t[user] ?? 0) + amount }));
    }, 3200);
    return () => clearInterval(id);
  }, []);

  const handleGoing = () => {
    if (going) return;
    const date = new Date();
    date.setHours(date.getHours() + 2);
    addBooking({
      type: "table",
      placeName: post.placeName,
      placeSlug: slugify(post.placeName),
      cover: post.poster,
      partySize: 2,
      date: date.toISOString(),
      timeLabel: date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
    });
    setGoing(true);
    ["🔥", "💃", "🪩", "🍾", "❤️"].forEach((e, i) =>
      setTimeout(() => emitReaction(e, true), i * 90),
    );
    toast("You're going! 🪩", {
      description: `Saved to My Bookings · ${post.placeName}`,
      action: {
        label: "View",
        onClick: () => navigate({ to: "/bookings" }),
      },
    });
  };

  // autoscroll chat
  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const sendMessage = () => {
    const t = draft.trim();
    if (!t) return;
    setMessages((m) => [...m, { id: `me-${Date.now()}`, user: "@you", text: t, isMe: true }]);
    setDraft("");
  };

  const sendTip = (amount: number) => {
    if (firePoints < amount) {
      toast("Not enough 🔥", { description: "Earn more by posting honest comments." });
      return;
    }
    setFirePoints((p) => p - amount);
    setTippers((t) => ({ ...t, "@you": (t["@you"] ?? 0) + amount }));
    const tipId = Date.now();
    setTipBurst((b) => [...b, { id: tipId, amount }]);
    setTimeout(() => setTipBurst((b) => b.filter((t) => t.id !== tipId)), 2000);
    setMessages((m) => [
      ...m,
      {
        id: `tip-${Date.now()}`,
        user: "@you",
        text: `tipped ${amount} 🔥 to ${post.placeName}`,
        fire: amount,
        isMe: true,
        isTip: true,
      },
    ]);
    setTipModal(false);
    toast(`Sent ${amount} 🔥`, { description: "The DJ felt that one." });
  };

  const tipOptions = useMemo(() => [5, 25, 100], []);

  return (
    <div className="relative h-[100svh] w-full overflow-hidden bg-background">
      {/* Video */}
      <video
        ref={videoRef}
        src={post.videoUrl}
        poster={post.poster}
        loop
        playsInline
        muted={muted}
        autoPlay
        onClick={() => setMuted((m) => !m)}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-vibe" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-background/85 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-background via-background/70 to-transparent" />

      {/* Top bar */}
      <header className="absolute inset-x-0 top-0 z-20 flex items-center gap-2 p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <Link
          to="/live"
          aria-label="Back"
          className="grid h-9 w-9 place-items-center rounded-full glass-dark"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div className="flex flex-1 items-center gap-2">
          <motion.div
            animate={{
              opacity: [1, 0.6, 1],
              scale: [1, 1.02, 1],
              boxShadow: [
                "0 0 10px var(--color-secondary)",
                "0 0 20px var(--color-secondary)",
                "0 0 10px var(--color-secondary)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1"
          >
            <Radio className="h-3 w-3 animate-pulse text-secondary-foreground" />
            <span className="text-[10px] font-display font-black uppercase tracking-[0.25em] text-secondary-foreground">
              Live
            </span>
          </motion.div>
          <div className="glass-dark inline-flex items-center gap-1.5 rounded-full px-2.5 py-1">
            <Users className="h-3 w-3 text-accent" />
            <span className="text-[11px] font-display font-bold tabular-nums">
              {viewers.toLocaleString()}
            </span>
          </div>
          <div className="glass-dark inline-flex items-center gap-1.5 rounded-full px-2.5 py-1">
            <span className="text-[10px] font-display font-bold">{post.username}</span>
            <span className="text-[10px] text-foreground/60">
              ·{" "}
              {followers !== null
                ? followers >= 1000
                  ? `${(followers / 1000).toFixed(1)}k`
                  : followers
                : "..."}
            </span>
          </div>
        </div>

        <button
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "Unmute" : "Mute"}
          className="grid h-9 w-9 place-items-center rounded-full glass-dark"
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
        <button
          aria-label="Share"
          onClick={() => toast("Link copied", { description: "Share the vibe." })}
          className="grid h-9 w-9 place-items-center rounded-full glass-dark"
        >
          <Share2 className="h-4 w-4" />
        </button>
      </header>

      {/* Place pill */}
      <div className="absolute left-3 right-3 top-[max(3.75rem,calc(env(safe-area-inset-top)+3.25rem))] z-20">
        <Link
          to="/place/$slug"
          params={{ slug: slugify(post.placeName) }}
          className="glass-dark inline-flex max-w-full items-center gap-2 rounded-full border border-border/40 px-3 py-1.5"
        >
          <span className="text-base">{fireScore(post.vibeScore)}</span>
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-bold leading-none">{post.placeName}</p>
            <p className="text-[10px] uppercase tracking-widest text-foreground/60">
              {post.neighborhood} · started {timeAgo(post.postedAt)}
            </p>
          </div>
        </Link>
      </div>

      {/* Top tippers leaderboard pill (tap to expand) */}
      <div className="absolute left-3 right-3 top-[max(7rem,calc(env(safe-area-inset-top)+6.5rem))] z-20">
        <button
          onClick={() => setLeaderOpen(true)}
          aria-label="Open full leaderboard"
          className="glass-dark inline-flex max-w-full items-center gap-2 rounded-full border border-accent/40 px-2.5 py-1 shadow-[0_0_24px_oklch(0.78_0.18_60_/_0.25)] transition-transform active:scale-95"
        >
          <Trophy className="h-3 w-3 shrink-0 text-accent" />
          <span className="text-[9px] font-display font-black uppercase tracking-[0.22em] text-accent">
            Top Tippers
          </span>
          <div className="flex items-center gap-1.5 overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              {topTippers.map(([user, amount], i) => (
                <motion.div
                  key={user}
                  layout
                  initial={{ opacity: 0, scale: 0.8, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.25 }}
                  className={`flex items-center gap-1 rounded-full px-1.5 py-0.5 ${
                    user === "@you"
                      ? "bg-gradient-sunset text-primary-foreground"
                      : "bg-foreground/10"
                  }`}
                >
                  <span className="text-[10px] font-display font-black">
                    {["🥇", "🥈", "🥉"][i]}
                  </span>
                  <span className="max-w-[70px] truncate text-[10px] font-bold">{user}</span>
                  <span className="text-[10px] font-black tabular-nums">{amount}</span>
                  <Flame className="h-2.5 w-2.5" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <ChevronRight className="h-3 w-3 text-foreground/50" />
        </button>
      </div>

      {/* Floating reactions overlay (co-watch) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 top-0 z-30 overflow-hidden">
        <AnimatePresence>
          {reactions.map((r) => (
            <motion.div
              key={r.id}
              initial={{ y: 0, opacity: 0, scale: 0.4, x: 0 }}
              animate={{
                y: typeof window !== "undefined" ? -window.innerHeight * 0.7 : -600,
                opacity: [0, 1, 1, 0],
                scale: r.mine ? [0.4, 1.4, 1] : [0.4, 1.1, 1],
                x: [0, r.sway / 2, r.sway, r.sway / 2, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 3.4, ease: [0.16, 1, 0.3, 1] }}
              style={{ left: `${r.left}%`, bottom: "8rem" }}
              className="absolute"
            >
              <span
                className={`text-3xl ${
                  r.mine
                    ? "drop-shadow-[0_0_18px_oklch(0.72_0.22_25_/_0.9)]"
                    : "drop-shadow-[0_0_8px_rgba(0,0,0,0.4)]"
                }`}
              >
                {r.emoji}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Tip burst overlay */}
      <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
        <AnimatePresence>
          {tipBurst.map((t) => (
            <motion.div
              key={t.id}
              initial={{ y: 40, opacity: 0, scale: 0.6 }}
              animate={{ y: -260, opacity: 1, scale: 1.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
              className="absolute bottom-40 left-1/2 -translate-x-1/2 text-center"
            >
              <p className="text-5xl drop-shadow-[0_0_20px_oklch(0.78_0.18_60_/_0.8)]">🔥</p>
              <p className="font-display text-2xl font-black text-accent">+{t.amount}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Going button (top-right, under header) */}
      <div className="absolute right-3 top-[max(3.75rem,calc(env(safe-area-inset-top)+3.25rem))] z-20">
        <button
          onClick={handleGoing}
          aria-pressed={going}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-display text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 ${
            going
              ? "bg-accent text-accent-foreground shadow-[0_0_24px_oklch(0.78_0.18_60_/_0.6)]"
              : "bg-gradient-sunset text-primary-foreground shadow-glow-coral"
          }`}
        >
          {going ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Going
            </>
          ) : (
            <>
              <CalendarPlus className="h-3.5 w-3.5" />
              I'm Going
            </>
          )}
        </button>
      </div>

      {/* Chat overlay (bottom 55%) */}
      <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div
          ref={chatRef}
          className="no-scrollbar mx-3 max-h-[42vh] space-y-1.5 overflow-y-auto pb-2"
        >
          <AnimatePresence initial={false}>
            {messages.slice(-12).map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex"
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-1.5 text-[12px] leading-snug ${
                    m.isTip
                      ? "bg-accent/30 text-foreground shadow-[0_0_20px_oklch(0.78_0.18_60_/_0.4)]"
                      : m.isMe
                        ? "glass-dark border border-primary/40"
                        : "glass-dark"
                  }`}
                >
                  <span
                    className={`mr-1.5 font-display text-[11px] font-bold ${
                      m.isMe ? "text-primary" : "text-secondary"
                    }`}
                  >
                    {m.user}
                  </span>
                  <span className="text-foreground/95">{m.text}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Reaction picker */}
        <div className="mx-3 mb-2 flex items-center justify-center gap-1.5">
          {REACTIONS.map((e) => (
            <button
              key={e}
              onClick={() => emitReaction(e, true)}
              aria-label={`React ${e}`}
              className="grid h-9 w-9 place-items-center rounded-full glass-dark border border-border/40 text-lg transition-transform active:scale-90 hover:border-primary/60"
            >
              {e}
            </button>
          ))}
        </div>

        {/* Composer */}
        <div className="mx-3 flex items-center gap-2">
          <div className="glass-dark flex flex-1 items-center gap-2 rounded-full border border-border/40 px-3 py-1.5">
            <Heart className="h-4 w-4 text-primary" />
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Say something nice..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-foreground/40"
            />
            {draft && (
              <button
                onClick={sendMessage}
                aria-label="Send"
                className="grid h-7 w-7 place-items-center rounded-full bg-gradient-sunset text-primary-foreground"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={() => setTipModal(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-sunset px-3.5 py-2 font-display text-xs font-black uppercase tracking-widest text-primary-foreground shadow-glow-coral active:scale-95"
          >
            <Flame className="h-4 w-4" />
            Tip
          </button>
        </div>

        <p className="mt-1.5 text-center text-[10px] uppercase tracking-widest text-foreground/40">
          Your balance · {firePoints} 🔥
        </p>
      </div>

      {/* Tip modal */}
      <AnimatePresence>
        {tipModal && (
          <>
            <motion.button
              aria-label="Close"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTipModal(false)}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ y: 200, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 200, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed inset-x-3 bottom-3 z-50 max-w-md md:left-1/2 md:bottom-10 md:right-auto md:-translate-x-1/2"
            >
              <div className="glass-dark rounded-3xl border border-border/40 p-5 shadow-soft">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-black tracking-tight">
                    Drop some <span className="text-gradient-sunset">🔥</span>
                  </h2>
                  <button
                    onClick={() => setTipModal(false)}
                    aria-label="Close"
                    className="grid h-8 w-8 place-items-center rounded-full glass"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-1 text-xs text-foreground/60">
                  Show {post.placeName} love. Your tip pops on screen.
                </p>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  {tipOptions.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => sendTip(amt)}
                      className="rounded-2xl border border-border/40 bg-gradient-card p-4 text-center transition-all active:scale-95 hover:border-primary/60"
                    >
                      <p className="text-2xl">🔥</p>
                      <p className="mt-1 font-display text-xl font-black">{amt}</p>
                      <p className="text-[10px] uppercase tracking-widest text-foreground/60">
                        {amt === 5 ? "Spark" : amt === 25 ? "Blaze" : "Inferno"}
                      </p>
                    </button>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between rounded-2xl bg-accent/10 p-3 text-xs">
                  <span className="text-foreground/70">Your balance</span>
                  <span className="font-display font-bold">{firePoints} 🔥</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Full leaderboard sheet (top 20 + ▲▼ since last hour) */}
      <AnimatePresence>
        {leaderOpen && (
          <>
            <motion.button
              aria-label="Close leaderboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLeaderOpen(false)}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 32 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[85svh] rounded-t-[2rem] glass-dark border-t border-border/40 shadow-soft md:left-1/2 md:right-auto md:bottom-6 md:max-w-md md:-translate-x-1/2 md:rounded-3xl md:border"
            >
              <div className="mx-auto mt-2.5 h-1.5 w-12 rounded-full bg-foreground/20 md:hidden" />
              <div className="flex items-center justify-between p-5 pb-3">
                <div>
                  <p className="text-[10px] font-display font-black uppercase tracking-[0.3em] text-accent">
                    Tonight · Last hour
                  </p>
                  <h2 className="font-display text-2xl font-black tracking-tight">
                    Top <span className="text-gradient-sunset">Tippers</span>
                  </h2>
                </div>
                <button
                  onClick={() => setLeaderOpen(false)}
                  aria-label="Close"
                  className="grid h-9 w-9 place-items-center rounded-full glass"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="no-scrollbar max-h-[65svh] space-y-1 overflow-y-auto px-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <AnimatePresence initial={false}>
                  {sortedTippers.slice(0, 20).map((t, i) => {
                    const change = rankChanges[t.handle];
                    const rank = i + 1;
                    const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;
                    const isMe = t.handle === "@you";
                    return (
                      <motion.div
                        key={t.handle}
                        layout
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`flex items-center gap-3 rounded-2xl border px-3 py-2.5 ${
                          isMe
                            ? "border-primary/60 bg-gradient-sunset/15 shadow-glow-coral"
                            : "border-border/40 bg-foreground/[0.03]"
                        }`}
                      >
                        <span className="grid w-8 shrink-0 place-items-center font-display text-base font-black tabular-nums">
                          {medal ?? rank}
                        </span>
                        <span className="flex-1 truncate font-display text-sm font-bold">
                          {t.handle}
                          {isMe && (
                            <span className="ml-1.5 rounded-full bg-primary/30 px-1.5 py-0.5 text-[9px] uppercase tracking-widest">
                              You
                            </span>
                          )}
                        </span>
                        <span className="w-12 text-right">
                          {change === "new" ? (
                            <span className="rounded-full bg-secondary/30 px-1.5 py-0.5 text-[9px] font-display font-black uppercase tracking-widest text-secondary">
                              New
                            </span>
                          ) : typeof change === "number" && change > 0 ? (
                            <span className="font-display text-[11px] font-black text-accent">
                              ▲ {change}
                            </span>
                          ) : typeof change === "number" && change < 0 ? (
                            <span className="font-display text-[11px] font-black text-primary">
                              ▼ {Math.abs(change)}
                            </span>
                          ) : (
                            <span className="font-display text-[11px] text-foreground/40">—</span>
                          )}
                        </span>
                        <span className="inline-flex w-16 items-center justify-end gap-1 font-display text-sm font-black tabular-nums">
                          {t.amount}
                          <Flame className="h-3 w-3 text-accent" />
                        </span>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
