import { useNavigate } from "@tanstack/react-router";
import { usePortalSettings } from "../../contexts/PortalSettingsContext";
import LoginButton from "../auth/LoginButton";

interface BrandHeaderProps {
  showAuth?: boolean;
}

export default function BrandHeader({ showAuth = false }: BrandHeaderProps) {
  const navigate = useNavigate();
  const { brandingSettings } = usePortalSettings();

  const logoSrc =
    brandingSettings.logoDataUrl ??
    "/assets/generated/higgins-music-logo.dim_512x512.png";
  const portalName = brandingSettings.portalName ?? "Higgins Music";

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <img
            src={logoSrc}
            alt={portalName}
            className="h-10 w-10 rounded-full object-cover"
          />
          <span className="text-xl font-semibold">{portalName}</span>
        </button>
        {showAuth && <LoginButton />}
      </div>
    </header>
  );
}
