import React, { useMemo, useState } from 'react';
import { Box, Divider, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useVeterinarians } from '@/features/gestation/hooks/useVeterinaryProtocols';
import { QuickCreateVeterinarianDialog } from '../../dialogs/QuickCreateVeterinarianDialog';

/**
 * Sentinel that opens the creation dialog instead of selecting somebody.
 *
 * Deliberately not the empty string: MUI reads `''` as "nothing selected" and paints the field
 * blank, so the option would look like it did nothing.
 */
const NEW_PROFESSIONAL = '__new__';

export interface SheetHeaderValues {
  veterinarian_id: number | '';
  evaluation_date: string;
  sample_round: number;
}

interface Props {
  values: SheetHeaderValues;
  onChange: (field: keyof SheetHeaderValues, value: string | number) => void;
  disabled?: boolean;
}

/**
 * Who answers for this chute session.
 *
 * ADR-29: nothing institutional is asked here any more. The operator used to have to decide
 * which health centre backed the act and, if the samples were derived, which laboratory they
 * were going to — two questions they frequently cannot answer, at the worst possible moment,
 * about rows somebody had to create in a catalogue beforehand.
 *
 * All of that now belongs to the veterinarian, who describes the institution when they dispatch
 * the tubes or transcribe the result: the moments when they actually know.
 */
export const SheetProfessionalHeader: React.FC<Props> = ({ values, onChange, disabled }) => {
  const { data: veterinarians = [], isLoading: loadingVets } = useVeterinarians();
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);

  const selectedVet = useMemo(
    () => veterinarians.find((v) => v.id === values.veterinarian_id),
    [veterinarians, values.veterinarian_id]
  );

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        border: 1,
        borderColor: 'divider',
        borderRadius: '8px',
        bgcolor: 'background.paper',
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '8px',
            bgcolor: 'action.hover',
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FuseSvgIcon size={20}>heroicons-outline:identification</FuseSvgIcon>
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
            Responsable del procedimiento
          </Typography>
          <Typography variant="caption" color="text.secondary">
            El acta se emite a su nombre. A dónde viajan los tubos lo carga después el profesional.
          </Typography>
        </Box>
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TextField
          select
          required
          label="Profesional actuante (M.V.)"
          value={values.veterinarian_id}
          onChange={(e) => {
            // A professional missing from the catalogue must not cost the loaded sheet: the
            // chute already happened and the tubes are in the cooler.
            if (e.target.value === NEW_PROFESSIONAL) {
              setQuickCreateOpen(true);
              return;
            }

            onChange('veterinarian_id', Number(e.target.value));
          }}
          disabled={disabled || loadingVets}
          variant="filled"
          size="small"
          sx={{ bgcolor: 'action.hover', flex: 2 }}
          helperText={
            selectedVet
              ? `Matrícula ${selectedVet.license_number}`
              : 'Sin profesional el acta no puede emitirse.'
          }
        >
          {veterinarians.map((vet) => (
            <MenuItem key={vet.id} value={vet.id}>
              {vet.name} — M.P. {vet.license_number}
              {vet.user_id === null ? ' · sin acceso al portal' : ''}
            </MenuItem>
          ))}

          <Divider />
          <MenuItem value={NEW_PROFESSIONAL}>+ Nuevo profesional…</MenuItem>
        </TextField>

        <TextField
          type="date"
          label="Fecha de apertura del acta"
          value={values.evaluation_date}
          onChange={(e) => onChange('evaluation_date', e.target.value)}
          disabled={disabled}
          variant="filled"
          size="small"
          InputLabelProps={{ shrink: true }}
          sx={{ bgcolor: 'action.hover', flex: 1 }}
          helperText="Cada tubo guarda su propia fecha."
        />

        <TextField
          select
          label="Ronda de muestreo"
          value={values.sample_round}
          onChange={(e) => onChange('sample_round', Number(e.target.value))}
          disabled={disabled}
          variant="filled"
          size="small"
          sx={{ bgcolor: 'action.hover', flex: 1 }}
          helperText="Se exigen 2 rondas negativas."
        >
          {[1, 2, 3, 4].map((round) => (
            <MenuItem key={round} value={round}>
              Ronda {round}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <QuickCreateVeterinarianDialog
        open={quickCreateOpen}
        onClose={() => setQuickCreateOpen(false)}
        onCreated={(created) => {
          // Selected straight away: the operator came here to close a sheet, not to manage a
          // catalogue.
          onChange('veterinarian_id', created.id);
          setQuickCreateOpen(false);
        }}
      />
    </Paper>
  );
};
