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
  "/bowld.mp4",       // [0]
  "/bowld2.mp4",      // [1]
  "/bowld3.mp4",      // [2]
  "/bowld4.mp4",      // [3]
  "/coppersbelair.mp4", // [4]
  "/d481.mp4",        // [5]
  "/d482.mp4",        // [6]
  "/d483.mp4",        // [7]
  "/d484.mp4",        // [8]
  "/d485.mp4",        // [9]
  "/d486.mp4",        // [10]
  "/laparadanorthriding.mp4", // [11]
  "/mojalove.mp4",    // [12]
  "/phirinyane1.mp4", // [13]
  "/phirinyane2.mp4", // [14]
  "/phirinyane3.mp4", // [15]
  "/phirinyane4.mp4", // [16]
  "/phirinyane5.mp4", // [17]
  "/phirinyane6.mp4", // [18]
  "/phirinyane7.mp4", // [19]
  "/phirinyane8.mp4", // [20]
  "/rockets1.mp4",    // [21]
  "/rockets2.mp4",    // [22]
  "/rockets3.mp4",    // [23]
  "/rockets4.mp4",    // [24]
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

// ============================================================
// VIBE POSTS — grouped by establishment, sorted by filename
// ============================================================

export const VIBE_POSTS: VibePost[] = [

  // --- BOWLD RESTAURANT (Morningside, Sandton) ---
  // 1st Floor, Masingita Towers, 15 West Road South, Morningside, Sandton
  // Coords: -26.0932, 28.0619
  {
    id: "bowld-1",
    videoUrl: SAMPLE_VIDEOS[0], // bowld.mp4
    poster: POSTERS[0],
    placeName: "Bowld Restaurant",
    category: "restaurant",
    neighborhood: "Morningside",
    city: "Sandton",
    lat: -26.0932,
    lng: 28.0619,
    vibeScore: 3,
    postedAt: minutesAgo(2),
    username: "@vibemaster",
    caption: "Bowld Sandton is the spot today! 🥗✨",
    likes: 1200,
    comments: 45,
    isLive: true,
    verificationStatus: "verified",
  },
  {
    id: "bowld-2",
    videoUrl: SAMPLE_VIDEOS[1], // bowld2.mp4
    poster: POSTERS[1],
    placeName: "Bowld Restaurant",
    category: "restaurant",
    neighborhood: "Morningside",
    city: "Sandton",
    lat: -26.0932,
    lng: 28.0619,
    vibeScore: 2,
    postedAt: minutesAgo(15),
    username: "@foodie_sa",
    caption: "Lunch vibes are immaculate 🍱",
    likes: 850,
    comments: 21,
    verificationStatus: "verified",
  },
  {
    id: "bowld-3",
    videoUrl: SAMPLE_VIDEOS[2], // bowld3.mp4
    poster: POSTERS[2],
    placeName: "Bowld Restaurant",
    category: "restaurant",
    neighborhood: "Morningside",
    city: "Sandton",
    lat: -26.0932,
    lng: 28.0619,
    vibeScore: 3,
    postedAt: minutesAgo(35),
    username: "@cityslicker",
    caption: "Best wholesome bowls in Sandton 🌿",
    likes: 2100,
    comments: 89,
  },
  {
    id: "bowld-4",
    videoUrl: SAMPLE_VIDEOS[3], // bowld4.mp4
    poster: POSTERS[3],
    placeName: "Bowld Restaurant",
    category: "restaurant",
    neighborhood: "Morningside",
    city: "Sandton",
    lat: -26.0932,
    lng: 28.0619,
    vibeScore: 3,
    postedAt: minutesAgo(55),
    username: "@lunchlady_jhb",
    caption: "Dessert was absolutely calling my name 😍",
    likes: 450,
    comments: 12,
  },

  // --- COPPERS BELAIR (Northriding) ---
  // 1st Floor, Bel Air Shopping Centre, Bellairs Drive, Northriding, Johannesburg, 2153
  // Coords: -26.0501, 27.9588
  {
    id: "coppers-1",
    videoUrl: SAMPLE_VIDEOS[4], // coppersbelair.mp4
    poster: POSTERS[4],
    placeName: "Coppers Belair",
    category: "club",
    neighborhood: "Northriding",
    city: "Johannesburg",
    lat: -26.0501,
    lng: 27.9588,
    vibeScore: 3,
    postedAt: minutesAgo(8),
    username: "@belair_nights",
    caption: "Cocktails at Coppers Belair hit different 🍹",
    likes: 1540,
    comments: 67,
    isLive: true,
    verificationStatus: "verified",
  },

  // --- D48 BAR & GRILL (Halfway House, Midrand) ---
  // 561 James Crescent, Halfway House, Midrand, Johannesburg, 1685
  // Coords: -25.9983, 28.1271
  {
    id: "d48-1",
    videoUrl: SAMPLE_VIDEOS[5], // d481.mp4
    poster: POSTERS[5],
    placeName: "D48 Bar & Grill",
    category: "club",
    neighborhood: "Halfway House",
    city: "Midrand",
    lat: -25.9983,
    lng: 28.1271,
    vibeScore: 3,
    postedAt: minutesAgo(3),
    username: "@midrand_nights",
    caption: "D48 Midrand is LUIT tonight! 🪩🔥",
    likes: 3400,
    comments: 112,
    isLive: true,
    verificationStatus: "verified",
  },
  {
    id: "d48-2",
    videoUrl: SAMPLE_VIDEOS[6], // d482.mp4
    poster: POSTERS[6],
    placeName: "D48 Bar & Grill",
    category: "club",
    neighborhood: "Halfway House",
    city: "Midrand",
    lat: -25.9983,
    lng: 28.1271,
    vibeScore: 3,
    postedAt: minutesAgo(12),
    username: "@clubber_sa",
    caption: "The lights! The music! The energy! 🎶",
    likes: 2200,
    comments: 45,
  },
  {
    id: "d48-3",
    videoUrl: SAMPLE_VIDEOS[7], // d483.mp4
    poster: POSTERS[7],
    placeName: "D48 Bar & Grill",
    category: "club",
    neighborhood: "Halfway House",
    city: "Midrand",
    lat: -25.9983,
    lng: 28.1271,
    vibeScore: 2,
    postedAt: minutesAgo(25),
    username: "@joburg_party",
    caption: "After-work vibes unmatched 🍺",
    likes: 1800,
    comments: 32,
  },
  {
    id: "d48-4",
    videoUrl: SAMPLE_VIDEOS[8], // d484.mp4
    poster: POSTERS[0],
    placeName: "D48 Bar & Grill",
    category: "club",
    neighborhood: "Halfway House",
    city: "Midrand",
    lat: -25.9983,
    lng: 28.1271,
    vibeScore: 3,
    postedAt: minutesAgo(40),
    username: "@vibe_chaser_jhb",
    caption: "Bottle service on point tonight",
    likes: 2900,
    comments: 67,
  },
  {
    id: "d48-5",
    videoUrl: SAMPLE_VIDEOS[9], // d485.mp4
    poster: POSTERS[1],
    placeName: "D48 Bar & Grill",
    category: "club",
    neighborhood: "Halfway House",
    city: "Midrand",
    lat: -25.9983,
    lng: 28.1271,
    vibeScore: 3,
    postedAt: minutesAgo(50),
    username: "@nightlife_midrand",
    caption: "Midrand's finest bar and grill",
    likes: 3100,
    comments: 98,
  },
  {
    id: "d48-6",
    videoUrl: SAMPLE_VIDEOS[10], // d486.mp4
    poster: POSTERS[2],
    placeName: "D48 Bar & Grill",
    category: "club",
    neighborhood: "Halfway House",
    city: "Midrand",
    lat: -25.9983,
    lng: 28.1271,
    vibeScore: 2,
    postedAt: minutesAgo(58),
    username: "@jhb_afterdark",
    caption: "Unreal vibes at D48 tonight",
    likes: 1200,
    comments: 34,
  },

  // --- LA PARADA (Northriding) ---
  // Bel Air Shopping Centre, Bellairs Drive, Northriding, Johannesburg
  // Coords: -26.0504, 27.9591
  {
    id: "laparada-1",
    videoUrl: SAMPLE_VIDEOS[11], // laparadanorthriding.mp4
    poster: POSTERS[3],
    placeName: "La Parada",
    category: "restaurant",
    neighborhood: "Northriding",
    city: "Johannesburg",
    lat: -26.0504,
    lng: 27.9591,
    vibeScore: 3,
    postedAt: minutesAgo(6),
    username: "@tapas_lover_jozi",
    caption: "Tapas and chill at La Parada Northriding 🥘🌶️",
    likes: 1900,
    comments: 78,
    isLive: true,
    verificationStatus: "verified",
  },

  // --- MOJA CAFÉ (Sunninghill, Sandton) ---
  // Chilli Lane Shopping Centre, Corner Rivonia Road & Leeuwkop Road, Sunninghill, Sandton, 2196
  // Coords: -26.0219, 28.0622
  {
    id: "moja-1",
    videoUrl: SAMPLE_VIDEOS[12], // mojalove.mp4
    poster: POSTERS[4],
    placeName: "Moja Café",
    category: "event",
    neighborhood: "Sunninghill",
    city: "Sandton",
    lat: -26.0219,
    lng: 28.0622,
    vibeScore: 3,
    postedAt: minutesAgo(10),
    username: "@kasi_vibes_sa",
    caption: "Moja Café is jumping tonight! 💃🎵",
    likes: 2500,
    comments: 145,
    isLive: true,
    verificationStatus: "verified",
  },

  // --- PHIRINYANE BY GEMELLI (Bryanston, Sandton) ---
  // Shop 13, Posthouse Link Centre, Corner Main & Posthouse Street, Bryanston, Sandton
  // Coords: -26.0507, 28.0183
  {
    id: "phiri-1",
    videoUrl: SAMPLE_VIDEOS[13], // phirinyane1.mp4
    poster: POSTERS[5],
    placeName: "Phirinyane by Gemelli",
    category: "restaurant",
    neighborhood: "Bryanston",
    city: "Sandton",
    lat: -26.0507,
    lng: 28.0183,
    vibeScore: 3,
    postedAt: minutesAgo(2),
    username: "@bryanston_eats",
    caption: "Phirinyane by Gemelli — the vibes are chef's kiss! 🍝✨",
    likes: 4200,
    comments: 231,
    isLive: true,
    verificationStatus: "verified",
  },
  {
    id: "phiri-2",
    videoUrl: SAMPLE_VIDEOS[14], // phirinyane2.mp4
    poster: POSTERS[6],
    placeName: "Phirinyane by Gemelli",
    category: "restaurant",
    neighborhood: "Bryanston",
    city: "Sandton",
    lat: -26.0507,
    lng: 28.0183,
    vibeScore: 3,
    postedAt: minutesAgo(12),
    username: "@sandton_foodie",
    caption: "Italian soul, African heart 🇿🇦❤️",
    likes: 2100,
    comments: 89,
  },
  {
    id: "phiri-3",
    videoUrl: SAMPLE_VIDEOS[15], // phirinyane3.mp4
    poster: POSTERS[7],
    placeName: "Phirinyane by Gemelli",
    category: "restaurant",
    neighborhood: "Bryanston",
    city: "Sandton",
    lat: -26.0507,
    lng: 28.0183,
    vibeScore: 2,
    postedAt: minutesAgo(22),
    username: "@gemelli_fan",
    caption: "Chill dinner with the crew",
    likes: 1200,
    comments: 34,
  },
  {
    id: "phiri-4",
    videoUrl: SAMPLE_VIDEOS[16], // phirinyane4.mp4
    poster: POSTERS[0],
    placeName: "Phirinyane by Gemelli",
    category: "restaurant",
    neighborhood: "Bryanston",
    city: "Sandton",
    lat: -26.0507,
    lng: 28.0183,
    vibeScore: 3,
    postedAt: minutesAgo(32),
    username: "@jhb_gourmet",
    caption: "The tasting menu here is unmatched",
    likes: 3100,
    comments: 112,
  },
  {
    id: "phiri-5",
    videoUrl: SAMPLE_VIDEOS[17], // phirinyane5.mp4
    poster: POSTERS[1],
    placeName: "Phirinyane by Gemelli",
    category: "restaurant",
    neighborhood: "Bryanston",
    city: "Sandton",
    lat: -26.0507,
    lng: 28.0183,
    vibeScore: 3,
    postedAt: minutesAgo(42),
    username: "@bryanston_social",
    caption: "Always a good time at Phirinyane 🍷",
    likes: 2800,
    comments: 95,
  },
  {
    id: "phiri-6",
    videoUrl: SAMPLE_VIDEOS[18], // phirinyane6.mp4
    poster: POSTERS[2],
    placeName: "Phirinyane by Gemelli",
    category: "restaurant",
    neighborhood: "Bryanston",
    city: "Sandton",
    lat: -26.0507,
    lng: 28.0183,
    vibeScore: 2,
    postedAt: minutesAgo(52),
    username: "@sandton_after_dark",
    caption: "The crowd here is everything",
    likes: 1900,
    comments: 67,
  },
  {
    id: "phiri-7",
    videoUrl: SAMPLE_VIDEOS[19], // phirinyane7.mp4
    poster: POSTERS[3],
    placeName: "Phirinyane by Gemelli",
    category: "restaurant",
    neighborhood: "Bryanston",
    city: "Sandton",
    lat: -26.0507,
    lng: 28.0183,
    vibeScore: 3,
    postedAt: minutesAgo(55),
    username: "@gemelli_nights",
    caption: "Don't miss out on Friday nights here 🔥",
    likes: 3500,
    comments: 124,
  },
  {
    id: "phiri-8",
    videoUrl: SAMPLE_VIDEOS[20], // phirinyane8.mp4
    poster: POSTERS[4],
    placeName: "Phirinyane by Gemelli",
    category: "restaurant",
    neighborhood: "Bryanston",
    city: "Sandton",
    lat: -26.0507,
    lng: 28.0183,
    vibeScore: 3,
    postedAt: minutesAgo(59),
    username: "@phirinyane_addicted",
    caption: "Closing the night on a high note",
    likes: 4100,
    comments: 189,
  },

  // --- ROCKETS BRYANSTON (Bryanston, Sandton) ---
  // 86 Hobart Road, Hobart Centre, Bryanston, Sandton, Johannesburg, 2191
  // Coords: -26.0561, 28.0246
  {
    id: "rockets-1",
    videoUrl: SAMPLE_VIDEOS[21], // rockets1.mp4
    poster: POSTERS[5],
    placeName: "Rockets Bryanston",
    category: "club",
    neighborhood: "Bryanston",
    city: "Sandton",
    lat: -26.0561,
    lng: 28.0246,
    vibeScore: 3,
    postedAt: minutesAgo(4),
    username: "@rockets_vip",
    caption: "Rockets Bryanston is absolutely firing tonight! 🚀🔥",
    likes: 5600,
    comments: 289,
    isLive: true,
    verificationStatus: "verified",
  },
  {
    id: "rockets-2",
    videoUrl: SAMPLE_VIDEOS[22], // rockets2.mp4
    poster: POSTERS[6],
    placeName: "Rockets Bryanston",
    category: "club",
    neighborhood: "Bryanston",
    city: "Sandton",
    lat: -26.0561,
    lng: 28.0246,
    vibeScore: 3,
    postedAt: minutesAgo(14),
    username: "@bryanston_elite",
    caption: "Champagne showers at Rockets 🥂",
    likes: 3200,
    comments: 145,
  },
  {
    id: "rockets-3",
    videoUrl: SAMPLE_VIDEOS[23], // rockets3.mp4
    poster: POSTERS[7],
    placeName: "Rockets Bryanston",
    category: "club",
    neighborhood: "Bryanston",
    city: "Sandton",
    lat: -26.0561,
    lng: 28.0246,
    vibeScore: 2,
    postedAt: minutesAgo(24),
    username: "@sandton_luxury",
    caption: "Contemporary dining + nightlife in one 🍽️",
    likes: 2100,
    comments: 88,
  },
  {
    id: "rockets-4",
    videoUrl: SAMPLE_VIDEOS[24], // rockets4.mp4
    poster: POSTERS[0],
    placeName: "Rockets Bryanston",
    category: "club",
    neighborhood: "Bryanston",
    city: "Sandton",
    lat: -26.0561,
    lng: 28.0246,
    vibeScore: 3,
    postedAt: minutesAgo(44),
    username: "@rockets_crew",
    caption: "Best Sunday session in Sandton 🌟",
    likes: 4800,
    comments: 123,
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

  // --- BOWLD RESTAURANT ---
  [slugify("Bowld Restaurant")]: {
    slug: slugify("Bowld Restaurant"),
    description:
      "Modern eatery focused on fresh, wholesome bowls and creative dishes. A chic, health-conscious dining destination on the 1st Floor of Masingita Towers in Morningside, Sandton.",
    address: "1st Floor, Masingita Towers, 15 West Road South, Morningside, Sandton, Johannesburg, 2196",
    phone: "+27 (11) 784-0000",
    priceRange: "$$$",
    rating: 4.6,
    reviewCount: 834,
    hours: makeHours("7am – 9pm", "8am – 10pm"),
    amenities: ["Healthy menu", "Vegan & vegetarian options", "Reservations", "Walk-ins", "Outdoor seating"],
    acceptsBookings: true,
    maxPartySize: 12,
    events: [
      {
        id: "bowld-e1",
        title: "Wellness Wednesday Lunch",
        date: "Wed, Apr 23",
        time: "12:00 PM",
        price: 0,
        spotsLeft: 30,
        cover: "https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?w=800&q=80&auto=format",
      },
    ],
    packages: [
      {
        id: "bowld-p1",
        title: "The Nourish Bowl Package",
        description: "2 signature nourish bowls + freshly squeezed juices for 2",
        originalPrice: 380,
        price: 280,
        tag: "Most popular",
      },
      {
        id: "bowld-p2",
        title: "Group Booking (6+)",
        description: "Reserved table + complimentary starter platter",
        originalPrice: 200,
        price: 0,
        tag: "Free for groups",
      },
    ],
  },

  // --- COPPERS BELAIR ---
  [slugify("Coppers Belair")]: {
    slug: slugify("Coppers Belair"),
    description:
      "A stylish cocktail bar and lounge on the 1st Floor of Bel Air Shopping Centre, Northriding. Well-known for its premium drinks menu and sophisticated evening atmosphere.",
    address: "1st Floor, Bel Air Shopping Centre, Bellairs Drive, Northriding, Johannesburg, 2153",
    phone: "+27 (11) 462-0000",
    priceRange: "$$$",
    rating: 4.5,
    reviewCount: 612,
    hours: makeHours("4pm – 12am", "2pm – 2am", [0, 1]),
    amenities: ["Premium cocktails", "Bottle service", "Dress code", "VIP seating", "Live music"],
    acceptsBookings: true,
    maxPartySize: 10,
    events: [
      {
        id: "coppers-e1",
        title: "Ladies Night",
        date: "Wed, Apr 23",
        time: "7:00 PM",
        price: 0,
        spotsLeft: 50,
        cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80&auto=format",
      },
    ],
    packages: [
      {
        id: "coppers-p1",
        title: "Cocktail Masterclass for 4",
        description: "Learn to shake 4 signature cocktails with our bartender",
        originalPrice: 800,
        price: 550,
        tag: "Most popular",
      },
      {
        id: "coppers-p2",
        title: "VIP Bottle & Mixers",
        description: "1 premium bottle + mixers + reserved lounge seating",
        originalPrice: 1200,
        price: 900,
      },
    ],
  },

  // --- D48 BAR & GRILL ---
  [slugify("D48 Bar & Grill")]: {
    slug: slugify("D48 Bar & Grill"),
    description:
      "A lively bar and grill on the Old Pretoria Road, Halfway House, Midrand. Known for its upbeat atmosphere, creative cocktails, and hearty meals — the go-to spot for after-work gatherings and late-night fun.",
    address: "561 James Crescent, Halfway House, Midrand, Johannesburg, 1685",
    phone: "+27 (11) 315-0048",
    priceRange: "$$",
    rating: 4.4,
    reviewCount: 1120,
    hours: makeHours("11am – 11pm", "11am – 2am"),
    amenities: ["Full bar", "Sports screens", "After-work specials", "DJ on weekends", "Outdoor terrace"],
    acceptsBookings: true,
    maxPartySize: 20,
    events: [
      {
        id: "d48-e1",
        title: "Friday After-Work Drinks",
        date: "Fri, Apr 25",
        time: "5:00 PM",
        price: 0,
        spotsLeft: 80,
        cover: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800&q=80&auto=format",
      },
      {
        id: "d48-e2",
        title: "Saturday DJ Night",
        date: "Sat, Apr 26",
        time: "9:00 PM",
        price: 100,
        spotsLeft: 120,
        cover: "https://images.unsplash.com/photo-1571266028243-d220bc11d49b?w=800&q=80&auto=format",
      },
    ],
    packages: [
      {
        id: "d48-p1",
        title: "The D48 Party Pack",
        description: "2 bottles of spirits + mixers + reserved table for 8",
        originalPrice: 1800,
        price: 1299,
        tag: "Best value",
      },
      {
        id: "d48-p2",
        title: "After-Work Special (2 for 1)",
        description: "2-for-1 cocktails Mon–Thu, 4pm–7pm",
        originalPrice: 200,
        price: 100,
        tag: "Weekdays only",
      },
    ],
  },

  // --- LA PARADA ---
  [slugify("La Parada")]: {
    slug: slugify("La Parada"),
    description:
      "Spanish-inspired tapas bar with vibrant décor at Bel Air Shopping Centre, Northriding. Serving small plates, creative cocktails, and offering a festive, social atmosphere.",
    address: "Bel Air Shopping Centre, Bellairs Drive, Northriding, Johannesburg",
    phone: "+27 (11) 462-9000",
    priceRange: "$$$",
    rating: 4.7,
    reviewCount: 978,
    hours: makeHours("11am – 11pm", "10am – 1am"),
    amenities: ["Tapas menu", "Spanish wines", "Cocktail bar", "Outdoor seating", "Walk-ins welcome"],
    acceptsBookings: true,
    maxPartySize: 16,
    events: [
      {
        id: "parada-e1",
        title: "Tapas & Wine Evening",
        date: "Thu, Apr 24",
        time: "6:30 PM",
        price: 250,
        spotsLeft: 35,
        cover: "https://images.unsplash.com/photo-1519214605650-76a613ee3245?w=800&q=80&auto=format",
      },
    ],
    packages: [
      {
        id: "parada-p1",
        title: "Tapas Feast for 4",
        description: "8 signature tapas plates + 1 pitcher of sangria",
        originalPrice: 900,
        price: 650,
        tag: "Most popular",
      },
      {
        id: "parada-p2",
        title: "Date Night Package",
        description: "3-course tapas tasting + house wine for 2",
        originalPrice: 600,
        price: 420,
        tag: "Romantic",
      },
    ],
  },

  // --- MOJA CAFÉ ---
  [slugify("Moja Café")]: {
    slug: slugify("Moja Café"),
    description:
      "A contemporary café and lounge at Chilli Lane Shopping Centre, Sunninghill. Combining urban culture with dining, live music, and social events — true Joburg soul.",
    address: "Chilli Lane Shopping Centre, Corner Rivonia Road & Leeuwkop Road, Sunninghill, Sandton, Johannesburg, 2196",
    phone: "+27 (11) 807-0000",
    priceRange: "$$",
    rating: 4.5,
    reviewCount: 743,
    hours: makeHours("8am – 10pm", "8am – 12am"),
    amenities: ["Live events", "DJ nights", "Outdoor seating", "Full menu", "Cocktail bar"],
    acceptsBookings: true,
    maxPartySize: 14,
    events: [
      {
        id: "moja-e1",
        title: "Sunday Jazz Brunch",
        date: "Sun, Apr 27",
        time: "11:00 AM",
        price: 180,
        spotsLeft: 40,
        cover: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80&auto=format",
      },
    ],
    packages: [
      {
        id: "moja-p1",
        title: "Moja Experience Package",
        description: "Welcome cocktail + 2-course meal + priority seating",
        originalPrice: 450,
        price: 320,
        tag: "Signature",
      },
    ],
  },

  // --- PHIRINYANE BY GEMELLI ---
  [slugify("Phirinyane by Gemelli")]: {
    slug: slugify("Phirinyane by Gemelli"),
    description:
      "Upscale dining experience blending Italian inspiration with South African flair, curated by the Gemelli team at Posthouse Link Centre, Bryanston. A sophisticated evening destination.",
    address: "Shop 13, Posthouse Link Centre, Corner Main & Posthouse Street, Bryanston, Sandton, Johannesburg",
    phone: "+27 (11) 706-0000",
    priceRange: "$$$",
    rating: 4.8,
    reviewCount: 521,
    hours: makeHours("12pm – 10pm", "12pm – 12am", [0]),
    amenities: ["Fine dining", "Italian wines", "Tasting menus", "Private dining", "Reservations required"],
    acceptsBookings: true,
    maxPartySize: 10,
    events: [
      {
        id: "phiri-e1",
        title: "Chef's Tasting Evening",
        date: "Fri, Apr 25",
        time: "7:00 PM",
        price: 650,
        spotsLeft: 20,
        cover: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80&auto=format",
      },
    ],
    packages: [
      {
        id: "phiri-p1",
        title: "Gemelli Signature Dinner",
        description: "5-course tasting menu + wine pairing for 2",
        originalPrice: 1800,
        price: 1300,
        tag: "Chef's favourite",
      },
      {
        id: "phiri-p2",
        title: "Aperitivo Hour",
        description: "Complimentary Aperol Spritz + bruschetta selection before your meal",
        originalPrice: 250,
        price: 0,
        tag: "Complimentary with booking",
      },
    ],
  },

  // --- ROCKETS BRYANSTON ---
  [slugify("Rockets Bryanston")]: {
    slug: slugify("Rockets Bryanston"),
    description:
      "Trendy restaurant and lounge at 86 Hobart Road, Hobart Centre, Bryanston. Offering contemporary dining, stylish interiors, and a vibrant nightlife scene — Sandton's premier destination.",
    address: "86 Hobart Road, Hobart Centre, Bryanston, Sandton, Johannesburg, 2191",
    phone: "+27 (11) 706-9000",
    priceRange: "$$$",
    rating: 4.7,
    reviewCount: 1842,
    hours: makeHours("11am – 11pm", "10am – 2am"),
    amenities: ["Contemporary menu", "Cocktail bar", "VIP lounge", "Live DJ", "Outdoor terrace", "21+"],
    acceptsBookings: true,
    maxPartySize: 14,
    events: [
      {
        id: "rockets-e1",
        title: "Friday Night Live DJ",
        date: "Fri, Apr 25",
        time: "9:00 PM",
        price: 150,
        spotsLeft: 60,
        cover: "https://images.unsplash.com/photo-1471679010831-6edbbd2e3a0e?w=800&q=80&auto=format",
      },
      {
        id: "rockets-e2",
        title: "Sunday Session",
        date: "Sun, Apr 27",
        time: "2:00 PM",
        price: 0,
        spotsLeft: 100,
        cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80&auto=format",
      },
    ],
    packages: [
      {
        id: "rockets-p1",
        title: "VIP Bottle Package",
        description: "2 premium spirits + mixers + reserved lounge booth for 6",
        originalPrice: 2500,
        price: 1800,
        tag: "Most popular",
      },
      {
        id: "rockets-p2",
        title: "Date Night at Rockets",
        description: "3-course dinner + welcome cocktails for 2",
        originalPrice: 900,
        price: 650,
        tag: "Romantic",
      },
    ],
  },
};

const DEFAULT_VENUE: Omit<VenueDetails, "slug"> = {
  description:
    "A standout spot worth checking out. Real-time vibes from people who actually showed up.",
  address: "Johannesburg, South Africa",
  phone: "+27 (11) 000-0000",
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
      originalPrice: 250,
      price: 180,
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
  return VIBE_POSTS
    .filter((p) => slugify(p.placeName) === slug)
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
