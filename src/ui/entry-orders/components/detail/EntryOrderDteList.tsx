import React from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { ARRIVAL_FINDINGS, type EntryOrder, type EntryOrderDte } from '@/features/entry-orders/types';
import { RECEPTION_METHOD_LABELS, formatDate } from '../entryOrderFormat';

interface EntryOrderDteListProps {
  order: EntryOrder;
  onReceive: (dte: EntryOrderDte) => void;
  /** Receives it and identifies its animals at once, on a full screen. */
  onReceiveWithCaravans: (dte: EntryOrderDte) => void;
  /** "Corregir cabezas": the head of the DTE were loaded wrong. */
  onCorrect: (dte: EntryOrderDte) => void;
  /** The ING-03 receipt sheet of the DTE, to receive it at the chute on paper. */
  onPrintSheet: (dte: EntryOrderDte) => void;
}

const buttonSx = { textTransform: 'none', fontWeight: 700, borderRadius: '6px', py: 0.25 } as const;

/** "lesión al arribo: ojo 2, aplomo 1", or null when no caravan came with one. */
const findingsOf = (dte: EntryOrderDte): string | null => {
  const marked = ARRIVAL_FINDINGS.filter((f) => (dte.arrival_findings_count?.[f.code] ?? 0) > 0).map(
    (f) => `${f.short.toLowerCase()} ${dte.arrival_findings_count?.[f.code]}`
  );

  return marked.length > 0 ? `lesión al arribo: ${marked.join(', ')}` : null;
};

/** "50 cabezas · recibidas 48 · en tránsito 0 · no llegan 2 · lesión al arribo: ojo 1". */
const progressOf = (dte: EntryOrderDte): string =>
  [
    `${dte.head_count} ${dte.head_count === 1 ? 'cabeza' : 'cabezas'}`,
    `recibidas ${dte.received_count}`,
    dte.uncaravaned_count > 0 ? `${dte.uncaravaned_count} sin caravana` : null,
    `en tránsito ${dte.pending_count}`,
    dte.missing_head_count > 0 ? `no llegan ${dte.missing_head_count}` : null,
    dte.excess_count > 0 ? `${dte.excess_count} de más` : null,
    findingsOf(dte)
  ]
    .filter(Boolean)
    .join(' · ');

/**
 * Each DTE loaded against the order: the head it declares, how many arrived, are on their way or
 * will not arrive, and the caravans received on it. "Recibir" stays while the DTE has head in
 * transit; "Cargar caravanas" while head were received without caravan; the ING-03 while either;
 * "Corregir cabezas" while the order is open.
 */
export const EntryOrderDteList: React.FC<EntryOrderDteListProps> = ({ order, onReceive, onReceiveWithCaravans, onCorrect, onPrintSheet }) => {
  const stop = (action: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    action();
  };

  return (
    <Box>
      <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary' }}>
        DTE cargados
      </Typography>
      {order.dtes.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {order.status === 'DRAFT'
            ? 'Los DTE se cargan una vez confirmada la compra.'
            : order.accepts_dte
              ? 'Todavía no se cargó ningún DTE. Cada DTE declara cuántas cabezas vienen; las caravanas se anotan cuando llegan.'
              : 'Se anuló antes de cargar un DTE.'}
        </Typography>
      ) : (
        <Stack spacing={1} sx={{ mt: 0.5 }}>
          {order.dtes.map((dte) => (
            <Accordion key={dte.id} disableGutters elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: '6px', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<FuseSvgIcon size={18}>heroicons-outline:chevron-down</FuseSvgIcon>}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%', pr: 1, flexWrap: 'wrap' }}>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 800, fontFamily: 'monospace' }}>DTE {dte.dte_number}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {progressOf(dte)} · emitido {formatDate(dte.dte_date)}
                      {dte.loaded_by?.name ? ` · cargó ${dte.loaded_by.name}` : ''}
                    </Typography>
                  </Box>
                  {order.can_correct_dtes && (
                    <Button size="small" variant="text" component="span" color="inherit" onClick={stop(() => onCorrect(dte))} sx={buttonSx}>
                      Corregir cabezas
                    </Button>
                  )}
                  {((dte.pending_count > 0 && order.accepts_reception) || dte.uncaravaned_count > 0) && (
                    <Button
                      size="small"
                      variant="text"
                      component="span"
                      onClick={stop(() => onPrintSheet(dte))}
                      startIcon={<FuseSvgIcon size={15}>heroicons-outline:printer</FuseSvgIcon>}
                      sx={buttonSx}
                    >
                      Hoja ING-03
                    </Button>
                  )}
                  {dte.pending_count > 0 && order.accepts_reception && (
                    <Button
                      size="small"
                      variant="contained"
                      disableElevation
                      component="span"
                      onClick={stop(() => onReceiveWithCaravans(dte))}
                      startIcon={<FuseSvgIcon size={15}>heroicons-outline:tag</FuseSvgIcon>}
                      sx={buttonSx}
                    >
                      Recibir y registrar caravanas
                    </Button>
                  )}
                  {dte.pending_count > 0 && order.accepts_reception && (
                    <Button
                      size="small"
                      variant="outlined"
                      component="span"
                      onClick={stop(() => onReceive(dte))}
                      startIcon={<FuseSvgIcon size={15}>heroicons-outline:truck</FuseSvgIcon>}
                      sx={buttonSx}
                    >
                      Recibir ({dte.pending_count})
                    </Button>
                  )}
                  {dte.pending_count === 0 && dte.uncaravaned_count > 0 && (
                    <Button
                      size="small"
                      variant="outlined"
                      component="span"
                      onClick={stop(() => onReceive(dte))}
                      startIcon={<FuseSvgIcon size={15}>heroicons-outline:tag</FuseSvgIcon>}
                      sx={buttonSx}
                    >
                      Cargar caravanas ({dte.uncaravaned_count})
                    </Button>
                  )}
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                {dte.observations && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 1 }}>
                    {dte.observations}
                  </Typography>
                )}
                {(dte.animals ?? []).length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    {dte.uncaravaned_count > 0
                      ? `Se recibieron ${dte.uncaravaned_count} cabezas sin caravana: cargalas a mano o con la hoja ING-03.`
                      : 'Todavía no llegó ningún animal de este DTE.'}
                  </Typography>
                ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Caravana</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Sexo</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Categoría</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Raza</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Recibida</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">
                        Peso
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(dte.animals ?? []).map((animal) => (
                      <TableRow key={animal.id}>
                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>{animal.identification}</TableCell>
                        <TableCell>{animal.sex === 'M' ? 'Macho' : 'Hembra'}</TableCell>
                        <TableCell>{order.categories.find((c) => c.position === animal.category_position)?.name ?? 'Sin declarar'}</TableCell>
                        <TableCell>
                          {animal.breed_position != null
                            ? `${animal.breed_letter} · ${order.breeds.find((b) => b.position === animal.breed_position)?.label ?? ''}`
                            : 'Sin declarar'}
                        </TableCell>
                        <TableCell>
                          {formatDate(animal.received_at)}
                          {animal.reception_method ? ` · ${RECEPTION_METHOD_LABELS[animal.reception_method]}` : ''}
                        </TableCell>
                        <TableCell align="right">{animal.entry_weight != null ? `${animal.entry_weight} kg` : '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default EntryOrderDteList;
