import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Alert, Box, Button, Chip, CircularProgress, Paper, Stack, TextField, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import axiosInstance from '@/utils/axios';
import { useReceiveEntryOrder } from '@/features/entry-orders/hooks/useEntryOrderMutations';
import { EntryOrder, EntryOrderApiError, EntryOrderResult, entryOrderApiError, entryOrderErrorMessage } from '@/features/entry-orders/types';
import EntryOrderStatusChip from '@/ui/entry-orders/components/EntryOrderStatusChip';
import MissingHeadPanel, { missingCountOf, type MissingFate } from '@/ui/entry-orders/components/reception/MissingHeadPanel';
import type { Ing03PagesState } from '../../hooks/useIng03Pages';
import Ing03ReviewTable, { OUTCOME_CHIP } from './ing03/Ing03ReviewTable';
import { Ing03Outcome, resolveIng03, withServerRowErrors } from './ing03/ing03Resolution';
import { ing03LayoutOf } from '../../templates/ing03/ing03Columns';
import { fromEntryOrderErrors, fromLocalChecks, fromRowNotes, type ScanIssue } from './issues';

const ACCEPTED_FILE_TYPES = '.png,.jpg,.jpeg,.webp,.pdf';

interface ScanIng03WorkspaceProps {
  state: Ing03PagesState;
  onPreviewPage: (previewUrl: string) => void;
  /** Every problem of the review and of the last attempt, for the guide of errors. */
  onIssuesChange?: (issues: ScanIssue[]) => void;
}

/**
 * Review of a scanned ING-03, the receipt sheet of a DTE. The sheet only names the order, the DTE
 * and its R-number: the purchase comes from the order. Each line written is an animal that arrived,
 * its caravan created on registering. When the lines are fewer than the head in transit, the
 * reviewer says whether the rest arrive later or never ("Faltan N"): the paper does not say it. A
 * person supervises it all before it is registered as one reception, with the sheet's pages marked
 * as scanned. A sheet weighed with one average shows its PESO PROMEDIO in the header and no weight
 * per line, as the paper does.
 */
export const ScanIng03Workspace: React.FC<ScanIng03WorkspaceProps> = ({ state, onPreviewPage, onIssuesChange }) => {
  const navigate = useNavigate();
  const receive = useReceiveEntryOrder();
  const inputRef = useRef<HTMLInputElement>(null);
  const [done, setDone] = useState<EntryOrderResult | null>(null);
  const [serverError, setServerError] = useState<string[]>([]);
  const [serverBody, setServerBody] = useState<EntryOrderApiError | null>(null);
  const [fate, setFate] = useState<MissingFate>('LATER');
  const [missingCount, setMissingCount] = useState('');
  const [reason, setReason] = useState('');
  const [showMissingErrors, setShowMissingErrors] = useState(false);
  const { pages, rows, metadata, missingPages, isIdentifying, pageError } = state;
  const code = metadata.orden_ingreso;
  const today = new Date().toISOString().slice(0, 10);

  const { data: order, isLoading } = useQuery({
    queryKey: ['entry-orders', 'by-code', code, 'detail'],
    queryFn: async (): Promise<EntryOrder | null> =>
      (await axiosInstance.get<EntryOrder>(`/entry-orders/by-code/${encodeURIComponent(code)}`).catch(() => ({ data: null }))).data,
    enabled: code !== ''
  });

  // "Faltan N" counts the head left after the lines written, so it is resolved twice: first to know them.
  const left = useMemo(() => resolveIng03(order ?? null, pages, rows, metadata, { count: 0, reason: '' }, today).left, [order, pages, rows, metadata, today]);
  const missing = { count: missingCountOf(fate, missingCount, left), reason };
  const live = useMemo(
    () => resolveIng03(order ?? null, pages, rows, metadata, missing, today),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [order, pages, rows, metadata, missing.count, missing.reason, today]
  );
  // Once registered, the review shows what was registered: the order refreshes and would re-read
  // every line as "already received".
  const [registered, setRegistered] = useState<typeof live | null>(null);
  // A written breed or category the server could not resolve marks its own line.
  const resolution = registered ?? withServerRowErrors(live, serverBody?.row_errors);
  const sheet = resolution.sheet;
  const averaged = sheet?.weighing_mode === 'AVERAGE';
  const rowErrors = resolution.counts.error;

  // A message about the previous attempt no longer applies once the review changes.
  useEffect(() => {
    setServerError([]);
    setServerBody(null);
  }, [rows, metadata]);

  useEffect(() => {
    onIssuesChange?.([
      ...fromLocalChecks(resolution.headerErrors, resolution.headerWarnings),
      ...fromRowNotes(rows.map((r) => ({ id: r.id, tag: r.caravana })), (id) => resolution.rows.get(id)?.note ?? null),
      ...fromEntryOrderErrors(
        serverBody?.header_errors,
        serverBody?.row_errors?.filter((e) => !live.sentRowIds[e.row])
      )
    ]);
  }, [resolution, live, rows, serverBody, onIssuesChange]);

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
          setServerBody(body);
          setServerError([
            ...(body?.header_errors ?? []).map((e) => e.message),
            ...(body?.row_errors ?? []).map((e) => e.message),
            ...(!body?.header_errors?.length && !body?.row_errors?.length ? [entryOrderErrorMessage(error, 'No se pudo registrar la recepción')] : [])
          ]);
        }
      }
    );
  };

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
          Faltan hojas: se puede registrar igual. Las cabezas de las hojas que faltan siguen en tránsito, y la orden muestra qué hoja no volvió.
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
          label="Observaciones de la hoja"
          size="small"
          fullWidth
          value={metadata.observaciones}
          disabled={done !== null}
          onChange={(e) => state.setMetadataField('observaciones', e.target.value)}
        />
      </Stack>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {resolution.dte && (
          <Chip
            size="small"
            variant="outlined"
            label={`DTE ${resolution.dte.dte_number}: ${resolution.dte.head_count} cabezas · ${resolution.dte.pending_count} en tránsito`}
            sx={{ fontWeight: 700 }}
          />
        )}
        {(['received', 'error'] as Ing03Outcome[]).map((outcome) => (
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

      <Ing03ReviewTable
        rows={rows}
        resolutions={resolution.rows}
        layout={
          order && sheet
            ? ing03LayoutOf(order, sheet)
            : { mixed: false, needsCategory: false, severalBreeds: false, averaged, written: true }
        }
        locked={done !== null}
        onChange={state.updateRow}
        onDelete={state.deleteRow}
      />

      {done === null && (
        <MissingHeadPanel
          left={left}
          fate={fate}
          onFate={(next) => {
            setFate(next);
            if (next === 'MISSING' && missingCount === '') setMissingCount(String(left));
          }}
          count={missingCount}
          onCount={setMissingCount}
          reason={reason}
          onReason={setReason}
          showErrors={showMissingErrors}
        />
      )}

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
                setShowMissingErrors(true);
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
