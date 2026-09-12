import React from "react";
import { DiagnosticProtocol } from "@/core/veterinary/domain/VeterinaryTypes";

interface PortalLabHistoryPanelProps {
  protocols?: DiagnosticProtocol[];
  isLoading?: boolean;
}

/**
 * Tab 3: Laboratory history archive for the veterinary portal.
 * Displays completed and verified protocols with Senasa/Renalab certificates.
 */
export const PortalLabHistoryPanel: React.FC<PortalLabHistoryPanelProps> = ({
  protocols = [],
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-700 border-t-transparent" />
      </div>
    );
  }

  if (protocols.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-slate-800">
          Sin historial de laboratorio disponible
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Los informes analíticos certificados por el laboratorio oficial
          aparecerán en esta sección.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="bg-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-700">
            <tr className="border-b border-slate-200">
              <th className="px-4 py-2.5">N° Protocolo</th>
              <th className="px-4 py-2.5">Fecha de Muestreo</th>
              <th className="px-4 py-2.5">Laboratorio Certificante</th>
              <th className="px-4 py-2.5 text-center">Muestras</th>
              <th className="px-4 py-2.5 text-center">Estado Oficial</th>
              <th className="px-4 py-2.5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {protocols.map((protocol) => (
              <tr key={protocol.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono font-bold text-slate-800">
                  {protocol.protocol_number}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {protocol.sample_date}
                </td>
                <td className="px-4 py-3 font-medium text-slate-700">
                  {protocol.analysing_institution?.nombre ??
                    protocol.reporting_institution?.nombre ??
                    "Sin declarar"}
                  {/* ADR-31 (rev.): lo declaró el profesional, así que se muestra. */}
                  {protocol.is_derived && (
                    <span
                      className="ml-2 inline-flex rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700"
                      title={`Derivado desde ${protocol.reporting_institution?.nombre ?? "otro centro"}`}
                    >
                      Derivado
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-center font-mono text-slate-600">
                  {protocol.samples_count}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                    Certificado
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-900"
                  >
                    Ver Dictamen
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PortalLabHistoryPanel;
