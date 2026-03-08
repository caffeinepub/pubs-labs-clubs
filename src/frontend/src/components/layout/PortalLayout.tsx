import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  ChevronRight,
  Disc,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Mic2,
  Music,
  Rocket,
  Settings,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { UserRole } from "../../backend";
import { usePortalSettings } from "../../contexts/PortalSettingsContext";
import { useBrandingStyles } from "../../hooks/useBrandingStyles";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { useGetCallerUserRole } from "../../hooks/useQueries";
import ApprovalGate from "../auth/ApprovalGate";
import NotificationsBell from "../notifications/NotificationsBell";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
  exact?: boolean;
}

// Map section id -> icon (preserving original icons exactly)
const SECTION_ICONS: Record<string, React.ReactNode> = {
  home: <Home size={18} />,
  memberships: <Users size={18} />,
  publishing: <Music size={18} />,
  releases: <Disc size={18} />,
  recordings: <Mic2 size={18} />,
  artists: <TrendingUp size={18} />,
  admin: <LayoutDashboard size={18} />,
  roles: <Shield size={18} />,
  bootstrap: <Settings size={18} />,
  settings: <Settings size={18} />,
  rollout: <Rocket size={18} />,
};

export default function PortalLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const routerState = useRouterState();
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userRole } = useGetCallerUserRole();
  const { defaultSections, sectionSettings, brandingSettings } =
    usePortalSettings();

  // Apply CSS variable overrides for branding colors
  useBrandingStyles();

  const isAdmin = userRole === UserRole.admin;
  const currentPath = routerState.location.pathname;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: "/" });
  };

  const handleNavClick = (path: string) => {
    navigate({ to: path as "/" });
    setMobileOpen(false);
  };

  // Build navItems from context — respects custom labels and visibility
  const navItems: NavItem[] = defaultSections
    .filter((section) => {
      const setting = sectionSettings[section.id];
      if (!setting) return false;
      // Filter hidden sections
      if (!setting.visible) return false;
      // Filter admin-only sections for non-admins
      if (section.adminOnly && !isAdmin) return false;
      return true;
    })
    .map((section) => ({
      label: sectionSettings[section.id]?.label ?? section.defaultLabel,
      path: section.path,
      icon: SECTION_ICONS[section.id],
      adminOnly: section.adminOnly,
      exact: section.exact,
    }));

  const isNavItemActive = (item: NavItem): boolean => {
    if (item.exact) {
      return currentPath === item.path;
    }
    return currentPath === item.path || currentPath.startsWith(`${item.path}/`);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <button
          type="button"
          onClick={() => navigate({ to: "/portal" as "/" })}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <img
            src={
              brandingSettings.logoDataUrl ??
              "/assets/generated/higgins-music-logo.dim_512x512.png"
            }
            alt={brandingSettings.portalName ?? "Higgins Music"}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="text-left">
            <div className="font-bold text-sidebar-foreground text-sm leading-tight">
              {brandingSettings.portalName ?? "Higgins Music"}
            </div>
            <div className="text-xs text-sidebar-foreground/60">
              Member Portal
            </div>
          </div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = isNavItemActive(item);
          return (
            <button
              type="button"
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <span
                className={`flex-shrink-0 ${isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/50 group-hover:text-sidebar-accent-foreground"}`}
              >
                {item.icon}
              </span>
              <span className="flex-1 text-left">{item.label}</span>
              {isActive && (
                <ChevronRight size={14} className="flex-shrink-0 opacity-70" />
              )}
            </button>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-sidebar-border">
        {identity && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-sidebar-accent/30">
            <div className="text-xs text-sidebar-foreground/50 mb-0.5">
              Signed in as
            </div>
            <div className="text-xs font-medium text-sidebar-foreground truncate">
              {identity.getPrincipal().toString().slice(0, 20)}...
            </div>
            {isAdmin && (
              <span className="inline-block mt-1 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded font-medium">
                Admin
              </span>
            )}
          </div>
        )}
        <div className="flex items-center gap-1 mb-1">
          <NotificationsBell />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="flex-1 justify-start gap-2 text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut size={16} />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-sidebar border-r border-sidebar-border flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
          onKeyUp={(e) => e.key === "Escape" && setMobileOpen(false)}
          role="button"
          tabIndex={-1}
          aria-label="Close menu"
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border flex flex-col md:hidden transform transition-transform duration-200 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-background flex-shrink-0">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <img
            src={
              brandingSettings.logoDataUrl ??
              "/assets/generated/higgins-music-logo.dim_512x512.png"
            }
            alt={brandingSettings.portalName ?? "Higgins Music"}
            className="w-7 h-7 rounded-full object-cover"
          />
          <span className="font-semibold text-sm flex-1">
            {brandingSettings.portalName ?? "Higgins Music"} Portal
          </span>
          <NotificationsBell />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {currentPath.startsWith("/portal/admin") ? (
            <Outlet />
          ) : (
            <ApprovalGate>
              <Outlet />
            </ApprovalGate>
          )}
        </main>
      </div>
    </div>
  );
}
