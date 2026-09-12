import React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import {
  LabSampleStatus,
  PortalBull,
} from "@/core/veterinary/domain/VeterinaryTypes";
import {
  PortalBullDraft,
  PortalBullEvaluationRow,
  PortalPathogenColumn,
} from "./PortalBullEvaluationRow";

interface PortalEvaluationTableProps {
  bulls: PortalBull[];
  pathogens: PortalPathogenColumn[];
  selectedIds: number[];
  drafts: Record<number, PortalBullDraft>;
  onToggle: (caravanId: number) => void;
  onDraftChange: (caravanId: number, patch: Partial<PortalBullDraft>) => void;
  onResultChange: (
    caravanId: number,
    pathogenId: number,
    status: LabSampleStatus,
  ) => void;
}

export const PortalEvaluationTable: React.FC<PortalEvaluationTableProps> = ({
  bulls,
  pathogens,
  selectedIds,
  drafts,
  onToggle,
  onDraftChange,
  onResultChange,
}) => (
  <TableContainer
    component={Paper}
    variant="outlined"
    sx={{ maxHeight: 520, borderRadius: "8px" }}
  >
    <Table size="small" stickyHeader>
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox" />
          <TableCell sx={{ fontWeight: 700 }}>Caravana</TableCell>
          <TableCell sx={{ fontWeight: 700 }}>C. Escrotal</TableCell>
          <TableCell sx={{ fontWeight: 700 }}>C. Corporal</TableCell>
          <TableCell sx={{ fontWeight: 700 }}>Libido</TableCell>
          {pathogens.map((pathogen) => (
            <TableCell
              key={pathogen.id}
              align="center"
              sx={{ fontWeight: 700 }}
            >
              {pathogen.name}
            </TableCell>
          ))}
          <TableCell sx={{ fontWeight: 700 }}>
            Aplomos / Observaciones
          </TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {bulls.map((bull) => (
          <PortalBullEvaluationRow
            key={bull.caravan_id}
            bull={bull}
            pathogens={pathogens}
            selected={selectedIds.includes(bull.caravan_id)}
            draft={
              drafts[bull.caravan_id] ?? {
                scrotal_circumference_cm: "",
                body_condition_score: "",
                aplomo_notes: "",
                libido: "MEDIA",
                results: {},
              }
            }
            onToggle={onToggle}
            onDraftChange={onDraftChange}
            onResultChange={onResultChange}
          />
        ))}

        {bulls.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={pathogens.length + 6}
              align="center"
              sx={{ py: 5 }}
            >
              <Typography variant="body2" color="text.secondary">
                No hay reproductores en la tropa seleccionada.
              </Typography>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </TableContainer>
);

export default PortalEvaluationTable;
