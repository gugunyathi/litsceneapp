import { useEffect, useState } from "react";
import { type VibePost, type Category, distanceKm } from "@/data/vibes";

export interface UserLocation {
  lat: number;
  lng: number;
}

export function useVibeAlgorithm(posts: VibePost[]) {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [preferences, setPreferences] = useState<Record<string, number>>({});

  // 1. Always get user's real-time location (IP region fallback + Precise GPS)
  useEffect(() => {
    let exactGranted = false;

    // A. Fetch rough region instantly via IP
    fetch("https://get.geojs.io/v1/ip/geo.json")
      .then((res) => res.json())
      .then((data) => {
        if (!exactGranted && data.latitude && data.longitude) {
          setLocation({ lat: parseFloat(data.latitude), lng: parseFloat(data.longitude) });
        }
      })
      .catch(() => {});

    // B. Re-align with precise hardware GPS if authorized
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          exactGranted = true;
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => console.warn("Location permission denied", err),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // 2. Remember user's structured likes & history
  useEffect(() => {
    try {
      const saved = localStorage.getItem("vibe_prefs");
      if (saved) setPreferences(JSON.parse(saved));
    } catch {}
  }, []);

  // 3. The "For You" Feed Sorting Algorithm
  const sortForYou = (filtered: VibePost[]) => {
    const currentHour = new Date().getHours();
    
    // Time of day relevance map -> boosts matching categories based on user's timezone
    const timeRelevance: Record<string, number> = {};
    if (currentHour >= 5 && currentHour < 12) {
      // Morning
      timeRelevance["restaurant"] = 2; // brunch/coffee
      timeRelevance["beach"] = 1;
    } else if (currentHour >= 12 && currentHour < 17) {
      // Afternoon
      timeRelevance["beach"] = 2;
      timeRelevance["restaurant"] = 1;
      timeRelevance["event"] = 1;
    } else if (currentHour >= 17 && currentHour < 21) {
      // Evening
      timeRelevance["rooftop"] = 3;
      timeRelevance["restaurant"] = 2;
      timeRelevance["event"] = 1;
    } else {
      // Night (21 -> 5)
      timeRelevance["club"] = 3;
      timeRelevance["event"] = 2;
      timeRelevance["rooftop"] = 1;
    }

    return [...filtered].sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // Base metric: freshness (older posts degrade)
      const freshA = (Date.now() - new Date(a.postedAt).getTime()) / 60000; // mins
      const freshB = (Date.now() - new Date(b.postedAt).getTime()) / 60000;
      scoreA -= freshA * 0.1; 
      scoreB -= freshB * 0.1;

      // Metric: Location Proximity
      if (location) {
        const distA = distanceKm(location, { lat: a.lat, lng: a.lng });
        const distB = distanceKm(location, { lat: b.lat, lng: b.lng });
        // The closer, the higher the score (e.g., -1 point per km away)
        scoreA += (100 - distA) * 0.5;
        scoreB += (100 - distB) * 0.5;
      }

      // Metric: User History (Likes)
      const prefA = preferences[a.category] || 0;
      const prefB = preferences[b.category] || 0;
      scoreA += prefA * 5; 
      scoreB += prefB * 5;

      // Metric: Time of day relevance
      scoreA += (timeRelevance[a.category] || 0) * 10;
      scoreB += (timeRelevance[b.category] || 0) * 10;

      // Highest score first
      return scoreB - scoreA;
    });
  };

  return { location, sortForYou };
}

export function trackVibeInteraction(category: Category) {
  try {
    const saved = localStorage.getItem("vibe_prefs");
    const prefs = saved ? JSON.parse(saved) : {};
    prefs[category] = (prefs[category] || 0) + 1;
    localStorage.setItem("vibe_prefs", JSON.stringify(prefs));
  } catch (err) {
    console.warn("Could not save preference:", err);
  }
}

