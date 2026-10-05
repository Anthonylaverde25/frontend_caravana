import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import axiosInstance from '@/utils/axios';
import { useReceiveEntryOrder } from '@/features/entry-orders/hooks/useEntryOrderMutations';
import { EntryOrder, EntryOrderResult, entryOrderApiError, entryOrderErrorMessage } from '@/features/entry-orders/types';
import EntryOrderStatusChip from '@/ui/entry-orders/components/EntryOrderStatusChip';
import type { Ing03PagesState, Ing03Row } from '../../hooks/useIng03Pages';
import { breedAndCoatOf } from '../../templates/ing03/useIng03Sheet';
import { Ing03Outcome, resolveIng03 } from './ing03/ing03Resolution';

const OUTCOME_CHIP: Record<Ing03Outcome, { label: string; color: 'success' | 'warning' | 'default' | 'info' | 'error' }> = {
  received: { label: 'Se recibe', color: 'success' },
  missing: { label: 'No llega', color: 'warning' },
  later: { label: 'Llega después', color: 'default' },
  unlisted: { label: 'Sin DTE', color: 'info' },
  ignored: { label: 'No se carga', color: 'default' },
  error: { label: 'A corregir', color: 'error' }
};

const ACCEPTED_FILE_TYPES = '.png,.jpg,.jpeg,.webp,.pdf';

interface ScanIng03WorkspaceProps {
  state: Ing03PagesState;
  onPreviewPage: (previewUrl: string) => void;
}

/**
 * Review of a scanned ING-03, the receipt sheet of a DTE. The sheet only names the order, the DTE
 * and its R-number: the purchase comes from the order. Each line is checked against the caravans of
 * the order — received, not arriving, still in transit, or arrived without being in any DTE — and a
 * person supervises it before it is registered as one reception, with the sheet's pages marked as
 * scanned. A sheet weighed with one average shows its PESO PROMEDIO in the header and no weight per
 * line, as the paper does.
 */
export const ScanIng03Workspace: React.FC<ScanIng03WorkspaceProps> = ({ state, onPreviewPage }) => {
  const navigate = useNavigate();
  const receive = useReceiveEntryOrder();
  const inputRef = useRef<HTMLInputElement>(null);
  const [done, setDone] = useState<EntryOrderResult | null>(null);
  const [serverError, setServerError] = useState<string[]>([]);
  const { pages, rows, metadata, missingPages, isIdentifying, pageError } = state;
  const code = metadata.orden_ingreso;
  const today = new Date().toISOString().slice(0, 10);

  const { data: order, isLoading } = useQuery({
    queryKey: ['entry-orders', 'by-code', code, 'detail'],
    queryFn: async (): Promise<EntryOrder | null> =>
      (await axiosInstance.get<EntryOrder>(`/entry-orders/by-code/${encodeURIComponent(code)}`).catch(() => ({ data: null }))).data,
    enabled: code !== ''
  });

  const live = useMemo(() => resolveIng03(order ?? null, pages, rows, metadata, today), [order, pages, rows, metadata, today]);
  // Once registered, the review shows what was registered: the order refreshes and would re-read
  // every line as "already received".
  const [registered, setRegistered] = useState<typeof live | null>(null);
  const resolution = registered ?? live;
  const sheet = order?.receipt_sheets.find((s) => s.label === metadata.hoja_recepcion) ?? null;
  const averaged = sheet?.weighing_mode === 'AVERAGE';
  const rowErrors = resolution.counts.error;

  // A message about the previous attempt no longer applies once the review changes.
  useEffect(() => setServerError([]), [rows, metadata]);

  const handleFiles = async (files: FileList | null) => {
    for (const file of Array.from(files ?? [])) {
      const added = await state.addPageFromFile(file);
      if (!added) break;
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  const submit = () => {
    if (!order || !live.payload) return;

    setServerError([]);
    receive.mutate(
      { id: order.id, payload: live.payload },
      {
        onSuccess: (result) => {
          setRegistered(live);
          setDone(result);
        },
        onError: (error) => {
          const body = entryOrderApiError(error);
          setServerError([
            ...(body?.header_errors ?? []).map((e) => e.message),
            ...(body?.row_errors ?? []).map((e) => e.message),
            ...(!body?.header_errors?.length && !body?.row_errors?.length ? [entryOrderErrorMessage(error, 'No se pudo registrar la recepción')] : [])
          ]);
        }
      }
    );
  };

  const cell = (row: Ing03Row, field: 'caravana' | 'peso' | 'ec' | 'sexo' | 'raza' | 'pelaje', width: number) => (
    <TextField
      size="small"
      variant="standard"
      value={row[field]}
      disabled={done !== null}
      onChange={(e) =>
        state.updateRow(row.id, field, field === 'caravana' || field === 'sexo' ? e.target.value.toUpperCase() : e.target.value)
      }
      InputProps={{ disableUnderline: true, sx: { fontFamily: 'monospace', fontWeight: field === 'caravana' ? 800 : 600, fontSize: '0.8rem' } }}
      sx={{ width }}
    />
  );

  return (
    <Stack spacing={2} sx={{ p: 2.5 }}>
      {/* The order and the sheet the paper names, resolved. */}
      <Paper elevation={0} sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: '6px' }}>
        {isLoading ? (
          <Stack direction="row" spacing={1} alignItems="center">
            <CircularProgress size={14} />
            <Typography variant="caption">Buscando la orden {code}…</Typography>
          </Stack>
        ) : order ? (
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography sx={{ fontFamily: 'monospace', fontWeight: 800 }}>{order.code}</Typography>
            <EntryOrderStatusChip status={order.status} progress={order} />
            <Typography variant="body2" color="text.secondary">
              {order.provider.name} · {order.farm.name} · lote {order.batch_name}
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Chip
              size="small"
              label={
                sheet
                  ? `${sheet.label} · DTE ${sheet.dte_number} · ${sheet.weighing_mode_label} · ${sheet.status_label}`
                  : `Hoja ${metadata.hoja_recepcion || '¿?'}`
              }
              color={sheet ? (sheet.is_active ? 'info' : 'default') : 'error'}
              sx={{ fontWeight: 700, borderRadius: '6px' }}
            />
          </Stack>
        ) : (
          <Typography variant="body2" color="error">
            {code ? `No existe la orden de ingreso ${code}.` : 'La hoja no trae el código de la orden.'}
          </Typography>
        )}
      </Paper>

      {/* Pages of the sheet: scanned together, confirmed together. */}
      <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
        <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1 }}>
          Hojas ({pages.length}
          {sheet ? ` de ${sheet.page_count}` : ''})
        </Typography>
        {pages.map((page, idx) => (
          <Chip
            key={page.key}
            size="small"
            color="success"
            variant="outlined"
            label={`Hoja ${page.hojaNumero ?? idx + 1} ✓ · ${page.rows.length} renglones`}
            onClick={page.previewUrl ? () => onPreviewPage(page.previewUrl as string) : undefined}
            onDelete={done || pages.length === 1 ? undefined : () => state.removePage(page.key)}
            sx={{ fontWeight: 700, borderRadius: '4px' }}
          />
        ))}
        {missingPages.map((n) => (
          <Chip key={`missing-${n}`} size="small" color="warning" label={`Hoja ${n} falta`} sx={{ fontWeight: 700, borderRadius: '4px' }} />
        ))}
        <Box sx={{ flexGrow: 1 }} />
        <input ref={inputRef} type="file" multiple accept={ACCEPTED_FILE_TYPES} style={{ display: 'none' }} onChange={(e) => handleFiles(e.target.files)} />
        <Button
          size="small"
          variant="outlined"
          disabled={isIdentifying || done !== null}
          onClick={() => inputRef.current?.click()}
          startIcon={isIdentifying ? <CircularProgress size={14} /> : <FuseSvgIcon size={16}>heroicons-outline:document-plus</FuseSvgIcon>}
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '6px' }}
        >
          {isIdentifying ? 'Analizando hoja…' : 'Agregar hoja'}
        </Button>
      </Stack>
      {missingPages.length > 0 && (
        <Typography variant="caption" color="warning.main" sx={{ fontWeight: 600, mt: '-8px !important' }}>
          Faltan hojas: se puede registrar igual. Las caravanas de las hojas que faltan siguen en tránsito, y la orden muestra qué hoja no volvió.
        </Typography>
      )}
      {pageError && (
        <Alert severity="error" onClose={() => state.setPageError(null)} sx={{ borderRadius: '6px' }}>
          {pageError}
        </Alert>
      )}

      {/* What the header of the paper says, editable. */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          label="Fecha de recepción"
          type="date"
          size="small"
          required
          value={metadata.fecha_recepcion}
          disabled={done !== null}
          onChange={(e) => state.setMetadataField('fecha_recepcion', e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{ max: today }}
          error={!metadata.fecha_recepcion}
          helperText={!metadata.fecha_recepcion ? 'No se leyó: escribila.' : undefined}
          sx={{ width: 220 }}
        />
        {averaged && (
          <TextField
            label="Peso promedio (kg)"
            size="small"
            value={metadata.peso_promedio}
            disabled={done !== null}
            onChange={(e) => state.setMetadataField('peso_promedio', e.target.value.replace(',', '.'))}
            helperText={!metadata.peso_promedio ? 'Sin peso: se reciben sin pesar.' : 'Para todas las que llegaron.'}
            inputProps={{ inputMode: 'decimal' }}
            sx={{ width: 200, flexShrink: 0 }}
          />
        )}
        <TextField
          label={`Motivo de las que no llegan${resolution.counts.missing > 0 ? ' (obligatorio)' : ''}`}
          size="small"
          fullWidth
          value={metadata.motivo_no_llegan}
          disabled={done !== null}
          onChange={(e) => state.setMetadataField('motivo_no_llegan', e.target.value)}
          error={resolution.counts.missing > 0 && metadata.motivo_no_llegan.trim().length < 3}
        />
      </Stack>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {(['received', 'missing', 'later', 'unlisted', 'error'] as Ing03Outcome[]).map((outcome) => (
          <Chip
            key={outcome}
            size="small"
            color={resolution.counts[outcome] > 0 ? OUTCOME_CHIP[outcome].color : 'default'}
            variant={resolution.counts[outcome] > 0 ? 'filled' : 'outlined'}
            label={`${OUTCOME_CHIP[outcome].label}: ${resolution.counts[outcome]}`}
            sx={{ fontWeight: 700 }}
          />
        ))}
      </Stack>

      {[...resolution.headerErrors, ...serverError].map((message) => (
        <Alert key={message} severity="error" sx={{ borderRadius: '6px', py: 0 }}>
          {message}
        </Alert>
      ))}
      {resolution.headerWarnings.map((message) => (
        <Alert key={message} severity="warning" sx={{ borderRadius: '6px', py: 0 }}>
          {message}
        </Alert>
      ))}

      <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: '6px', overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ '& .MuiTableCell-root': { fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase', color: 'text.secondary' } }}>
              <TableCell>Hoja</TableCell>
              <TableCell>Caravana</TableCell>
              <TableCell>Sexo</TableCell>
              <TableCell>Raza</TableCell>
              <TableCell>Pelaje</TableCell>
              <TableCell align="center">Llegó</TableCell>
              <TableCell align="center">No llega</TableCell>
              <TableCell>EC</TableCell>
              {!averaged && <TableCell>Peso</TableCell>}
              <TableCell>Resultado</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const result = resolution.rows.get(row.id);
              const outcome = result?.outcome ?? 'ignored';

              return (
                <TableRow key={row.id} sx={{ bgcolor: outcome === 'error' ? 'rgba(220, 38, 38, 0.05)' : undefined }}>
                  <TableCell sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>{row.pageNumber ?? '—'}</TableCell>
                  <TableCell>{cell(row, 'caravana', 150)}</TableCell>
                  <TableCell>{result?.animal ? <Typography sx={{ fontSize: '0.8rem' }}>{result.animal.sex}</Typography> : cell(row, 'sexo', 36)}</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem' }}>{result?.animal && order ? breedAndCoatOf(order, result.animal).breed : cell(row, 'raza', 100)}</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem' }}>{result?.animal && order ? breedAndCoatOf(order, result.animal).coat : cell(row, 'pelaje', 90)}</TableCell>
                  <TableCell align="center">
                    <Checkbox
                      size="small"
                      checked={row.llego === 'X'}
                      disabled={done !== null}
                      onChange={(e) => state.updateRow(row.id, 'llego', e.target.checked ? 'X' : '')}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Checkbox
                      size="small"
                      color="warning"
                      checked={row.no_llega === 'X'}
                      disabled={done !== null}
                      onChange={(e) => state.updateRow(row.id, 'no_llega', e.target.checked ? 'X' : '')}
                    />
                  </TableCell>
                  <TableCell>{cell(row, 'ec', 44)}</TableCell>
                  {!averaged && <TableCell>{cell(row, 'peso', 70)}</TableCell>}
                  <TableCell sx={{ minWidth: 220 }}>
                    <Chip size="small" label={OUTCOME_CHIP[outcome].label} color={OUTCOME_CHIP[outcome].color} sx={{ fontWeight: 700, mb: result?.note ? 0.5 : 0 }} />
                    {result?.note && (
                      <Typography
                        variant="caption"
                        sx={{ display: 'block', lineHeight: 1.3, color: result.note.severity === 'error' ? 'error.main' : result.note.severity === 'warning' ? 'warning.dark' : 'text.secondary' }}
                      >
                        {result.note.message}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Quitar renglón">
                      <span>
                        <IconButton size="small" disabled={done !== null} onClick={() => state.deleteRow(row.id)}>
                          <FuseSvgIcon size={16}>heroicons-outline:trash</FuseSvgIcon>
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>

      {done ? (
        <Alert
          severity="success"
          sx={{ borderRadius: '6px' }}
          action={
            <Button color="inherit" size="small" onClick={() => navigate(`/entry-orders?orderId=${done.order.id}`)} sx={{ textTransform: 'none', fontWeight: 700 }}>
              Abrir la orden
            </Button>
          }
        >
          Recepción registrada. Orden {done.order.code}: {done.order.status_label.toLowerCase()} · {done.order.received_count} recibidas
          {done.order.in_transit_count > 0 ? ` · ${done.order.in_transit_count} siguen en tránsito` : ''}.
        </Alert>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1.5 }}>
          <Button size="small" onClick={state.addRow} startIcon={<FuseSvgIcon size={16}>heroicons-outline:plus</FuseSvgIcon>} sx={{ textTransform: 'none', fontWeight: 600 }}>
            Agregar renglón
          </Button>
          <Button
            variant="contained"
            disableElevation
            disabled={receive.isPending}
            onClick={() => {
              // Told on click, not by a disabled button: the theme paints a disabled button like an active one.
              if (!resolution.payload) {
                setServerError([rowErrors > 0 ? `Hay ${rowErrors === 1 ? '1 renglón' : `${rowErrors} renglones`} a corregir.` : 'Corregí lo marcado arriba antes de registrar.']);
                return;
              }
              submit();
            }}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '6px', px: 3 }}
          >
            {receive.isPending ? 'Registrando…' : 'Registrar recepción'}
          </Button>
        </Box>
      )}
    </Stack>
  );
};

export default ScanIng03Workspace;
