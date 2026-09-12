import { createContext, useContext } from "react";
import {
  DiagnosticProtocol,
  PendingTube,
  SampleShipment,
  SampleType,
  VeterinaryPortalSession,
} from "@/core/veterinary/domain/VeterinaryTypes";

export interface VeterinaryPortalContextType {
  session: VeterinaryPortalSession | undefined;
  accessToken: string | null;
  isProfessional: boolean;
  isReadOnly: boolean;
  acts: {
    pending_signature: DiagnosticProtocol[];
    pending_lab_report: DiagnosticProtocol[];
  } | undefined;
  loadingActs: boolean;
  pendingTubes: PendingTube[];
  loadingTubes: boolean;
  shipments: SampleShipment[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  basePath: string;
  onSignAct: (act: DiagnosticProtocol) => void;
  onReportAct: (act: DiagnosticProtocol) => void;
  onOpenShipment: (protocol?: DiagnosticProtocol) => void;
  onVoidShipment: (shipment: SampleShipment, reason: string) => Promise<void>;
  // Shared Act Setup Fields (Tropa, Ensayo, Ronda, Fechas, KPIs)
  batchId: number | null;
  setBatchId: (id: number | null) => void;
  sampleType: SampleType;
  setSampleType: (type: SampleType) => void;
  sampleRound: number;
  setSampleRound: (round: number) => void;
  sampleDate: string;
  setSampleDate: (date: string) => void;
  resultDate: string;
  setResultDate: (date: string) => void;
  totalBulls: number;
  setTotalBulls: (count: number) => void;
  evaluatedCount: number;
  setEvaluatedCount: (count: number) => void;
}

export const VeterinaryPortalContext =
  createContext<VeterinaryPortalContextType | null>(null);

export function useVeterinaryPortalContext(): VeterinaryPortalContextType {
  const context = useContext(VeterinaryPortalContext);
  if (!context) {
    throw new Error(
      "useVeterinaryPortalContext must be used within a VeterinaryPortalLayout",
    );
  }
  return context;
}
