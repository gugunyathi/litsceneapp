/**
 * usePlacesAutocomplete
 *
 * Loads the Google Maps JS SDK (Places library) once, then exposes
 * a debounced `fetchSuggestions` function and the resulting list.
 *
 * Uses the same Firebase/GCP apiKey that's already in firebase-applet-config.json.
 */

import { useState, useCallback, useRef } from "react";
import firebaseConfig from "../../firebase-applet-config.json";

export interface PlaceSuggestion {
  placeId: string;
  mainText: string;       // e.g. "Neon Beach Club"
  secondaryText: string;  // e.g. "Ocean Drive, Miami Beach, FL, USA"
  lat?: number;
  lng?: number;
  neighborhood?: string;
  city?: string;
}

// ─── SDK Loader ────────────────────────────────────────────────────────────────

let sdkPromise: Promise<void> | null = null;

function loadGoogleMapsSDK(): Promise<void> {
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined") return resolve();

    if (window.google?.maps?.places) return resolve();

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${firebaseConfig.apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps SDK"));
    document.head.appendChild(script);
  });

  return sdkPromise;
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function usePlacesAutocomplete() {
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const serviceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ensureService = async () => {
    await loadGoogleMapsSDK();
    if (!serviceRef.current) {
      serviceRef.current = new google.maps.places.AutocompleteService();
    }
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
    }
  };

  const fetchSuggestions = useCallback((query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        await ensureService();

        serviceRef.current!.getPlacePredictions(
          {
            input: query,
            sessionToken: sessionTokenRef.current!,
            types: ["establishment", "geocode"],
          },
          (predictions, status) => {
            if (
              status !== google.maps.places.PlacesServiceStatus.OK ||
              !predictions
            ) {
              setSuggestions([]);
              setIsLoading(false);
              return;
            }

            setSuggestions(
              predictions.map((p) => ({
                placeId: p.place_id,
                mainText: p.structured_formatting.main_text,
                secondaryText: p.structured_formatting.secondary_text ?? "",
              }))
            );
            setIsLoading(false);
          }
        );
      } catch {
        setSuggestions([]);
        setIsLoading(false);
      }
    }, 250);
  }, []);

  /** Resolve full details (lat/lng, address components) for a chosen prediction */
  const resolvePlaceDetails = useCallback(
    async (placeId: string): Promise<PlaceSuggestion | null> => {
      try {
        await ensureService();

        return new Promise((resolve) => {
          // PlacesService needs a DOM node (hidden div is fine)
          const div = document.createElement("div");
          const placesService = new google.maps.places.PlacesService(div);

          placesService.getDetails(
            {
              placeId,
              fields: ["name", "geometry", "address_components", "formatted_address"],
              sessionToken: sessionTokenRef.current!,
            },
            (place, status) => {
              // Refresh session token after a billable call
              sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();

              if (status !== google.maps.places.PlacesServiceStatus.OK || !place) {
                resolve(null);
                return;
              }

              const components = place.address_components ?? [];

              const getComponent = (type: string) =>
                components.find((c) => c.types.includes(type))?.long_name ?? "";

              const neighborhood =
                getComponent("neighborhood") ||
                getComponent("sublocality_level_1") ||
                getComponent("sublocality");

              const city =
                getComponent("locality") ||
                getComponent("administrative_area_level_2");

              resolve({
                placeId,
                mainText: place.name ?? "",
                secondaryText: place.formatted_address ?? "",
                lat: place.geometry?.location?.lat(),
                lng: place.geometry?.location?.lng(),
                neighborhood,
                city,
              });
            }
          );
        });
      } catch {
        return null;
      }
    },
    []
  );

  const clearSuggestions = useCallback(() => setSuggestions([]), []);

  return { suggestions, isLoading, fetchSuggestions, resolvePlaceDetails, clearSuggestions };
}
