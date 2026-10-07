import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Alert, Box, Button, Chip, Paper, Stack, Table, TableBody, TableCell, TableRow, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import axiosInstance from '@/utils/axios';
import { useSuppliers } from '@/features/suppliers/hooks/useSuppliers';
import { useFarms } from '@/features/suppliers/hooks/useFarms';
import { useAnimalCategories } from '@/features/categories/hooks/useAnimalCategories';
import { useBreeds } from '@/features/breeds/hooks/useBreeds';
import type { EntryOrderResult, EntryOrderSummary } from '@/features/entry-orders/types';
import CreateExternalBatchDialog from '@/ui/batches/components/external/CreateExternalBatchDialog';
import { fromFieldNotes, type ScanIssue } from './issues';
import type { ExternalBatchFormInput } from '@/ui/batches/components/external/externalBatchSchema';
import { ING02_CATEGORY_LINES, Ing02ScanReading, ing02ScanToForm } from './ing02/ing02ScanToForm';

const READ_FIELDS: { key: string; label: string }[] = [
  { key: 'orden_ingreso', label: 'Orden de ingreso' },
  { key: 'proveedor', label: 'Proveedor' },
  { key: 'cuit_proveedor', label: 'CUIT' },
  { key: 'establecimiento', label: 'Establecimiento' },
  { key: 'nombre_lote', label: 'Nombre del lote' },
  { key: 'fecha_compra', label: 'Fecha de compra' },
  { key: 'sexo', label: 'Sexo' },
  { key: 'machos', label: 'Machos' },
  { key: 'hembras', label: 'Hembras' },
  { key: 'edad', label: 'Edad' },
  { key: 'estado', label: 'Estado' },
  { key: 'peso_aprox', label: 'Peso aprox.' },
  { key: 'peso_min', label: 'Peso mín.' },
  { key: 'peso_max', label: 'Peso máx.' },
  { key: 'desbaste', label: 'Desbaste' },
  { key: 'sabe_comer', label: 'Sabe comer' },
  { key: 'garrapata', label: 'Garrapata' },
  { key: 'observaciones', label: 'Observaciones' }
];

const text = (value: unknown): string => {
  const raw = value && typeof value === 'object' && 'value' in (value as object) ? (value as { value: unknown }).value : value;

  return raw == null || raw === '' ? '—' : String(raw);
};

/**
 * Review of a scanned ING-02. A hand-filled sheet is the purchase written on paper: what was read
 * is shown as read, every cell that could not be matched is marked, and the order is created from
 * the same "Alta de Lote Externo" dialog, prefilled, where the person checks and confirms it. The
 * order is born waiting for its DTE, like any other.
 */
export const ScanIng02Workspace: React.FC<{ reading: Ing02ScanReading; onIssuesChange?: (issues: ScanIssue[]) => void }> = ({ reading, onIssuesChange }) => {
  const navigate = useNavigate();
  const { data: suppliers = [] } = useSuppliers();
  // The farms of the provider the sheet names: the unfiltered list also holds the company's own
  // farms, which the farm mapper refuses, so it is not usable here.
  const providerId = useMemo(
    () => ing02ScanToForm(reading, { suppliers, farms: [], categories: [], breeds: [] }).values.provider_id as number | undefined,
    [reading, suppliers]
  );
  const { data: farms = [] } = useFarms(providerId);
  const { data: categories = [] } = useAnimalCategories();
  const { data: breeds = [] } = useBreeds();
  // A snapshot taken when the review opens: catalogues refetching must not reset what is being edited.
  const [reviewValues, setReviewValues] = useState<ExternalBatchFormInput | null>(null);
  const [created, setCreated] = useState<EntryOrderResult | null>(null);
  const code = text(reading.context.orden_ingreso);

  // A sheet printed from an order already exists in the system: it is not loaded twice.
  const { data: existing } = useQuery({
    queryKey: ['entry-orders', 'by-code', code],
    queryFn: async (): Promise<EntryOrderSummary | null> =>
      (await axiosInstance.get<EntryOrderSummary>(`/entry-orders/by-code/${encodeURIComponent(code)}`).catch(() => ({ data: null }))).data,
    enabled: code !== '—'
  });

  const { values, notes } = useMemo(
    () => ing02ScanToForm(reading, { suppliers, farms, categories, breeds }),
    [reading, suppliers, farms, categories, breeds]
  );
  const errors = notes.filter((n) => n.severity === 'error');

  useEffect(() => onIssuesChange?.(fromFieldNotes(notes)), [notes, onIssuesChange]);
  const warnings = notes.filter((n) => n.severity === 'warning');

  return (
    <Stack spacing={2}>
      {existing && (
        <Alert severity="error" sx={{ borderRadius: '6px' }}>
          La hoja es de la orden {existing.code}, que ya está cargada ({existing.status_label.toLowerCase()}). No se vuelve a crear:{' '}
          <Button size="small" onClick={() => navigate(`/entry-orders?orderId=${existing.id}`)} sx={{ textTransform: 'none' }}>
            ver la orden
          </Button>
        </Alert>
      )}
      {created && (
        <Alert severity="success" sx={{ borderRadius: '6px' }}>
          Orden {created.order.code} creada: el lote {created.order.batch_name} queda en espera del DTE.{' '}
          <Button size="small" onClick={() => navigate(`/entry-orders?orderId=${created.order.id}`)} sx={{ textTransform: 'none' }}>
            Abrir la orden
          </Button>
        </Alert>
      )}

      <Stack direction="row" spacing={1}>
        <Chip color={errors.length ? 'error' : 'success'} label={`${errors.length} a corregir`} sx={{ fontWeight: 700 }} />
        <Chip color={warnings.length ? 'warning' : 'default'} variant="outlined" label={`${warnings.length} a revisar`} />
      </Stack>

      {notes.map((n) => (
        <Alert key={`${n.field}-${n.message}`} severity={n.severity} sx={{ borderRadius: '6px', py: 0 }}>
          {n.message}
        </Alert>
      ))}

      <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: '6px' }}>
        <Table size="small">
          <TableBody>
            {READ_FIELDS.map((field) => (
              <TableRow key={field.key}>
                <TableCell sx={{ width: 180, fontWeight: 700, color: 'text.secondary' }}>{field.label}</TableCell>
                <TableCell sx={{ fontFamily: 'monospace' }}>{text(reading.context[field.key])}</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary', verticalAlign: 'top' }}>Categorías</TableCell>
              <TableCell sx={{ fontFamily: 'monospace' }}>
                {Array.from({ length: ING02_CATEGORY_LINES }, (_, i) => i + 1)
                  .filter((n) => text(reading.context[`categoria_${n}`]) !== '—' || text(reading.context[`cabezas_${n}`]) !== '—')
                  .map((n) => (
                    <Box key={n}>
                      {n} · {text(reading.context[`categoria_${n}`])} · {text(reading.context[`cabezas_${n}`])} cab.
                    </Box>
                  ))}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary', verticalAlign: 'top' }}>Razas</TableCell>
              <TableCell sx={{ fontFamily: 'monospace' }}>
                {reading.rows.length === 0
                  ? '—'
                  : reading.rows.map((row, i) => (
                      <Box key={i}>
                        {String.fromCharCode(65 + i)} · {text(row.raza)} · {text(row.pelaje)}
                      </Box>
                    ))}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          disableElevation
          disabled={Boolean(existing) || Boolean(created)}
          onClick={() => setReviewValues(values)}
          startIcon={<FuseSvgIcon size={16}>heroicons-outline:pencil-square</FuseSvgIcon>}
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '6px' }}
        >
          Revisar y crear la orden
        </Button>
      </Box>

      <Typography variant="caption" color="text.secondary">
        Al confirmar se crea la orden en espera de DTE. Lo que no se pudo leer queda en blanco en el formulario: completalo ahí.
      </Typography>

      <CreateExternalBatchDialog
        open={reviewValues !== null}
        mode="order"
        initialValues={reviewValues}
        onClose={() => setReviewValues(null)}
        onSaved={setCreated}
      />
    </Stack>
  );
};

export default ScanIng02Workspace;
