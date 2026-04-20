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
} from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { VIBE_POSTS, fireScore } from "@/data/vibes";
import { useBookings } from "@/data/bookings";
import { useFirebase } from "@/lib/FirebaseContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your Profile — VibeCheck" },
      { name: "description", content: "Track your 🔥 points, posts and rewards." },
      { property: "og:title", content: "Your Profile — VibeCheck" },
      { property: "og:description", content: "Top vibes, top rewards." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, loading } = useFirebase();
  const [profile, setProfile] = useState({
    handle: "@guest",
    city: "Unknown",
    avatar: "🌴",
    firePoints: 0,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(profile);
  const [activeTab, setActiveTab] = useState<"posts" | "saved">("posts");
  const [isSaving, setIsSaving] = useState(false);

  // Load user profile from Firebase
  useEffect(() => {
    if (!user) return;
    
    const loadProfile = async () => {
      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          setProfile({
            handle: data.handle || "@guest",
            city: data.city || "Unknown",
            avatar: data.avatar || "🌴",
            firePoints: data.firePoints || 0,
          });
          setEditForm({
            handle: data.handle || "@guest",
            city: data.city || "Unknown",
            avatar: data.avatar || "🌴",
            firePoints: data.firePoints || 0,
          });
        }
      } catch (error) {
        console.error("Error loading profile", error);
        toast.error("Failed to load profile");
      }
    };
    
    loadProfile();
  }, [user]);

  const myPosts = VIBE_POSTS.slice(0, 6);
  const savedSpots = VIBE_POSTS.slice(6, 12);

  const handleSaveProfile = async () => {
    if (!user) {
      toast.error("Must be logged in to save profile");
      return;
    }
    
    setIsSaving(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        handle: editForm.handle,
        city: editForm.city,
        avatar: editForm.avatar,
        updatedAt: new Date(),
      });
      setProfile(editForm);
      setIsEditing(false);
      toast.success("Profile updated!");
    } catch (error) {
      console.error("Error saving profile", error);
      toast.error("Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[100svh] w-full bg-background flex items-center justify-center pb-32">
        <div className="text-center px-4">
          <p className="text-foreground/60 mb-4">Please sign in to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] w-full bg-background pb-32">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-sunset px-4 pb-10 pt-[max(2rem,env(safe-area-inset-top))]">
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-gradient-fire opacity-40 blur-3xl" />
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-background text-3xl font-display font-black shadow-soft">
              {profile.avatar}
            </div>
            <div>
              <h1 className="font-display text-2xl font-black tracking-tight text-primary-foreground">
                {profile.handle}
              </h1>
              <p className="text-xs uppercase tracking-widest text-primary-foreground/80">
                {profile.city} · Tier: Sunset
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditForm(profile);
              setIsEditing(true);
            }}
            aria-label="Edit Profile"
            className="grid h-10 w-10 place-items-center rounded-full bg-background/20 text-primary-foreground backdrop-blur-sm active:scale-95 transition-transform"
          >
            <Edit2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Vibe points */}
      <div className="-mt-6 px-4">
        <div className="glass-dark rounded-3xl border border-border/40 p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-foreground/60">
                Vibe points
              </p>
              <p className="font-display text-3xl font-black text-gradient-fire">{profile.firePoints} 🔥</p>
            </div>
            <button className="rounded-full bg-gradient-sunset px-4 py-2 text-[11px] font-display font-bold uppercase tracking-widest text-primary-foreground shadow-glow-coral">
              Redeem
            </button>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-2/3 bg-gradient-fire" />
          </div>
          <p className="mt-2 text-[11px] text-foreground/60">
            {Math.max(0, 3000 - profile.firePoints)} points to <span className="font-bold text-accent">Magenta tier</span>
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 px-4 pt-4">
        <Stat icon={Flame} label="Posts" value="42" />
        <Stat icon={Trophy} label="Rank" value="#127" />
        <Stat icon={Calendar} label="Streak" value="7d" />
      </div>

      <BookingsCallout />

      {/* Rewards */}
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

      {/* Tabs */}
      <div className="px-4 pt-10">
        <div className="flex gap-2 border-b border-border/40">
          <button
            onClick={() => setActiveTab("posts")}
            className={`flex flex-1 items-center justify-center gap-2 pb-3 font-display text-xs font-bold uppercase tracking-widest transition-all ${
              activeTab === "posts"
                ? "border-b-2 border-primary text-primary"
                : "border-b-2 border-transparent text-foreground/60"
            }`}
          >
            <Play className="h-3.5 w-3.5" />
            Your Vibes
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`flex flex-1 items-center justify-center gap-2 pb-3 font-display text-xs font-bold uppercase tracking-widest transition-all ${
              activeTab === "saved"
                ? "border-b-2 border-primary text-primary"
                : "border-b-2 border-transparent text-foreground/60"
            }`}
          >
            <Bookmark className="h-3.5 w-3.5" />
            Saved Spots
          </button>
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

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="glass-dark w-full max-w-sm rounded-3xl border border-border/40 p-5 shadow-glow-magenta">
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
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-foreground/70">
                  Username
                </label>
                <input
                  type="text"
                  value={editForm.handle}
                  onChange={(e) => setEditForm({ ...editForm, handle: e.target.value })}
                  className="w-full rounded-2xl border border-border/40 bg-foreground/5 px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 focus:border-primary focus:outline-none"
                  placeholder="@yourname"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-foreground/70">
                  Home City
                </label>
                <input
                  type="text"
                  value={editForm.city}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  className="w-full rounded-2xl border border-border/40 bg-foreground/5 px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 focus:border-primary focus:outline-none"
                  placeholder="e.g. Miami"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-foreground/70">
                  Avatar Emoji
                </label>
                <input
                  type="text"
                  value={editForm.avatar}
                  onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                  className="w-full rounded-2xl border border-border/40 bg-foreground/5 px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 focus:border-primary focus:outline-none"
                  placeholder="e.g. 🌴"
                  maxLength={2}
                />
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="mt-6 w-full rounded-full bg-gradient-sunset py-4 font-display text-sm font-bold uppercase tracking-widest text-primary-foreground active:scale-[0.98] transition-transform shadow-glow-coral disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
      className="mx-4 mt-4 flex items-center gap-3 rounded-3xl bg-gradient-card border border-border/40 p-4 shadow-soft active:scale-[0.99]"
    >
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-sunset shadow-glow-coral">
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
      <span className="rounded-full bg-accent/20 px-2 py-0.5 font-display text-[11px] font-black text-accent">
        {upcoming.length}
      </span>
      <ChevronRight className="h-4 w-4 text-foreground/60" />
    </Link>
  );
}
