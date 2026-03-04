import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, RotateCcw, Save, Upload, X } from "lucide-react";
import type React from "react";
import { useRef } from "react";
import { toast } from "sonner";
import {
  DEFAULT_BRANDING,
  usePortalSettings,
} from "../../contexts/PortalSettingsContext";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

interface ColorPreset {
  label: string;
  hue: number;
  chroma: number;
}

const COLOR_PRESETS: ColorPreset[] = [
  { label: "Slate", hue: 264, chroma: 0.0 },
  { label: "Violet", hue: 264, chroma: 0.243 },
  { label: "Blue", hue: 220, chroma: 0.22 },
  { label: "Emerald", hue: 162, chroma: 0.17 },
  { label: "Amber", hue: 84, chroma: 0.189 },
  { label: "Rose", hue: 16, chroma: 0.246 },
];

interface BrandingPanelProps {
  onSave?: () => void;
  onReset?: () => void;
}

export default function BrandingPanel({ onSave, onReset }: BrandingPanelProps) {
  const { brandingSettings, updateBranding, saveBranding, resetBranding } =
    usePortalSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { logoDataUrl, primaryColorHue, primaryColorChroma, portalName } =
    brandingSettings;

  // ── Logo Upload ─────────────────────────────────────────────────────────────
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image too large — maximum size is 2 MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      updateBranding({ logoDataUrl: dataUrl });
      toast.success("Logo updated");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleClearLogo = () => {
    updateBranding({ logoDataUrl: undefined });
    toast("Logo cleared — using default");
  };

  // ── Color helpers ────────────────────────────────────────────────────────────
  const swatchColor = (hue: number, chroma: number) =>
    `oklch(0.60 ${chroma} ${hue})`;

  const isPresetActive = (preset: ColorPreset) =>
    Math.abs(preset.hue - primaryColorHue) < 2 &&
    Math.abs(preset.chroma - primaryColorChroma) < 0.01;

  const handlePresetClick = (preset: ColorPreset) => {
    updateBranding({
      primaryColorHue: preset.hue,
      primaryColorChroma: preset.chroma,
    });
  };

  // ── Save / Reset ─────────────────────────────────────────────────────────────
  const handleSave = () => {
    saveBranding();
    toast.success("Branding saved successfully");
    onSave?.();
  };

  const handleReset = () => {
    resetBranding();
    toast.success("Branding reset to defaults");
    onReset?.();
  };

  return (
    <div className="space-y-6">
      {/* ── Logo ─────────────────────────────────────────────── */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">
          Portal Logo
        </Label>
        <div className="flex items-center gap-4">
          {/* Preview thumbnail */}
          <div className="relative h-16 w-16 flex-shrink-0 rounded-xl overflow-hidden border-2 border-border bg-muted/40 flex items-center justify-center">
            {logoDataUrl ? (
              <img
                src={logoDataUrl}
                alt="Custom portal logo"
                className="h-full w-full object-cover"
              />
            ) : (
              <img
                src="/assets/generated/higgins-music-logo.dim_512x512.png"
                alt="Default portal logo"
                className="h-full w-full object-cover"
              />
            )}
          </div>

          {/* Upload / Clear buttons */}
          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/gif"
              className="hidden"
              onChange={handleFileSelect}
              aria-label="Upload logo image"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => fileInputRef.current?.click()}
              data-ocid="branding.logo_upload_button"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload Logo
            </Button>
            {logoDataUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={handleClearLogo}
                data-ocid="branding.logo_clear_button"
              >
                <X className="h-3.5 w-3.5" />
                Remove
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground leading-snug max-w-xs">
            PNG, JPG, or GIF · Max 2 MB
            <br />
            Will appear in the sidebar and mobile header.
          </p>
        </div>
      </div>

      {/* ── Portal Name ─────────────────────────────────────────── */}
      <div className="space-y-2">
        <Label
          htmlFor="branding-portal-name"
          className="text-sm font-medium text-foreground"
        >
          Portal Name
        </Label>
        <Input
          id="branding-portal-name"
          value={portalName}
          placeholder="Higgins Music"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            updateBranding({ portalName: e.target.value })
          }
          className="max-w-sm"
          data-ocid="branding.portal_name_input"
        />
        <p className="text-xs text-muted-foreground">
          Displayed in the sidebar header and mobile nav.
        </p>
      </div>

      {/* ── Color Theme ─────────────────────────────────────────── */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">
          Color Theme
        </Label>

        {/* Preset swatches */}
        <div className="flex flex-wrap gap-3">
          {COLOR_PRESETS.map((preset, index) => {
            const active = isPresetActive(preset);
            return (
              <button
                key={preset.label}
                type="button"
                title={preset.label}
                aria-label={`${preset.label} color theme${active ? " (active)" : ""}`}
                onClick={() => handlePresetClick(preset)}
                data-ocid={`branding.color_swatch.${index + 1}`}
                className="relative flex flex-col items-center gap-1.5 focus-visible:outline-none"
              >
                {/* Swatch circle */}
                <span
                  className={`h-9 w-9 rounded-full transition-transform duration-150 hover:scale-110 ${
                    active
                      ? "ring-2 ring-offset-2 ring-offset-background ring-foreground"
                      : "ring-1 ring-border/60"
                  }`}
                  style={{
                    background: swatchColor(preset.hue, preset.chroma),
                  }}
                >
                  {active && (
                    <span className="flex h-full w-full items-center justify-center">
                      <Check className="h-4 w-4 text-white drop-shadow" />
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-muted-foreground leading-none">
                  {preset.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Custom hue slider */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">
              Custom Hue ({Math.round(primaryColorHue)}°)
            </Label>
            <span
              className="h-5 w-5 rounded-full ring-1 ring-border/60 flex-shrink-0"
              style={{
                background: swatchColor(primaryColorHue, primaryColorChroma),
              }}
              aria-hidden="true"
            />
          </div>
          <input
            type="range"
            min={0}
            max={360}
            step={1}
            value={primaryColorHue}
            onChange={(e) =>
              updateBranding({ primaryColorHue: Number(e.target.value) })
            }
            data-ocid="branding.hue_slider"
            aria-label="Custom hue value"
            className="w-full max-w-sm h-2 rounded-full cursor-pointer accent-current"
            style={{
              background: `linear-gradient(to right, oklch(0.6 ${primaryColorChroma} 0), oklch(0.6 ${primaryColorChroma} 60), oklch(0.6 ${primaryColorChroma} 120), oklch(0.6 ${primaryColorChroma} 180), oklch(0.6 ${primaryColorChroma} 240), oklch(0.6 ${primaryColorChroma} 300), oklch(0.6 ${primaryColorChroma} 360))`,
            }}
          />
        </div>
      </div>

      {/* ── Live Preview ─────────────────────────────────────────── */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">Preview</Label>
        <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border/60">
          {/* Primary button sample */}
          <span
            className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm select-none"
            style={{
              background: `oklch(0.488 ${primaryColorChroma} ${primaryColorHue})`,
            }}
          >
            Primary Button
          </span>

          {/* Active nav item sample */}
          <span
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-white select-none"
            style={{
              background: `oklch(0.488 ${primaryColorChroma} ${primaryColorHue})`,
              opacity: 0.85,
            }}
          >
            ◀ Active Nav
          </span>

          {/* Accent ring sample */}
          <span
            className="h-8 w-8 rounded-full border-4 border-white shadow-sm flex-shrink-0"
            style={{
              background: `oklch(0.70 ${primaryColorChroma} ${primaryColorHue})`,
            }}
            aria-label="Color accent ring preview"
          />
        </div>
      </div>

      {/* ── Actions ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 pt-2 border-t border-border">
        <Button
          type="button"
          onClick={handleSave}
          className="gap-2"
          data-ocid="branding.save_button"
        >
          <Save className="h-4 w-4" />
          Save Branding
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          className="gap-2 text-muted-foreground hover:text-foreground"
          data-ocid="branding.reset_button"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Defaults
        </Button>
        <span className="text-xs text-muted-foreground ml-auto">
          Default:{" "}
          <span className="font-medium">
            {DEFAULT_BRANDING.portalName} · Violet
          </span>
        </span>
      </div>
    </div>
  );
}
