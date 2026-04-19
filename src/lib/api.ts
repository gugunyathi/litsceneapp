import { collection, getDocs, doc, setDoc, query, orderBy, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { VIBE_POSTS, VENUE_DETAILS, type VibePost, type VenueDetails } from "@/data/vibes";

// 1. Core Getters
export async function fetchAllPosts(): Promise<VibePost[]> {
  const q = query(collection(db, "posts"), orderBy("postedAt", "desc"));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    console.warn("Firestore is empty, falling back to local mocks");
    return VIBE_POSTS;
  }
  
  return snapshot.docs.map(d => d.data() as VibePost);
}

export async function fetchVenueDetails(slug: string): Promise<VenueDetails | null> {
  const ref = doc(db, "venues", slug);
  const snap = await getDoc(ref);
  
  if (!snap.exists()) {
    // fallback logic
    return VENUE_DETAILS[slug] || null;
  }
  
  return snap.data() as VenueDetails;
}

// 2. Initial Seeding Function (Run this once to populate your new database)
export async function seedDatabase() {
  try {
    console.log("Seeding posts...");
    for (const post of VIBE_POSTS) {
      await setDoc(doc(db, "posts", post.id), post);
    }
    
    console.log("Seeding venues...");
    for (const slug of Object.keys(VENUE_DETAILS)) {
      await setDoc(doc(db, "venues", slug), VENUE_DETAILS[slug]);
    }
    
    console.log("Database seeded successfully!");
    return { success: true, message: "Database seeded successfully!" };
  } catch (error) {
    console.error("Error seeding database:", error);
    return { success: false, error };
  }
}

// Expose globally for easy initialization
if (typeof window !== "undefined") {
  (window as any)._seedFirebaseDb = seedDatabase;
}
