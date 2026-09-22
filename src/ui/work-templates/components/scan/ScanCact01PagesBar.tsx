import React, { useRef } from 'react';
import { Alert, Box, Button, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import { NoteAdd as NoteAddIcon } from '@mui/icons-material';
import type { Cact01PagesState } from '../../hooks/useCact01Pages';

const ACCEPTED_FILE_TYPES = '.png,.jpg,.jpeg,.webp,.pdf';

interface ScanCact01PagesBarProps {
  state: Cact01PagesState;
  onPreviewPage: (previewUrl: string) => void;
  disabled?: boolean;
}

/**
 * Pages of a CACT-01 load. A troop changing activity is 60 to 200 head, so three to ten
 * A4 sheets: each one is scanned here and all of them are confirmed together, which is
 * what keeps the all-or-nothing rule covering the whole movement.
 */
export const ScanCact01PagesBar: React.FC<ScanCact01PagesBarProps> = ({ state, onPreviewPage, disabled = false }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { pages, pendingPage, missingPages, isIdentifying, pageError } = state;

  const handleFiles = async (files: FileList | null) => {
    for (const file of Array.from(files ?? [])) {
      // One at a time: a page with a different header stops the queue until the operator decides.
      const outcome = await state.addPageFromFile(file);

      if (outcome !== 'added') break;
    }

    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
        <Box sx={{ pl: 1.5, borderLeft: '3px solid #0a6ed1', mr: 1 }}>
          <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1 }}>
            Hojas del movimiento ({pages.length})
          </Typography>
        </Box>
        {pages.map((page, idx) => (
          <Chip
            key={page.key}
            size="small"
            color="success"
            variant="outlined"
            label={`Hoja ${page.hojaNumero ?? idx + 1} ✓ · ${page.rows.length} animales`}
            onClick={page.previewUrl ? () => onPreviewPage(page.previewUrl as string) : undefined}
            onDelete={disabled || pages.length === 1 ? undefined : () => state.removePage(page.key)}
            sx={{ fontWeight: 700, borderRadius: '4px' }}
          />
        ))}
        {missingPages.map((n) => (
          <Chip key={`missing-${n}`} size="small" color="warning" label={`Hoja ${n} falta`} sx={{ fontWeight: 700, borderRadius: '4px' }} />
        ))}
        <Box sx={{ flexGrow: 1 }} />
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_FILE_TYPES}
          style={{ display: 'none' }}
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Button
          size="small"
          variant="outlined"
          startIcon={isIdentifying ? <CircularProgress size={14} /> : <NoteAddIcon />}
          disabled={disabled || isIdentifying || pendingPage !== null}
          onClick={() => inputRef.current?.click()}
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '6px' }}
        >
          {isIdentifying ? 'Analizando hoja…' : 'Agregar hoja'}
        </Button>
      </Stack>

      {missingPages.length > 0 && (
        <Typography variant="caption" color="warning.main" sx={{ fontWeight: 600 }}>
          Faltan hojas según el total escrito en la planilla. Podés confirmar igual si ya no quedan animales por cargar.
        </Typography>
      )}

      {pageError && (
        <Alert severity="error" onClose={() => state.setPageError(null)} sx={{ borderRadius: '6px' }}>
          {pageError}
        </Alert>
      )}

      {pendingPage && (
        <Alert
          severity="warning"
          sx={{ borderRadius: '6px' }}
          action={
            <Stack direction="row" spacing={1}>
              <Button color="inherit" size="small" onClick={state.discardPendingPage}>
                Descartar hoja
              </Button>
              <Button color="inherit" size="small" variant="outlined" onClick={state.acceptPendingPage}>
                Es del mismo movimiento
              </Button>
            </Stack>
          }
        >
          La hoja <strong>{pendingPage.fileName}</strong> dice lote de origen "{pendingPage.metadata.lote_origen || 'sin nombre'}" y fecha{' '}
          {pendingPage.metadata.fecha_movimiento}, distinto de la hoja 1. Si es del mismo movimiento, se agrega y vale el encabezado de la hoja 1.
        </Alert>
      )}
    </Box>
  );
};

export default ScanCact01PagesBar;
