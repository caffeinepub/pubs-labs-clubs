import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export interface PortalSectionConfig {
  id: string;
  defaultLabel: string;
  path: string;
  adminOnly?: boolean;
  exact?: boolean;
}

export interface SectionSetting {
  label: string;
  visible: boolean;
}

export interface BrandingSettings {
  logoDataUrl?: string;
  primaryColorHue: number;
  primaryColorChroma: number;
  portalName: string;
}

export const DEFAULT_BRANDING: BrandingSettings = {
  logoDataUrl: undefined,
  primaryColorHue: 264,
  primaryColorChroma: 0.243,
  portalName: "Higgins Music",
};

// ─── Custom Fields ────────────────────────────────────────────────────────────

export type CustomFieldType = "text" | "number" | "date" | "dropdown";

export interface CustomFieldDef {
  id: string; // e.g. "cf_<timestamp>_<random>"
  label: string;
  type: CustomFieldType;
  options: string[]; // only used when type === 'dropdown'
  required: boolean;
}

export type SectionId =
  | "memberships"
  | "publishing"
  | "releases"
  | "recordings"
  | "artists";

export type CustomFieldsMap = Record<SectionId, CustomFieldDef[]>;

export interface PortalSettingsContextValue {
  sectionSettings: Record<string, SectionSetting>;
  defaultSections: PortalSectionConfig[];
  updateSection: (id: string, patch: Partial<SectionSetting>) => void;
  saveSettings: () => void;
  resetSettings: () => void;
  // Branding
  brandingSettings: BrandingSettings;
  updateBranding: (patch: Partial<BrandingSettings>) => void;
  saveBranding: () => void;
  resetBranding: () => void;
  // Custom Fields
  customFields: CustomFieldsMap;
  addCustomField: (
    sectionId: SectionId,
    def: Omit<CustomFieldDef, "id">,
  ) => void;
  removeCustomField: (sectionId: SectionId, fieldId: string) => void;
  updateCustomField: (
    sectionId: SectionId,
    fieldId: string,
    patch: Partial<Omit<CustomFieldDef, "id">>,
  ) => void;
}

export const defaultSections: PortalSectionConfig[] = [
  {
    id: "home",
    defaultLabel: "Home",
    path: "/portal",
    exact: true,
  },
  {
    id: "memberships",
    defaultLabel: "Memberships",
    path: "/portal/memberships",
  },
  {
    id: "publishing",
    defaultLabel: "Publishing Works",
    path: "/portal/publishing",
  },
  {
    id: "releases",
    defaultLabel: "Releases",
    path: "/portal/releases",
  },
  {
    id: "recordings",
    defaultLabel: "Recording Projects",
    path: "/portal/recordings",
  },
  {
    id: "artists",
    defaultLabel: "Artist Development",
    path: "/portal/artists",
  },
  {
    id: "admin",
    defaultLabel: "Dashboard",
    path: "/portal/admin",
    adminOnly: true,
  },
  {
    id: "roles",
    defaultLabel: "Role Assignment",
    path: "/portal/admin/roles",
    adminOnly: true,
  },
  {
    id: "bootstrap",
    defaultLabel: "Bootstrap",
    path: "/portal/admin/bootstrap",
    adminOnly: true,
  },
  {
    id: "settings",
    defaultLabel: "Admin Settings",
    path: "/portal/admin/settings",
    adminOnly: true,
  },
  {
    id: "rollout",
    defaultLabel: "Rollout Wizard",
    path: "/portal/admin/rollout-wizard",
    adminOnly: true,
  },
];

const STORAGE_KEY = "higgins_portal_settings";
const BRANDING_STORAGE_KEY = "higgins_portal_branding";
const CUSTOM_FIELDS_STORAGE_KEY = "higgins_portal_custom_fields";

function buildDefaultSettings(): Record<string, SectionSetting> {
  return Object.fromEntries(
    defaultSections.map((s) => [
      s.id,
      { label: s.defaultLabel, visible: true },
    ]),
  );
}

function loadFromStorage(): Record<string, SectionSetting> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildDefaultSettings();
    const parsed = JSON.parse(raw) as Record<string, SectionSetting>;
    // Merge with defaults to handle new sections added after initial save
    const defaults = buildDefaultSettings();
    return { ...defaults, ...parsed };
  } catch {
    return buildDefaultSettings();
  }
}

function loadBrandingFromStorage(): BrandingSettings {
  try {
    const raw = localStorage.getItem(BRANDING_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_BRANDING };
    const parsed = JSON.parse(raw) as Partial<BrandingSettings>;
    return { ...DEFAULT_BRANDING, ...parsed };
  } catch {
    return { ...DEFAULT_BRANDING };
  }
}

function buildDefaultCustomFields(): CustomFieldsMap {
  return {
    memberships: [],
    publishing: [],
    releases: [],
    recordings: [],
    artists: [],
  };
}

function loadCustomFieldsFromStorage(): CustomFieldsMap {
  try {
    const raw = localStorage.getItem(CUSTOM_FIELDS_STORAGE_KEY);
    if (!raw) return buildDefaultCustomFields();
    const parsed = JSON.parse(raw) as Partial<CustomFieldsMap>;
    const defaults = buildDefaultCustomFields();
    return { ...defaults, ...parsed };
  } catch {
    return buildDefaultCustomFields();
  }
}

function generateFieldId(): string {
  return `cf_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

const PortalSettingsContext = createContext<PortalSettingsContextValue | null>(
  null,
);

export function PortalSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sectionSettings, setSectionSettings] =
    useState<Record<string, SectionSetting>>(loadFromStorage);

  const [brandingSettings, setBrandingSettings] = useState<BrandingSettings>(
    loadBrandingFromStorage,
  );

  const [customFields, setCustomFields] = useState<CustomFieldsMap>(
    loadCustomFieldsFromStorage,
  );

  const updateSection = useCallback(
    (id: string, patch: Partial<SectionSetting>) => {
      setSectionSettings((prev) => ({
        ...prev,
        [id]: { ...prev[id], ...patch },
      }));
    },
    [],
  );

  const saveSettings = useCallback(() => {
    setSectionSettings((current) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      return current;
    });
  }, []);

  const resetSettings = useCallback(() => {
    const defaults = buildDefaultSettings();
    setSectionSettings(defaults);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
  }, []);

  const updateBranding = useCallback((patch: Partial<BrandingSettings>) => {
    setBrandingSettings((prev) => {
      const next = { ...prev, ...patch };
      // Persist immediately for live preview
      localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const saveBranding = useCallback(() => {
    setBrandingSettings((current) => {
      localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(current));
      return current;
    });
  }, []);

  const resetBranding = useCallback(() => {
    const defaults = { ...DEFAULT_BRANDING };
    setBrandingSettings(defaults);
    localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(defaults));
  }, []);

  const addCustomField = useCallback(
    (sectionId: SectionId, def: Omit<CustomFieldDef, "id">) => {
      setCustomFields((prev) => {
        const next: CustomFieldsMap = {
          ...prev,
          [sectionId]: [...prev[sectionId], { ...def, id: generateFieldId() }],
        };
        localStorage.setItem(CUSTOM_FIELDS_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  const removeCustomField = useCallback(
    (sectionId: SectionId, fieldId: string) => {
      setCustomFields((prev) => {
        const next: CustomFieldsMap = {
          ...prev,
          [sectionId]: prev[sectionId].filter((f) => f.id !== fieldId),
        };
        localStorage.setItem(CUSTOM_FIELDS_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  const updateCustomField = useCallback(
    (
      sectionId: SectionId,
      fieldId: string,
      patch: Partial<Omit<CustomFieldDef, "id">>,
    ) => {
      setCustomFields((prev) => {
        const next: CustomFieldsMap = {
          ...prev,
          [sectionId]: prev[sectionId].map((f) =>
            f.id === fieldId ? { ...f, ...patch } : f,
          ),
        };
        localStorage.setItem(CUSTOM_FIELDS_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  const value = useMemo<PortalSettingsContextValue>(
    () => ({
      sectionSettings,
      defaultSections,
      updateSection,
      saveSettings,
      resetSettings,
      brandingSettings,
      updateBranding,
      saveBranding,
      resetBranding,
      customFields,
      addCustomField,
      removeCustomField,
      updateCustomField,
    }),
    [
      sectionSettings,
      updateSection,
      saveSettings,
      resetSettings,
      brandingSettings,
      updateBranding,
      saveBranding,
      resetBranding,
      customFields,
      addCustomField,
      removeCustomField,
      updateCustomField,
    ],
  );

  return (
    <PortalSettingsContext.Provider value={value}>
      {children}
    </PortalSettingsContext.Provider>
  );
}

export function usePortalSettings(): PortalSettingsContextValue {
  const ctx = useContext(PortalSettingsContext);
  if (!ctx) {
    throw new Error(
      "usePortalSettings must be used within a PortalSettingsProvider",
    );
  }
  return ctx;
}
