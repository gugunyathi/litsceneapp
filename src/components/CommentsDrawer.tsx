import { useMemo, useState } from "react";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Sparkles, X, Send, Flame } from "lucide-react";
import { useComments, type VibeRating } from "@/data/comments";
import { timeAgo } from "@/data/vibes";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  postId: string;
  placeName: string;
}

const RATINGS: { id: VibeRating; label: string; emoji: string; color: string }[] = [
  { id: "chill", label: "Chill", emoji: "😌", color: "from-indigo-deep to-indigo-deep" },
  { id: "buzzing", label: "Buzzing", emoji: "⚡", color: "from-accent to-coral" },
  { id: "fire", label: "On Fire", emoji: "🔥", color: "from-coral to-magenta" },
];

const commentSchema = z.object({
  text: z
    .string()
    .trim()
    .min(3, "Say a bit more — honest comments earn 🔥")
    .max(280, "Keep it under 280 characters"),
  rating: z.enum(["chill", "buzzing", "fire"]),
});

export function CommentsDrawer({ open, onClose, postId, placeName }: Props) {
  const { comments, addComment, upvote } = useComments(postId);
  const [text, setText] = useState("");
  const [rating, setRating] = useState<VibeRating>("buzzing");
  const [error, setError] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c = { chill: 0, buzzing: 0, fire: 0 };
    comments.forEach((x) => (c[x.rating] += 1));
    return c;
  }, [comments]);
  const total = comments.length || 1;

  const submit = () => {
    setError(null);
    const result = commentSchema.safeParse({ text, rating });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    const { honest, points } = addComment({
      text: result.data.text,
      rating: result.data.rating,
      placeName,
    });
    setText("");
    toast.success(
      honest ? `+${points} 🔥 honest comment bonus!` : `+${points} 🔥 thanks for sharing`,
      {
        description: honest ? "Thoughtful, detailed reviews earn more points." : undefined,
      },
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            aria-label="Close comments"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm"
          />
          <motion.aside
            role="dialog"
            aria-label="Comments"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 600) onClose();
            }}
            className="glass-dark fixed inset-x-0 bottom-0 z-50 max-h-[85svh] overflow-hidden rounded-t-3xl border-t border-border/40 shadow-soft"
          >
            <div className="flex flex-col h-full max-h-[85svh]">
              {/* Drag handle */}
              <div className="flex justify-center pt-2 pb-1">
                <span className="h-1.5 w-12 rounded-full bg-foreground/30" />
              </div>

              {/* Header */}
              <header className="flex items-center justify-between px-4 pb-3">
                <div>
                  <h2 className="font-display text-lg font-black">
                    {comments.length} {comments.length === 1 ? "vibe" : "vibes"}
                  </h2>
                  <p className="text-[11px] uppercase tracking-widest text-foreground/60">
                    {placeName}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="grid h-9 w-9 place-items-center rounded-full glass"
                >
                  <X className="h-4 w-4" />
                </button>
              </header>

              {/* Vibe meter */}
              <div className="mx-4 mb-3 rounded-2xl bg-gradient-card border border-border/40 p-3">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-foreground/60">
                  <span>Crowd consensus</span>
                  <span className="inline-flex items-center gap-1 text-accent">
                    <Sparkles className="h-3 w-3" />
                    Rate honestly · earn 🔥
                  </span>
                </div>
                <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-indigo-deep"
                    style={{ width: `${(counts.chill / total) * 100}%` }}
                  />
                  <div
                    className="h-full bg-accent"
                    style={{ width: `${(counts.buzzing / total) * 100}%` }}
                  />
                  <div
                    className="h-full bg-gradient-fire"
                    style={{ width: `${(counts.fire / total) * 100}%` }}
                  />
                </div>
                <div className="mt-1.5 flex justify-between text-[10px] font-display font-bold uppercase tracking-wider">
                  <span>😌 {counts.chill}</span>
                  <span className="text-accent">⚡ {counts.buzzing}</span>
                  <span className="text-gradient-fire">🔥 {counts.fire}</span>
                </div>
              </div>

              {/* Comment list */}
              <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-2">
                {comments.length === 0 ? (
                  <div className="grid place-items-center py-12 text-center">
                    <p className="text-4xl">💭</p>
                    <p className="mt-2 font-display text-base font-bold">No vibes yet</p>
                    <p className="text-xs text-foreground/60">Be the first to weigh in.</p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {comments.map((c) => {
                      const r = RATINGS.find((x) => x.id === c.rating)!;
                      return (
                        <li key={c.id} className="flex gap-3">
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-card text-base">
                            {c.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-display text-sm font-bold">{c.username}</span>
                              {c.honest && (
                                <span
                                  title="Honest review badge"
                                  className="inline-flex items-center gap-0.5 rounded-full bg-accent/20 px-1.5 py-0.5 text-[9px] font-display font-black uppercase tracking-widest text-accent"
                                >
                                  <Flame className="h-2.5 w-2.5" /> Honest
                                </span>
                              )}
                              <span
                                className={`rounded-full bg-gradient-to-r ${r.color} px-1.5 py-0.5 text-[9px] font-display font-black uppercase tracking-widest text-primary-foreground`}
                              >
                                {r.emoji} {r.label}
                              </span>
                              <span className="text-[10px] text-foreground/50">
                                · {timeAgo(c.createdAt)}
                              </span>
                            </div>
                            <p className="mt-0.5 text-sm leading-snug text-foreground/90 break-words">
                              {c.text}
                            </p>
                            <button
                              onClick={() => upvote(c.id)}
                              className="mt-1 inline-flex items-center gap-1 rounded-full glass px-2 py-0.5 text-[10px] font-bold text-foreground/80 active:scale-95"
                            >
                              <ArrowUp className="h-3 w-3" />
                              {c.upvotes}
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Composer */}
              <div className="border-t border-border/40 bg-background/60 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                <div className="mb-2 flex gap-1.5">
                  {RATINGS.map((r) => {
                    const active = r.id === rating;
                    return (
                      <button
                        key={r.id}
                        onClick={() => setRating(r.id)}
                        className={`flex-1 rounded-full px-2 py-1.5 text-[11px] font-display font-bold uppercase tracking-wider transition-all ${
                          active
                            ? `bg-gradient-to-r ${r.color} text-primary-foreground shadow-glow-coral`
                            : "glass text-foreground/80"
                        }`}
                      >
                        {r.emoji} {r.label}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-end gap-2">
                  <div className="glass flex-1 rounded-2xl border border-border/40 px-3 py-2">
                    <textarea
                      value={text}
                      onChange={(e) => {
                        setText(e.target.value.slice(0, 280));
                        setError(null);
                      }}
                      rows={2}
                      placeholder="Was it actually vibey? Be honest."
                      className="w-full resize-none bg-transparent text-sm placeholder:text-foreground/50 focus:outline-none"
                    />
                    <div className="flex items-center justify-between text-[10px] text-foreground/50">
                      <span className={error ? "text-destructive" : ""}>
                        {error ?? `${text.length}/280 · 25+ chars = honest 🔥`}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={submit}
                    aria-label="Post comment"
                    disabled={text.trim().length < 3}
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-sunset shadow-glow-coral active:scale-95 disabled:opacity-40 disabled:shadow-none"
                  >
                    <Send className="h-5 w-5 text-primary-foreground" />
                  </button>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
