import React from "react";
import {
  Checkbox,
  Chip,
  MenuItem,
  TableCell,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import {
  LabSampleStatus,
  PortalBull,
} from "@/core/veterinary/domain/VeterinaryTypes";

export interface PortalPathogenColumn {
  id: number;
  code: string;
  name: string;
}

export interface PortalBullDraft {
  scrotal_circumference_cm: string;
  body_condition_score: string;
  aplomo_notes: string;
  libido: string;
  /** Keyed by pathogen id. */
  results: Record<number, LabSampleStatus>;
}

interface PortalBullEvaluationRowProps {
  bull: PortalBull;
  pathogens: PortalPathogenColumn[];
  selected: boolean;
  draft: PortalBullDraft;
  onToggle: (caravanId: number) => void;
  onDraftChange: (caravanId: number, patch: Partial<PortalBullDraft>) => void;
  onResultChange: (
    caravanId: number,
    pathogenId: number,
    status: LabSampleStatus,
  ) => void;
}

const LIBIDO_OPTIONS = ["BAJA", "MEDIA", "ALTA", "MUY_ALTA"];

const RESULT_OPTIONS: { value: LabSampleStatus; label: string }[] = [
  { value: "NEGATIVE_CLEARED", label: "Negativo" },
  { value: "POSITIVE_DETECTED", label: "Positivo" },
  { value: "PENDING_RESULTS", label: "Pendiente" },
];

/** One pass through the chute for one bull: biometry plus the samples taken on the spot. */
export const PortalBullEvaluationRow: React.FC<
  PortalBullEvaluationRowProps
> = ({
  bull,
  pathogens,
  selected,
  draft,
  onToggle,
  onDraftChange,
  onResultChange,
}) => (
  <TableRow hover selected={selected}>
    <TableCell padding="checkbox">
      <Checkbox
        size="small"
        checked={selected}
        onChange={() => onToggle(bull.caravan_id)}
      />
    </TableCell>

    <TableCell>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {bull.identification}
      </Typography>
      <Chip
        label={bull.aptitude_status}
        size="small"
        variant="outlined"
        sx={{ height: 18, fontSize: "0.65rem", mt: 0.25 }}
      />
    </TableCell>

    <TableCell sx={{ minWidth: 110 }}>
      <TextField
        size="small"
        variant="filled"
        fullWidth
        type="number"
        disabled={!selected}
        placeholder="CE cm"
        value={draft.scrotal_circumference_cm}
        onChange={(event) =>
          onDraftChange(bull.caravan_id, {
            scrotal_circumference_cm: event.target.value,
          })
        }
        sx={{
          bgcolor: "action.hover",
          "& .MuiFilledInput-input": { py: 0.75, fontSize: "0.8rem" },
        }}
      />
    </TableCell>

    <TableCell sx={{ minWidth: 100 }}>
      <TextField
        size="small"
        variant="filled"
        fullWidth
        type="number"
        disabled={!selected}
        placeholder="CC"
        value={draft.body_condition_score}
        onChange={(event) =>
          onDraftChange(bull.caravan_id, {
            body_condition_score: event.target.value,
          })
        }
        sx={{
          bgcolor: "action.hover",
          "& .MuiFilledInput-input": { py: 0.75, fontSize: "0.8rem" },
        }}
      />
    </TableCell>

    <TableCell sx={{ minWidth: 120 }}>
      <TextField
        select
        size="small"
        variant="filled"
        fullWidth
        disabled={!selected}
        value={draft.libido}
        onChange={(event) =>
          onDraftChange(bull.caravan_id, { libido: event.target.value })
        }
        sx={{
          bgcolor: "action.hover",
          "& .MuiFilledInput-input": { py: 0.75, fontSize: "0.8rem" },
        }}
      >
        {LIBIDO_OPTIONS.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </TextField>
    </TableCell>

    {pathogens.map((pathogen) => (
      <TableCell key={pathogen.id} align="center" sx={{ minWidth: 140 }}>
        <TextField
          select
          size="small"
          variant="filled"
          fullWidth
          disabled={!selected}
          value={draft.results[pathogen.id] ?? "NEGATIVE_CLEARED"}
          onChange={(event) =>
            onResultChange(
              bull.caravan_id,
              pathogen.id,
              event.target.value as LabSampleStatus,
            )
          }
          sx={{
            bgcolor: "action.hover",
            "& .MuiFilledInput-input": { py: 0.75, fontSize: "0.8rem" },
          }}
        >
          {RESULT_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </TableCell>
    ))}

    <TableCell sx={{ minWidth: 200 }}>
      <TextField
        size="small"
        variant="filled"
        fullWidth
        disabled={!selected}
        placeholder="Aplomos y observaciones"
        value={draft.aplomo_notes}
        onChange={(event) =>
          onDraftChange(bull.caravan_id, { aplomo_notes: event.target.value })
        }
        sx={{
          bgcolor: "action.hover",
          "& .MuiFilledInput-input": { py: 0.75, fontSize: "0.8rem" },
        }}
      />
    </TableCell>
  </TableRow>
);

export default PortalBullEvaluationRow;
