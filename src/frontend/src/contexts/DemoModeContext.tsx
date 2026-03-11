import { UserRole } from "@/backend";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type DemoPersona = "off" | "admin" | "approved_user" | "pending_user";

export interface DemoPersonaConfig {
  id: DemoPersona;
  label: string;
  description: string;
  color: string;
  role: UserRole;
  isApproved: boolean;
}

export const DEMO_PERSONAS: DemoPersonaConfig[] = [
  {
    id: "admin",
    label: "Admin",
    description: "Full portal access, settings, and role management",
    color: "violet",
    role: UserRole.admin,
    isApproved: true,
  },
  {
    id: "approved_user",
    label: "Approved User",
    description: "Standard member with access to all portal sections",
    color: "blue",
    role: UserRole.user,
    isApproved: true,
  },
  {
    id: "pending_user",
    label: "Pending User",
    description: "Awaiting admin approval — sees the approval gate",
    color: "amber",
    role: UserRole.guest,
    isApproved: false,
  },
];

interface DemoModeContextValue {
  activePersona: DemoPersona;
  activeConfig: DemoPersonaConfig | null;
  isDemoMode: boolean;
  setPersona: (persona: DemoPersona) => void;
  exitDemoMode: () => void;
}

const DemoModeContext = createContext<DemoModeContextValue | undefined>(
  undefined,
);

const STORAGE_KEY = "higgins_demo_persona";

export function DemoModeProvider({ children }: { children: React.ReactNode }) {
  const [activePersona, setActivePersona] = useState<DemoPersona>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as DemoPersona | null;
      if (
        stored &&
        (stored === "off" || DEMO_PERSONAS.find((p) => p.id === stored))
      ) {
        return stored;
      }
    } catch {
      // ignore
    }
    return "off";
  });

  const setPersona = useCallback((persona: DemoPersona) => {
    setActivePersona(persona);
    try {
      localStorage.setItem(STORAGE_KEY, persona);
    } catch {
      // ignore
    }
  }, []);

  const exitDemoMode = useCallback(() => {
    setPersona("off");
  }, [setPersona]);

  const activeConfig = useMemo(
    () => DEMO_PERSONAS.find((p) => p.id === activePersona) ?? null,
    [activePersona],
  );

  const isDemoMode = activePersona !== "off";

  const value = useMemo<DemoModeContextValue>(
    () => ({
      activePersona,
      activeConfig,
      isDemoMode,
      setPersona,
      exitDemoMode,
    }),
    [activePersona, activeConfig, isDemoMode, setPersona, exitDemoMode],
  );

  return (
    <DemoModeContext.Provider value={value}>
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  const ctx = useContext(DemoModeContext);
  if (!ctx) throw new Error("useDemoMode must be used within DemoModeProvider");
  return ctx;
}
