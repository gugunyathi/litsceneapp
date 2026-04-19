import { useEffect, useState } from "react";

export interface Friend {
  id: string;
  handle: string;
  avatar: string; // emoji
  color: string; // tailwind bg class
}

export const FRIENDS: Friend[] = [
  { id: "f1", handle: "@latenightlena", avatar: "🦋", color: "bg-primary/40" },
  { id: "f2", handle: "@brickellbabe", avatar: "🌅", color: "bg-secondary/40" },
  { id: "f3", handle: "@ravelogs", avatar: "⚡", color: "bg-accent/40" },
  { id: "f4", handle: "@miamigremlin", avatar: "🌴", color: "bg-primary/30" },
  { id: "f5", handle: "@dancefloordiary", avatar: "🪩", color: "bg-secondary/30" },
  { id: "f6", handle: "@neonkid", avatar: "💫", color: "bg-accent/30" },
  { id: "f7", handle: "@bassdrop", avatar: "🎧", color: "bg-primary/40" },
  { id: "f8", handle: "@vibegrl", avatar: "🌺", color: "bg-secondary/40" },
];

// Deterministic mapping: which friends are "going" to a given place tonight
// Uses the place slug to seed which friends show up — feels real, stays stable.
function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

export function getFriendsGoing(placeSlug: string): Friend[] {
  const seed = hash(placeSlug);
  const count = 2 + (seed % 4); // 2-5 friends
  const start = seed % FRIENDS.length;
  const list: Friend[] = [];
  for (let i = 0; i < count; i++) {
    list.push(FRIENDS[(start + i * 3) % FRIENDS.length]);
  }
  // de-dupe by id
  return Array.from(new Map(list.map((f) => [f.id, f])).values());
}

/* ------- Tippers history (for rank-change arrows in leaderboard) ------- */

export interface RankSnapshot {
  // handle -> rank at that time (1 = top)
  [handle: string]: number;
}

const HISTORY_KEY = "vibecheck.tippers.history.v1";

function loadHistory(): RankSnapshot {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as RankSnapshot) : {};
  } catch {
    return {};
  }
}

function saveHistory(snap: RankSnapshot) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(snap));
  } catch {
    /* ignore */
  }
}

/**
 * Compares a fresh ranking against the snapshot taken ~1 hour ago
 * (here: snapshot taken on first mount per session) and returns deltas.
 * Positive delta = moved up (▲). Negative = moved down (▼).
 */
export function useRankChanges(currentRanking: { handle: string; amount: number }[]) {
  const [baseline, setBaseline] = useState<RankSnapshot | null>(null);

  useEffect(() => {
    const existing = loadHistory();
    if (Object.keys(existing).length === 0) {
      const snap: RankSnapshot = {};
      currentRanking.forEach((r, i) => {
        snap[r.handle] = i + 1;
      });
      saveHistory(snap);
      setBaseline(snap);
    } else {
      setBaseline(existing);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deltas: Record<string, number | "new"> = {};
  if (baseline) {
    currentRanking.forEach((r, i) => {
      const prev = baseline[r.handle];
      const now = i + 1;
      if (prev === undefined) deltas[r.handle] = "new";
      else deltas[r.handle] = prev - now; // positive = climbed
    });
  }
  return deltas;
}
