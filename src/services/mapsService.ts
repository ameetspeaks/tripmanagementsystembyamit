import { loadGoogleMaps } from "@/lib/googleMapsLoader";

export async function geocodeAddress(address: string) {
  const google = await loadGoogleMaps();
  const geocoder = new google.maps.Geocoder();
  return new Promise<{ formattedAddress: string; latitude: number; longitude: number; components: any[] }>((resolve, reject) => {
    geocoder.geocode({ address }, (results, status) => {
      if (status !== "OK" || !results || !results.length) {
        reject(new Error("No geocode results"));
        return;
      }
      const r = results[0];
      const loc = r.geometry.location;
      resolve({
        formattedAddress: r.formatted_address as string,
        latitude: loc.lat(),
        longitude: loc.lng(),
        components: r.address_components as any[],
      });
    });
  });
}

export async function directions(from: { lat: number; lng: number }, to: { lat: number; lng: number }, mode: "driving" | "transit" = "driving", transitMode: "bus" | "rail" | "subway" | "train" | undefined = undefined) {
  const google = await loadGoogleMaps();
  const service = new google.maps.DirectionsService();
  const request: google.maps.DirectionsRequest = {
    origin: new google.maps.LatLng(from.lat, from.lng),
    destination: new google.maps.LatLng(to.lat, to.lng),
    travelMode: mode === "transit" ? google.maps.TravelMode.TRANSIT : google.maps.TravelMode.DRIVING,
  };
  return new Promise<{ distanceMeters?: number; durationSeconds?: number; polyline?: string; raw: any }>((resolve, reject) => {
    service.route(request, (result, status) => {
      if (status !== "OK" || !result || !result.routes?.length) {
        reject(new Error("No directions results"));
        return;
      }
      const route = result.routes[0];
      const legs = route.legs?.[0];
      const polyline = route.overview_polyline?.getPath ? undefined : (route.overview_polyline as any)?.encodedPath;
      resolve({
        distanceMeters: legs?.distance?.value,
        durationSeconds: legs?.duration?.value,
        polyline,
        raw: result,
      });
    });
  });
}

type PlacesAutocompleteOptions = {
  country?: string;
  types?: string[];
  sessionToken?: google.maps.places.AutocompleteSessionToken;
};

export async function placesAutocomplete(input: string, options?: PlacesAutocompleteOptions) {
  const google = await loadGoogleMaps();
  const service = new google.maps.places.AutocompleteService();
  return new Promise<{ description: string; placeId: string }[]>((resolve) => {
    const req: google.maps.places.AutocompletionRequest = { input } as any;
    if (options?.country) (req as any).componentRestrictions = { country: options.country } as any;
    if (options?.types) (req as any).types = options.types as any;
    if (options?.sessionToken) (req as any).sessionToken = options.sessionToken;
    service.getPlacePredictions(req, (predictions) => {
      const list = (predictions || []).map((p) => ({ description: p.description, placeId: p.place_id as string }));
      resolve(list);
    });
  });
}

export async function placeDetails(placeId: string) {
  const google = await loadGoogleMaps();
  const el = document.createElement("div");
  const service = new google.maps.places.PlacesService(el);
  return new Promise<{ formattedAddress?: string; latitude?: number; longitude?: number }>((resolve, reject) => {
    service.getDetails({ placeId, fields: ["geometry", "formatted_address"] }, (place, status) => {
      if (status !== "OK" || !place) {
        reject(new Error("Place details failed"));
        return;
      }
      const loc = place.geometry?.location;
      resolve({
        formattedAddress: place.formatted_address,
        latitude: loc?.lat(),
        longitude: loc?.lng(),
      });
    });
  });
}
