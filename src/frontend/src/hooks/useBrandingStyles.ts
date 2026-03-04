import { useEffect } from "react";
import { usePortalSettings } from "../contexts/PortalSettingsContext";

/**
 * Applies branding CSS variable overrides to document.documentElement
 * whenever brandingSettings changes. Call once from PortalLayout.
 */
export function useBrandingStyles() {
  const { brandingSettings } = usePortalSettings();

  useEffect(() => {
    const { primaryColorHue: hue, primaryColorChroma: chroma } =
      brandingSettings;

    const root = document.documentElement.style;

    // Light mode primary (high lightness)
    root.setProperty("--primary", `0.922 ${chroma} ${hue}`);
    // Sidebar primary (mid lightness)
    root.setProperty("--sidebar-primary", `0.488 ${chroma} ${hue}`);
    // Ring
    root.setProperty("--ring", `0.556 ${chroma} ${hue}`);

    return () => {
      // Cleanup: remove overrides when portal is unmounted
      root.removeProperty("--primary");
      root.removeProperty("--sidebar-primary");
      root.removeProperty("--ring");
    };
  }, [brandingSettings]);
}
