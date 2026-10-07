import React, { useRef, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { toast } from 'sonner';
import { useReadTri } from '@/features/entry-orders/hooks/useEntryOrderMutations';
import { entryOrderErrorMessage, type TriReading } from '@/features/entry-orders/types';

interface TriAttachmentProps {
  orderId: number;
  /** Adds the caravans read to the grid; returns how many were new. */
  onCaravans: (tags: string[]) => number;
  /** The TRI number read, to keep with the reception. */
  onTriNumber: (triNumber: string | null) => void;
}

const plural = (n: number, one: string, many: string) => (n === 1 ? `1 ${one}` : `${n} ${many}`);

/**
 * "Adjuntar TRI": the SENASA TRI of the DTE — a photo per page, or one PDF with all of them — is
 * read by the AI and its caravans fill the grid, in item order, for the person to review. What
 * looks wrong (a caravan written twice, one already in the system, another RENSPA, a page that
 * could not be read) is said, never fixed.
 */
export const TriAttachment: React.FC<TriAttachmentProps> = ({ orderId, onCaravans, onTriNumber }) => {
  const input = useRef<HTMLInputElement>(null);
  const read = useReadTri();
  const [reading, setReading] = useState<TriReading | null>(null);
  const [added, setAdded] = useState(0);

  const pick = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    read.mutate(
      { orderId, files: Array.from(files) },
      {
        onSuccess: (result) => {
          setReading(result);
          setAdded(onCaravans(result.caravans.map((c) => c.caravana)));
          onTriNumber(result.tri_numbers[0] ?? null);
        },
        onError: (error) => toast.error(entryOrderErrorMessage(error, 'No se pudo leer el TRI'))
      }
    );
    if (input.current) input.current.value = '';
  };

  const notes = reading
    ? [
        ...reading.warnings,
        reading.repeated.length > 0 ? `Repetidas en el TRI (se cargaron una vez): ${reading.repeated.join(', ')}.` : null,
        reading.existing.length > 0 ? `Ya existen en el sistema: ${reading.existing.join(', ')}. Revisá la lectura.` : null
      ].filter((note): note is string => Boolean(note))
    : [];

  return (
    <Box>
      <input ref={input} type="file" hidden multiple accept="image/*,application/pdf" onChange={(e) => pick(e.target.files)} />
      <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
        <Button
          size="small"
          variant="outlined"
          disabled={read.isPending}
          onClick={() => input.current?.click()}
          startIcon={read.isPending ? <CircularProgress size={14} /> : <FuseSvgIcon size={16}>heroicons-outline:paper-clip</FuseSvgIcon>}
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '6px' }}
        >
          {read.isPending ? 'Leyendo el TRI…' : reading ? 'Adjuntar otro TRI' : 'Adjuntar TRI'}
        </Button>
        <Typography variant="caption" color="text.secondary">
          {reading
            ? `TRI ${reading.tri_numbers.join(', ') || 'sin número legible'} · ${plural(reading.pages.length, 'archivo', 'archivos')} · ${plural(added, 'caravana agregada', 'caravanas agregadas')}`
            : 'Foto de cada hoja o un PDF: la IA lee el Nro. de caravana y completa la grilla.'}
        </Typography>
      </Stack>
      {notes.length > 0 && (
        <Alert severity="warning" sx={{ mt: 1, py: 0, borderRadius: '6px', '& .MuiAlert-message': { fontSize: '0.78rem' } }}>
          {notes.map((note) => (
            <Box key={note}>{note}</Box>
          ))}
        </Alert>
      )}
    </Box>
  );
};

export default TriAttachment;
