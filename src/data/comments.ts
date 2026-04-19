import { useEffect, useState } from "react";

export type VibeRating = "chill" | "buzzing" | "fire";

export interface VibeComment {
  id: string;
  postId: string;
  placeName: string;
  username: string;
  avatar: string;
  rating: VibeRating;
  text: string;
  createdAt: string; // ISO
  upvotes: number;
  honest: boolean; // earned 🔥 reward
}

const STORAGE_KEY = "vibecheck.comments.v1";

// Seed comments so the drawer never feels empty
const SEED: VibeComment[] = [
  {
    id: "c1",
    postId: "1",
    placeName: "Neon Beach Club",
    username: "@latenightlena",
    avatar: "🦋",
    rating: "fire",
    text: "Floor was packed by 11. Sound system slaps, no cover before midnight.",
    createdAt: "2025-04-19T20:14:00Z",
    upvotes: 184,
    honest: true,
  },
  {
    id: "c2",
    postId: "1",
    placeName: "Neon Beach Club",
    username: "@dancefloordiary",
    avatar: "🪩",
    rating: "buzzing",
    text: "Vibes solid but drinks are $20+. Worth it for the rooftop view though.",
    createdAt: "2025-04-19T19:42:00Z",
    upvotes: 92,
    honest: true,
  },
  {
    id: "c3",
    postId: "1",
    placeName: "Neon Beach Club",
    username: "@miamigremlin",
    avatar: "🌴",
    rating: "chill",
    text: "Came at 9pm, kinda dead. Pick up around 11.",
    createdAt: "2025-04-19T18:10:00Z",
    upvotes: 41,
    honest: false,
  },
  {
    id: "c4",
    postId: "2",
    placeName: "Sunset Rooftop",
    username: "@brickellbabe",
    avatar: "🌅",
    rating: "fire",
    text: "Golden hour here is unmatched. Get the spicy paloma.",
    createdAt: "2025-04-19T19:55:00Z",
    upvotes: 230,
    honest: true,
  },
  {
    id: "c5",
    postId: "4",
    placeName: "Pulse Warehouse",
    username: "@ravelogs",
    avatar: "⚡",
    rating: "fire",
    text: "Best warehouse rave I've been to in years. Lineup goes till 6am.",
    createdAt: "2025-04-19T21:01:00Z",
    upvotes: 312,
    honest: true,
  },
];

function load(): VibeComment[] {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED;
    const parsed = JSON.parse(raw) as VibeComment[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED;
  } catch {
    return SEED;
  }
}

function save(comments: VibeComment[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
  } catch {
    // ignore quota errors
  }
}

let memory: VibeComment[] | null = null;
const listeners = new Set<() => void>();

function getAll(): VibeComment[] {
  if (memory === null) memory = load();
  return memory;
}

function setAll(next: VibeComment[]) {
  memory = next;
  save(next);
  listeners.forEach((l) => l());
}

export function useComments(postId: string) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const listener = () => setTick((t) => t + 1);
    listeners.add(listener);
    if (memory === null) memory = load();
    setTick((t) => t + 1);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const comments = getAll()
    .filter((c) => c.postId === postId)
    .sort((a, b) => b.upvotes - a.upvotes);

  const addComment = (input: { text: string; rating: VibeRating; placeName: string }) => {
    const honest = input.text.trim().length >= 25; // honest = thoughtful
    const c: VibeComment = {
      id: crypto.randomUUID(),
      postId,
      placeName: input.placeName,
      username: "@you",
      avatar: "✨",
      rating: input.rating,
      text: input.text.trim(),
      createdAt: new Date().toISOString(),
      upvotes: 0,
      honest,
    };
    setAll([c, ...getAll()]);
    return { honest, points: honest ? 25 : 5 };
  };

  const upvote = (id: string) => {
    setAll(getAll().map((c) => (c.id === id ? { ...c, upvotes: c.upvotes + 1 } : c)));
  };

  return { comments, addComment, upvote };
}
