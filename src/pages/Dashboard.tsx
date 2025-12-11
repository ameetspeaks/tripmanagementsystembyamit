import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Truck, 
  MapPin, 
  Users, 
  Package, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  // Mock statistics
  const stats = {
    totalTrips: 156,
    activeTrips: 23,
    completedToday: 12,
    delayedTrips: 4,
    totalVehicles: 45,
    activeVehicles: 38,
    totalDrivers: 52,
    availableDrivers: 14,
  };

  // Mock recent trips
  const recentTrips = [
    { id: "TRP001", origin: "Mumbai", destination: "Delhi", status: "In Transit", driver: "Ramesh Kumar", vehicle: "MH12AB1234", eta: "2 hrs" },
    { id: "TRP002", origin: "Chennai", destination: "Bangalore", status: "Completed", driver: "Suresh Yadav", vehicle: "TN07EF9012", eta: "-" },
    { id: "TRP003", origin: "Delhi", destination: "Hyderabad", status: "Delayed", driver: "Mahesh Singh", vehicle: "DL04GH3456", eta: "5 hrs" },
    { id: "TRP004", origin: "Bangalore", destination: "Mumbai", status: "Scheduled", driver: "Rajesh Patel", vehicle: "KA01CD5678", eta: "8 hrs" },
    { id: "TRP005", origin: "Hyderabad", destination: "Chennai", status: "In Transit", driver: "Dinesh Sharma", vehicle: "GJ06IJ7890", eta: "3 hrs" },
  ];

  // Mock alerts
  const alerts = [
    { id: 1, type: "warning", message: "Driver license expiring: Ramesh Kumar (3 days)", time: "10 min ago" },
    { id: 2, type: "error", message: "Trip TRP003 delayed by 2 hours", time: "25 min ago" },
    { id: 3, type: "info", message: "Vehicle MH12AB1234 maintenance due", time: "1 hr ago" },
    { id: 4, type: "success", message: "Trip TRP002 completed successfully", time: "2 hrs ago" },
  ];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Completed": return "default";
      case "In Transit": return "secondary";
      case "Scheduled": return "outline";
      case "Delayed": return "destructive";
      default: return "outline";
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "warning": return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "error": return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case "success": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your trip management system</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate("/trips")}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Trips</CardTitle>
              <Truck className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTrips}</div>
              <div className="flex items-center text-xs text-green-600 mt-1">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                <span>+12% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate("/live-location")}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Trips</CardTitle>
              <MapPin className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.activeTrips}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.delayedTrips} delayed
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate("/vehicles")}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Vehicles</CardTitle>
              <Truck className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeVehicles}/{stats.totalVehicles}</div>
              <p className="text-xs text-muted-foreground mt-1">Active vehicles</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate("/drivers")}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Drivers</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.availableDrivers}/{stats.totalDrivers}</div>
              <p className="text-xs text-muted-foreground mt-1">Available today</p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed Today</CardTitle>
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completedToday}</div>
              <div className="flex items-center text-xs text-green-600 mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>On track for target</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Delayed Trips</CardTitle>
              <AlertTriangle className="w-4 h-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.delayedTrips}</div>
              <div className="flex items-center text-xs text-destructive mt-1">
                <ArrowDownRight className="w-3 h-3 mr-1" />
                <span>Requires attention</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Fleet Utilization</CardTitle>
              <Package className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">84%</div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '84%' }} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Trips */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Trips</CardTitle>
              <button 
                className="text-sm text-primary hover:underline"
                onClick={() => navigate("/trips")}
              >
                View all
              </button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTrips.map((trip) => (
                  <div 
                    key={trip.id} 
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/trips/view/${trip.id.replace('TRP00', '')}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Truck className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{trip.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {trip.origin} → {trip.destination}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden md:block">
                        <p className="text-sm">{trip.driver}</p>
                        <p className="text-xs text-muted-foreground">{trip.vehicle}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={getStatusVariant(trip.status)}>{trip.status}</Badge>
                        {trip.eta !== "-" && (
                          <p className="text-xs text-muted-foreground mt-1">ETA: {trip.eta}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alerts & Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Alerts & Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex gap-3 p-3 border rounded-lg">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <p className="text-sm">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
