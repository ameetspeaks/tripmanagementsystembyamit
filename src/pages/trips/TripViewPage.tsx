import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MapPin, AlertTriangle, Info, CheckCircle, Phone, Truck } from "lucide-react";
import TripMap from "@/components/maps/TripMap";

// Mock trip data
const mockTripDetails = {
  "1": {
    tripId: "TRK-007-2024",
    status: "In Progress",
    distanceLeft: "125 km",
    origin: { lat: 28.6139, lng: 77.2090, name: "Warehouse A, Delhi" },
    destination: { lat: 26.9124, lng: 75.7873, name: "Client B, Jaipur" },
    currentPosition: { lat: 27.8974, lng: 76.5168 },
    waypoints: [
      { lat: 28.4595, lng: 77.0266, name: "Gurugram City Limits", status: "completed" as const },
      { lat: 28.2636, lng: 76.6561, name: "Dharuhera Checkpoint", status: "completed" as const },
      { lat: 27.8974, lng: 76.5168, name: "Behror Toll Plaza", status: "current" as const },
    ],
    vehicle: "DL1C B2345",
    transporter: "Global Logistics Inc.",
    driverName: "Rajesh Kumar",
    driverPhone: "+91-9876543210",
    simTracked: true,
    highConsent: true,
    alerts: [
      { type: "critical", title: "Route Deviation", description: "Vehicle deviated from planned route by 5 km near Rewari. Investigation initiated." },
      { type: "warning", title: "Tracking Interrupted", description: "GPS signal lost for 15 minutes near Dharuhera, re-established." },
      { type: "info", title: "Unexpected Stop", description: "Vehicle stopped for 30 minutes at unauthorized location (NH48 Service Road)." },
    ],
    timeline: [
      { time: "09:00 AM", event: "Origin Departure: Warehouse A, Delhi", status: "completed" },
      { time: "09:45 AM", event: "Waypoint Reached: Gurugram City Limits", status: "completed", note: "On Schedule" },
      { time: "11:30 AM", event: "Waypoint Reached: Dharuhera Checkpoint", status: "completed", note: "On Schedule" },
      { time: "01:45 PM", event: "Waypoint Reached: Behror Toll Plaza", status: "delayed", note: "Delayed by 15 min" },
      { time: "03:30 PM (ETA)", event: "Destination Arrival: Client B, Jaipur", status: "pending" },
    ],
  },
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "In Progress": return "bg-primary text-primary-foreground";
    case "Completed": return "bg-green-500 text-white";
    case "Delayed": return "bg-destructive text-destructive-foreground";
    default: return "bg-muted text-muted-foreground";
  }
};

const getAlertStyle = (type: string) => {
  switch (type) {
    case "critical": return { bg: "bg-destructive/10", border: "border-destructive", badge: "bg-destructive text-destructive-foreground", icon: AlertTriangle };
    case "warning": return { bg: "bg-yellow-500/10", border: "border-yellow-500", badge: "bg-yellow-500 text-white", icon: AlertTriangle };
    case "info": return { bg: "bg-muted", border: "border-muted-foreground/20", badge: "bg-muted-foreground text-white", icon: Info };
    default: return { bg: "bg-muted", border: "border-muted-foreground/20", badge: "bg-muted-foreground text-white", icon: Info };
  }
};

const getTimelineColor = (status: string) => {
  switch (status) {
    case "completed": return "bg-primary";
    case "delayed": return "bg-destructive";
    case "pending": return "bg-muted-foreground/30";
    default: return "bg-muted-foreground/30";
  }
};

const TripViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const trip = mockTripDetails["1"]; // Using mock data

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/trips")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-bold">Live Trip Tracking</h1>
          <Badge className={getStatusColor(trip.status)}>{trip.status}</Badge>
        </div>

        {/* Map Section */}
        <Card className="overflow-hidden">
          <div className="h-80">
            <TripMap
              origin={trip.origin}
              destination={trip.destination}
              currentPosition={trip.currentPosition}
              waypoints={trip.waypoints}
            />
          </div>
          
          {/* Origin/Destination labels overlay */}
          <div className="p-4 bg-card border-t flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Origin</p>
                <p className="font-semibold text-sm">{trip.origin.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary animate-pulse" />
              <span className="text-sm font-medium">{trip.distanceLeft} remaining</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Destination</p>
                <p className="font-semibold text-sm">{trip.destination.name}</p>
              </div>
              <MapPin className="w-4 h-4 text-destructive" />
            </div>
          </div>
        </Card>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Trip Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Trip Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trip No.</span>
                  <span className="font-semibold">{trip.tripId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className={getStatusColor(trip.status)}>{trip.status}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Distance Left</span>
                  <span className="font-semibold">{trip.distanceLeft}</span>
                </div>
              </CardContent>
            </Card>

            {/* Logistics Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Logistics Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vehicle No.</span>
                  <span className="font-semibold">{trip.vehicle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transporter</span>
                  <span className="font-semibold">{trip.transporter}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Driver Name</span>
                  <span className="font-semibold">{trip.driverName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Driver No.</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{trip.driverPhone}</span>
                    <Phone className="w-4 h-4 text-primary cursor-pointer" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tracking Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tracking Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">SIM Tracked</span>
                  {trip.simTracked ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">High Consent Available</span>
                  {trip.highConsent ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Trip Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Trip Alerts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {trip.alerts.map((alert, index) => {
                  const style = getAlertStyle(alert.type);
                  const IconComponent = style.icon;
                  return (
                    <div key={index} className={`p-3 rounded-lg border ${style.bg} ${style.border}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <IconComponent className="w-5 h-5 mt-0.5 text-muted-foreground" />
                          <div>
                            <p className="font-semibold">{alert.title}</p>
                            <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                          </div>
                        </div>
                        <Badge className={style.badge}>
                          {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Trip Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Trip Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative space-y-6">
                  {trip.timeline.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${getTimelineColor(item.status)}`}></div>
                        {index < trip.timeline.length - 1 && (
                          <div className={`w-0.5 flex-1 mt-2 ${index < trip.timeline.length - 2 ? 'bg-primary' : 'bg-muted-foreground/30'}`}></div>
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${item.status === 'delayed' ? 'text-destructive' : ''}`}>
                            {item.time}
                          </span>
                        </div>
                        <p className="text-sm mt-1">{item.event}</p>
                        {item.note && (
                          <p className={`text-xs mt-1 ${item.status === 'delayed' ? 'text-destructive' : 'text-muted-foreground'}`}>
                            {item.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TripViewPage;