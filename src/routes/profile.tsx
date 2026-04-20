import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Flame,
  Trophy,
  Calendar,
  Gift,
  Ticket,
  ChevronRight,
  Edit2,
  X,
  Bookmark,
  Play,
  LogIn,
  User,
  MapPin,
} from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { VIBE_POSTS, fireScore } from "@/data/vibes";
import { useBookings } from "@/data/bookings";
import { useFirebase } from "@/lib/FirebaseContext";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your Profile — LitScene" },
      { name: "description", content: "Track your 🔥 points, posts and rewards." },
      { property: "og:title", content: "Your Profile — LitScene" },
      { property: "og:description", content: "Top vibes, top rewards." },
    ],
  }),
  component: ProfilePage,
});

// ── helpers ──────────────────────────────────────────────────────────────────

/** Derive a clean handle suggestion from a Firebase user */
function suggestHandle(email: string | null, displayName: string | null): string {
  if (email) {
    return email.split("@")[0].replace(/[^a-z0-9_.]/gi, "").toLowerCase();
  }
  if (displayName) {
    return displayName.replace(/\s+/g, "").toLowerCase();
  }
  return "viber";
}

function validateHandle(raw: string): string | null {
  // strip leading @ if user typed it
  const h = raw.replace(/^@+/, "");
  if (h.length < 3) return "Username must be at least 3 characters.";
  if (h.length > 24) return "Username must be 24 characters or less.";
  if (!/^[a-z0-9_.]+$/.test(h)) return "Only letters, numbers, _ and . allowed.";
  return null; // valid
}

// ── types ─────────────────────────────────────────────────────────────────────

interface UserProfile {
  handle: string;       // stored WITHOUT leading @
  city: string;
  avatar: string;       // emoji or photoURL
  firePoints: number;
}

const GUEST_PROFILE: UserProfile = {
  handle: "guest",
  city: "Your City",
  avatar: "🌴",
  firePoints: 0,
};

// ── page ──────────────────────────────────────────────────────────────────────

function ProfilePage() {
  const { user, loading, requireAuth } = useFirebase();
  const [profile, setProfile] = useState<UserProfile>(GUEST_PROFILE);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editHandle, setEditHandle] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [handleError, setHandleError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "saved">("posts");

  // ── Load profile from Firestore whenever user changes ────────────────────
  useEffect(() => {
    if (!user) {
      setProfile(GUEST_PROFILE);
      return;
    }

    const loadProfile = async () => {
      setProfileLoading(true);
      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          const data = snap.data();
          const loaded: UserProfile = {
            handle: data.handle || suggestHandle(user.email, user.displayName),
            city: data.city || "",
            // prefer stored emoji, fall back to Google photo, then default
            avatar: data.avatar || user.photoURL || "🌴",
            firePoints: data.firePoints ?? 500,
          };
          setProfile(loaded);
        } else {
          // bootstrap if context somehow missed it
          const suggested = suggestHandle(user.email, user.displayName);
          const bootstrapped: UserProfile = {
            handle: suggested,
            city: "",
            avatar: user.photoURL || "🌴",
            firePoints: 500,
          };
          await setDoc(userRef, { ...bootstrapped, createdAt: new Date() });
          setProfile(bootstrapped);
        }
      } catch (err) {
        console.error("Error loading profile", err);
        toast.error("Couldn't load your profile");
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  // ── Edit modal open ───────────────────────────────────────────────────────
  const openEdit = () => {
    setEditHandle(profile.handle);
    setEditCity(profile.city);
    setEditAvatar(profile.avatar);
    setHandleError(null);
    setIsEditing(true);
  };

  // ── Save profile ──────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!user) return;

    const err = validateHandle(editHandle);
    if (err) { setHandleError(err); return; }

    const cleanHandle = editHandle.replace(/^@+/, "");

    setIsSaving(true);
    try {
      const userRef = doc(db, "users", user.uid);
      const updates = {
        handle: cleanHandle,
        city: editCity.trim(),
        avatar: editAvatar.trim() || profile.avatar,
        updatedAt: new Date(),
      };
      await updateDoc(userRef, updates);
      setProfile((p) => ({ ...p, ...updates }));
      setIsEditing(false);
      toast.success("Profile updated! 🎉");
    } catch (err) {
      console.error("Error saving profile", err);
      toast.error("Failed to save — try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const myPosts = VIBE_POSTS.slice(0, 6);
  const savedSpots = VIBE_POSTS.slice(6, 12);

  // ── Guest view ────────────────────────────────────────────────────────────
  if (!loading && !user) {
    return (
      <div className="min-h-[100svh] w-full bg-background pb-32">
        {/* Guest Hero */}
        <div className="relative overflow-hidden bg-gradient-sunset px-4 pb-12 pt-[max(3rem,env(safe-area-inset-top))]">
          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-gradient-fire opacity-40 blur-3xl" />
          {/* Avatar placeholder */}
          <div className="relative flex flex-col items-center gap-3 text-center">
            <div className="grid h-24 w-24 place-items-center rounded-full bg-background/20 backdrop-blur-sm border-2 border-primary-foreground/30 shadow-soft">
              <User className="h-10 w-10 text-primary-foreground/80" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-black tracking-tight text-primary-foreground">
                @guest
              </h1>
              <p className="text-xs uppercase tracking-widest text-primary-foreground/70 mt-0.5">
                Sign in to claim your profile
              </p>
            </div>
          </div>
        </div>

        {/* CTA card */}
        <div className="mx-4 -mt-6">
          <div className="glass-dark rounded-3xl border border-border/40 p-6 shadow-soft text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-sunset shadow-glow-coral mx-auto mb-4">
              <Flame className="h-7 w-7 text-primary-foreground" />
            </div>
            <h2 className="font-display text-xl font-black mb-2">Join the scene</h2>
            <p className="text-sm text-foreground/60 mb-6 leading-relaxed">
              Sign in to track your Fire Points, save spots, book events, and climb the leaderboard.
            </p>
            <button
              onClick={() => requireAuth()}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-sunset py-4 font-display text-sm font-bold uppercase tracking-widest text-primary-foreground shadow-glow-coral active:scale-[0.98] transition-transform"
            >
              <LogIn className="h-4 w-4" />
              Sign In / Sign Up
            </button>
          </div>
        </div>

        {/* Preview stats (greyed) */}
        <div className="grid grid-cols-3 gap-3 px-4 pt-6 opacity-40 pointer-events-none select-none">
          <Stat icon={Flame} label="Posts" value="—" />
          <Stat icon={Trophy} label="Rank" value="—" />
          <Stat icon={Calendar} label="Streak" value="—" />
        </div>

        {/* Preview grid */}
        <h2 className="px-4 pb-3 pt-8 font-display text-xl font-black tracking-tight opacity-40">
          Your Vibes
        </h2>
        <div className="grid grid-cols-3 gap-1 px-4 opacity-30 pointer-events-none select-none">
          {myPosts.map((p) => (
            <div key={p.id} className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted">
              <img src={p.poster} alt={p.placeName} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>

        <BottomNav />
      </div>
    );
  }

  // ── Signed-in view ────────────────────────────────────────────────────────

  // Decide how to display the avatar: if it's a URL use <img>, else render as emoji
  const isPhotoUrl = profile.avatar.startsWith("http");

  return (
    <div className="min-h-[100svh] w-full bg-background pb-32">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-gradient-sunset px-4 pb-14 pt-[max(2.5rem,env(safe-area-inset-top))]">
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-gradient-fire opacity-40 blur-3xl" />

        <div className="relative flex items-start justify-between gap-4">
          {/* Avatar + name stack */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar */}
            <div className="relative shrink-0">
              {isPhotoUrl ? (
                <img
                  src={profile.avatar}
                  alt={profile.handle}
                  referrerPolicy="no-referrer"
                  className="h-20 w-20 rounded-full object-cover border-2 border-primary-foreground/30 shadow-soft"
                />
              ) : (
                <div className="grid h-20 w-20 place-items-center rounded-full bg-background/20 backdrop-blur-sm border-2 border-primary-foreground/30 shadow-soft text-3xl">
                  {profile.avatar || "🌴"}
                </div>
              )}
              {/* Online dot */}
              <span className="absolute bottom-1 right-1 h-3 w-3 rounded-full bg-green-400 border-2 border-background shadow" />
            </div>

            {/* Name block — truncated cleanly */}
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-black tracking-tight text-primary-foreground truncate leading-tight">
                @{profile.handle}
              </h1>
              <div className="flex items-center gap-1 mt-0.5">
                {profile.city && (
                  <>
                    <MapPin className="h-3 w-3 text-primary-foreground/70 shrink-0" />
                    <p className="text-xs text-primary-foreground/70 truncate">{profile.city}</p>
                    <span className="text-primary-foreground/40 text-xs">·</span>
                  </>
                )}
                <p className="text-xs uppercase tracking-widest text-primary-foreground/70 shrink-0">
                  Sunset Tier
                </p>
              </div>
            </div>
          </div>

          {/* Edit button */}
          <button
            onClick={openEdit}
            aria-label="Edit Profile"
            className="shrink-0 grid h-10 w-10 place-items-center rounded-full bg-background/20 text-primary-foreground backdrop-blur-sm active:scale-95 transition-transform"
          >
            <Edit2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Vibe Points card ── */}
      <div className="-mt-6 px-4">
        <div className="glass-dark rounded-3xl border border-border/40 p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-foreground/60">Vibe Points</p>
              {profileLoading ? (
                <div className="mt-1 h-8 w-28 rounded-lg bg-foreground/10 animate-pulse" />
              ) : (
                <p className="font-display text-3xl font-black text-gradient-fire">{profile.firePoints} 🔥</p>
              )}
            </div>
            <button className="rounded-full bg-gradient-sunset px-4 py-2 text-[11px] font-display font-bold uppercase tracking-widest text-primary-foreground shadow-glow-coral">
              Redeem
            </button>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-gradient-fire transition-all"
              style={{ width: `${Math.min(100, (profile.firePoints / 3000) * 100)}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-foreground/60">
            {Math.max(0, 3000 - profile.firePoints)} points to{" "}
            <span className="font-bold text-accent">Magenta tier</span>
          </p>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-3 px-4 pt-4">
        <Stat icon={Flame} label="Posts" value="42" />
        <Stat icon={Trophy} label="Rank" value="#127" />
        <Stat icon={Calendar} label="Streak" value="7d" />
      </div>

      <BookingsCallout />

      {/* ── Rewards ── */}
      <h2 className="px-4 pb-3 pt-8 font-display text-xl font-black tracking-tight">
        Rewards waiting
      </h2>
      <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-2">
        {[
          { title: "Free entry", place: "Neon Beach Club", cost: "1,500 🔥" },
          { title: "2-for-1 cocktails", place: "Sunset Rooftop", cost: "800 🔥" },
          { title: "VIP bottle", place: "Pulse Warehouse", cost: "5,000 🔥" },
        ].map((r) => (
          <div
            key={r.title}
            className="w-56 shrink-0 overflow-hidden rounded-2xl bg-gradient-card border border-border/40 p-4 shadow-soft"
          >
            <Gift className="h-5 w-5 text-accent" />
            <p className="mt-2 font-display text-base font-bold">{r.title}</p>
            <p className="text-[11px] uppercase tracking-widest text-foreground/60">{r.place}</p>
            <p className="mt-3 font-display text-sm font-black text-gradient-fire">{r.cost}</p>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="px-4 pt-10">
        <div className="flex gap-2 border-b border-border/40">
          {(["posts", "saved"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex flex-1 items-center justify-center gap-2 pb-3 font-display text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === tab
                  ? "border-b-2 border-primary text-primary"
                  : "border-b-2 border-transparent text-foreground/60"
              }`}
            >
              {tab === "posts" ? <Play className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
              {tab === "posts" ? "Your Vibes" : "Saved Spots"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1 px-4 pt-4">
        {(activeTab === "posts" ? myPosts : savedSpots).map((p) => (
          <div key={p.id} className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted">
            <img src={p.poster} alt={p.placeName} className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-1.5">
              <p className="truncate text-[10px] font-bold">{p.placeName}</p>
              <p className="text-[10px]">{fireScore(p.vibeScore)}</p>
            </div>
          </div>
        ))}
      </div>

      <BottomNav />

      {/* ── Edit Profile Modal ── */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-background/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 340, damping: 32 }}
              className="glass-dark w-full max-w-sm rounded-3xl border border-border/40 p-5 shadow-glow-magenta"
            >
              {/* Header */}
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-display text-xl font-black tracking-tight">Edit Profile</h3>
                <button
                  onClick={() => setIsEditing(false)}
                  className="grid h-8 w-8 place-items-center rounded-full bg-foreground/10 text-foreground/80 active:scale-95 transition-transform"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">

                {/* Username */}
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-foreground/70">
                    Username
                  </label>
                  {/* Suggested pill */}
                  {user && editHandle !== suggestHandle(user.email, user.displayName) && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditHandle(suggestHandle(user!.email, user!.displayName));
                        setHandleError(null);
                      }}
                      className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/30 px-3 py-1 text-[11px] font-bold text-primary"
                    >
                      Suggested: @{suggestHandle(user.email, user.displayName)}
                    </button>
                  )}
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 text-sm font-bold pointer-events-none">
                      @
                    </span>
                    <input
                      type="text"
                      value={editHandle.replace(/^@/, "")}
                      onChange={(e) => {
                        setEditHandle(e.target.value.replace(/^@/, ""));
                        setHandleError(null);
                      }}
                      className="w-full rounded-2xl border border-border/40 bg-foreground/5 pl-8 pr-4 py-3 text-sm text-foreground placeholder:text-foreground/30 focus:border-primary focus:outline-none"
                      placeholder="yourname"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                    />
                  </div>
                  {handleError && (
                    <p className="mt-1.5 text-[11px] text-destructive font-semibold">{handleError}</p>
                  )}
                </div>

                {/* Home City */}
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-foreground/70">
                    Home City
                  </label>
                  <input
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full rounded-2xl border border-border/40 bg-foreground/5 px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 focus:border-primary focus:outline-none"
                    placeholder="e.g. Miami"
                  />
                </div>

                {/* Avatar */}
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-foreground/70">
                    Avatar Emoji
                  </label>
                  <input
                    type="text"
                    value={editAvatar.startsWith("http") ? "" : editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                    className="w-full rounded-2xl border border-border/40 bg-foreground/5 px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 focus:border-primary focus:outline-none"
                    placeholder="e.g. 🔥"
                    maxLength={2}
                  />
                  {user?.photoURL && (
                    <p className="mt-1.5 text-[11px] text-foreground/50">
                      Leave empty to keep your Google profile photo.
                    </p>
                  )}
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="mt-4 w-full rounded-full bg-gradient-sunset py-4 font-display text-sm font-bold uppercase tracking-widest text-primary-foreground active:scale-[0.98] transition-transform shadow-glow-coral disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── sub-components ─────────────────────────────────────────────────────────

function Stat({ icon: Icon, label, value }: { icon: typeof Flame; label: string; value: string }) {
  return (
    <div className="glass rounded-2xl border border-border/40 p-3 text-center">
      <Icon className="mx-auto h-4 w-4 text-accent" />
      <p className="mt-1 font-display text-lg font-black">{value}</p>
      <p className="text-[10px] uppercase tracking-widest text-foreground/60">{label}</p>
    </div>
  );
}

function BookingsCallout() {
  const bookings = useBookings();
  const upcoming = bookings.filter((b) => b.status === "upcoming");
  const next = upcoming[0];
  return (
    <Link
      to="/bookings"
      className="mx-4 mt-4 flex items-center gap-3 rounded-3xl bg-gradient-card border border-border/40 p-4 shadow-soft active:scale-[0.99] transition-transform"
    >
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-sunset shadow-glow-coral">
        <Ticket className="h-6 w-6 text-primary-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-display text-sm font-black">My Bookings</p>
        <p className="truncate text-[11px] text-foreground/70">
          {next
            ? `Next: ${next.eventTitle ?? next.placeName} · ${next.timeLabel}`
            : `${upcoming.length} upcoming · tap to view tickets`}
        </p>
      </div>
      <span className="shrink-0 rounded-full bg-accent/20 px-2 py-0.5 font-display text-[11px] font-black text-accent">
        {upcoming.length}
      </span>
      <ChevronRight className="shrink-0 h-4 w-4 text-foreground/60" />
    </Link>
  );
}
