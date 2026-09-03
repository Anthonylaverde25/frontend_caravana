import React, { createContext, useContext, useEffect, useState } from "react";
import GlobalStyles from "@mui/material/GlobalStyles";

export type ContrastPreset =
  | "default"
  | "high-contrast-dark"
  | "high-contrast-light"
  | "sap-fiori"
  | "emerald"
  | "custom";

export interface ContrastSettings {
  enabled: boolean;
  headerBg: string;
  headerText: string;
  asideBg: string;
  asideText: string;
  primaryButtonBg: string;
  secondaryButtonBg: string;
  preset: ContrastPreset;
}

export const PRESETS: Record<
  Exclude<ContrastPreset, "custom">,
  Omit<ContrastSettings, "enabled" | "preset">
> = {
  default: {
    headerBg: "",
    headerText: "",
    asideBg: "",
    asideText: "",
    primaryButtonBg: "#0E3D26",
    secondaryButtonBg: "#059669",
  },
  "high-contrast-dark": {
    headerBg: "#0F172A",
    headerText: "#FFFFFF",
    asideBg: "#020617",
    asideText: "#F8FAFC",
    primaryButtonBg: "#2563EB",
    secondaryButtonBg: "#3B82F6",
  },
  "high-contrast-light": {
    headerBg: "#FFFFFF",
    headerText: "#000000",
    asideBg: "#F8FAFC",
    asideText: "#020617",
    primaryButtonBg: "#0E3D26",
    secondaryButtonBg: "#10B981",
  },
  "sap-fiori": {
    headerBg: "#0A6ED1",
    headerText: "#FFFFFF",
    asideBg: "#1D232A",
    asideText: "#F4F4F4",
    primaryButtonBg: "#0A6ED1",
    secondaryButtonBg: "#475569",
  },
  emerald: {
    headerBg: "#064E3B",
    headerText: "#ECFDF5",
    asideBg: "#022C22",
    asideText: "#F0FDF4",
    primaryButtonBg: "#0E3D26",
    secondaryButtonBg: "#059669",
  },
};

const DEFAULT_SETTINGS: ContrastSettings = {
  enabled: true,
  headerBg: "",
  headerText: "",
  asideBg: "",
  asideText: "",
  primaryButtonBg: "#0E3D26",
  secondaryButtonBg: "#059669",
  preset: "default",
};

const LOCAL_STORAGE_KEY = "fuse_header_aside_contrast";

interface ContrastThemeContextType {
  settings: ContrastSettings;
  updateSettings: (newSettings: Partial<ContrastSettings>) => void;
  applyPreset: (preset: ContrastPreset) => void;
  resetToDefault: () => void;
  toggleEnabled: () => void;
}

const ContrastThemeContext = createContext<
  ContrastThemeContextType | undefined
>(undefined);

export const ContrastThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<ContrastSettings>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (error) {
      console.error(
        "Error loading contrast settings from localStorage:",
        error,
      );
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Error saving contrast settings to localStorage:", error);
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<ContrastSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
      preset: newSettings.preset || "custom",
      enabled: newSettings.enabled !== undefined ? newSettings.enabled : true,
    }));
  };

  const applyPreset = (preset: ContrastPreset) => {
    if (preset === "default") {
      resetToDefault();
      return;
    }

    const presetValues = PRESETS[preset as keyof typeof PRESETS];
    if (presetValues) {
      setSettings({
        enabled: true,
        preset,
        ...presetValues,
      });
    }
  };

  const resetToDefault = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  const toggleEnabled = () => {
    setSettings((prev) => ({
      ...prev,
      enabled: !prev.enabled,
    }));
  };

  const primaryBtn = settings.enabled ? settings.primaryButtonBg || "#0E3D26" : null;
  const secondaryBtn = settings.enabled ? settings.secondaryButtonBg || "#059669" : null;

  return (
    <ContrastThemeContext.Provider
      value={{
        settings,
        updateSettings,
        applyPreset,
        resetToDefault,
        toggleEnabled,
      }}
    >
      {/* Global CSS overrides for Primary & Secondary action buttons */}
      {settings.enabled && (primaryBtn || secondaryBtn) && (
        <GlobalStyles
          styles={{
            ...(primaryBtn && {
              ".MuiButton-containedPrimary": {
                backgroundColor: `${primaryBtn} !important`,
                color: "#ffffff !important",
                "&:hover": {
                  filter: "brightness(0.92)",
                  backgroundColor: `${primaryBtn} !important`,
                },
              },
              ".MuiButton-outlinedPrimary": {
                color: `${primaryBtn} !important`,
                borderColor: `${primaryBtn} !important`,
                "&:hover": {
                  backgroundColor: `${primaryBtn}15 !important`,
                  borderColor: `${primaryBtn} !important`,
                },
              },
              ".MuiButton-textPrimary": {
                color: `${primaryBtn} !important`,
              },
              ".MuiIconButton-colorPrimary": {
                color: `${primaryBtn} !important`,
              },
              ".MuiFab-primary": {
                backgroundColor: `${primaryBtn} !important`,
                color: "#ffffff !important",
              },
              ".MuiChip-colorPrimary": {
                backgroundColor: `${primaryBtn} !important`,
                color: "#ffffff !important",
              },
            }),
            ...(secondaryBtn && {
              ".MuiButton-containedSecondary": {
                backgroundColor: `${secondaryBtn} !important`,
                color: "#ffffff !important",
                "&:hover": {
                  filter: "brightness(0.92)",
                  backgroundColor: `${secondaryBtn} !important`,
                },
              },
              ".MuiButton-outlinedSecondary": {
                color: `${secondaryBtn} !important`,
                borderColor: `${secondaryBtn} !important`,
                "&:hover": {
                  backgroundColor: `${secondaryBtn}15 !important`,
                  borderColor: `${secondaryBtn} !important`,
                },
              },
              ".MuiButton-textSecondary": {
                color: `${secondaryBtn} !important`,
              },
              ".MuiIconButton-colorSecondary": {
                color: `${secondaryBtn} !important`,
              },
              ".MuiFab-secondary": {
                backgroundColor: `${secondaryBtn} !important`,
                color: "#ffffff !important",
              },
            }),
          }}
        />
      )}
      {children}
    </ContrastThemeContext.Provider>
  );
};

export const useContrastTheme = (): ContrastThemeContextType => {
  const context = useContext(ContrastThemeContext);
  if (!context) {
    throw new Error(
      "useContrastTheme must be used within a ContrastThemeProvider",
    );
  }
  return context;
};
