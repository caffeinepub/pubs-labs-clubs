# Higgins Music Portal — Part 8, Section 3: Portal Branding Customization

## Current State

The Admin Settings page (`/portal/admin/settings`) has four cards:
1. **Section Visibility** — fully live (rename and toggle portal sections)
2. **Portal Branding** — currently a "Coming soon" placeholder card with no functionality
3. **Custom Fields** — placeholder, coming soon
4. **General Settings** — placeholder, coming soon

The portal sidebar and mobile header both display a hardcoded logo (`/assets/generated/higgins-music-logo.dim_512x512.png`) and hardcoded color scheme.

The `PortalSettingsContext` currently manages only section label/visibility settings and stores to `localStorage`.

## Requested Changes (Diff)

### Add
- A `BrandingSettings` type (`{ logoDataUrl?: string; primaryColorHue: number; primaryColorChroma: number; portalName: string }`) in the portal settings context
- `brandingSettings`, `updateBranding`, and `saveBranding` to `PortalSettingsContext` — persisted to `localStorage` under a separate key `higgins_portal_branding`
- A `BrandingPanel` component inside `AdminSettingsPage` replacing the "Coming soon" placeholder card
  - Logo upload field: file input (PNG/JPG/GIF, max 2 MB), preview thumbnail, clear button
  - Portal name input field (customizes the sidebar heading text)
  - Color theme selector: 6 preset swatches (Slate/neutral, Violet, Blue, Emerald, Amber, Rose) + a "custom" hue slider
  - Live preview strip showing how the primary color will look on buttons and active nav items
  - Save and Reset to Default buttons
- `useBrandingStyles` hook that applies CSS custom property overrides onto `document.documentElement` whenever `brandingSettings` changes (dynamic CSS var injection for primary, sidebar-primary, ring colors based on selected hue/chroma)
- Update `PortalLayout` sidebar to use `brandingSettings.logoDataUrl` (with fallback to original logo) and `brandingSettings.portalName` (with fallback to "Higgins Music")
- Update `BrandHeader` to also consume the portal name from branding context

### Modify
- `PortalSettingsContext`: extend with branding state, persist/load from `localStorage`, export new types
- `AdminSettingsPage`: replace the Portal Branding card placeholder content with the new `BrandingPanel`
- `PortalLayout`: read logo and portal name from context instead of hardcoded values
- `BrandHeader`: read portal name from context

### Remove
- The "Coming soon" badge and placeholder div from the Portal Branding card

## Implementation Plan

1. Extend `PortalSettingsContext` with branding state (`logoDataUrl`, `primaryColorHue`, `primaryColorChroma`, `portalName`), load/save from `localStorage`, expose `updateBranding` and `resetBranding`
2. Create `useBrandingStyles` hook that injects CSS variable overrides dynamically when branding changes
3. Build `BrandingPanel` component with logo upload, portal name input, color preset swatches + hue slider, live preview strip, save/reset controls
4. Wire `BrandingPanel` into `AdminSettingsPage` replacing the placeholder card
5. Update `PortalLayout` sidebar and mobile header to consume logo and portal name from context
6. Update `BrandHeader` to consume portal name from context
7. Apply deterministic `data-ocid` markers to all interactive elements in the branding panel
