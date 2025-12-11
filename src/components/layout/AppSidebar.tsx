import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Truck,
  MapPin,
  Users,
  UserCheck,
  Radio,
  Settings,
  Route,
  ChevronDown,
  ChevronUp,
  PanelLeftClose,
  PanelLeft,
  Package,
  Navigation,
  Map,
  LayoutDashboard,
} from "lucide-react";

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

const masterItems: SidebarItem[] = [
  { title: "Vehicles", href: "/vehicle-master", icon: Truck },
  { title: "Vehicle Types", href: "/vehicle-types", icon: Truck },
  { title: "Transporters", href: "/transporters", icon: Users },
  { title: "Lanes", href: "/lanes", icon: Map },
  { title: "Locations", href: "/locations", icon: MapPin },
  { title: "Serviceability", href: "/serviceability", icon: Map },
  { title: "Partners", href: "/partner-master", icon: Users },
  { title: "Drivers", href: "/driver", icon: UserCheck },
  { title: "Tracking Assets", href: "/tracking-asset", icon: Radio },
  { title: "Shipments", href: "/shipments", icon: Package },
  { title: "Users", href: "/users", icon: Settings },
];

const mainItems: SidebarItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Trips", href: "/trips", icon: Route },
  { title: "Live Location", href: "/live-location", icon: Navigation },
];

const settingsItems: SidebarItem[] = [
  { title: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const [mastersOpen, setMastersOpen] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(href + "/");

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Route className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-semibold text-sidebar-accent-foreground text-lg">
              TripMS
            </span>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          {collapsed ? (
            <PanelLeft className="w-5 h-5" />
          ) : (
            <PanelLeftClose className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {/* Masters Group */}
        <div>
          <button
            onClick={() => setMastersOpen(!mastersOpen)}
            className={cn(
              "flex items-center justify-between w-full px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
              collapsed && "justify-center"
            )}
          >
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5" />
              {!collapsed && <span className="text-sm font-medium">Masters</span>}
            </div>
            {!collapsed && (
              mastersOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )
            )}
          </button>

          {mastersOpen && !collapsed && (
            <div className="ml-4 mt-1 space-y-1 animate-fade-in">
              {masterItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "sidebar-item text-sm",
                    isActive(item.href) && "sidebar-item-active"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.title}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-sidebar-border my-2" />

        {/* Main Items */}
        {mainItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={cn(
              "sidebar-item",
              isActive(item.href) && "sidebar-item-active",
              collapsed && "justify-center"
            )}
          >
            <item.icon className="w-5 h-5" />
            {!collapsed && <span className="text-sm">{item.title}</span>}
          </NavLink>
        ))}

        {/* Divider */}
        <div className="border-t border-sidebar-border my-2" />

        {/* Settings */}
        {settingsItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={cn(
              "sidebar-item",
              isActive(item.href) && "sidebar-item-active",
              collapsed && "justify-center"
            )}
          >
            <item.icon className="w-5 h-5" />
            {!collapsed && <span className="text-sm">{item.title}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
