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
  Shield,
} from "lucide-react";
import { type VibePost, timeAgo, slugify } from "@/data/vibes";
import { Link } from "@tanstack/react-router";
import { VibeBadge } from "./VibeBadge";
import { PlacePin } from "./PlacePin";
import { CommentsDrawer } from "./CommentsDrawer";
import { useComments } from "@/data/comments";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

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

export function VideoCard({ post, active, muted, onToggleMute }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [liked, setLiked] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [voted, setVoted] = useState(false);
  const { comments } = useComments(post.id);
  const commentCount = post.comments + comments.filter((c) => !c.id.startsWith("c")).length;

  const lastTapRef = useRef<number>(0);

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
      // Double tap detected
      lastTapRef.current = 0; // reset
      if (!liked) setLiked(true);
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 700);

      // Resume video if the first tap paused it
      if (v && v.paused) {
        v.play().catch(() => {});
        setIsPlaying(true);
      }
    } else {
      // Single tap - pause/play immediately
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
      title: `${post.username} checking in at ${post.placeName} on VibeCheck`,
      text: post.caption,
      url: shareUrl,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast("Link copied to clipboard", {
          description: "Share the vibe with your friends.",
        });
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        toast.error("Failed to share", { description: "Please try again." });
      }
    }
  };

  return (
    <section className="relative h-full w-full overflow-hidden bg-background">
      <video
        ref={videoRef}
        src={post.videoUrl}
        poster={post.poster}
        loop
        playsInline
        muted={muted}
        className="absolute inset-0 h-full w-full object-cover"
        onClick={handleTap}
      />

      {/* gradient veil for legibility */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-vibe" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-background/70 to-transparent" />

      {/* Pause indicator overlay */}
      <AnimatePresence>
        {!isPlaying && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none absolute inset-0 grid place-items-center bg-background/5"
          >
            <div className="grid h-20 w-20 place-items-center rounded-full bg-background/20 backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.15)]">
              <Play className="h-10 w-10 ml-1.5 text-white/90" fill="currentColor" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* double-tap heart */}
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

      {/* Top right: vibe + live */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-end gap-2 p-4 pt-[max(1rem,env(safe-area-inset-top))]">
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

      {/* Middle Left: place pin + reels */}
      <div className="absolute left-4 top-1/2 z-10 -translate-y-1/2 flex flex-col items-start gap-2 pointer-events-auto">
        <div className="relative group">
          <PlacePin 
            name={post.placeName} 
            neighborhood={post.neighborhood} 
            status={post.verificationStatus} 
          />
          {/* Mod Override (Simulated) */}
          <button 
            onClick={() => toast("Mod Override Panel 🛡️", { description: "You can now edit the name, category, or delete the tag entirely." })}
            className="absolute -top-3 -right-3 grid h-6 w-6 place-items-center rounded-full bg-accent text-accent-foreground opacity-0 group-hover:opacity-100 transition-opacity active:scale-95 shadow-glow-coral"
            title="Moderator Edit"
          >
            <Shield className="h-3 w-3" />
          </button>
        </div>

        {/* Waze style verification prompt */}
        {post.verificationStatus === "unverified" && !voted && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-dark rounded-xl p-2.5 shadow-soft border border-accent/20 w-[180px]"
          >
            <p className="text-[11px] font-bold mb-2 leading-tight">
              Is this {post.placeName}?
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setVoted(true);
                  toast.success("Thanks for verifying!", { description: "+5 Trust Score. 9 more 'Yes' votes to verify." });
                }}
                className="flex-1 bg-accent/20 active:bg-accent/30 text-accent font-display text-[10px] uppercase font-bold py-1.5 rounded-lg border border-accent/30"
              >
                Yes
              </button>
              <button
                onClick={() => {
                  setVoted(true);
                  toast("Flagged for review", { description: "We'll wait for more community input." });
                }}
                className="flex-1 bg-foreground/10 active:bg-foreground/20 text-foreground font-display text-[10px] uppercase font-bold py-1.5 rounded-lg border border-foreground/10"
              >
                No
              </button>
            </div>
          </motion.div>
        )}
        
        {!post.verificationStatus || post.verificationStatus === "verified" ? (
          <Link
            to="/reel/$slug"
            params={{ slug: slugify(post.placeName) }}
            className="glass-dark inline-flex items-center gap-2 rounded-full py-2 px-3 shadow-pin active:scale-95 transition-transform mt-1"
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
      <div className="absolute bottom-28 right-3 z-10 flex flex-col items-center gap-5">
        <button
          onClick={() => setLiked((s) => !s)}
          className="flex flex-col items-center gap-1 transition-transform active:scale-90"
        >
          <span className="grid h-12 w-12 place-items-center rounded-full glass-dark">
            <Heart
              className={`h-6 w-6 transition-colors ${
                liked ? "fill-primary text-primary" : "text-foreground"
              }`}
            />
          </span>
          <span className="text-xs font-semibold text-foreground/90">
            {formatCount(post.likes + (liked ? 1 : 0))}
          </span>
        </button>
        <button
          onClick={() => setCommentsOpen(true)}
          className="flex flex-col items-center gap-1 active:scale-90"
        >
          <span className="grid h-12 w-12 place-items-center rounded-full glass-dark">
            <MessageCircle className="h-6 w-6" />
          </span>
          <span className="text-xs font-semibold text-foreground/90">
            {formatCount(commentCount)}
          </span>
        </button>
        <button className="flex flex-col items-center gap-1 active:scale-90">
          <span className="grid h-12 w-12 place-items-center rounded-full glass-dark">
            <Bookmark className="h-6 w-6" />
          </span>
          <span className="text-xs font-semibold text-foreground/90">Save</span>
        </button>
        <button onClick={handleShare} className="flex flex-col items-center gap-1 active:scale-90">
          <span className="grid h-12 w-12 place-items-center rounded-full glass-dark">
            <Share2 className="h-6 w-6" />
          </span>
          <span className="text-xs font-semibold text-foreground/90">Share</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleMute();
            if (videoRef.current) {
              videoRef.current.muted = !muted;
            }
          }}
          className="grid h-10 w-10 place-items-center rounded-full glass-dark active:scale-90"
        >
          {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
      </div>

      {/* Bottom: caption + meta */}
      <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-24">
        <div className="max-w-[78%] space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-display text-base font-bold text-gradient-sunset">
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
      <CommentsDrawer
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        postId={post.id}
        placeName={post.placeName}
        status={post.verificationStatus}
      />
    </section>
  );
}
