export type Category = "club" | "restaurant" | "event" | "rooftop" | "beach";

export interface VibePost {
  id: string;
  videoUrl: string;
  poster: string;
  placeName: string;
  category: Category;
  neighborhood: string;
  city: string;
  lat: number;
  lng: number;
  vibeScore: 1 | 2 | 3;
  postedAt: string; // ISO
  username: string;
  caption: string;
  likes: number;
  comments: number;
  isLive?: boolean;
}

// Vertical sample videos (Google's CDN — public sample assets)
const SAMPLE_VIDEOS = [
  "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
];

const POSTERS = [
  "https://images.unsplash.com/photo-1571266028243-d220bc11d49b?w=800&q=80&auto=format",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80&auto=format",
  "https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?w=800&q=80&auto=format",
  "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800&q=80&auto=format",
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80&auto=format",
  "https://images.unsplash.com/photo-1519214605650-76a613ee3245?w=800&q=80&auto=format",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80&auto=format",
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80&auto=format",
];

// Fixed base time so SSR + client render identical strings (avoids hydration mismatch).
const BASE_TIME = new Date("2025-04-19T22:00:00Z").getTime();
const minutesAgo = (m: number) => new Date(BASE_TIME - m * 60_000).toISOString();

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Haversine distance in km
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

export const VIBE_POSTS: VibePost[] = [
  {
    id: "1",
    videoUrl: SAMPLE_VIDEOS[0],
    poster: POSTERS[0],
    placeName: "Neon Beach Club",
    category: "club",
    neighborhood: "South Beach",
    city: "Miami",
    lat: 25.7826,
    lng: -80.1303,
    vibeScore: 3,
    postedAt: minutesAgo(4),
    username: "@miamiafterdark",
    caption: "the floor is SHAKING tonight 🔥",
    likes: 12_400,
    comments: 432,
    isLive: true,
  },
  {
    id: "2",
    videoUrl: SAMPLE_VIDEOS[1],
    poster: POSTERS[1],
    placeName: "Sunset Rooftop",
    category: "rooftop",
    neighborhood: "Brickell",
    city: "Miami",
    lat: 25.7617,
    lng: -80.1918,
    vibeScore: 3,
    postedAt: minutesAgo(12),
    username: "@brickellbabe",
    caption: "golden hour with the girls 🌅",
    likes: 8_932,
    comments: 211,
  },
  {
    id: "3",
    videoUrl: SAMPLE_VIDEOS[2],
    poster: POSTERS[2],
    placeName: "Casa Tulum",
    category: "restaurant",
    neighborhood: "Wynwood",
    city: "Miami",
    lat: 25.801,
    lng: -80.199,
    vibeScore: 2,
    postedAt: minutesAgo(28),
    username: "@foodiefiend",
    caption: "spicy margs hit different 🌶️",
    likes: 4_120,
    comments: 88,
  },
  {
    id: "4",
    videoUrl: SAMPLE_VIDEOS[3],
    poster: POSTERS[3],
    placeName: "Pulse Warehouse",
    category: "event",
    neighborhood: "Wynwood",
    city: "Miami",
    lat: 25.803,
    lng: -80.1995,
    vibeScore: 3,
    postedAt: minutesAgo(45),
    username: "@ravelogs",
    caption: "warehouse rave > everything",
    likes: 21_300,
    comments: 901,
    isLive: true,
  },
  {
    id: "5",
    videoUrl: SAMPLE_VIDEOS[4],
    poster: POSTERS[4],
    placeName: "Palm Lounge",
    category: "club",
    neighborhood: "South Beach",
    city: "Miami",
    lat: 25.785,
    lng: -80.132,
    vibeScore: 2,
    postedAt: minutesAgo(70),
    username: "@nightowlnyc",
    caption: "DJ set hitting fr",
    likes: 3_200,
    comments: 145,
  },
  {
    id: "6",
    videoUrl: SAMPLE_VIDEOS[5],
    poster: POSTERS[5],
    placeName: "Coco Beach",
    category: "beach",
    neighborhood: "Mid Beach",
    city: "Miami",
    lat: 25.82,
    lng: -80.123,
    vibeScore: 2,
    postedAt: minutesAgo(95),
    username: "@beachvibes",
    caption: "day club energy ☀️🍹",
    likes: 5_600,
    comments: 178,
  },
  {
    id: "7",
    videoUrl: SAMPLE_VIDEOS[6],
    poster: POSTERS[6],
    placeName: "Mezzanote",
    category: "restaurant",
    neighborhood: "Design District",
    city: "Miami",
    lat: 25.813,
    lng: -80.193,
    vibeScore: 1,
    postedAt: minutesAgo(140),
    username: "@dinnerdiaries",
    caption: "moody dinner energy",
    likes: 1_240,
    comments: 33,
  },
  {
    id: "8",
    videoUrl: SAMPLE_VIDEOS[7],
    poster: POSTERS[7],
    placeName: "Skyline Festival",
    category: "event",
    neighborhood: "Downtown",
    city: "Miami",
    lat: 25.774,
    lng: -80.19,
    vibeScore: 3,
    postedAt: minutesAgo(180),
    username: "@festivalheads",
    caption: "main stage went OFF",
    likes: 18_200,
    comments: 612,
  },
];

export const CATEGORIES: { id: Category | "all"; label: string; emoji: string }[] = [
  { id: "all", label: "All", emoji: "✨" },
  { id: "club", label: "Clubs", emoji: "🪩" },
  { id: "rooftop", label: "Rooftops", emoji: "🌇" },
  { id: "restaurant", label: "Eats", emoji: "🍽️" },
  { id: "event", label: "Events", emoji: "🎫" },
  { id: "beach", label: "Beach", emoji: "🏖️" },
];

export function timeAgo(iso: string): string {
  // Use BASE_TIME so SSR + client agree.
  const diff = BASE_TIME - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function fireScore(score: 1 | 2 | 3): string {
  return "🔥".repeat(score);
}

// ============= VENUE EXTRAS =============

export interface OpeningHours {
  day: string;
  hours: string;
  closed?: boolean;
}

export interface VenueEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  price: number;
  spotsLeft: number;
  cover: string;
}

export interface VenuePackage {
  id: string;
  title: string;
  description: string;
  originalPrice: number;
  price: number;
  tag?: string;
}

export interface VenueDetails {
  slug: string;
  description: string;
  address: string;
  phone: string;
  priceRange: "$" | "$$" | "$$$" | "$$$$";
  rating: number;
  reviewCount: number;
  hours: OpeningHours[];
  amenities: string[];
  events: VenueEvent[];
  packages: VenuePackage[];
  acceptsBookings: boolean;
  maxPartySize: number;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function makeHours(weekday: string, weekend: string, closedDays: number[] = []): OpeningHours[] {
  return DAYS.map((d, i) => {
    if (closedDays.includes(i)) return { day: d, hours: "Closed", closed: true };
    return { day: d, hours: i >= 4 ? weekend : weekday };
  });
}

export const VENUE_DETAILS: Record<string, VenueDetails> = {
  [slugify("Neon Beach Club")]: {
    slug: slugify("Neon Beach Club"),
    description:
      "Iconic oceanfront superclub. Resident DJs, world-class sound, 3 dance floors. Where Miami nights legends are made.",
    address: "1234 Ocean Dr, Miami Beach, FL",
    phone: "+1 (305) 555-0142",
    priceRange: "$$$$",
    rating: 4.7,
    reviewCount: 2841,
    hours: makeHours("10pm – 4am", "10pm – 6am", [0, 1]),
    amenities: ["VIP tables", "Bottle service", "Coat check", "21+", "Smoking terrace"],
    acceptsBookings: true,
    maxPartySize: 12,
    events: [
      {
        id: "e1",
        title: "Headliner: DJ AURORA",
        date: "Sat, Apr 26",
        time: "11:00 PM",
        price: 45,
        spotsLeft: 28,
        cover:
          "https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?w=800&q=80&auto=format",
      },
      {
        id: "e2",
        title: "Sunset Sessions: PARADISE",
        date: "Fri, May 2",
        time: "7:00 PM",
        price: 25,
        spotsLeft: 112,
        cover:
          "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80&auto=format",
      },
    ],
    packages: [
      {
        id: "p1",
        title: "VIP Bottle Package",
        description: "2 premium bottles + mixers + reserved booth for 6",
        originalPrice: 850,
        price: 595,
        tag: "Most popular",
      },
      {
        id: "p2",
        title: "Skip the Line + Welcome Shot",
        description: "Express entry pass for 2 with welcome shots",
        originalPrice: 80,
        price: 49,
      },
    ],
  },
  [slugify("Sunset Rooftop")]: {
    slug: slugify("Sunset Rooftop"),
    description:
      "30 floors above Brickell with panoramic skyline views. Craft cocktails, small plates, golden hour every night.",
    address: "555 Brickell Ave, Floor 30, Miami, FL",
    phone: "+1 (305) 555-0188",
    priceRange: "$$$",
    rating: 4.8,
    reviewCount: 1923,
    hours: makeHours("4pm – 12am", "2pm – 2am"),
    amenities: ["Outdoor terrace", "Heated", "Reservations", "Dress code"],
    acceptsBookings: true,
    maxPartySize: 10,
    events: [
      {
        id: "e3",
        title: "Rosé All Day Brunch",
        date: "Sun, Apr 27",
        time: "1:00 PM",
        price: 65,
        spotsLeft: 42,
        cover:
          "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80&auto=format",
      },
    ],
    packages: [
      {
        id: "p3",
        title: "Sunset Cocktail Flight",
        description: "4 signature cocktails paired with charcuterie",
        originalPrice: 95,
        price: 65,
        tag: "Sunset only",
      },
    ],
  },
  [slugify("Casa Tulum")]: {
    slug: slugify("Casa Tulum"),
    description:
      "Mexican-coastal cuisine meets Wynwood art scene. Wood-fired everything, mezcal flights, garden seating.",
    address: "2200 NW 2nd Ave, Miami, FL",
    phone: "+1 (305) 555-0211",
    priceRange: "$$$",
    rating: 4.6,
    reviewCount: 1102,
    hours: makeHours("12pm – 11pm", "11am – 1am"),
    amenities: ["Outdoor seating", "Vegan options", "Reservations", "Walk-ins"],
    acceptsBookings: true,
    maxPartySize: 14,
    events: [],
    packages: [
      {
        id: "p4",
        title: "Mezcal Flight + Tacos for 2",
        description: "5-mezcal tasting + chef's taco selection",
        originalPrice: 120,
        price: 79,
      },
    ],
  },
};

const DEFAULT_VENUE: Omit<VenueDetails, "slug"> = {
  description:
    "A standout spot worth checking out. Real-time vibes from people who actually showed up.",
  address: "Miami, FL",
  phone: "+1 (305) 555-0100",
  priceRange: "$$$",
  rating: 4.5,
  reviewCount: 412,
  hours: makeHours("6pm – 12am", "6pm – 2am"),
  amenities: ["Reservations", "Walk-ins welcome"],
  acceptsBookings: true,
  maxPartySize: 8,
  events: [],
  packages: [
    {
      id: "default-p1",
      title: "House Package",
      description: "Welcome drink + priority seating",
      originalPrice: 60,
      price: 39,
    },
  ],
};

export function getVenueDetails(placeName: string): VenueDetails {
  const slug = slugify(placeName);
  return VENUE_DETAILS[slug] ?? { ...DEFAULT_VENUE, slug };
}

export function getPostsByPlace(placeName: string): VibePost[] {
  return VIBE_POSTS.filter((p) => p.placeName === placeName).sort(
    (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime(),
  );
}

export interface VenueSummary {
  placeName: string;
  slug: string;
  category: Category;
  neighborhood: string;
  city: string;
  lat: number;
  lng: number;
  poster: string;
  vibeScore: 1 | 2 | 3;
  postCount: number;
  latestPostAt: string;
}

export function getVenueSummaries(filter?: Category | "all"): VenueSummary[] {
  const map = new Map<string, VenueSummary>();
  for (const p of VIBE_POSTS) {
    if (filter && filter !== "all" && p.category !== filter) continue;
    const existing = map.get(p.placeName);
    if (!existing) {
      map.set(p.placeName, {
        placeName: p.placeName,
        slug: slugify(p.placeName),
        category: p.category,
        neighborhood: p.neighborhood,
        city: p.city,
        lat: p.lat,
        lng: p.lng,
        poster: p.poster,
        vibeScore: p.vibeScore,
        postCount: 1,
        latestPostAt: p.postedAt,
      });
    } else {
      existing.postCount += 1;
      if (new Date(p.postedAt) > new Date(existing.latestPostAt)) {
        existing.latestPostAt = p.postedAt;
        existing.vibeScore = p.vibeScore;
        existing.poster = p.poster;
      }
    }
  }
  return [...map.values()].sort(
    (a, b) => new Date(b.latestPostAt).getTime() - new Date(a.latestPostAt).getTime(),
  );
}

export function getNearbyVenues(
  origin: { lat: number; lng: number; placeName: string; category: Category },
  limit = 6,
): VenueSummary[] {
  return getVenueSummaries(origin.category)
    .filter((v) => v.placeName !== origin.placeName)
    .map((v) => ({ v, d: distanceKm({ lat: origin.lat, lng: origin.lng }, v) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, limit)
    .map(({ v }) => v);
}
