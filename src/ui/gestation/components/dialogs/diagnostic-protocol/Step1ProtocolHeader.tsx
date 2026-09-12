import React from 'react';
import { Alert, Box, Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Veterinarian } from '@/core/veterinary/domain/VeterinaryTypes';
import { AttachmentDropzone } from './AttachmentDropzone';

interface Step1ProtocolHeaderProps {
  protocolNumber: string;
  setProtocolNumber: (value: string) => void;
  sampleDate: string;
  setSampleDate: (value: string) => void;
  resultDate: string;
  setResultDate: (value: string) => void;
  veterinarianId: number | '';
  setVeterinarianId: (value: number | '') => void;
  observations: string;
  setObservations: (value: string) => void;
  attachments: File[];
  setAttachments: (files: File[]) => void;
  veterinarians: Veterinarian[];
  onQuickCreateVeterinarian: () => void;
  duplicateWarning?: string | null;
}

/**
 * Step 1 — the document itself: who signs it and the original evidence behind the
 * transcription.
 *
 * ADR-29: the institution that issued it is no longer picked from a catalogue; it is described
 * when the result is transcribed.
 */
export const Step1ProtocolHeader: React.FC<Step1ProtocolHeaderProps> = ({
  protocolNumber,
  setProtocolNumber,
  sampleDate,
  setSampleDate,
  resultDate,
  setResultDate,
  veterinarianId,
  setVeterinarianId,
  observations,
  setObservations,
  attachments,
  setAttachments,
  veterinarians,
  onQuickCreateVeterinarian,
  duplicateWarning,
}) => (
  <Stack spacing={2}>
    <Alert severity="info" sx={{ fontSize: '0.8rem', py: 0.5 }}>
      La foto es prueba documental, no dato operable. Los resultados por caravana se transcriben
      en el paso siguiente: el motor de aptitud y el candado sanitario leen la base relacional.
    </Alert>

    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
      <TextField
        label="N° de Protocolo"
        placeholder="LAB-2026-8492"
        value={protocolNumber}
        onChange={(event) => setProtocolNumber(event.target.value)}
        variant="filled"
        fullWidth
        required
        error={Boolean(duplicateWarning)}
        helperText={duplicateWarning ?? 'Tal como figura impreso en el informe del laboratorio.'}
        sx={{ bgcolor: 'action.hover' }}
      />
    </Stack>

    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
      <TextField
        label="Fecha de toma de muestra"
        type="date"
        value={sampleDate}
        onChange={(event) => setSampleDate(event.target.value)}
        variant="filled"
        fullWidth
        slotProps={{ inputLabel: { shrink: true } }}
        sx={{ bgcolor: 'action.hover' }}
      />
      <TextField
        label="Fecha de resultado"
        type="date"
        value={resultDate}
        onChange={(event) => setResultDate(event.target.value)}
        variant="filled"
        fullWidth
        slotProps={{ inputLabel: { shrink: true } }}
        sx={{ bgcolor: 'action.hover' }}
      />
    </Stack>

    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          select
          label="Médico Veterinario actuante"
          value={veterinarianId}
          onChange={(event) => setVeterinarianId(event.target.value === '' ? '' : Number(event.target.value))}
          variant="filled"
          fullWidth
          sx={{ bgcolor: 'action.hover' }}
        >
          <MenuItem value="">Sin profesional asignado</MenuItem>
          {veterinarians.map((vet) => (
            <MenuItem key={vet.id} value={vet.id}>
              {vet.name} — {vet.license_number}
            </MenuItem>
          ))}
        </TextField>

      </Stack>

      {/* Quick create keeps the form alive: a missing catalogue row must not cost the transcription. */}
      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        <Button
          size="small"
          variant="text"
          onClick={onQuickCreateVeterinarian}
          sx={{ fontWeight: 600, textTransform: 'none', color: 'primary.main' }}
          startIcon={<FuseSvgIcon size={16}>heroicons-outline:plus</FuseSvgIcon>}
        >
          Nuevo profesional
        </Button>
      </Stack>
    </Box>

    <AttachmentDropzone files={attachments} onChange={setAttachments} />

    <TextField
      label="Observaciones"
      value={observations}
      onChange={(event) => setObservations(event.target.value)}
      variant="filled"
      fullWidth
      multiline
      minRows={2}
      sx={{ bgcolor: 'action.hover' }}
    />

    <Typography variant="caption" color="text.secondary">
      El protocolo queda archivado como transcripción del propietario (sin aval profesional)
      hasta que un M.V. lo verifique.
    </Typography>
  </Stack>
);

export default Step1ProtocolHeader;
