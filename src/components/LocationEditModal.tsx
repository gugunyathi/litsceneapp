import { useState, useEffect } from "react";
import { X, MapPin, Search, Loader } from "lucide-react";
import { motion } from "framer-motion";
import { type VibePost } from "@/data/vibes";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

interface LocationEditModalProps {
  post: VibePost;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (updatedPost: VibePost) => void;
}

export function LocationEditModal({
  post,
  isOpen,
  onClose,
  onSave,
}: LocationEditModalProps) {
  const [placeName, setPlaceName] = useState(post.placeName);
  const [neighborhood, setNeighborhood] = useState(post.neighborhood);
  const [city, setCity] = useState(post.city);
  const [lat, setLat] = useState(post.lat);
  const [lng, setLng] = useState(post.lng);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<
    Array<{ name: string; address: string; lat: number; lng: number }>
  >([]);
  const [searching, setSearching] = useState(false);

  // Search for locations using Nominatim (free geocoding)
  const handleAddressSearch = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await response.json();
      setSuggestions(
        data.map((item: any) => ({
          name: item.name,
          address: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
        }))
      );
    } catch (error) {
      console.error("Error searching locations", error);
      toast.error("Failed to search locations");
    } finally {
      setSearching(false);
    }
  };

  const handleSuggestionSelect = (suggestion: (typeof suggestions)[0]) => {
    setPlaceName(suggestion.name);
    setCity(suggestion.address.split(",").pop()?.trim() || city);
    setLat(suggestion.lat);
    setLng(suggestion.lng);
    setSuggestions([]);
    setSearchQuery("");
  };

  const handleSave = async () => {
    if (!placeName.trim() || !neighborhood.trim() || !city.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSaving(true);
    try {
      const postRef = doc(db, "posts", post.id);
      const updates = {
        placeName,
        neighborhood,
        city,
        lat,
        lng,
        updatedAt: new Date(),
      };
      await updateDoc(postRef, updates);
      toast.success("Location updated successfully!");
      const updatedPost: VibePost = {
        ...post,
        ...updates,
      };
      onSave?.(updatedPost);
      onClose();
    } catch (error) {
      console.error("Error saving location", error);
      toast.error("Failed to save location");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
      />
      <motion.div
        initial={{ y: 200, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 200, opacity: 0 }}
        className="relative w-full max-w-sm rounded-2xl glass-dark border border-border/40 p-5 shadow-soft z-10 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-black text-xl">Edit Location</h3>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-foreground/10 text-foreground/80 active:scale-95 transition-transform"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Address Search */}
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-foreground/70">
              Search Address
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleAddressSearch(e.target.value);
                }}
                placeholder="Search for a place..."
                className="w-full bg-background/50 border border-border/40 rounded-xl px-10 py-3 text-sm focus:outline-none focus:border-primary/50"
              />
              {searching && (
                <Loader className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-primary" />
              )}
            </div>
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border/40 rounded-xl shadow-lg z-20 max-h-40 overflow-y-auto">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionSelect(s)}
                    className="w-full text-left p-3 hover:bg-foreground/10 border-b border-border/20 last:border-0 transition-colors"
                  >
                    <p className="text-sm font-semibold">{s.name}</p>
                    <p className="text-[11px] text-foreground/60 truncate">{s.address}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Place Name */}
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-foreground/70">
              Place Name
            </label>
            <input
              type="text"
              value={placeName}
              onChange={(e) => setPlaceName(e.target.value)}
              className="w-full bg-background/50 border border-border/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
              placeholder="e.g., Neon Beach Club"
            />
          </div>

          {/* Neighborhood */}
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-foreground/70">
              Neighborhood
            </label>
            <input
              type="text"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              className="w-full bg-background/50 border border-border/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
              placeholder="e.g., South Beach"
            />
          </div>

          {/* City */}
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-foreground/70">
              City
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-background/50 border border-border/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
              placeholder="e.g., Miami"
            />
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-foreground/70">
                Latitude
              </label>
              <input
                type="number"
                value={lat}
                onChange={(e) => setLat(parseFloat(e.target.value))}
                step="0.0001"
                className="w-full bg-background/50 border border-border/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-foreground/70">
                Longitude
              </label>
              <input
                type="number"
                value={lng}
                onChange={(e) => setLng(parseFloat(e.target.value))}
                step="0.0001"
                className="w-full bg-background/50 border border-border/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>

          {/* Map Preview */}
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-foreground/70">
              Map Preview
            </p>
            <div className="w-full h-32 rounded-xl bg-foreground/5 border border-border/40 flex items-center justify-center">
              <a
                href={`https://maps.google.com/?q=${lat},${lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline text-sm"
              >
                <MapPin className="h-4 w-4" />
                Open in Google Maps
              </a>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <button
              onClick={onClose}
              className="flex-1 glass text-xs font-bold py-3 rounded-xl active:scale-95 transition-transform"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 bg-gradient-sunset text-xs font-bold py-3 rounded-xl text-primary-foreground active:scale-95 transition-transform disabled:opacity-50 shadow-glow-coral"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
