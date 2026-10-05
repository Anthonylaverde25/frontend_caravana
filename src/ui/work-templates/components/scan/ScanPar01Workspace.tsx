import React, { useMemo, useRef } from 'react';
import { Alert, Box, Button, Chip, CircularProgress, Stack, TextField, Typography } from '@mui/material';
import { NoteAdd as NoteAddIcon } from '@mui/icons-material';
import TransferOrderStatusChip from '@/ui/transfer-orders/components/TransferOrderStatusChip';
import ScanPar01Table from './ScanPar01Table';
import { par01RowStatus } from './par01RowStatus';
import type { Par01PagesState } from '../../hooks/usePar01Pages';
import type { Par01BirthOrderState } from '../../hooks/usePar01BirthOrder';
import type { Par01Problems } from '../../hooks/usePar01Submission';

const ACCEPTED_FILE_TYPES = '.png,.jpg,.jpeg,.webp,.pdf';

interface ScanPar01WorkspaceProps {
  state: Par01PagesState;
  order: Par01BirthOrderState;
  problems: Par01Problems;
  onPreviewPage: (previewUrl: string) => void;
  isSaving: boolean;
}

/**
 * The review of a PAR-01 load: its pages, the birth order it fulfils, the header as read and the rows.
 * A person supervises every cell before saving; what the server objects to is marked on the cell,
 * with no extra repair step.
 */
export const ScanPar01Workspace: React.FC<ScanPar01WorkspaceProps> = ({ state, order, problems, onPreviewPage, isSaving }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const round = state.metadata.fecha_recorrida;

  // R1: what this load brings that the order does not know yet, and what it only repeats.
  const tally = useMemo(() => {
    const result = { news: 0, already: 0, overdue: 0, differs: 0, missingDates: 0 };

    state.rows.forEach((row) => {
      const status = par01RowStatus(row, order.animalOf(row.caravana_madre));

      if (status.kind === 'already') result.already += 1;
      else if (status.kind === 'differs') result.differs += 1;
      else if (status.kind === 'overdue_kept') result.overdue += 1;
      else if (!status.mark.empty) {
        result.news += 1;
        if (status.mark.overdue && !status.mark.outcome) result.overdue += 1;
        if (!row.fecha_nacimiento) result.missingDates += 1;
      }
    });

    return result;
  }, [state.rows, order]);
  const missingDates = tally.missingDates;

  const handleFiles = async (files: FileList | null) => {
    for (const file of Array.from(files ?? [])) {
      if (!(await state.addPageFromFile(file))) break;
    }

    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <Box>
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
          <Box sx={{ pl: 1.5, borderLeft: '3px solid #0a6ed1', mr: 1 }}>
            <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1 }}>
              Hojas de la recorrida ({state.pages.length})
            </Typography>
          </Box>
          {state.pages.map((page, idx) => (
            <Chip
              key={page.key}
              size="small"
              color="success"
              variant="outlined"
              label={`Hoja ${page.hojaNumero ?? idx + 1} ✓ · ${page.rows.length} filas`}
              onClick={page.previewUrl ? () => onPreviewPage(page.previewUrl as string) : undefined}
              onDelete={isSaving || state.pages.length === 1 ? undefined : () => state.removePage(page.key)}
              sx={{ fontWeight: 700, borderRadius: '4px' }}
            />
          ))}
          {state.missingPages.map((n) => (
            <Chip key={`missing-${n}`} size="small" color="warning" label={`Hoja ${n} falta`} sx={{ fontWeight: 700, borderRadius: '4px' }} />
          ))}
          <Box sx={{ flexGrow: 1 }} />
          <input ref={inputRef} type="file" multiple accept={ACCEPTED_FILE_TYPES} style={{ display: 'none' }} onChange={(e) => handleFiles(e.target.files)} />
          <Button
            size="small"
            variant="outlined"
            startIcon={state.isIdentifying ? <CircularProgress size={14} /> : <NoteAddIcon />}
            disabled={isSaving || state.isIdentifying}
            onClick={() => inputRef.current?.click()}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '6px' }}
          >
            {state.isIdentifying ? 'Analizando hoja…' : 'Agregar hoja'}
          </Button>
        </Stack>
        {state.pageError && (
          <Alert severity="error" onClose={() => state.setPageError(null)} sx={{ borderRadius: '6px' }}>
            {state.pageError}
          </Alert>
        )}
      </Box>

      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ md: 'center' }}>
          <TextField
            size="small"
            label="Orden de parición"
            value={state.metadata.orden_paricion}
            onChange={(e) => state.setMetadataField('orden_paricion', e.target.value)}
            error={order.notFound}
            helperText={order.notFound ? 'No existe: corregí la lectura, o borralo si la planilla se llenó sin orden.' : ' '}
            sx={{ minWidth: 240 }}
          />
          {order.order ? (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ pb: 2.5 }}>
              <TransferOrderStatusChip status={order.order.status} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {order.order.pending_head_count} de {order.order.head_count} vientres pendientes
                {order.order.overdue_head_count > 0 ? ` · ${order.order.overdue_head_count} con parto vencido` : ''}
              </Typography>
            </Stack>
          ) : (
            !state.metadata.orden_paricion.trim() && (
              <Typography variant="body2" color="text.secondary" sx={{ pb: 2.5 }}>
                Sin código: al confirmar se crea una orden registrada con estos partos.
              </Typography>
            )
          )}
          <Box sx={{ flexGrow: 1 }} />
          <TextField
            size="small"
            type="date"
            label="Fecha de recorrida"
            value={round}
            onChange={(e) => state.setMetadataField('fecha_recorrida', e.target.value)}
            InputLabelProps={{ shrink: true }}
            helperText=" "
          />
          <Button
            size="small"
            variant="outlined"
            disabled={!round || missingDates === 0}
            onClick={() => state.fillMissingDates(round)}
            sx={{ textTransform: 'none', fontWeight: 600, mb: 2.5, whiteSpace: 'nowrap' }}
          >
            Usarla en {missingDates} fila(s) sin fecha
          </Button>
        </Stack>

        {order.order && !order.order.is_open && (
          <Alert severity="error" sx={{ borderRadius: '6px' }}>
            La orden {order.order.code} está {order.order.status_label.toLowerCase()}: no admite más partos.
          </Alert>
        )}
        {problems.header.map((problem) => (
          <Alert key={`${problem.code}-${problem.message}`} severity="error" sx={{ borderRadius: '6px' }}>
            {problem.message}
          </Alert>
        ))}
        {Object.keys(problems.byRowId).length > 0 && (
          <Alert severity="error" sx={{ borderRadius: '6px' }}>
            {Object.keys(problems.byRowId).length} fila(s) con problemas, marcadas en la tabla. No se guardó nada: corregilas y confirmá de nuevo.
          </Alert>
        )}
      </Box>

      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip size="small" color="primary" variant="outlined" label={`${tally.news} nueva(s)`} sx={{ fontWeight: 700 }} />
          <Chip size="small" variant="outlined" label={`${tally.already} ya registrada(s)`} sx={{ fontWeight: 700 }} />
          <Chip size="small" color="warning" variant="outlined" label={`${tally.overdue} parto(s) vencido(s)`} sx={{ fontWeight: 700 }} />
          {tally.differs > 0 && (
            <Chip size="small" color="warning" label={`${tally.differs} distinta(s) a lo registrado: se conserva lo registrado`} sx={{ fontWeight: 700 }} />
          )}
        </Stack>
        <ScanPar01Table rows={state.rows} order={order} problems={problems} onRowChange={state.updateRow} onDeleteRow={state.deleteRow} />
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color="text.secondary">
            Sin marcar = el vientre sigue pendiente. NM = el ternero nació sin vida · M = nació vivo y murió al pie · N = pasó su fecha y no
            parió (alerta). Lo ya registrado se saltea. La cría nace en el lote de su madre. El padre es opcional: vacío usa el toro único o
            confirmado del servicio, o queda en Sires pendientes.
          </Typography>
          <Button size="small" onClick={state.addRow} disabled={isSaving} sx={{ textTransform: 'none', fontWeight: 700 }}>
            + Agregar fila
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default ScanPar01Workspace;
