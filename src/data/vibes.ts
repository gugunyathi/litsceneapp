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
  verificationStatus?: "verified" | "unverified" | "crowdsource";
}

// Vertical sample videos located in public folder
const SAMPLE_VIDEOS = [
  "/bowld.mp4",
  "/bowld2.mp4",
  "/bowld3.mp4",
  "/bowld4.mp4",
  "/coppersbelair.mp4",
  "/d481.mp4",
  "/d482.mp4",
  "/d483.mp4",
  "/d484.mp4",
  "/d485.mp4",
  "/d486.mp4",
  "/laparadanorthriding.mp4",
  "/mojalove.mp4",
  "/phirinyane1.mp4",
  "/phirinyane2.mp4",
  "/phirinyane3.mp4",
  "/phirinyane4.mp4",
  "/phirinyane5.mp4",
  "/phirinyane6.mp4",
  "/phirinyane7.mp4",
  "/phirinyane8.mp4",
  "/rockets1.mp4",
  "/rockets2.mp4",
  "/rockets3.mp4",
  "/rockets4.mp4",
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
const BASE_TIME = new Date("2026-04-21T11:00:00Z").getTime();
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
  // existing sample posts
  {
    id: "1",
    videoUrl: SAMPLE_VIDEOS[0], // /bowld.mp4
    poster: POSTERS[0],
    placeName: "Bowld Restaurant",
    category: "restaurant",
    neighborhood: "Bryanston",
    city: "Johannesburg",
    lat: -26.0594,
    lng: 28.0244,
    vibeScore: 3,
    postedAt: minutesAgo(2),
    username: "@vibemaster",
    caption: "Bowld is the spot today! 🥗✨",
    likes: 1200,
    comments: 45,
    isLive: true,
  },
  {
    id: "b2",
    videoUrl: SAMPLE_VIDEOS[1], // /bowld2.mp4
    poster: POSTERS[1],
    placeName: "Bowld Restaurant",
    category: "restaurant",
    neighborhood: "Bryanston",
    city: "Johannesburg",
    lat: -26.0594,
    lng: 28.0244,
    vibeScore: 2,
    postedAt: minutesAgo(15),
    username: "@foodie_sa",
    caption: "Lunch vibes are immaculate",
    likes: 850,
    comments: 21,
  },
  {
    id: "b3",
    videoUrl: SAMPLE_VIDEOS[2], // /bowld3.mp4
    poster: POSTERS[2],
    placeName: "Bowld Restaurant",
    category: "restaurant",
    neighborhood: "Bryanston",
    city: "Johannesburg",
    lat: -26.0594,
    lng: 28.0244,
    vibeScore: 3,
    postedAt: minutesAgo(35),
    username: "@cityslicker",
    caption: "Best harvest table in Joburg",
    likes: 2100,
    comments: 89,
  },
  {
    id: "b4",
    videoUrl: SAMPLE_VIDEOS[3], // /bowld4.mp4
    poster: POSTERS[3],
    placeName: "Bowld Restaurant",
    category: "restaurant",
    neighborhood: "Bryanston",
    city: "Johannesburg",
    lat: -26.0594,
    lng: 28.0244,
    vibeScore: 3,
    postedAt: minutesAgo(55),
    username: "@lunchlady",
    caption: "Dessert was calling my name",
    likes: 450,
    comments: 12,
  },
  {
    id: "c1",
    videoUrl: SAMPLE_VIDEOS[4], // /coppersbelair.mp4
    poster: POSTERS[4],
    placeName: "Coppers Bel Air",
    category: "restaurant",
    neighborhood: "North Riding",
    city: "Johannesburg",
    lat: -26.0456,
    lng: 27.9623,
    vibeScore: 3,
    postedAt: minutesAgo(8),
    username: "@belair_nights",
    caption: "Drinks at Coppers hit different 🍹",
    likes: 1540,
    comments: 67,
    isLive: true,
  },
  {
    id: "d481",
    videoUrl: SAMPLE_VIDEOS[5],
    poster: POSTERS[5],
    placeName: "D48",
    category: "club",
    neighborhood: "Sandton",
    city: "Johannesburg",
    lat: -26.1076,
    lng: 28.0567,
    vibeScore: 3,
    postedAt: minutesAgo(3),
    username: "@sandtonceleb",
    caption: "D48 is LUIT tonight! 🪩",
    likes: 3400,
    comments: 112,
    isLive: true,
  },
  {
    id: "d482",
    videoUrl: SAMPLE_VIDEOS[6],
    poster: POSTERS[6],
    placeName: "D48",
    category: "club",
    neighborhood: "Sandton",
    city: "Johannesburg",
    lat: -26.1076,
    lng: 28.0567,
    vibeScore: 3,
    postedAt: minutesAgo(12),
    username: "@clubber_extra",
    caption: "The lights! The music!",
    likes: 2200,
    comments: 45,
  },
  {
    id: "d483",
    videoUrl: SAMPLE_VIDEOS[7],
    poster: POSTERS[7],
    placeName: "D48",
    category: "club",
    neighborhood: "Sandton",
    city: "Johannesburg",
    lat: -26.1076,
    lng: 28.0567,
    vibeScore: 2,
    postedAt: minutesAgo(25),
    username: "@partyanimal",
    caption: "Energy is crazy",
    likes: 1800,
    comments: 32,
  },
  {
    id: "d484",
    videoUrl: SAMPLE_VIDEOS[8],
    poster: POSTERS[0],
    placeName: "D48",
    category: "club",
    neighborhood: "Sandton",
    city: "Johannesburg",
    lat: -26.1076,
    lng: 28.0567,
    vibeScore: 3,
    postedAt: minutesAgo(40),
    username: "@vibe_chaser",
    caption: "Bottle service on point",
    likes: 2900,
    comments: 67,
  },
  {
    id: "d485",
    videoUrl: SAMPLE_VIDEOS[9],
    poster: POSTERS[1],
    placeName: "D48",
    category: "club",
    neighborhood: "Sandton",
    city: "Johannesburg",
    lat: -26.1076,
    lng: 28.0567,
    vibeScore: 3,
    postedAt: minutesAgo(50),
    username: "@nightlifejhb",
    caption: "Sandton's finest",
    likes: 3100,
    comments: 98,
  },
  {
    id: "d486",
    videoUrl: SAMPLE_VIDEOS[10],
    poster: POSTERS[2],
    placeName: "D48",
    category: "club",
    neighborhood: "Sandton",
    city: "Johannesburg",
    lat: -26.1076,
    lng: 28.0567,
    vibeScore: 2,
    postedAt: minutesAgo(58),
    username: "@johannesburgafterdark",
    caption: "Unreal night",
    likes: 1200,
    comments: 34,
  },
  {
    id: "lp1",
    videoUrl: SAMPLE_VIDEOS[11],
    poster: POSTERS[3],
    placeName: "La Parada North Riding",
    category: "restaurant",
    neighborhood: "North Riding",
    city: "Johannesburg",
    lat: -26.0478,
    lng: 27.9654,
    vibeScore: 3,
    postedAt: minutesAgo(6),
    username: "@tapas_lover",
    caption: "Tapas and chill at La Parada 🥘",
    likes: 1900,
    comments: 78,
    isLive: true,
  },
  {
    id: "ml1",
    videoUrl: SAMPLE_VIDEOS[12],
    poster: POSTERS[4],
    placeName: "Moja Love",
    category: "event",
    neighborhood: "Soweto",
    city: "Johannesburg",
    lat: -26.2485,
    lng: 27.8546,
    vibeScore: 3,
    postedAt: minutesAgo(10),
    username: "@kasi_vibes",
    caption: "Moja Love event is jumping! 💃",
    likes: 2500,
    comments: 145,
    isLive: true,
  },
  {
    id: "p1",
    videoUrl: SAMPLE_VIDEOS[13],
    poster: POSTERS[5],
    placeName: "Phirinyane",
    category: "club",
    neighborhood: "Gaborone",
    city: "Gaborone",
    lat: -24.6282,
    lng: 25.8894,
    vibeScore: 3,
    postedAt: minutesAgo(2),
    username: "@botswana_nightlife",
    caption: "Phirinyane is the place to be! 🇧🇼",
    likes: 4200,
    comments: 231,
    isLive: true,
  },
  {
    id: "p2",
    videoUrl: SAMPLE_VIDEOS[14],
    poster: POSTERS[6],
    placeName: "Phirinyane",
    category: "club",
    neighborhood: "Gaborone",
    city: "Gaborone",
    lat: -24.6282,
    lng: 25.8894,
    vibeScore: 3,
    postedAt: minutesAgo(12),
    username: "@gabs_finest",
    caption: "Weekend mode activated",
    likes: 2100,
    comments: 89,
  },
  {
    id: "p3",
    videoUrl: SAMPLE_VIDEOS[15],
    poster: POSTERS[7],
    placeName: "Phirinyane",
    category: "club",
    neighborhood: "Gaborone",
    city: "Gaborone",
    lat: -24.6282,
    lng: 25.8894,
    vibeScore: 2,
    postedAt: minutesAgo(22),
    username: "@bw_vibes",
    caption: "Chill sessions",
    likes: 1200,
    comments: 34,
  },
  {
    id: "p4",
    videoUrl: SAMPLE_VIDEOS[16],
    poster: POSTERS[0],
    placeName: "Phirinyane",
    category: "club",
    neighborhood: "Gaborone",
    city: "Gaborone",
    lat: -24.6282,
    lng: 25.8894,
    vibeScore: 3,
    postedAt: minutesAgo(32),
    username: "@lit_bw",
    caption: "Turn up time",
    likes: 3100,
    comments: 112,
  },
  {
    id: "p5",
    videoUrl: SAMPLE_VIDEOS[17],
    poster: POSTERS[1],
    placeName: "Phirinyane",
    category: "club",
    neighborhood: "Gaborone",
    city: "Gaborone",
    lat: -24.6282,
    lng: 25.8894,
    vibeScore: 3,
    postedAt: minutesAgo(42),
    username: "@phirinyane_loyal",
    caption: "Always a good time",
    likes: 2800,
    comments: 95,
  },
  {
    id: "p6",
    videoUrl: SAMPLE_VIDEOS[18],
    poster: POSTERS[2],
    placeName: "Phirinyane",
    category: "club",
    neighborhood: "Gaborone",
    city: "Gaborone",
    lat: -24.6282,
    lng: 25.8894,
    vibeScore: 2,
    postedAt: minutesAgo(52),
    username: "@gaborone_afterdark",
    caption: "The crowd is insane",
    likes: 1900,
    comments: 67,
  },
  {
    id: "p7",
    videoUrl: SAMPLE_VIDEOS[19],
    poster: POSTERS[3],
    placeName: "Phirinyane",
    category: "club",
    neighborhood: "Gaborone",
    city: "Gaborone",
    lat: -24.6282,
    lng: 25.8894,
    vibeScore: 3,
    postedAt: minutesAgo(58),
    username: "@bw_nightlife_hub",
    caption: "Don't miss out",
    likes: 3500,
    comments: 124,
  },
  {
    id: "p8",
    videoUrl: SAMPLE_VIDEOS[20],
    poster: POSTERS[4],
    placeName: "Phirinyane",
    category: "club",
    neighborhood: "Gaborone",
    city: "Gaborone",
    lat: -24.6282,
    lng: 25.8894,
    vibeScore: 3,
    postedAt: minutesAgo(59),
    username: "@phirinyane_kings",
    caption: "Closing off the night",
    likes: 4100,
    comments: 189,
  },
  {
    id: "r1",
    videoUrl: SAMPLE_VIDEOS[21],
    poster: POSTERS[5],
    placeName: "Rockets",
    category: "club",
    neighborhood: "Bryanston",
    city: "Johannesburg",
    lat: -26.0583,
    lng: 28.0231,
    vibeScore: 3,
    postedAt: minutesAgo(4),
    username: "@rockets_vip",
    caption: "Rockets Bryanston is firing! 🚀",
    likes: 5600,
    comments: 289,
    isLive: true,
  },
  {
    id: "r2",
    videoUrl: SAMPLE_VIDEOS[22],
    poster: POSTERS[6],
    placeName: "Rockets",
    category: "club",
    neighborhood: "Bryanston",
    city: "Johannesburg",
    lat: -26.0583,
    lng: 28.0231,
    vibeScore: 3,
    postedAt: minutesAgo(14),
    username: "@bryanston_boys",
    caption: "Champagne showers",
    likes: 3200,
    comments: 145,
  },
  {
    id: "r3",
    videoUrl: SAMPLE_VIDEOS[23],
    poster: POSTERS[7],
    placeName: "Rockets",
    category: "club",
    neighborhood: "Bryanston",
    city: "Johannesburg",
    lat: -26.0583,
    lng: 28.0231,
    vibeScore: 2,
    postedAt: minutesAgo(24),
    username: "@jhb_luxury",
    caption: "Exclusive vibes",
    likes: 2100,
    comments: 88,
  },
  {
    id: "r4",
    videoUrl: SAMPLE_VIDEOS[24],
    poster: POSTERS[0],
    placeName: "Rockets",
    category: "club",
    neighborhood: "Bryanston",
    city: "Johannesburg",
    lat: -26.0583,
    lng: 28.0231,
    vibeScore: 3,
    postedAt: minutesAgo(44),
    username: "@rockets_fam",
    caption: "Best Sunday session",
    likes: 4800,
    comments: 123,
  },
  // Original Miami samples (restored)
  {
    id: "m1",
    videoUrl: SAMPLE_VIDEOS[0],
    poster: POSTERS[0],
    placeName: "Neon Beach Club",
    category: "club",
    neighborhood: "South Beach",
    city: "Miami",
    lat: 25.7826,
    lng: -80.1303,
    vibeScore: 3,
    postedAt: minutesAgo(80),
    username: "@miamiafterdark",
    caption: "the floor is SHAKING tonight 🔥",
    likes: 12_400,
    comments: 432,
    isLive: false,
  },
  {
    id: "m2",
    videoUrl: SAMPLE_VIDEOS[4], // coppersbelair.mp4
    poster: POSTERS[1],
    placeName: "Sunset Rooftop",
    category: "rooftop",
    neighborhood: "Brickell",
    city: "Miami",
    lat: 25.7617,
    lng: -80.1918,
    vibeScore: 3,
    postedAt: minutesAgo(90),
    username: "@brickellbabe",
    caption: "golden hour with the girls 🌅",
    likes: 8_932,
    comments: 211,
    verificationStatus: 'unverified',
  },
  {
    id: "m3",
    videoUrl: SAMPLE_VIDEOS[5], // d481.mp4
    poster: POSTERS[2],
    placeName: "Casa Tulum",
    category: "restaurant",
    neighborhood: "Wynwood",
    city: "Miami",
    lat: 25.801,
    lng: -80.199,
    vibeScore: 2,
    postedAt: minutesAgo(100),
    username: "@foodiefiend",
    caption: "spicy margs hit different 🌶️",
    likes: 4_120,
    comments: 88,
  },
  {
    id: "m4",
    videoUrl: SAMPLE_VIDEOS[6], // d482.mp4
    poster: POSTERS[3],
    placeName: "Pulse Warehouse",
    category: "event",
    neighborhood: "Wynwood",
    city: "Miami",
    lat: 25.803,
    lng: -80.1995,
    vibeScore: 3,
    postedAt: minutesAgo(110),
    username: "@ravelogs",
    caption: "warehouse rave > everything",
    likes: 21_300,
    comments: 901,
    isLive: false,
  },
  {
    id: "m5",
    videoUrl: SAMPLE_VIDEOS[7], // d483.mp4
    poster: POSTERS[4],
    placeName: "Palm Lounge",
    category: "club",
    neighborhood: "South Beach",
    city: "Miami",
    lat: 25.785,
    lng: -80.132,
    vibeScore: 2,
    postedAt: minutesAgo(120),
    username: "@nightowlnyc",
    caption: "DJ set hitting fr",
    likes: 3_200,
    comments: 145,
  },
  {
    id: "m6",
    videoUrl: SAMPLE_VIDEOS[11], // laparadanorthriding.mp4
    poster: POSTERS[5],
    placeName: "Coco Beach",
    category: "beach",
    neighborhood: "Mid Beach",
    city: "Miami",
    lat: 25.82,
    lng: -80.123,
    vibeScore: 2,
    postedAt: minutesAgo(130),
    username: "@beachvibes",
    caption: "day club energy ☀️🍹",
    likes: 5_600,
    comments: 178,
  },
  {
    id: "m7",
    videoUrl: SAMPLE_VIDEOS[12], // mojalove.mp4
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
    id: "m8",
    videoUrl: SAMPLE_VIDEOS[21], // rockets1.mp4
    poster: POSTERS[7],
    placeName: "Skyline Festival",
    category: "event",
    neighborhood: "Downtown",
    city: "Miami",
    lat: 25.774,
    lng: -80.19,
    vibeScore: 3,
    postedAt: minutesAgo(150),
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

/**
 * Reel Algorithm: Fetch videos from a specific spot,
 * arranged closest to realtime (latest to oldest),
 * maximum past 1 hour from realtime.
 */
export function getReelPostsForPlace(slug: string): VibePost[] {
  const oneHourAgo = BASE_TIME - 60 * 60 * 1000;
  
  return VIBE_POSTS
    .filter((p) => slugify(p.placeName) === slug)
    // Enforce maximum past 1 hour timeframe
    .filter((p) => new Date(p.postedAt).getTime() >= oneHourAgo)
    // Sort closest to real time (latest to oldest)
    .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
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
