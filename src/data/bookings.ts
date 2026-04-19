import { useEffect, useState } from "react";

export type BookingType = "table" | "ticket";

export interface Booking {
  id: string;
  type: BookingType;
  placeName: string;
  placeSlug: string;
  cover: string;
  // Table fields
  partySize?: number;
  date: string; // ISO
  timeLabel: string;
  // Ticket fields
  eventTitle?: string;
  ticketPrice?: number;
  // Common
  confirmationCode: string;
  status: "upcoming" | "past" | "cancelled";
  createdAt: string;
}

const STORAGE_KEY = "vibecheck.bookings.v1";

const SEED: Booking[] = [
  {
    id: "b-seed-1",
    type: "table",
    placeName: "Sunset Rooftop",
    placeSlug: "sunset-rooftop",
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80&auto=format",
    partySize: 4,
    date: "2025-04-26T20:00:00Z",
    timeLabel: "8:00 PM",
    confirmationCode: "VC-RT-8421",
    status: "upcoming",
    createdAt: "2025-04-18T12:00:00Z",
  },
  {
    id: "b-seed-2",
    type: "ticket",
    placeName: "Neon Beach Club",
    placeSlug: "neon-beach-club",
    cover: "https://images.unsplash.com/photo-1571266028243-d220bc11d49b?w=800&q=80&auto=format",
    eventTitle: "Headliner: DJ AURORA",
    ticketPrice: 45,
    date: "2025-04-26T23:00:00Z",
    timeLabel: "11:00 PM",
    confirmationCode: "VC-EV-2207",
    status: "upcoming",
    createdAt: "2025-04-17T18:00:00Z",
  },
  {
    id: "b-seed-3",
    type: "table",
    placeName: "Casa Tulum",
    placeSlug: "casa-tulum",
    cover: "https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?w=800&q=80&auto=format",
    partySize: 2,
    date: "2025-04-12T19:30:00Z",
    timeLabel: "7:30 PM",
    confirmationCode: "VC-RT-6190",
    status: "past",
    createdAt: "2025-04-10T10:00:00Z",
  },
];

function load(): Booking[] {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED;
    const parsed = JSON.parse(raw) as Booking[];
    return Array.isArray(parsed) ? parsed : SEED;
  } catch {
    return SEED;
  }
}

function save(b: Booking[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(b));
  } catch {
    /* ignore */
  }
}

let memory: Booking[] | null = null;
const listeners = new Set<() => void>();

function getAll(): Booking[] {
  if (memory === null) memory = load();
  return memory;
}

function setAll(next: Booking[]) {
  memory = next;
  save(next);
  listeners.forEach((l) => l());
}

function randomCode(prefix: string) {
  return `VC-${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export function addBooking(
  input: Omit<Booking, "id" | "confirmationCode" | "status" | "createdAt">,
) {
  const b: Booking = {
    ...input,
    id: crypto.randomUUID(),
    confirmationCode: randomCode(input.type === "table" ? "RT" : "EV"),
    status: "upcoming",
    createdAt: new Date().toISOString(),
  };
  setAll([b, ...getAll()]);
  return b;
}

export function cancelBooking(id: string) {
  setAll(getAll().map((b) => (b.id === id ? { ...b, status: "cancelled" as const } : b)));
}

export function useBookings() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const l = () => setTick((t) => t + 1);
    listeners.add(l);
    if (memory === null) memory = load();
    setTick((t) => t + 1);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return getAll().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
