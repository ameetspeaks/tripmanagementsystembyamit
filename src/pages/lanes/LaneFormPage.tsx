import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FormPageLayout } from "@/components/forms/FormPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form } from "@/components/ui/form";
import { laneSchema, LaneFormData } from "@/lib/schemas";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, ArrowRight, Truck, Train, Plane, MapPinned, Route } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createLane, getLane, updateLane, addLaneRoute } from "@/services/laneService";
import { geocodeAddress, directions, placesAutocomplete, placeDetails } from "@/services/mapsService";
import { upsertLocationFromPlace } from "@/services/locationService";
import { createLocation } from "@/services/locationService";
import { useEffect, useRef, useState } from "react";

interface LaneFormPageProps {
  mode: "add" | "view" | "edit";
}

const laneTypes = ["Point to Point", "Area to Area", "City to City"];
const transportModes = [
  { value: "Road", icon: Truck },
  { value: "Rail", icon: Train },
  { value: "Air", icon: Plane },
];

// Google-assisted lane creation

const LaneFormPage = ({ mode }: LaneFormPageProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isReadOnly = mode === "view";
  const queryClient = useQueryClient();
  const { data: lane } = useQuery({
    queryKey: ["lane", id],
    queryFn: () => getLane(id as string),
    enabled: !!id && mode !== "add",
  });
  const [originGeo, setOriginGeo] = useState<{ lat: number; lng: number } | null>(null);
  const [destGeo, setDestGeo] = useState<{ lat: number; lng: number } | null>(null);
  const [mapInfo, setMapInfo] = useState<{ polyline?: string; raw?: any } | null>(null);
  const [originSuggestions, setOriginSuggestions] = useState<{ description: string; placeId: string }[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<{ description: string; placeId: string }[]>([]);
  const originDebounce = useRef<number | null>(null);
  const destDebounce = useRef<number | null>(null);
  const [originLoading, setOriginLoading] = useState(false);
  const [destLoading, setDestLoading] = useState(false);
  const originSessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const destSessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  const form = useForm<LaneFormData>({
    resolver: zodResolver(laneSchema),
    defaultValues: {
      laneCode: "",
      laneName: "",
      laneType: "",
      modeOfTransport: "Road",
      originName: "",
      destinationName: "",
      integrationId: "",
      distance: "",
      mapJson: "",
      lanePrice: "",
      status: "Active",
    },
  });

  useEffect(() => {
    if (lane) {
      form.reset({
        laneCode: lane.laneCode,
        laneName: lane.laneName,
        laneType: lane.laneType,
        modeOfTransport: lane.modeOfTransport,
        originName: lane.originName,
        destinationName: lane.destinationName,
        integrationId: lane.integrationId || "",
        distance: String(lane.distanceKm),
        mapJson: lane.mapJson ? JSON.stringify(lane.mapJson) : "",
        lanePrice: lane.lanePrice != null ? String(lane.lanePrice) : "",
        status: lane.laneStatus,
      });
    }
  }, [lane]);

  const handleOriginChange = (value: string) => {
    form.setValue("originName", value);
    setOriginGeo(null);
    setMapInfo(null);
    if (originDebounce.current) window.clearTimeout(originDebounce.current);
    if (!isReadOnly && value && value.length > 2) {
      setOriginLoading(true);
      if (!originSessionTokenRef.current && (window as any).google) {
        originSessionTokenRef.current = new (window as any).google.maps.places.AutocompleteSessionToken();
      }
      originDebounce.current = window.setTimeout(async () => {
        try {
          const sug = await placesAutocomplete(value, { country: 'IN', types: ['geocode'], sessionToken: originSessionTokenRef.current || undefined });
          setOriginSuggestions(sug);
        } catch {
          setOriginSuggestions([]);
        } finally {
          setOriginLoading(false);
        }
      }, 300);
    } else {
      setOriginSuggestions([]);
      setOriginLoading(false);
    }
  };

  const handleDestinationChange = (value: string) => {
    form.setValue("destinationName", value);
    setDestGeo(null);
    setMapInfo(null);
    if (destDebounce.current) window.clearTimeout(destDebounce.current);
    if (!isReadOnly && value && value.length > 2) {
      setDestLoading(true);
      if (!destSessionTokenRef.current && (window as any).google) {
        destSessionTokenRef.current = new (window as any).google.maps.places.AutocompleteSessionToken();
      }
      destDebounce.current = window.setTimeout(async () => {
        try {
          const sug = await placesAutocomplete(value, { country: 'IN', types: ['geocode'], sessionToken: destSessionTokenRef.current || undefined });
          setDestSuggestions(sug);
        } catch {
          setDestSuggestions([]);
        } finally {
          setDestLoading(false);
        }
      }, 300);
    } else {
      setDestSuggestions([]);
      setDestLoading(false);
    }
  };

  useEffect(() => {
    const computeIfReady = async () => {
      if (originGeo && destGeo) {
        try {
          const res = await directions(originGeo, destGeo, "driving");
          const km = res.distanceMeters ? res.distanceMeters / 1000 : 0;
          form.setValue("distance", String(Math.round(km)));
          setMapInfo({ polyline: res.polyline, raw: res.raw });
        } catch (e: any) {
          toast.error(e.message || "Failed to compute distance");
        }
      }
    };
    computeIfReady();
  }, [originGeo, destGeo]);

  const fetchOrigin = async () => {
    try {
      const res = await geocodeAddress(form.getValues("originName"));
      setOriginGeo({ lat: res.latitude, lng: res.longitude });
      await createLocation({
        address: res.formattedAddress,
        locationName: form.getValues("originName"),
        consigneeCode: "",
        consigneeName: "",
        simRadius: "5000",
        gpsRadius: "500",
        latitude: String(res.latitude),
        longitude: String(res.longitude),
        locationType: form.getValues("laneType") === "Point to Point" ? "Node" : "Consignee",
        cityName: "",
        pincode: "000000",
        stateName: "",
        district: "",
        zone: "",
        taluka: "",
        areaOffice: "",
        integrationId: form.getValues("integrationId") || "",
        status: "Active",
      });
      toast.success("Origin geocoded and saved to Locations");
    } catch (e: any) {
      toast.error(e.message || "Failed to fetch origin");
    }
  };

  const fetchDestination = async () => {
    try {
      const res = await geocodeAddress(form.getValues("destinationName"));
      setDestGeo({ lat: res.latitude, lng: res.longitude });
      await createLocation({
        address: res.formattedAddress,
        locationName: form.getValues("destinationName"),
        consigneeCode: "",
        consigneeName: "",
        simRadius: "5000",
        gpsRadius: "500",
        latitude: String(res.latitude),
        longitude: String(res.longitude),
        locationType: form.getValues("laneType") === "Point to Point" ? "Node" : "Consignee",
        cityName: "",
        pincode: "000000",
        stateName: "",
        district: "",
        zone: "",
        taluka: "",
        areaOffice: "",
        integrationId: form.getValues("integrationId") || "",
        status: "Active",
      });
      toast.success("Destination geocoded and saved to Locations");
    } catch (e: any) {
      toast.error(e.message || "Failed to fetch destination");
    }
  };

  const computeRoute = async () => {
    if (!originGeo || !destGeo) {
      toast.error("Geocode origin and destination first");
      return;
    }
    try {
      const useTransit = form.getValues("modeOfTransport") === "Road";
      let res;
      try {
        res = await directions(originGeo, destGeo, useTransit ? "transit" : "driving", useTransit ? "bus" : undefined);
      } catch {
        res = await directions(originGeo, destGeo, "driving");
      }
      const km = res.distanceMeters ? res.distanceMeters / 1000 : 0;
      form.setValue("distance", String(km));
      setMapInfo({ polyline: res.polyline, raw: res.raw });
      toast.success("Route computed and distance populated");
    } catch (e: any) {
      toast.error(e.message || "Failed to compute route");
    }
  };

  const onSubmit = async (data: LaneFormData) => {
    try {
      const mapJson = mapInfo?.raw || (data.mapJson ? JSON.parse(data.mapJson) : undefined);
      if (mode === "add") {
        const laneId = await createLane(data, mapJson);
        if (mapInfo?.polyline) {
          await addLaneRoute(laneId, form.getValues("modeOfTransport") === "Road" ? "transit_bus" : "driving", mapInfo.polyline, mapInfo.raw);
        }
        toast.success("Lane created");
      } else if (mode === "edit" && id) {
        await updateLane(id, data, mapJson);
        toast.success("Lane updated");
      }
      queryClient.invalidateQueries({ queryKey: ["lanes"] });
      navigate("/lanes");
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    }
  };

  return (
    <DashboardLayout>
      <FormPageLayout title="Lane" backUrl="/lanes" mode={mode}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Lane Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Lane Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="laneCode">Lane Code *</Label>
                    <Input
                      id="laneCode"
                      {...form.register("laneCode")}
                      disabled={isReadOnly || mode === "edit"}
                      placeholder="e.g., LN001"
                    />
                    {form.formState.errors.laneCode && (
                      <p className="text-sm text-destructive">{form.formState.errors.laneCode.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="laneName">Lane Name *</Label>
                    <Input
                      id="laneName"
                      {...form.register("laneName")}
                      disabled={isReadOnly}
                      placeholder="e.g., Mumbai-Delhi Express"
                    />
                    {form.formState.errors.laneName && (
                      <p className="text-sm text-destructive">{form.formState.errors.laneName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="laneType">Lane Type *</Label>
                    <Select
                      disabled={isReadOnly}
                      value={form.watch("laneType")}
                      onValueChange={(value) => form.setValue("laneType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select lane type" />
                      </SelectTrigger>
                      <SelectContent>
                        {laneTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.laneType && (
                      <p className="text-sm text-destructive">{form.formState.errors.laneType.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="modeOfTransport">Mode of Transport *</Label>
                    <Select
                      disabled={isReadOnly}
                      value={form.watch("modeOfTransport")}
                      onValueChange={(value) => form.setValue("modeOfTransport", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                      <SelectContent>
                        {transportModes.map((mode) => (
                          <SelectItem key={mode.value} value={mode.value}>
                            <div className="flex items-center gap-2">
                              <mode.icon className="w-4 h-4" />
                              {mode.value}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.modeOfTransport && (
                      <p className="text-sm text-destructive">{form.formState.errors.modeOfTransport.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="distance">Distance (km) *</Label>
                    <Input
                      id="distance"
                      {...form.register("distance")}
                      disabled={isReadOnly}
                      placeholder="e.g., 1400"
                    />
                    {form.formState.errors.distance && (
                      <p className="text-sm text-destructive">{form.formState.errors.distance.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lanePrice">Lane Price (₹)</Label>
                    <Input
                      id="lanePrice"
                      {...form.register("lanePrice")}
                      disabled={isReadOnly}
                      placeholder="e.g., 50000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="integrationId">Integration ID</Label>
                    <Input
                      id="integrationId"
                      {...form.register("integrationId")}
                      disabled={isReadOnly}
                      placeholder="External system ID"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select
                      disabled={isReadOnly}
                      value={form.watch("status")}
                      onValueChange={(value) => form.setValue("status", value as "Active" | "Inactive")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Origin and Destination Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
              {/* Origin Location Card */}
              <Card className="border-primary/30">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="w-5 h-5 text-primary" />
                    Origin
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Auto-creates location record</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="originName">Origin Address/Name *</Label>
                    {(() => {
                      const reg = form.register("originName");
                      return (
                        <Input
                          id="originName"
                          disabled={isReadOnly}
                          placeholder="Type to search places"
                          defaultValue={form.getValues("originName")}
                          onChange={(e) => {
                            reg.onChange(e);
                            handleOriginChange(e.target.value);
                          }}
                        />
                      );
                    })()}
                    {form.formState.errors.originName && (
                      <p className="text-sm text-destructive">{form.formState.errors.originName.message}</p>
                    )}
                    {!isReadOnly && originSuggestions.length > 0 && (
                      <div className="border rounded-md mt-2 max-h-48 overflow-auto">
                        {originSuggestions.map((s) => (
                          <button
                            type="button"
                            key={s.placeId}
                            className="w-full text-left px-3 py-2 hover:bg-muted"
                            onClick={async () => {
                              form.setValue("originName", s.description);
                              try {
                                const d = await placeDetails(s.placeId);
                                if (d.latitude && d.longitude) setOriginGeo({ lat: d.latitude, lng: d.longitude });
                                if (d.formattedAddress) {
                                  try {
                                    const g = await geocodeAddress(d.formattedAddress);
                                    const city = (g.components.find((c: any) => c.types?.includes("locality"))?.long_name) || "";
                                    const state = (g.components.find((c: any) => c.types?.includes("administrative_area_level_1"))?.long_name) || "";
                                    const pin = (g.components.find((c: any) => c.types?.includes("postal_code"))?.long_name) || "";
                                    await upsertLocationFromPlace({ locationName: s.description, address: g.formattedAddress, latitude: g.latitude, longitude: g.longitude, cityName: city, stateName: state, pincode: pin });
                                  } catch {}
                                }
                                setOriginSuggestions([]);
                              } catch {}
                            }}
                          >
                            {s.description}
                          </button>
                        ))}
                        {originLoading && (
                          <div className="px-3 py-2 text-sm text-muted-foreground">Searching...</div>
                        )}
                      </div>
                    )}
                    {!isReadOnly && (
                      <Button type="button" variant="secondary" className="mt-2" onClick={fetchOrigin}>
                        <MapPinned className="w-4 h-4 mr-2" /> Geocode & Save Location
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Arrow between cards */}
              <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="bg-background rounded-full p-2 border">
                  <ArrowRight className="w-6 h-6 text-primary" />
                </div>
              </div>

              {/* Destination Location Card */}
              <Card className="border-destructive/30">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="w-5 h-5 text-destructive" />
                    Destination
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Auto-creates location record</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="destinationName">Destination Address/Name *</Label>
                    {(() => {
                      const reg = form.register("destinationName");
                      return (
                        <Input
                          id="destinationName"
                          disabled={isReadOnly}
                          placeholder="Type to search places"
                          defaultValue={form.getValues("destinationName")}
                          onChange={(e) => {
                            reg.onChange(e);
                            handleDestinationChange(e.target.value);
                          }}
                        />
                      );
                    })()}
                    {form.formState.errors.destinationName && (
                      <p className="text-sm text-destructive">{form.formState.errors.destinationName.message}</p>
                    )}
                    {!isReadOnly && destSuggestions.length > 0 && (
                      <div className="border rounded-md mt-2 max-h-48 overflow-auto">
                        {destSuggestions.map((s) => (
                          <button
                            type="button"
                            key={s.placeId}
                            className="w-full text-left px-3 py-2 hover:bg-muted"
                            onClick={async () => {
                              form.setValue("destinationName", s.description);
                              try {
                                const d = await placeDetails(s.placeId);
                                if (d.latitude && d.longitude) setDestGeo({ lat: d.latitude, lng: d.longitude });
                                if (d.formattedAddress) {
                                  try {
                                    const g = await geocodeAddress(d.formattedAddress);
                                    const city = (g.components.find((c: any) => c.types?.includes("locality"))?.long_name) || "";
                                    const state = (g.components.find((c: any) => c.types?.includes("administrative_area_level_1"))?.long_name) || "";
                                    const pin = (g.components.find((c: any) => c.types?.includes("postal_code"))?.long_name) || "";
                                    await upsertLocationFromPlace({ locationName: s.description, address: g.formattedAddress, latitude: g.latitude, longitude: g.longitude, cityName: city, stateName: state, pincode: pin });
                                  } catch {}
                                }
                                setDestSuggestions([]);
                              } catch {}
                            }}
                          >
                            {s.description}
                          </button>
                        ))}
                        {destLoading && (
                          <div className="px-3 py-2 text-sm text-muted-foreground">Searching...</div>
                        )}
                      </div>
                    )}
                    {!isReadOnly && (
                      <Button type="button" variant="secondary" className="mt-2" onClick={fetchDestination}>
                        <MapPinned className="w-4 h-4 mr-2" /> Geocode & Save Location
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Map JSON */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Route Information (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="mapJson">Map JSON (Route Info)</Label>
                  <Input
                    id="mapJson"
                    {...form.register("mapJson")}
                    disabled={isReadOnly}
                    placeholder="JSON route data"
                  />
                </div>
              </CardContent>
            </Card>

            {!isReadOnly && (
              <div className="flex gap-4 pt-4">
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  {mode === "add" ? "Create Lane" : "Update Lane"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/lanes")}>
                  Cancel
                </Button>
              </div>
            )}

            {isReadOnly && (
              <div className="flex gap-4 pt-4">
                <Button type="button" onClick={() => navigate(`/lanes/edit/${id}`)}>
                  Edit Lane
                </Button>
              </div>
            )}
          </form>
        </Form>
      </FormPageLayout>
    </DashboardLayout>
  );
};

export default LaneFormPage;
