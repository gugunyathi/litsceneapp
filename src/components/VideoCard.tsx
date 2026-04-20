import { useEffect, useRef, useState } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Volume2,
  VolumeX,
  Radio,
  Play,
  Film,
  MapPin,
  Edit3,
  Tv2,
  EyeOff,
} from "lucide-react";
import { type VibePost, timeAgo, slugify } from "@/data/vibes";
import { Link } from "@tanstack/react-router";
import { VibeBadge } from "./VibeBadge";
import { PlacePin } from "./PlacePin";
import { CommentsDrawer } from "./CommentsDrawer";
import { useComments } from "@/data/comments";
import { trackVibeInteraction } from "@/hooks/useVibeAlgorithm";
import { recordLocationVote, getUserVoteForLocation } from "@/lib/locationVotes";
import { useFirebase } from "@/lib/FirebaseContext";
import { LocationEditModal } from "./LocationEditModal";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { usePlacesAutocomplete } from "@/hooks/usePlacesAutocomplete";

interface Props {
  post: VibePost;
  active: boolean;
  muted: boolean;
  onToggleMute: () => void;
}

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

// Module-level variable to persist cinematic mode across video scrolling
let isGlobalCinematic = false;

export function VideoCard({ post, active, muted, onToggleMute }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { user, isAdmin } = useFirebase();
  const [liked, setLiked] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [voted, setVoted] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  // ── Cinematic / clean-screen mode ────────────────────────────────────────
  const [cinematic, setCinematic] = useState(isGlobalCinematic);

  useEffect(() => {
    isGlobalCinematic = cinematic;
    if (cinematic) {
      document.body.classList.add("cinematic");
    } else {
      document.body.classList.remove("cinematic");
    }
  }, [cinematic]);

  // ── Local mute state (source of truth for the <video> element) ───────────
  const [isMuted, setIsMuted] = useState(muted);

  // Keep local state in sync when parent prop changes (e.g. first-load)
  useEffect(() => {
    setIsMuted(muted);
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);

  // Sync mute to video element whenever isMuted changes
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = isMuted;
  }, [isMuted]);

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !isMuted;
    setIsMuted(next);
    if (videoRef.current) videoRef.current.muted = next;
    onToggleMute(); // keep parent in sync
  };

  // Tag Location Modal State
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tagFocused, setTagFocused] = useState(false);
  const [isModMode, setIsModMode] = useState(false);
  const tagAC = usePlacesAutocomplete();

  const { comments } = useComments(post.id);
  const commentCount = post.comments + comments.filter((c) => !c.id.startsWith("c")).length;

  const lastTapRef = useRef<number>(0);

  // Check if user already voted for this location
  useEffect(() => {
    if (!user || post.verificationStatus !== "unverified") return;

    const checkVote = async () => {
      try {
        const userVote = await getUserVoteForLocation(user.uid, post.id);
        if (userVote) setVoted(true);
      } catch (error) {
        console.error("Error checking vote", error);
      }
    };

    checkVote();
  }, [user, post.id, post.verificationStatus]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (active) {
      v.currentTime = 0;
      v.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      v.pause();
      setIsPlaying(false);
    }
  }, [active]);

  const handleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    const v = videoRef.current;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      lastTapRef.current = 0;
      
      if (cinematic) {
        setCinematic(false);
        return;
      }
      
      if (!liked) {
        setLiked(true);
        trackVibeInteraction(post.category);
      }
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 700);
      if (v && v.paused) {
        v.play().catch(() => {});
        setIsPlaying(true);
      }
    } else {
      lastTapRef.current = now;
      if (v) {
        if (isPlaying) {
          v.pause();
          setIsPlaying(false);
        } else {
          v.play().catch(() => {});
          setIsPlaying(true);
        }
      }
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/place/${slugify(post.placeName)}`;
    const shareData = {
      title: `${post.username} checking in at ${post.placeName} on LitScene`,
      text: post.caption,
      url: shareUrl,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast("Link copied to clipboard", { description: "Share the vibe with your friends." });
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        toast.error("Failed to share", { description: "Please try again." });
      }
    }
  };

  return (
    <section className="relative h-full w-full overflow-hidden bg-background">
      {/* ── Raw video — no overlays touching it ─────────────────────────── */}
      <video
        ref={videoRef}
        src={post.videoUrl}
        poster={post.poster}
        autoPlay
        loop
        playsInline
        muted={isMuted}
        className="absolute inset-0 h-full w-full object-cover"
        onClick={handleTap}
      />

      {/* ── Gradient overlays — only at very bottom, feathered ─────────── */}
      {/* Bottom scrim: starts transparent, only darkens bottom 30% */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%]"
        style={{
          background:
            "linear-gradient(to top, oklch(0.14 0.05 285 / 0.92) 0%, oklch(0.14 0.05 285 / 0.55) 40%, transparent 100%)",
        }}
      />
      {/* Top scrim: only for readability of top badges */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-28"
        style={{
          background:
            "linear-gradient(to bottom, oklch(0.14 0.05 285 / 0.55) 0%, transparent 100%)",
        }}
      />

      {/* ── Pause indicator ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {!isPlaying && !cinematic && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none absolute inset-0 grid place-items-center"
          >
            <div className="grid h-20 w-20 place-items-center rounded-full bg-background/20 backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.15)]">
              <Play className="h-10 w-10 ml-1.5 text-white/90" fill="currentColor" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Double-tap heart ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showHeart && (
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1.4, opacity: 1 }}
            exit={{ scale: 1.8, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none absolute inset-0 grid place-items-center"
          >
            <Heart className="h-32 w-32 fill-primary text-primary drop-shadow-[0_0_30px_oklch(0.72_0.22_25_/_0.8)]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ ALL UI overlays — hidden in cinematic mode ══════════════════════ */}
      <AnimatePresence>
        {!cinematic && (
          <motion.div
            key="ui-layer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="contents pointer-events-none"
          >
            {/* Top row: vibe badge + live */}
            <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-end gap-2 p-4 pt-[max(1rem,env(safe-area-inset-top))] pointer-events-auto">
              {/* Right: badges */}
              <div className="flex flex-col items-end gap-2">
                <VibeBadge score={post.vibeScore} />
                {post.isLive && (
                  <div className="glass-dark inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 shadow-glow-magenta">
                    <Radio className="h-3 w-3 text-secondary animate-pulse" />
                    <span className="text-[10px] font-display font-bold uppercase tracking-widest text-secondary">
                      Live
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Volume button (top-left below categories) */}
            <button
              onClick={handleToggleMute}
              className="absolute left-4 top-[max(6rem,calc(env(safe-area-inset-top)+5.5rem))] z-20 grid h-10 w-10 place-items-center rounded-full glass-dark active:scale-90 transition-transform pointer-events-auto"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5 text-foreground/80" />
              ) : (
                <Volume2 className="h-5 w-5 text-foreground" />
              )}
            </button>

            {/* Middle Left: place pin + reels */}
            <div className="absolute left-4 top-1/2 z-10 -translate-y-1/2 flex flex-col items-start gap-2 pointer-events-auto">
              <div className="relative group">
                <PlacePin
                  name={post.placeName}
                  neighborhood={post.neighborhood}
                  status={post.verificationStatus}
                />
                {post.verificationStatus === "crowdsource" && (
                  <button
                    className="absolute inset-x-0 inset-y-0 z-20 w-full h-full cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); setTagModalOpen(true); }}
                    aria-label="Tag Location"
                  />
                )}
                {isAdmin && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditModalOpen(true); }}
                    className="absolute -top-3 -right-3 grid h-6 w-6 place-items-center z-30 rounded-full bg-accent text-accent-foreground opacity-0 group-hover:opacity-100 transition-opacity active:scale-95 shadow-glow-coral"
                    title="Edit Location"
                  >
                    <Edit3 className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Waze-style verification prompt */}
              {post.verificationStatus === "unverified" && !voted && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-dark rounded-xl p-2.5 shadow-soft border border-accent/20 w-[180px] pointer-events-auto"
                >
                  <p className="text-[11px] font-bold mb-2 leading-tight">
                    Is this {post.placeName}?
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (!user) { toast.error("Must be logged in to vote"); return; }
                        setVoted(true);
                        await recordLocationVote(user.uid, post.id, "yes");
                        toast.success("Thanks for verifying!", { description: "+5 Trust Score. 9 more 'Yes' votes to verify." });
                      }}
                      className="flex-1 bg-accent/20 active:bg-accent/30 text-accent font-display text-[10px] uppercase font-bold py-1.5 rounded-lg border border-accent/30"
                    >
                      Yes
                    </button>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (!user) { toast.error("Must be logged in to vote"); return; }
                        setVoted(true);
                        await recordLocationVote(user.uid, post.id, "no");
                        toast("Flagged for review", { description: "We'll wait for more community input." });
                      }}
                      className="flex-1 bg-foreground/10 active:bg-foreground/20 text-foreground font-display text-[10px] uppercase font-bold py-1.5 rounded-lg border border-foreground/10"
                    >
                      No
                    </button>
                  </div>
                </motion.div>
              )}

              {(!post.verificationStatus || post.verificationStatus === "verified") ? (
                <Link
                  to="/reel/$slug"
                  params={{ slug: slugify(post.placeName) }}
                  onClick={(e) => e.stopPropagation()}
                  className="glass-dark inline-flex items-center gap-2 rounded-full py-2 px-3 shadow-pin active:scale-95 transition-transform mt-1 pointer-events-auto"
                >
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-sunset shadow-glow-coral">
                    <Film className="h-3.5 w-3.5 text-primary-foreground" />
                  </span>
                  <span className="font-display text-[10px] font-bold uppercase tracking-widest text-foreground">
                    Reel
                  </span>
                </Link>
              ) : null}
            </div>

            {/* Right rail actions */}
            <div className="absolute bottom-28 right-3 z-30 flex flex-col items-center gap-5 pointer-events-auto">
              {/* Cinematic TV Mode */}
              <button
                onClick={(e) => { e.stopPropagation(); setCinematic(true); }}
                className="flex flex-col items-center gap-1 transition-transform active:scale-90"
                aria-label="Cinematic mode — hide UI"
              >
                <span className="grid h-12 w-12 place-items-center rounded-full glass-dark">
                  <Tv2 className="h-6 w-6 text-foreground" />
                </span>
                <span className="text-xs font-semibold text-transparent">Clear</span>
              </button>

              {/* Like */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!liked) trackVibeInteraction(post.category);
                  setLiked((s) => !s);
                }}
                className="flex flex-col items-center gap-1 transition-transform active:scale-90"
              >
                <span className="grid h-12 w-12 place-items-center rounded-full glass-dark">
                  <Heart
                    className={`h-6 w-6 transition-colors ${
                      liked ? "fill-primary text-primary" : "text-foreground"
                    }`}
                  />
                </span>
                <span className="text-xs font-semibold text-foreground/90 drop-shadow-md">
                  {formatCount(post.likes + (liked ? 1 : 0))}
                </span>
              </button>

              {/* Comments */}
              <button
                onClick={(e) => { e.stopPropagation(); setCommentsOpen(true); }}
                className="flex flex-col items-center gap-1 active:scale-90"
              >
                <span className="grid h-12 w-12 place-items-center rounded-full glass-dark">
                  <MessageCircle className="h-6 w-6" />
                </span>
                <span className="text-xs font-semibold text-foreground/90 drop-shadow-md">
                  {formatCount(commentCount)}
                </span>
              </button>

              {/* Save */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  const isSaved = !saved;
                  setSaved(isSaved);
                  toast(isSaved ? "Saved to Profile" : "Removed from saved", {
                    description: isSaved ? "Find it in your Saved Spots tab." : undefined,
                  });
                }} 
                className="flex flex-col items-center gap-1 active:scale-90"
              >
                <span className="grid h-12 w-12 place-items-center rounded-full glass-dark">
                  <Bookmark className={`h-6 w-6 transition-colors ${saved ? "fill-accent text-accent" : "text-foreground"}`} />
                </span>
                <span className="text-xs font-semibold text-foreground/90 drop-shadow-md">Save</span>
              </button>

              {/* Share */}
              <button onClick={(e) => { e.stopPropagation(); handleShare(); }} className="flex flex-col items-center gap-1 active:scale-90">
                <span className="grid h-12 w-12 place-items-center rounded-full glass-dark">
                  <Share2 className="h-6 w-6" />
                </span>
                <span className="text-xs font-semibold text-foreground/90 drop-shadow-md">Share</span>
              </button>
            </div>

            {/* Bottom caption + meta */}
            <div className="absolute inset-x-0 bottom-0 z-20 px-4 pb-24 pointer-events-none">
              <div className="max-w-[78%] space-y-2 pointer-events-auto">
                <div className="flex items-center gap-2">
                  <span className="font-display text-base font-bold text-gradient-sunset drop-shadow-sm">
                    {post.username}
                  </span>
                  <span className="text-xs text-foreground/60">· {timeAgo(post.postedAt)}</span>
                </div>
                <p className="text-sm leading-snug text-foreground/95">{post.caption}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="rounded-full glass px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                    #{post.category}
                  </span>
                  <span className="rounded-full glass px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                    #{post.neighborhood.replace(/\s+/g, "")}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Cinematic mode hint — tap to restore ─────────────────────────── */}
      <AnimatePresence>
        {cinematic && (
          <motion.div
            key="cinematic-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="pointer-events-none absolute bottom-8 inset-x-0 flex justify-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-background/30 backdrop-blur-sm px-4 py-2 border border-white/10">
              <EyeOff className="h-3.5 w-3.5 text-white/60" />
              <span className="text-[11px] font-semibold text-white/60 tracking-wide">
                Tap to show UI
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CommentsDrawer
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        postId={post.id}
        placeName={post.placeName}
        status={post.verificationStatus}
      />

      {/* Tagger Modal */}
      <AnimatePresence>
        {tagModalOpen && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTagModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: 200, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 200, opacity: 0 }}
              className="relative w-full max-w-sm rounded-2xl glass-dark border border-border/40 p-5 shadow-soft z-10"
            >
              <h3 className="font-display font-black text-xl mb-1">Tag Location</h3>
              <p className="text-xs text-foreground/60 mb-5">Know this spot? Help the community out by tagging it.</p>

              <div className="relative mb-4">
                <input
                  autoFocus
                  value={tagInput}
                  autoComplete="off"
                  onChange={(e) => {
                    setTagInput(e.target.value);
                    tagAC.fetchSuggestions(e.target.value);
                  }}
                  onFocus={() => setTagFocused(true)}
                  onBlur={() => setTimeout(() => setTagFocused(false), 150)}
                  placeholder="Where is this?"
                  className="w-full bg-background/50 border border-border/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                />

                {tagFocused && tagAC.suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border/40 rounded-xl shadow-lg z-30 max-h-44 overflow-y-auto">
                    {tagAC.suggestions.map((s) => (
                      <button
                        key={s.placeId}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={async () => {
                          setTagInput(s.mainText);
                          tagAC.clearSuggestions();
                          await tagAC.resolvePlaceDetails(s.placeId);
                        }}
                        className="w-full text-left px-3 py-2.5 hover:bg-foreground/10 border-b border-border/20 last:border-0 transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          <MapPin className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">{s.mainText}</p>
                            <p className="text-[11px] text-foreground/60 truncate">{s.secondaryText}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mb-5">
                <input
                  type="checkbox"
                  id={`mod-check-${post.id}`}
                  checked={isModMode}
                  onChange={(e) => setIsModMode(e.target.checked)}
                  className="accent-primary"
                />
                <label htmlFor={`mod-check-${post.id}`} className="text-[10px] text-foreground/60 uppercase tracking-widest font-bold">
                  Simulate: I am a Verified Mod
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setTagModalOpen(false)}
                  className="flex-1 glass text-xs font-bold py-2.5 rounded-xl active:scale-95 transition-transform"
                >
                  Cancel
                </button>
                <button
                  disabled={tagInput.trim().length < 2}
                  onClick={() => {
                    setTagModalOpen(false);
                    if (isModMode) {
                      toast.success(`Location Tagged: ${tagInput} ✅`, { description: "You are a Verified Mod, so it saved instantly!" });
                    } else {
                      toast("Suggestion Submitted 📍", { description: "Sent to AI and Mods for final verification." });
                    }
                    setTagInput("");
                  }}
                  className="flex-1 bg-gradient-sunset text-primary-foreground shadow-glow-coral text-xs font-black uppercase tracking-widest py-2.5 rounded-xl active:scale-95 transition-transform disabled:opacity-50"
                >
                  Submit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Location Edit Modal */}
      <LocationEditModal
        post={post}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
      />
    </section>
  );
}
