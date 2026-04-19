import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import {
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  Clock,
  Share2,
  Heart,
  Calendar,
  Users,
  Ticket,
  Tag,
  Sparkles,
  Play,
} from "lucide-react";
import {
  VIBE_POSTS,
  getVenueDetails,
  getPostsByPlace,
  fireScore,
  timeAgo,
  slugify,
  type VibePost,
} from "@/data/vibes";
import { addBooking } from "@/data/bookings";
import { toast } from "sonner";
import { BottomNav } from "@/components/BottomNav";
import { VibeBadge } from "@/components/VibeBadge";
import { FriendsGoing } from "@/components/FriendsGoing";
import { useFirebase } from "@/lib/FirebaseContext";

export const Route = createFileRoute("/place/$slug")({
  loader: ({ params }) => {
    const post = VIBE_POSTS.find((p) => slugify(p.placeName) === params.slug);
    if (!post) throw notFound();
    return { placeName: post.placeName };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.placeName ?? "Place"} — VibeCheck` },
      {
        name: "description",
        content: `Real-time vibes, opening hours, table booking and tickets for ${loaderData?.placeName ?? "this spot"}.`,
      },
      {
        property: "og:title",
        content: `${loaderData?.placeName ?? "Place"} — VibeCheck`,
      },
      {
        property: "og:description",
        content: `See what's actually happening at ${loaderData?.placeName ?? "this spot"} right now.`,
      },
    ],
  }),
  notFoundComponent: () => (
    <div className="grid min-h-[100svh] place-items-center bg-background px-6 text-center">
      <div>
        <p className="text-6xl">🌵</p>
        <h1 className="mt-4 font-display text-2xl font-black">Spot not found</h1>
        <Link
          to="/"
          className="mt-4 inline-block rounded-full bg-gradient-sunset px-5 py-2 font-display text-xs font-bold uppercase tracking-widest text-primary-foreground"
        >
          Back to feed
        </Link>
      </div>
    </div>
  ),
  component: PlaceDetailPage,
});

type Tab = "videos" | "book" | "events" | "info";

function PlaceDetailPage() {
  const { placeName } = Route.useLoaderData();
  const posts = useMemo(() => getPostsByPlace(placeName), [placeName]);
  const venue = useMemo(() => getVenueDetails(placeName), [placeName]);
  const hero = posts[0];
  const [tab, setTab] = useState<Tab>("videos");
  const [saved, setSaved] = useState(false);

  if (!hero) return null;

  return (
    <div className="min-h-[100svh] w-full bg-background pb-32">
      {/* Hero */}
      <div className="relative h-[58svh] w-full overflow-hidden">
        <img
          src={hero.poster}
          alt={placeName}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/30" />

        {/* Top bar */}
        <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between p-4 pt-[max(1rem,env(safe-area-inset-top))]">
          <Link
            to="/"
            aria-label="Back"
            className="grid h-10 w-10 place-items-center rounded-full glass-dark"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSaved((s) => !s)}
              aria-label="Save"
              className="grid h-10 w-10 place-items-center rounded-full glass-dark"
            >
              <Heart className={`h-4 w-4 ${saved ? "fill-primary text-primary" : ""}`} />
            </button>
            <button
              aria-label="Share"
              className="grid h-10 w-10 place-items-center rounded-full glass-dark"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Title block */}
        <div className="absolute inset-x-0 bottom-0 z-10 space-y-3 p-5">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-gradient-sunset px-2.5 py-0.5 text-[10px] font-display font-black uppercase tracking-widest text-primary-foreground">
              {hero.category}
            </span>
            <VibeBadge score={hero.vibeScore} />
          </div>
          <h1 className="font-display text-4xl font-black leading-none tracking-tighter">
            {placeName}
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-foreground/80">
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-accent text-accent" />
              <strong className="text-foreground">{venue.rating}</strong>
              <span className="text-foreground/60">({venue.reviewCount.toLocaleString()})</span>
            </span>
            <span>·</span>
            <span className="font-display font-bold text-accent">{venue.priceRange}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {hero.neighborhood}
            </span>
          </div>
          <FriendsGoing placeSlug={slugify(placeName)} size="md" />
        </div>
      </div>

      {/* Quick stats strip */}
      <div className="-mt-6 px-4">
        <div className="glass-dark grid grid-cols-3 gap-2 rounded-3xl border border-border/40 p-3 shadow-soft">
          <Stat label="Vibes" value={`${posts.length}`} sub="posts" />
          <Stat label="Right now" value={fireScore(hero.vibeScore)} sub={timeAgo(hero.postedAt)} />
          <Stat
            label="Live"
            value={hero.isLive ? "ON" : "—"}
            sub={hero.isLive ? "streaming" : "later"}
            highlight={hero.isLive}
          />
        </div>
      </div>

      {/* Tab rail */}
      <div className="sticky top-0 z-30 mt-6 bg-background/85 backdrop-blur-xl">
        <div className="no-scrollbar flex gap-1 overflow-x-auto px-4 py-3">
          {(
            [
              { id: "videos", label: "Vibes", icon: Play },
              { id: "book", label: "Book a Table", icon: Calendar },
              { id: "events", label: "Events", icon: Ticket },
              { id: "info", label: "Info", icon: Sparkles },
            ] as { id: Tab; label: string; icon: typeof Play }[]
          ).map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-display font-bold uppercase tracking-wider transition-all ${
                  active
                    ? "bg-gradient-sunset text-primary-foreground shadow-glow-coral"
                    : "glass text-foreground/80"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 pt-2">
        {tab === "videos" && <VideosTab posts={posts} />}
        {tab === "book" && <BookTab venue={venue} placeName={placeName} />}
        {tab === "events" && <EventsTab venue={venue} placeName={placeName} />}
        {tab === "info" && <InfoTab venue={venue} />}
      </div>

      <BottomNav />
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div className="text-center">
      <p className="text-[10px] uppercase tracking-widest text-foreground/60">{label}</p>
      <p
        className={`mt-0.5 font-display text-base font-black leading-tight ${
          highlight ? "text-secondary animate-pulse" : ""
        }`}
      >
        {value}
      </p>
      <p className="text-[10px] text-foreground/60">{sub}</p>
    </div>
  );
}

/* ---------- Tabs ---------- */

function VideosTab({ posts }: { posts: VibePost[] }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {posts.map((p) => (
        <article
          key={p.id}
          className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-border/40 shadow-soft"
        >
          <img
            src={p.poster}
            alt={p.caption}
            className="absolute inset-0 h-full w-full object-cover transition-transform group-active:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-vibe" />
          <div className="absolute right-2 top-2 rounded-full glass-dark px-2 py-0.5 text-xs">
            {fireScore(p.vibeScore)}
          </div>
          {p.isLive && (
            <div className="absolute left-2 top-2 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-display font-black uppercase tracking-widest text-secondary-foreground shadow-glow-magenta">
              Live
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 space-y-0.5 p-2.5">
            <p className="text-[11px] font-bold text-gradient-sunset">{p.username}</p>
            <p className="line-clamp-2 text-[11px] leading-tight text-foreground/90">{p.caption}</p>
            <p className="text-[10px] text-foreground/60">{timeAgo(p.postedAt)}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

function BookTab({
  venue,
  placeName,
}: {
  venue: ReturnType<typeof getVenueDetails>;
  placeName: string;
}) {
  const baseDate = new Date("2025-04-19T22:00:00Z");
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(baseDate.getTime() + (i + 1) * 86_400_000);
    return {
      iso: d.toISOString(),
      label: d.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
      day: d.getUTCDate(),
    };
  });

  const [partySize, setPartySize] = useState(2);
  const [selectedDay, setSelectedDay] = useState(days[0].iso);
  const [confirmed, setConfirmed] = useState<{ code: string } | null>(null);

  const times = useMemo(() => {
    const allTimes = [
      "5:00 PM",
      "6:00 PM",
      "6:30 PM",
      "7:00 PM",
      "7:30 PM",
      "8:00 PM",
      "8:30 PM",
      "9:00 PM",
      "10:00 PM",
      "11:00 PM",
    ];
    // Simulating availability dynamic shifts
    const seed = selectedDay.charCodeAt(selectedDay.length - 2);
    const filtered = allTimes.filter((_, i) => (seed + i) % 3 !== 0);
    return filtered.length > 0 ? filtered : allTimes;
  }, [selectedDay]);

  const [time, setTime] = useState(times[0]);
  const { requireAuth } = useFirebase();

  useEffect(() => {
    // Default to the earliest available time when day updates
    setTime(times[0]);
  }, [times]);

  const handleReserve = () => {
    if (!requireAuth()) return;
    const placePost = VIBE_POSTS.find((p) => p.placeName === placeName);
    const booking = addBooking({
      type: "table",
      placeName,
      placeSlug: slugify(placeName),
      cover: placePost?.poster ?? "",
      partySize,
      date: selectedDay,
      timeLabel: time,
    });
    setConfirmed({ code: booking.confirmationCode });
    toast.success("Table booked 🔥", {
      description: `+50 🔥 · See it in My Bookings`,
    });
  };

  if (confirmed) {
    return (
      <div className="glass-dark mt-2 rounded-3xl border border-border/40 p-6 text-center shadow-soft">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-sunset shadow-glow-coral">
          <Sparkles className="h-7 w-7 text-primary-foreground" />
        </div>
        <h3 className="mt-3 font-display text-xl font-black">You're locked in 🔥</h3>
        <p className="mt-1 text-sm text-foreground/70">
          Table for {partySize} at {placeName} confirmed.
        </p>
        <p className="mt-2 font-mono text-xs text-foreground/60">Code: {confirmed.code}</p>
        <p className="mt-3 inline-block rounded-full glass px-3 py-1 text-xs font-display font-bold uppercase tracking-widest">
          +50 🔥 added to your wallet
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link
            to="/bookings"
            className="rounded-full bg-gradient-sunset py-3 font-display text-xs font-bold uppercase tracking-widest text-primary-foreground"
          >
            View ticket
          </Link>
          <button
            onClick={() => setConfirmed(null)}
            className="rounded-full glass py-3 font-display text-xs font-bold uppercase tracking-widest"
          >
            Book another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2">
      {/* Party size */}
      <div className="glass rounded-2xl border border-border/40 p-4">
        <p className="mb-3 flex items-center gap-2 text-[10px] font-display font-bold uppercase tracking-[0.25em] text-foreground/70">
          <Users className="h-3.5 w-3.5" /> Party size
        </p>
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: Math.min(venue.maxPartySize, 10) }).map((_, i) => {
            const n = i + 1;
            const active = n === partySize;
            return (
              <button
                key={n}
                onClick={() => setPartySize(n)}
                className={`grid h-10 w-10 place-items-center rounded-full font-display text-sm font-bold transition-all ${
                  active
                    ? "bg-gradient-sunset text-primary-foreground shadow-glow-coral"
                    : "glass text-foreground/80"
                }`}
              >
                {n}
              </button>
            );
          })}
          {venue.maxPartySize > 10 && (
            <button className="rounded-full glass px-3 text-xs font-bold">10+</button>
          )}
        </div>
      </div>

      {/* Day */}
      <div className="glass rounded-2xl border border-border/40 p-4">
        <p className="mb-3 flex items-center gap-2 text-[10px] font-display font-bold uppercase tracking-[0.25em] text-foreground/70">
          <Calendar className="h-3.5 w-3.5" /> Pick a day
        </p>
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {days.map((d) => {
            const active = d.iso === selectedDay;
            return (
              <button
                key={d.iso}
                onClick={() => setSelectedDay(d.iso)}
                className={`flex min-w-[3.5rem] flex-col items-center rounded-2xl px-3 py-2 transition-all ${
                  active
                    ? "bg-gradient-sunset text-primary-foreground shadow-glow-coral"
                    : "glass text-foreground/80"
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest">{d.label}</span>
                <span className="font-display text-lg font-black">{d.day}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time */}
      <div className="glass rounded-2xl border border-border/40 p-4">
        <p className="mb-3 flex items-center gap-2 text-[10px] font-display font-bold uppercase tracking-[0.25em] text-foreground/70">
          <Clock className="h-3.5 w-3.5" /> Time
        </p>
        <div className="grid grid-cols-3 gap-2">
          {times.map((t) => {
            const active = t === time;
            return (
              <button
                key={t}
                onClick={() => setTime(t)}
                className={`rounded-xl py-2 font-display text-xs font-bold transition-all ${
                  active
                    ? "bg-gradient-sunset text-primary-foreground shadow-glow-coral"
                    : "glass text-foreground/80"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {/* Reservation Summary */}
      <div className="glass-dark rounded-2xl border border-border/40 p-4">
        <p className="mb-3 flex items-center gap-2 text-[10px] font-display font-bold uppercase tracking-[0.25em] text-foreground/70">
          <Sparkles className="h-3.5 w-3.5" /> Confirm Details
        </p>
        <div className="space-y-1">
          <p className="font-display text-sm font-bold">{placeName}</p>
          <p className="text-xs text-foreground/80">Table for {partySize}</p>
          <p className="text-xs text-foreground/80">
            {new Date(selectedDay).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              timeZone: "UTC",
            })}{" "}
            at {time}
          </p>
        </div>
      </div>

      <button
        onClick={handleReserve}
        className="w-full rounded-full bg-gradient-sunset py-4 font-display text-base font-black uppercase tracking-widest text-primary-foreground shadow-glow-coral active:scale-[0.98]"
      >
        Reserve · Free
      </button>

      {/* Packages upsell */}
      {venue.packages.length > 0 && (
        <div className="space-y-2 pt-4">
          <p className="flex items-center gap-2 px-1 text-[10px] font-display font-bold uppercase tracking-[0.25em] text-foreground/70">
            <Tag className="h-3.5 w-3.5 text-accent" /> Add a package · save up to 40%
          </p>
          {venue.packages.map((pkg) => (
            <div
              key={pkg.id}
              className="glass-dark flex items-center gap-3 rounded-2xl border border-border/40 p-3"
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-fire text-xl shadow-glow-magenta">
                🍾
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-display text-sm font-bold">{pkg.title}</p>
                  {pkg.tag && (
                    <span className="shrink-0 rounded-full bg-accent/20 px-1.5 py-0.5 text-[9px] font-display font-bold uppercase tracking-widest text-accent">
                      {pkg.tag}
                    </span>
                  )}
                </div>
                <p className="line-clamp-2 text-[11px] text-foreground/70">{pkg.description}</p>
                <p className="mt-1 flex items-baseline gap-1.5">
                  <span className="font-display text-base font-black text-gradient-fire">
                    ${pkg.price}
                  </span>
                  <span className="text-[11px] text-foreground/50 line-through">
                    ${pkg.originalPrice}
                  </span>
                </p>
              </div>
              <button className="shrink-0 rounded-full bg-gradient-sunset px-3 py-1 text-[10px] font-display font-bold uppercase tracking-widest text-primary-foreground">
                Add
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EventsTab({
  venue,
  placeName,
}: {
  venue: ReturnType<typeof getVenueDetails>;
  placeName: string;
}) {
  const { requireAuth } = useFirebase();
  const handleBuy = (e: (typeof venue.events)[number]) => {
    if (!requireAuth()) return;
    const placePost = VIBE_POSTS.find((p) => p.placeName === placeName);
    addBooking({
      type: "ticket",
      placeName,
      placeSlug: slugify(placeName),
      cover: e.cover ?? placePost?.poster ?? "",
      eventTitle: e.title,
      ticketPrice: e.price,
      date: new Date("2025-04-26T23:00:00Z").toISOString(),
      timeLabel: e.time,
    });
    toast.success(`Ticket secured: ${e.title}`, {
      description: "Find it in My Bookings · +25 🔥",
    });
  };

  if (venue.events.length === 0) {
    return (
      <div className="glass mt-2 rounded-2xl border border-border/40 p-6 text-center text-sm text-foreground/70">
        No upcoming events posted yet. Check back soon.
      </div>
    );
  }
  return (
    <div className="space-y-3 pt-2">
      {venue.events.map((e) => (
        <article
          key={e.id}
          className="glass-dark overflow-hidden rounded-3xl border border-border/40 shadow-soft"
        >
          <div className="relative h-32 w-full">
            <img src={e.cover} alt={e.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
            <div className="absolute left-3 top-3 rounded-full glass-dark px-2.5 py-1 text-[10px] font-display font-bold uppercase tracking-widest">
              {e.date} · {e.time}
            </div>
          </div>
          <div className="space-y-2 p-4">
            <h3 className="font-display text-lg font-black">{e.title}</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display text-2xl font-black text-gradient-fire">${e.price}</p>
                <p className="text-[11px] text-foreground/60">
                  {e.spotsLeft < 50 ? `Only ${e.spotsLeft} left 🔥` : `${e.spotsLeft} spots`}
                </p>
              </div>
              <button
                onClick={() => handleBuy(e)}
                className="rounded-full bg-gradient-sunset px-5 py-2.5 font-display text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-glow-coral active:scale-95"
              >
                Get Tickets
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function InfoTab({ venue }: { venue: ReturnType<typeof getVenueDetails> }) {
  return (
    <div className="space-y-4 pt-2">
      <div className="glass rounded-2xl border border-border/40 p-4">
        <p className="text-sm leading-relaxed text-foreground/85">{venue.description}</p>
      </div>

      <div className="glass-dark rounded-2xl border border-border/40 p-4">
        <p className="mb-3 flex items-center gap-2 text-[10px] font-display font-bold uppercase tracking-[0.25em] text-foreground/70">
          <Clock className="h-3.5 w-3.5" /> Hours
        </p>
        <ul className="space-y-1.5">
          {venue.hours.map((h) => (
            <li key={h.day} className="flex justify-between text-sm">
              <span className="font-display font-bold">{h.day}</span>
              <span className={h.closed ? "text-foreground/40" : "text-foreground/80"}>
                {h.hours}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="glass-dark grid gap-3 rounded-2xl border border-border/40 p-4">
        <a
          href={`https://maps.google.com/?q=${encodeURIComponent(venue.address)}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3"
        >
          <MapPin className="h-4 w-4 text-accent" />
          <span className="text-sm">{venue.address}</span>
        </a>
        <a href={`tel:${venue.phone}`} className="flex items-center gap-3">
          <Phone className="h-4 w-4 text-accent" />
          <span className="text-sm">{venue.phone}</span>
        </a>
      </div>

      <div className="glass rounded-2xl border border-border/40 p-4">
        <p className="mb-3 text-[10px] font-display font-bold uppercase tracking-[0.25em] text-foreground/70">
          Good to know
        </p>
        <div className="flex flex-wrap gap-1.5">
          {venue.amenities.map((a) => (
            <span
              key={a}
              className="rounded-full glass-dark px-2.5 py-1 text-[11px] font-display font-bold uppercase tracking-wider"
            >
              {a}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
