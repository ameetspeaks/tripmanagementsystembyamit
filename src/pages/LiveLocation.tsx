import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import TripMap from "@/components/maps/TripMap";
import { MapPin, Truck, Clock, Navigation } from "lucide-react";

interface Trip {
  id: string;
  tripId: string;
  origin: string;
  destination: string;
  vehicle: string;
  driver: string;
  status: string;
  currentLat: number;
  currentLng: number;
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
  lastUpdate: string;
  speed: string;
  eta: string;
}

const mockTrips: Trip[] = [
  {
    id: "1",
    tripId: "TRP001",
    origin: "Mumbai Hub",
    destination: "Delhi Warehouse",
    vehicle: "MH12AB1234",
    driver: "Ramesh Kumar",
    status: "In Transit",
    currentLat: 21.1458,
    currentLng: 79.0882,
    originLat: 19.076,
    originLng: 72.8777,
    destLat: 28.7041,
    destLng: 77.1025,
    lastUpdate: "2 mins ago",
    speed: "65 km/h",
    eta: "8 hours",
  },
  {
    id: "2",
    tripId: "TRP002",
    origin: "Chennai Depot",
    destination: "Bangalore Center",
    vehicle: "TN07EF9012",
    driver: "Suresh Yadav",
    status: "In Transit",
    currentLat: 12.8,
    currentLng: 77.9,
    originLat: 13.0827,
    originLng: 80.2707,
    destLat: 12.9716,
    destLng: 77.5946,
    lastUpdate: "1 min ago",
    speed: "72 km/h",
    eta: "45 mins",
  },
  {
    id: "3",
    tripId: "TRP003",
    origin: "Hyderabad Point",
    destination: "Chennai Depot",
    vehicle: "TS08GH3456",
    driver: "Mahesh Singh",
    status: "In Transit",
    currentLat: 14.5,
    currentLng: 78.8,
    originLat: 17.385,
    originLng: 78.4867,
    destLat: 13.0827,
    destLng: 80.2707,
    lastUpdate: "5 mins ago",
    speed: "58 km/h",
    eta: "4 hours",
  },
];

const getStatusVariant = (status: string) => {
  switch (status) {
    case "In Transit": return "secondary";
    case "Delayed": return "destructive";
    default: return "outline";
  }
};

const LiveLocation = () => {
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  const handleTripSelect = (tripId: string) => {
    const trip = mockTrips.find((t) => t.id === tripId);
    setSelectedTrip(trip || null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Live Location Tracking</h1>
          <p className="text-muted-foreground">Select a trip to view real-time location</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trip Selection */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Trip</CardTitle>
              </CardHeader>
              <CardContent>
                <Select onValueChange={handleTripSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a trip to track" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockTrips.map((trip) => (
                      <SelectItem key={trip.id} value={trip.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{trip.tripId}</span>
                          <span className="text-muted-foreground">- {trip.vehicle}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {selectedTrip && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-lg">
                      <span>Trip Details</span>
                      <Badge variant={getStatusVariant(selectedTrip.status)}>
                        {selectedTrip.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Origin</p>
                        <p className="font-medium">{selectedTrip.origin}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-destructive" />
                      <div>
                        <p className="text-sm text-muted-foreground">Destination</p>
                        <p className="font-medium">{selectedTrip.destination}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Truck className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Vehicle</p>
                        <p className="font-medium">{selectedTrip.vehicle}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Live Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Navigation className="w-4 h-4 text-primary animate-pulse" />
                      <div>
                        <p className="text-sm text-muted-foreground">Current Speed</p>
                        <p className="font-medium">{selectedTrip.speed}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">ETA</p>
                        <p className="font-medium">{selectedTrip.eta}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <div>
                        <p className="text-sm text-muted-foreground">Last Update</p>
                        <p className="font-medium">{selectedTrip.lastUpdate}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Map */}
          <div className="lg:col-span-2">
            <Card className="h-[600px]">
              <CardHeader className="pb-0">
                <CardTitle className="text-lg">
                  {selectedTrip ? `Tracking: ${selectedTrip.tripId}` : "Select a trip to view location"}
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[calc(100%-60px)] pt-4">
                {selectedTrip ? (
                  <TripMap
                    origin={{
                      lat: selectedTrip.originLat,
                      lng: selectedTrip.originLng,
                      name: selectedTrip.origin,
                    }}
                    destination={{
                      lat: selectedTrip.destLat,
                      lng: selectedTrip.destLng,
                      name: selectedTrip.destination,
                    }}
                    currentPosition={{
                      lat: selectedTrip.currentLat,
                      lng: selectedTrip.currentLng,
                    }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center bg-muted/50 rounded-lg">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
                      <p className="text-muted-foreground">Select a trip to view live location on map</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LiveLocation;
