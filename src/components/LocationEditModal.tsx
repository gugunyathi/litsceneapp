import { useState, useRef } from "react";
import { X, MapPin, Search, Loader } from "lucide-react";
import { motion } from "framer-motion";
import { type VibePost } from "@/data/vibes";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { usePlacesAutocomplete } from "@/hooks/usePlacesAutocomplete";

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

  // ── search bar autocomplete ────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const searchAC = usePlacesAutocomplete();

  // ── place-name field autocomplete ─────────────────────────────────────────
  const [placeNameFocused, setPlaceNameFocused] = useState(false);
  const placeNameAC = usePlacesAutocomplete();

  const containerRef = useRef<HTMLDivElement>(null);

  // ─────────────────────────────────────────────────────────────────────────
  async function applyPlace(placeId: string, mainText: string, source: "search" | "placeName") {
    const detail = await (source === "search"
      ? searchAC.resolvePlaceDetails(placeId)
      : placeNameAC.resolvePlaceDetails(placeId));

    if (!detail) {
      toast.error("Could not fetch place details. Please fill in manually.");
      return;
    }

    setPlaceName(detail.mainText || mainText);
    if (detail.neighborhood) setNeighborhood(detail.neighborhood);
    if (detail.city) setCity(detail.city);
    if (detail.lat !== undefined) setLat(detail.lat);
    if (detail.lng !== undefined) setLng(detail.lng);

    // clear both dropdowns
    searchAC.clearSuggestions();
    placeNameAC.clearSuggestions();
    setSearchQuery("");
  }

  // ─────────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!placeName.trim() || !neighborhood.trim() || !city.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSaving(true);
    try {
      const postRef = doc(db, "posts", post.id);
      const updates = { placeName, neighborhood, city, lat, lng, updatedAt: new Date() };
      await updateDoc(postRef, updates);
      toast.success("Location updated successfully!");
      onSave?.({ ...post, ...updates });
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
      {/* backdrop */}
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
        ref={containerRef}
        className="relative w-full max-w-sm rounded-2xl glass-dark border border-border/40 p-5 shadow-soft z-10 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
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

          {/* ── Search / Lookup ─────────────────────────────────────────── */}
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-foreground/70">
              Search Address or Place
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/50 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  searchAC.fetchSuggestions(e.target.value);
                }}
                placeholder="Search Google Maps…"
                autoComplete="off"
                className="w-full bg-background/50 border border-border/40 rounded-xl px-10 py-3 text-sm focus:outline-none focus:border-primary/50"
              />
              {searchAC.isLoading && (
                <Loader className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-primary" />
              )}

              {/* Search suggestions dropdown */}
              {searchAC.suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border/40 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto">
                  {searchAC.suggestions.map((s) => (
                    <button
                      key={s.placeId}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => applyPlace(s.placeId, s.mainText, "search")}
                      className="w-full text-left px-3 py-2.5 hover:bg-foreground/10 border-b border-border/20 last:border-0 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <MapPin className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{s.mainText}</p>
                          <p className="text-[11px] text-foreground/60 truncate">{s.secondaryText}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="mt-1.5 text-[10px] text-foreground/40">
              Powered by Google Maps · selecting auto-fills all fields below
            </p>
          </div>

          {/* ── Place Name ──────────────────────────────────────────────── */}
          <div className="relative">
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-foreground/70">
              Place Name
            </label>
            <input
              type="text"
              value={placeName}
              autoComplete="off"
              onChange={(e) => {
                setPlaceName(e.target.value);
                placeNameAC.fetchSuggestions(e.target.value);
              }}
              onFocus={() => setPlaceNameFocused(true)}
              onBlur={() => setTimeout(() => setPlaceNameFocused(false), 150)}
              className="w-full bg-background/50 border border-border/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
              placeholder="e.g., Neon Beach Club"
            />

            {/* Place Name suggestions dropdown */}
            {placeNameFocused && placeNameAC.suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border/40 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto">
                {placeNameAC.suggestions.map((s) => (
                  <button
                    key={s.placeId}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => applyPlace(s.placeId, s.mainText, "placeName")}
                    className="w-full text-left px-3 py-2.5 hover:bg-foreground/10 border-b border-border/20 last:border-0 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <MapPin className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{s.mainText}</p>
                        <p className="text-[11px] text-foreground/60 truncate">{s.secondaryText}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Neighborhood ────────────────────────────────────────────── */}
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

          {/* ── City ────────────────────────────────────────────────────── */}
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

          {/* ── Coordinates ─────────────────────────────────────────────── */}
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

          {/* ── Map Preview ─────────────────────────────────────────────── */}
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

          {/* ── Actions ─────────────────────────────────────────────────── */}
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
              {isSaving ? "Saving…" : "Save Changes"}
            </button>
          </div>

        </div>
      </motion.div>
    </motion.div>
  );
}
