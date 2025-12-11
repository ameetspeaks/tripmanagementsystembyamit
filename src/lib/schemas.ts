import { z } from "zod";

// Vehicle Schema
export const vehicleSchema = z.object({
  vehicleNumber: z.string().trim().min(1, "Vehicle number is required").max(20, "Vehicle number must be less than 20 characters"),
  vehicleType: z.string().trim().min(1, "Vehicle type is required"),
  trackingAsset: z.string().optional().or(z.literal("")),
  isDedicated: z.enum(["Y", "N"]),
  locationCode: z.string().optional().or(z.literal("")),
  integrationCode: z.string().optional().or(z.literal("")),
  status: z.enum(["Active", "Inactive", "Pending"]),

  rcNumber: z.string().optional().or(z.literal("")),
  rcIssueDate: z.string().optional().or(z.literal("")),
  rcExpiryDate: z.string().optional().or(z.literal("")),
  pucNumber: z.string().optional().or(z.literal("")),
  pucIssueDate: z.string().optional().or(z.literal("")),
  pucExpiryDate: z.string().optional().or(z.literal("")),
  insuranceNumber: z.string().optional().or(z.literal("")),
  insuranceIssueDate: z.string().optional().or(z.literal("")),
  insuranceExpiryDate: z.string().optional().or(z.literal("")),
  fitnessNumber: z.string().optional().or(z.literal("")),
  fitnessIssueDate: z.string().optional().or(z.literal("")),
  fitnessExpiryDate: z.string().optional().or(z.literal("")),
  permitNumber: z.string().optional().or(z.literal("")),
  permitIssueDate: z.string().optional().or(z.literal("")),
  permitExpiryDate: z.string().optional().or(z.literal("")),
  hydraulicTestNumber: z.string().optional().or(z.literal("")),
  hydraulicTestIssueDate: z.string().optional().or(z.literal("")),
  hydraulicTestExpiryDate: z.string().optional().or(z.literal("")),
}).refine((data) => {
  const today = new Date();
  const dates = [
    data.rcExpiryDate,
    data.pucExpiryDate,
    data.insuranceExpiryDate,
    data.fitnessExpiryDate,
    data.permitExpiryDate,
    data.hydraulicTestExpiryDate,
  ].filter(Boolean) as string[];
  return dates.every((d) => new Date(d) >= today);
}, { message: "Expiry dates cannot be in the past", path: ["rcExpiryDate"] });

export type VehicleFormData = z.infer<typeof vehicleSchema>;

// Location Schema
export const locationSchema = z
  .object({
    address: z.string().trim().min(1, "Address is required").max(500, "Address must be less than 500 characters"),
    locationName: z
      .string()
      .trim()
      .min(1, "Location name is required")
      .max(100, "Location name must be less than 100 characters"),
    consigneeCode: z.string().optional().or(z.literal("")),
    consigneeName: z.string().optional().or(z.literal("")),
    simRadius: z.string().regex(/^\d+$/, "SIM radius must be a number"),
    gpsRadius: z.string().regex(/^\d+$/, "GPS radius must be a number"),
    latitude: z
      .string()
      .optional()
      .or(z.literal("")),
    longitude: z
      .string()
      .optional()
      .or(z.literal("")),
    locationType: z.string().trim().min(1, "Location type is required"),
    cityName: z.string().trim().min(1, "City is required").max(50, "City must be less than 50 characters"),
    pincode: z.string().trim().min(1, "Pincode is required").regex(/^\d{6}$/, "Pincode must be 6 digits"),
    stateName: z.string().trim().min(1, "State is required").max(50, "State must be less than 50 characters"),
    district: z.string().optional().or(z.literal("")),
    zone: z.string().optional().or(z.literal("")),
    taluka: z.string().optional().or(z.literal("")),
    areaOffice: z.string().optional().or(z.literal("")),
    integrationId: z.string().optional().or(z.literal("")),
    status: z.enum(["Active", "Inactive"]),
  })
  .refine(
    (data) => {
      if (data.locationType.toLowerCase() === "node") {
        return !!data.latitude && !!data.longitude;
      }
      return true;
    },
    {
      message: "Latitude and Longitude are required for Node",
      path: ["latitude"],
    }
  );

export type LocationFormData = z.infer<typeof locationSchema>;

// Lane Schema - Updated with new fields
export const laneSchema = z.object({
  laneCode: z.string().trim().min(1, "Lane code is required").max(20, "Lane code must be less than 20 characters"),
  laneName: z.string().trim().min(1, "Lane name is required").max(100, "Lane name must be less than 100 characters"),
  laneType: z.string().trim().min(1, "Lane type is required"),
  modeOfTransport: z.string().trim().min(1, "Mode of transport is required"),
  originName: z.string().trim().min(1, "Origin name is required").max(100, "Origin name must be less than 100 characters"),
  destinationName: z.string().trim().min(1, "Destination name is required").max(100, "Destination name must be less than 100 characters"),
  integrationId: z.string().optional(),
  distance: z.string().trim().min(1, "Distance is required"),
  mapJson: z.string().optional(),
  lanePrice: z.string().optional(),
  status: z.enum(["Active", "Inactive"]),
});

export type LaneFormData = z.infer<typeof laneSchema>;

// Partner/Customer/Consignee Schema - Updated
export const partnerSchema = z.object({
  displayName: z.string().trim().min(1, "Display name is required").max(50, "Display name must be less than 50 characters"),
  companyName: z.string().trim().min(1, "Company name is required").max(100, "Company name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(100, "Email must be less than 100 characters").optional().or(z.literal("")),
  gstNumber: z.string().regex(/^[A-Z0-9]{15}$/, "GST must be 15 alphanumeric characters").optional().or(z.literal("")),
  panNumber: z.string().regex(/^[A-Z0-9]{10}$/, "PAN must be 10 alphanumeric characters").optional().or(z.literal("")),
  phoneNumber: z.string().trim().min(1, "Phone is required").regex(/^\d{10}$/, "Phone must be 10 digits"),
  address: z.string().trim().min(1, "Address is required").max(500, "Address must be less than 500 characters"),
  integrationCode: z.string().optional(),
  secondaryEmail: z.string().trim().email("Invalid email address").optional().or(z.literal("")),
  secondaryPhoneNumber: z.string().regex(/^\d{10}$/, "Secondary phone must be 10 digits").optional().or(z.literal("")),
  status: z.enum(["Active", "Inactive", "Pending"]),
});

export type PartnerFormData = z.infer<typeof partnerSchema>;

// Driver Schema - Updated with new fields
export const driverSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  mobileNumber: z.string().trim().min(1, "Mobile is required").regex(/^\d{10}$/, "Mobile must be 10 digits"),
  isDedicated: z.enum(["Y", "N"]),
  locationCode: z.string().optional(),
  licenseNumber: z.string().trim().min(1, "License number is required").max(20, "License number must be less than 20 characters"),
  licenseIssueDate: z.string().optional(),
  licenseExpiryDate: z.string().trim().min(1, "License expiry date is required"),
  aadhaarNumber: z.string().optional(),
  panNumber: z.string().regex(/^[A-Z0-9]{10}$/, "PAN must be 10 alphanumeric characters").optional().or(z.literal("")),
  voterIdNumber: z.string().optional(),
  passportNumber: z.string().optional(),
  policeVerificationNumber: z.string().optional(),
  policeVerificationIssueDate: z.string().optional(),
  policeVerificationExpiryDate: z.string().optional(),
  status: z.enum(["Active", "Inactive", "Pending"]),
});

export type DriverFormData = z.infer<typeof driverSchema>;

// Tracking Asset Schema
export const trackingAssetSchema = z.object({
  assetId: z.string().trim().min(1, "Asset ID is required").max(20, "Asset ID must be less than 20 characters"),
  assetType: z.enum(["SIM", "GPS", "DriverApp"]),
  manufacturer: z.string().trim().min(1, "Display name is required").max(50, "Display name must be less than 50 characters"),
  driverId: z.string().optional(),
  vehicleId: z.string().optional(),
  status: z.enum(["Active", "Inactive"]),
});

export type TrackingAssetFormData = z.infer<typeof trackingAssetSchema>;

// User Schema
export const userSchema = z.object({
  userName: z.string().trim().min(1, "User name is required").max(100, "User name must be less than 100 characters"),
  email: z.string().trim().min(1, "Email is required").email("Invalid email address").max(100, "Email must be less than 100 characters"),
  phone: z.string().trim().min(1, "Phone is required").regex(/^\d{10}$/, "Phone must be 10 digits"),
  role: z.string().trim().min(1, "Role is required"),
  status: z.enum(["Active", "Inactive"]),
});

export type UserFormData = z.infer<typeof userSchema>;

// Shipment/Material/Packaging Schema - New
export const shipmentSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  isBulk: z.enum(["Y", "N"]),
  code: z.string().trim().min(1, "Code is required").max(50, "Code must be less than 50 characters"),
  description: z.string().optional(),
  skuCode: z.string().trim().min(1, "SKU code is required").max(50, "SKU code must be less than 50 characters"),
  packaging: z.string().trim().min(1, "Packaging is required"),
  units: z.string().trim().min(1, "Units is required"),
  height: z.string().optional(),
  width: z.string().optional(),
  length: z.string().optional(),
  weight: z.string().trim().min(1, "Weight is required"),
  weightUoM: z.string().trim().min(1, "Weight UoM is required"),
  volume: z.string().trim().min(1, "Volume is required"),
  volumeUoM: z.string().trim().min(1, "Volume UoM is required"),
  status: z.enum(["Active", "Inactive"]),
});

export type ShipmentFormData = z.infer<typeof shipmentSchema>;

// Trip Schema - Updated to include shipment mapping
export const tripSchema = z.object({
  tripId: z.string().trim().min(1, "Trip ID is required").max(20, "Trip ID must be less than 20 characters"),
  laneId: z.string().trim().min(1, "Lane is required"),
  vehicle: z.string().trim().min(1, "Vehicle is required"),
  driver: z.string().trim().min(1, "Driver is required"),
  transporter: z.string().optional(),
  shipments: z.array(z.string()).optional(),
  startDate: z.string().trim().min(1, "Start date is required"),
  startTime: z.string().trim().min(1, "Start time is required"),
  estimatedArrival: z.string().optional().or(z.literal("")),
  trackingType: z.enum(["GPS", "SIM", "Manual"]),
});

export type TripFormData = z.infer<typeof tripSchema>;
