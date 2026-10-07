import React from "react";
import { Box, Typography, Stack } from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { ContrastPreset, PRESETS } from "@/contexts/ContrastThemeContext";
import { PresetCard, PresetItemData } from "./PresetCard";

interface PresetCategory {
  id: string;
  name: string;
  icon: string;
  items: PresetItemData[];
}

const CATEGORIES: PresetCategory[] = [
  {
    id: "agro",
    name: "Agro & Campo",
    icon: "lucide:sprout",
    items: [
      {
        id: "emerald",
        label: "Verde Esmeralda",
        subtitle: "Bosque profundo con acentos verdes",
        icon: "lucide:tree-pine",
        headerColor: PRESETS.emerald.headerBg,
        asideColor: PRESETS.emerald.asideBg,
        btnColor: PRESETS.emerald.primaryButtonBg,
      },
      {
        id: "campo-criollo",
        label: "Campo Criollo",
        subtitle: "Tonos tierra, tabaco y cuero rústico",
        icon: "lucide:sun-medium",
        headerColor: PRESETS["campo-criollo"].headerBg,
        asideColor: PRESETS["campo-criollo"].asideBg,
        btnColor: PRESETS["campo-criollo"].primaryButtonBg,
      },
      {
        id: "agtech-mint",
        label: "AgTech Mint",
        subtitle: "Verde nocturno con acentos menta neón",
        icon: "lucide:sparkles",
        headerColor: PRESETS["agtech-mint"].headerBg,
        asideColor: PRESETS["agtech-mint"].asideBg,
        btnColor: PRESETS["agtech-mint"].primaryButtonBg,
      },
      {
        id: "sage-linen",
        label: "Salvia & Lino",
        subtitle: "Diseño claro natural, fresco y sobrio",
        icon: "lucide:leaf",
        headerColor: PRESETS["sage-linen"].headerBg,
        asideColor: PRESETS["sage-linen"].asideBg,
        btnColor: PRESETS["sage-linen"].primaryButtonBg,
      },
    ],
  },
  {
    id: "corporate",
    name: "Corporativo & Analítica",
    icon: "lucide:briefcase",
    items: [
      {
        id: "sap-fiori",
        label: "SAP Fiori Clásico",
        subtitle: "Azul enterprise Fiori con barra lateral grafito",
        icon: "lucide:layers",
        headerColor: PRESETS["sap-fiori"].headerBg,
        asideColor: PRESETS["sap-fiori"].asideBg,
        btnColor: PRESETS["sap-fiori"].primaryButtonBg,
      },
      {
        id: "corporate-navy",
        label: "Azul Marino Corporativo",
        subtitle: "Azul profundo bancario con textos plata",
        icon: "lucide:shield",
        headerColor: PRESETS["corporate-navy"].headerBg,
        asideColor: PRESETS["corporate-navy"].asideBg,
        btnColor: PRESETS["corporate-navy"].primaryButtonBg,
      },
      {
        id: "nordic-slate",
        label: "Pizarra Nórdica",
        subtitle: "Gris neutro elegante para analítica",
        icon: "lucide:compass",
        headerColor: PRESETS["nordic-slate"].headerBg,
        asideColor: PRESETS["nordic-slate"].asideBg,
        btnColor: PRESETS["nordic-slate"].primaryButtonBg,
      },
      {
        id: "bordeaux-copper",
        label: "Burdeos & Cobre",
        subtitle: "Vino tinto ganadero con acentos cobre",
        icon: "lucide:flame",
        headerColor: PRESETS["bordeaux-copper"].headerBg,
        asideColor: PRESETS["bordeaux-copper"].asideBg,
        btnColor: PRESETS["bordeaux-copper"].primaryButtonBg,
      },
    ],
  },
  {
    id: "field",
    name: "Manga & Alto Contraste",
    icon: "lucide:zap",
    items: [
      {
        id: "high-contrast-dark",
        label: "Alto Contraste Oscuro",
        subtitle: "Negro obsidiana con azul eléctrico WCAG AAA",
        icon: "lucide:moon",
        headerColor: PRESETS["high-contrast-dark"].headerBg,
        asideColor: PRESETS["high-contrast-dark"].asideBg,
        btnColor: PRESETS["high-contrast-dark"].primaryButtonBg,
      },
      {
        id: "high-contrast-light",
        label: "Alto Contraste Claro",
        subtitle: "Fondo blanco puro con textos negros profundos",
        icon: "lucide:sun",
        headerColor: PRESETS["high-contrast-light"].headerBg,
        asideColor: PRESETS["high-contrast-light"].asideBg,
        btnColor: PRESETS["high-contrast-light"].primaryButtonBg,
      },
      {
        id: "manga-hivis",
        label: "Manga / Sol Directo (Hi-Vis)",
        subtitle: "Negro absoluto y amarillo reflectivo de campo",
        icon: "lucide:alert-circle",
        headerColor: PRESETS["manga-hivis"].headerBg,
        asideColor: PRESETS["manga-hivis"].asideBg,
        btnColor: PRESETS["manga-hivis"].primaryButtonBg,
      },
    ],
  },
];

const DEFAULT_PRESET_ITEM: PresetItemData = {
  id: "default",
  label: "Predeterminado del Sistema",
  subtitle: "Restablece el tema predeterminado original",
  icon: "lucide:rotate-ccw",
  headerColor: "#FFFFFF",
  asideColor: "#1E293B",
  btnColor: "#0E3D26",
};

interface PresetSelectorProps {
  currentPreset: ContrastPreset;
  enabled: boolean;
  onSelect: (preset: ContrastPreset) => void;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  currentPreset,
  enabled,
  onSelect,
}) => {
  return (
    <Stack spacing={3}>
      {/* Default Option */}
      <Box>
        <PresetCard
          preset={DEFAULT_PRESET_ITEM}
          isSelected={currentPreset === "default" || !enabled}
          disabled={false}
          onSelect={onSelect}
        />
      </Box>

      {/* Preset Categories */}
      {CATEGORIES.map((cat) => (
        <Box key={cat.id}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 1.5,
              pl: 1,
              borderLeft: (theme) => `3px solid ${theme.palette.primary.main}`,
            }}
          >
            <FuseSvgIcon size={16} color="action">
              {cat.icon}
            </FuseSvgIcon>
            <Typography
              variant="overline"
              sx={{
                color: "text.secondary",
                fontWeight: 700,
                letterSpacing: 1,
                fontSize: "0.75rem",
              }}
            >
              {cat.name}
            </Typography>
          </Box>

          <Stack spacing={1}>
            {cat.items.map((item) => (
              <PresetCard
                key={item.id}
                preset={item}
                isSelected={currentPreset === item.id && enabled}
                disabled={!enabled}
                onSelect={onSelect}
              />
            ))}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
};
