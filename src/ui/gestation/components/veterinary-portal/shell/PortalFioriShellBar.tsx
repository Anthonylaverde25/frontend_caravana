import React, { useMemo } from "react";
import Logo from "@/components/theme-layouts/components/Logo";

interface PortalFioriShellBarProps {
  veterinarianName?: string;
  licenseNumber?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  ttlText?: string;
}

/**
 * Top SAP Fiori ShellBar for the Veterinary Portal.
 * Provides institutional branding, omnibox search for animals/protocols,
 * temporal session indicator, and professional badge.
 */
export const PortalFioriShellBar: React.FC<PortalFioriShellBarProps> = ({
  veterinarianName = "Dr. Fernando Aranguren",
  licenseNumber = "MP 4582",
  searchValue,
  onSearchChange,
  ttlText = "Acceso temporal (48h)",
}) => {
  const initials = useMemo(() => {
    if (!veterinarianName) return "VET";
    const parts = veterinarianName
      .replace(/^(Dr\.|Dra\.)\s*/i, "")
      .trim()
      .split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [veterinarianName]);

  return (
    <header
      className="sticky top-0 z-40 bg-[#0a3622] text-white shadow-sm"
      data-purpose="sap-shellbar"
    >
      <div className="flex h-12 items-center justify-between px-4 sm:px-6">
        {/* Left Institutional Branding (RXNA Sistema Ganadero + Portal Veterinario) */}
        <div className="flex items-center space-x-3.5">
          <Logo
            size="small"
            forceDark
            className="shrink-0 transition-opacity hover:opacity-95"
          />

          <div className="hidden h-6 w-px bg-emerald-700/60 sm:block" />

          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-wide text-white leading-none">
                Portal Veterinario
              </span>
              <span className="hidden lg:inline-flex items-center rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-300 border border-emerald-500/30 leading-none">
                OFICIAL
              </span>
            </div>
            <span className="hidden text-[10px] text-emerald-200/90 font-medium sm:inline leading-tight mt-0.5">
              Actas de Manga &amp; Evaluación
            </span>
          </div>
        </div>

        {/* Center Omnibox Search */}
        <div className="mx-4 hidden max-w-xs flex-1 md:flex">
          <div className="relative w-full">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-emerald-300">
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar caravana, protocolo o lote..."
              className="w-full rounded border border-emerald-800/80 bg-[#062416] py-1 pl-8 pr-3 text-xs text-white placeholder-emerald-300/60 transition focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
          </div>
        </div>

        {/* Right Session info and Profile */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="hidden items-center space-x-1.5 rounded-full border border-emerald-700/60 bg-white/5 px-2.5 py-0.5 text-[11px] text-emerald-200 md:inline-flex">
            <svg
              className="h-3 w-3 flex-shrink-0 text-amber-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6v6l4 2"
              />
            </svg>
            <span className="font-medium text-emerald-100">{ttlText}</span>
          </div>

          <div className="hidden items-center space-x-1 text-emerald-100 sm:flex">
            <button
              type="button"
              className="relative rounded p-1.5 transition hover:bg-white/10"
              title="Notificaciones de protocolo"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-amber-400" />
            </button>
          </div>

          <div className="h-4 w-px bg-emerald-700/60" />

          {/* User Badge */}
          <div className="flex items-center space-x-2 pl-1">
            <div className="flex h-7 w-7 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-800 text-xs font-semibold text-white shadow-xs">
              {initials}
            </div>
            <div className="hidden text-left leading-tight sm:block">
              <span className="block text-xs font-medium text-white">
                {veterinarianName}
              </span>
              <span className="text-[10px] text-emerald-200">
                {licenseNumber
                  ? `M.P. ${licenseNumber.replace(/^MP\s*/i, "")} • `
                  : ""}
                Veterinario Actuante
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PortalFioriShellBar;
