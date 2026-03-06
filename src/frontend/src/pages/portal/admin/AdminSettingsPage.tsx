import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Eye, Palette, RotateCcw, Sliders, Wrench } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import AccessDeniedScreen from "../../../components/auth/AccessDeniedScreen";
import BrandingPanel from "../../../components/branding/BrandingPanel";
import CustomFieldsPanel from "../../../components/custom-fields/CustomFieldsPanel";
import {
  type PortalSectionConfig,
  usePortalSettings,
} from "../../../contexts/PortalSettingsContext";
import { useCurrentUser } from "../../../hooks/useCurrentUser";

export default function AdminSettingsPage() {
  const { isAdmin } = useCurrentUser();
  const [isSaving, setIsSaving] = useState(false);
  const {
    sectionSettings,
    defaultSections,
    updateSection,
    saveSettings,
    resetSettings,
  } = usePortalSettings();

  if (!isAdmin) {
    return <AccessDeniedScreen />;
  }

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      saveSettings();
      setIsSaving(false);
      toast.success("Settings saved successfully");
    }, 400);
  };

  const handleCancel = () => {
    toast("Changes discarded");
  };

  const handleReset = () => {
    resetSettings();
    toast.success("Settings reset to defaults");
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Page body */}
      <div className="flex-1 space-y-8 p-6 pb-24">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage portal configuration and customization
          </p>
        </div>

        {/* Settings section cards */}
        <div
          className="grid grid-cols-1 gap-6 md:grid-cols-2"
          data-ocid="admin_settings.section"
        >
          {/* Card 1: Section Visibility — LIVE */}
          <Card
            className="relative overflow-hidden border-border transition-shadow hover:shadow-md md:col-span-2"
            data-ocid="admin_settings.card"
          >
            <CardHeader className="flex flex-row items-start gap-4 pb-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Eye className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-semibold text-foreground">
                    Section Visibility
                  </CardTitle>
                  <span className="inline-flex items-center rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
                    Active
                  </span>
                </div>
                <CardDescription className="mt-1 text-sm text-muted-foreground">
                  Show or hide portal sections and rename their navigation
                  labels. Changes take effect immediately.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <SectionVisibilityPanel
                defaultSections={defaultSections}
                sectionSettings={sectionSettings}
                onUpdate={updateSection}
                onReset={handleReset}
              />
            </CardContent>
          </Card>

          {/* Card 2: Portal Branding — LIVE */}
          <Card
            className="relative overflow-hidden border-border transition-shadow hover:shadow-md"
            data-ocid="admin_settings.card"
          >
            <CardHeader className="flex flex-row items-start gap-4 pb-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Palette className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-semibold text-foreground">
                    Portal Branding
                  </CardTitle>
                  <span className="inline-flex items-center rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
                    Active
                  </span>
                </div>
                <CardDescription className="mt-1 text-sm text-muted-foreground">
                  Upload a logo, set the portal name, and choose a color theme.
                  Changes apply immediately across the portal.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <BrandingPanel />
            </CardContent>
          </Card>

          {/* Card 3: Custom Fields — LIVE */}
          <Card
            className="relative overflow-hidden border-border transition-shadow hover:shadow-md"
            data-ocid="admin_settings.card"
          >
            <CardHeader className="flex flex-row items-start gap-4 pb-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sliders className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-semibold text-foreground">
                    Custom Fields
                  </CardTitle>
                  <span className="inline-flex items-center rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
                    Active
                  </span>
                </div>
                <CardDescription className="mt-1 text-sm text-muted-foreground">
                  Add or remove custom fields per portal section. Fields appear
                  in create forms across the portal.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <CustomFieldsPanel />
            </CardContent>
          </Card>

          {/* Card 4: General Settings — Coming soon */}
          <Card
            className="relative overflow-hidden border-border transition-shadow hover:shadow-md md:col-span-2"
            data-ocid="admin_settings.card"
          >
            <CardHeader className="flex flex-row items-start gap-4 pb-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Wrench className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-semibold text-foreground">
                    General Settings
                  </CardTitle>
                  <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    Coming soon
                  </span>
                </div>
                <CardDescription className="mt-1 text-sm text-muted-foreground">
                  Other portal-wide configuration options. (Coming soon)
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-12 w-full rounded-md bg-muted/40 border border-dashed border-border flex items-center justify-center">
                <span className="text-xs text-muted-foreground/60 select-none">
                  Configuration options will appear here
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sticky footer bar */}
      <div className="sticky bottom-0 z-10 border-t border-border bg-background p-4 flex justify-end gap-3">
        <Button
          variant="ghost"
          onClick={handleCancel}
          data-ocid="admin_settings.cancel_button"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          data-ocid="admin_settings.save_button"
        >
          {isSaving ? "Saving…" : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}

// ─── Section Visibility Panel ────────────────────────────────────────────────

interface SectionVisibilityPanelProps {
  defaultSections: PortalSectionConfig[];
  sectionSettings: Record<string, { label: string; visible: boolean }>;
  onUpdate: (
    id: string,
    patch: Partial<{ label: string; visible: boolean }>,
  ) => void;
  onReset: () => void;
}

function SectionVisibilityPanel({
  defaultSections,
  sectionSettings,
  onUpdate,
  onReset,
}: SectionVisibilityPanelProps) {
  return (
    <div className="space-y-4">
      {/* Column header row */}
      <div className="hidden sm:grid sm:grid-cols-[1fr_auto] gap-4 px-1 pb-1 border-b border-border">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Section / Custom Label
        </span>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">
          Visible
        </span>
      </div>

      {/* Section rows */}
      <ul className="space-y-3" data-ocid="portal_settings.visibility_list">
        {defaultSections.map((section, index) => {
          const setting = sectionSettings[section.id] ?? {
            label: section.defaultLabel,
            visible: true,
          };
          const rowIndex = index + 1;

          return (
            <li
              key={section.id}
              className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border transition-colors ${
                setting.visible
                  ? "border-border bg-card"
                  : "border-border/40 bg-muted/30 opacity-60"
              }`}
            >
              {/* Label column */}
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground min-w-[6rem]">
                    {section.defaultLabel}
                    {section.adminOnly && (
                      <span className="ml-1.5 inline-flex items-center rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-medium text-amber-600 dark:text-amber-400">
                        Admin
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor={`label-input-${section.id}`}
                    className="text-xs text-muted-foreground/70 whitespace-nowrap"
                  >
                    Custom label:
                  </Label>
                  <Input
                    id={`label-input-${section.id}`}
                    value={setting.label}
                    placeholder={section.defaultLabel}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      onUpdate(section.id, { label: e.target.value })
                    }
                    className="h-8 text-sm max-w-xs"
                    data-ocid={`portal_settings.section_label_input.${rowIndex}`}
                  />
                </div>
              </div>

              {/* Visibility toggle */}
              <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                <span className="text-xs text-muted-foreground sm:hidden">
                  Visible in nav
                </span>
                <Switch
                  id={`visible-switch-${section.id}`}
                  checked={setting.visible}
                  onCheckedChange={(checked: boolean) =>
                    onUpdate(section.id, { visible: checked })
                  }
                  data-ocid={`portal_settings.section_visible_switch.${rowIndex}`}
                />
              </div>
            </li>
          );
        })}
      </ul>

      {/* Reset defaults */}
      <div className="flex justify-start pt-2 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="gap-2 text-muted-foreground hover:text-foreground"
          data-ocid="portal_settings.reset_defaults_button"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Defaults
        </Button>
      </div>
    </div>
  );
}
