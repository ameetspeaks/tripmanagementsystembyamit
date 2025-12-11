import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface TripMapProps {
  origin: { lat: number; lng: number; name: string };
  destination: { lat: number; lng: number; name: string };
  currentPosition?: { lat: number; lng: number };
  waypoints?: { lat: number; lng: number; name: string; status: "completed" | "current" | "pending" }[];
}

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const TripMap = ({ origin, destination, currentPosition, waypoints = [] }: TripMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map centered on India
    const map = L.map(mapRef.current, {
      center: [22.5937, 78.9629], // Center of India
      zoom: 5,
      zoomControl: true,
    });

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Clear existing layers except tile layer
    map.eachLayer((layer) => {
      if (!(layer instanceof L.TileLayer)) {
        map.removeLayer(layer);
      }
    });

    // Create custom icons
    const originIcon = L.divIcon({
      className: "custom-marker",
      html: `<div style="background: hsl(25, 95%, 53%); width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
        <span style="color: white; font-weight: bold; font-size: 12px;">O</span>
      </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const destinationIcon = L.divIcon({
      className: "custom-marker",
      html: `<div style="background: hsl(0, 84%, 60%); width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
        <span style="color: white; font-weight: bold; font-size: 12px;">D</span>
      </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const truckIcon = L.divIcon({
      className: "custom-marker",
      html: `<div style="background: hsl(25, 95%, 53%); width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 12px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
          <path d="M15 18H9"/>
          <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
          <circle cx="17" cy="18" r="2"/>
          <circle cx="7" cy="18" r="2"/>
        </svg>
      </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    // Add origin marker
    L.marker([origin.lat, origin.lng], { icon: originIcon })
      .addTo(map)
      .bindPopup(`<strong>Origin</strong><br/>${origin.name}`);

    // Add destination marker
    L.marker([destination.lat, destination.lng], { icon: destinationIcon })
      .addTo(map)
      .bindPopup(`<strong>Destination</strong><br/>${destination.name}`);

    // Add waypoint markers
    waypoints.forEach((wp, index) => {
      const wpIcon = L.divIcon({
        className: "custom-marker",
        html: `<div style="background: ${wp.status === "completed" ? "hsl(25, 95%, 53%)" : wp.status === "current" ? "hsl(45, 93%, 47%)" : "hsl(240, 5%, 64%)"}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
          <span style="color: white; font-weight: bold; font-size: 10px;">${index + 1}</span>
        </div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      L.marker([wp.lat, wp.lng], { icon: wpIcon })
        .addTo(map)
        .bindPopup(`<strong>Waypoint ${index + 1}</strong><br/>${wp.name}<br/><em>${wp.status}</em>`);
    });

    // Add current position (truck)
    if (currentPosition) {
      L.marker([currentPosition.lat, currentPosition.lng], { icon: truckIcon })
        .addTo(map)
        .bindPopup("<strong>Current Location</strong>");
    }

    // Draw route line
    const routePoints: L.LatLngExpression[] = [
      [origin.lat, origin.lng],
      ...waypoints.map((wp) => [wp.lat, wp.lng] as L.LatLngExpression),
      [destination.lat, destination.lng],
    ];

    // Completed route (solid line)
    const completedIndex = waypoints.findIndex((wp) => wp.status !== "completed");
    const completedPoints = routePoints.slice(0, completedIndex === -1 ? routePoints.length : completedIndex + 1);
    
    if (completedPoints.length > 1) {
      L.polyline(completedPoints, {
        color: "hsl(25, 95%, 53%)",
        weight: 4,
        opacity: 1,
      }).addTo(map);
    }

    // Remaining route (dashed line)
    const remainingPoints = routePoints.slice(completedIndex === -1 ? routePoints.length - 1 : completedIndex);
    if (remainingPoints.length > 1) {
      L.polyline(remainingPoints, {
        color: "hsl(240, 5%, 64%)",
        weight: 3,
        opacity: 0.6,
        dashArray: "10, 10",
      }).addTo(map);
    }

    // Fit bounds to show all points
    const bounds = L.latLngBounds(routePoints);
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [origin, destination, currentPosition, waypoints]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full min-h-[300px] rounded-lg"
      style={{ zIndex: 0 }}
    />
  );
};

export default TripMap;