// Sponsored promo posts for the feed.

export interface PromoPost {
  id: string;
  brand: string;
  brandLogo?: string;
  poster: string;
  videoUrl?: string;
  headline: string;
  subline: string;
  ctaLabel: string;
  ctaHref: string;
  badgeColor?: "coral" | "magenta" | "gold";
  // For interleaving in the feed
  insertAfterIndex: number;
  category: string;
}

export const PROMO_POSTS: PromoPost[] = [
  {
    id: "promo-1",
    brand: "DON JULIO 1942",
    poster: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80&auto=format",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    headline: "Bottle on us. Tonight only.",
    subline: "Buy any 2 cocktails at Neon Beach Club, get a 1942 shot free.",
    ctaLabel: "Claim offer",
    ctaHref: "/place/neon-beach-club",
    badgeColor: "gold",
    insertAfterIndex: 1,
    category: "drinks",
  },
  {
    id: "promo-2",
    brand: "UBER",
    poster: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80&auto=format",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    headline: "$15 off your ride home",
    subline: "VibeCheck users only. Use code VIBES15 after 11pm.",
    ctaLabel: "Get the code",
    ctaHref: "/profile",
    badgeColor: "coral",
    insertAfterIndex: 4,
    category: "ride",
  },
  {
    id: "promo-3",
    brand: "RED BULL FESTIVAL",
    poster: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80&auto=format",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    headline: "Skyline Fest · Early bird ends Friday",
    subline: "3 stages. 24 DJs. Get tickets before they jump to $89.",
    ctaLabel: "Tickets · $59",
    ctaHref: "/place/skyline-festival",
    badgeColor: "magenta",
    insertAfterIndex: 6,
    category: "event",
  },
];
