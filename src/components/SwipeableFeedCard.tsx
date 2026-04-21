import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { VideoCard } from "./VideoCard";
import { VIBE_POSTS, getNearbyVenues, getPostsByPlace, type VibePost } from "@/data/vibes";

interface Props {
  initialPost: VibePost;
  active: boolean;
  muted: boolean;
  onToggleMute: () => void;
}

/**
 * Wraps a feed card with horizontal swipe navigation between nearby
 * venues in the same category. Each swipe replaces the visible post
 * with the latest post from the next/prev nearby venue.
 */
export function SwipeableFeedCard({ initialPost, active, muted, onToggleMute }: Props) {
  // Build the venue rotation: [initial, ...nearby same-category]
  const venueChain = useMemo(() => {
    const nearby = getNearbyVenues({
      lat: initialPost.lat,
      lng: initialPost.lng,
      placeName: initialPost.placeName,
      category: initialPost.category,
    });
    return [initialPost.placeName, ...nearby.map((v) => v.placeName)];
  }, [initialPost]);

  const [venueIdx, setVenueIdx] = useState(0);
  const [direction, setDirection] = useState(0);

  // For each venue, latest post (but keep the exact initialPost when at index 0)
  const currentPost = useMemo(() => {
    if (venueIdx === 0) return initialPost;
    const name = venueChain[venueIdx];
    const posts = getPostsByPlace(name);
    if (posts.length > 0) return posts[0];
    return VIBE_POSTS.find((p) => p.placeName === name) ?? initialPost;
  }, [venueChain, venueIdx, initialPost]);

  // Reset to original when card scrolls out of view + back in
  useEffect(() => {
    if (!active) setVenueIdx(0);
  }, [active]);

  const x = useMotionValue(0);
  const swipeHint = useTransform(x, [-120, 0, 120], [1, 0, 1]);

  const canPrev = venueIdx > 0;
  const canNext = venueIdx < venueChain.length - 1;

  const goNext = () => {
    if (!canNext) return;
    setDirection(1);
    setVenueIdx((i) => i + 1);
  };
  const goPrev = () => {
    if (!canPrev) return;
    setDirection(-1);
    setVenueIdx((i) => i - 1);
  };

  return (
    <div className="relative h-[100svh] w-full overflow-hidden">
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={currentPost.id + ":" + venueIdx}
          custom={direction}
          initial={{ x: direction > 0 ? "100%" : direction < 0 ? "-100%" : 0, opacity: 0.6 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction > 0 ? "-100%" : "100%", opacity: 0.4 }}
          transition={{ type: "spring", stiffness: 320, damping: 36 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.25}
          style={{ x }}
          onDragEnd={(_, info) => {
            const threshold = 80;
            const velocity = info.velocity.x;
            if ((info.offset.x < -threshold || velocity < -500) && canNext) {
              goNext();
            } else if ((info.offset.x > threshold || velocity > 500) && canPrev) {
              goPrev();
            }
          }}
          className="absolute inset-0"
        >
          <VideoCard post={currentPost} active={active} muted={muted} onToggleMute={onToggleMute} />
        </motion.div>
      </AnimatePresence>

      {/* Edge swipe affordances */}
      {canPrev && (
        <button
          onClick={goPrev}
          aria-label="Previous spot"
          className="pointer-events-auto absolute left-2 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full glass-dark md:grid"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      {canNext && (
        <button
          onClick={goNext}
          aria-label="Next spot"
          className="pointer-events-auto absolute right-2 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full glass-dark md:grid"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}



      {/* Swipe hint glow */}
      <motion.div
        style={{ opacity: swipeHint }}
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-primary/30 to-transparent"
      />
    </div>
  );
}
