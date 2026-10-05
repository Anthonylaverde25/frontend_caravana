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
import type { EntryOrder, EntryOrderDte } from '@/features/entry-orders/types';
import { formatDate } from '../entryOrderFormat';
import ReceptionStatusChip from './ReceptionStatusChip';

interface EntryOrderDteListProps {
  order: EntryOrder;
  onReceive: (dte: EntryOrderDte) => void;
  /** Every DTE with caravans in transit, received in one go. */
  onReceiveAll: (dtes: EntryOrderDte[]) => void;
  /** The ING-03 receipt sheet of the DTE, to receive it at the chute on paper. */
  onPrintSheet: (dte: EntryOrderDte) => void;
}

/**
 * Each DTE loaded against the order, how many of its caravans arrived, and each caravan with its
 * reception. "Recibir" stays while the DTE has caravans in transit; "Recibir todo" takes every
 * caravan in transit of the order at once, for whoever prefers it direct — only when more than one
 * DTE waits, since with one it would do the same as its "Recibir".
 */
export const EntryOrderDteList: React.FC<EntryOrderDteListProps> = ({ order, onReceive, onReceiveAll, onPrintSheet }) => {
  const pendingDtes = order.dtes.filter((dte) => dte.in_transit_count > 0);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary' }}>
          DTE cargados
        </Typography>
        {order.accepts_reception && pendingDtes.length > 1 && (
          <Button
            size="small"
            variant="contained"
            disableElevation
            onClick={() => onReceiveAll(pendingDtes)}
            startIcon={<FuseSvgIcon size={15}>heroicons-outline:truck</FuseSvgIcon>}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '6px', py: 0.25 }}
          >
            Recibir todo ({order.in_transit_count})
          </Button>
        )}
      </Box>
      {order.dtes.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {order.status === 'DRAFT'
            ? 'Los DTE se cargan una vez confirmada la compra.'
            : order.accepts_dte
              ? 'Todavía no se cargó ningún DTE. Las caravanas existen desde que se carga el documento, en tránsito hasta recibirlas.'
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
                      Recibidas {dte.received_count} de {dte.head_count}
                      {dte.missing_count > 0 ? ` · ${dte.missing_count} no llegarán` : ''} · emitido {formatDate(dte.dte_date)}
                      {dte.loaded_by?.name ? ` · cargó ${dte.loaded_by.name}` : ''}
                    </Typography>
                  </Box>
                  {dte.in_transit_count > 0 && order.accepts_reception && (
                    <Button
                      size="small"
                      variant="text"
                      component="span"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        onPrintSheet(dte);
                      }}
                      startIcon={<FuseSvgIcon size={15}>heroicons-outline:printer</FuseSvgIcon>}
                      sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '6px', py: 0.25 }}
                    >
                      Hoja ING-03
                    </Button>
                  )}
                  {dte.in_transit_count > 0 && order.accepts_reception && (
                    <Button
                      size="small"
                      variant="outlined"
                      component="span"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        onReceive(dte);
                      }}
                      startIcon={<FuseSvgIcon size={15}>heroicons-outline:truck</FuseSvgIcon>}
                      sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '6px', py: 0.25 }}
                    >
                      Recibir ({dte.in_transit_count})
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
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Caravana</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Sexo</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Raza</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Recepción</TableCell>
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
                        <TableCell>
                          {animal.breed_position != null
                            ? `${animal.breed_letter} · ${order.breeds.find((b) => b.position === animal.breed_position)?.label ?? ''}`
                            : 'Sin declarar'}
                        </TableCell>
                        <TableCell>
                          <ReceptionStatusChip animal={animal} />
                        </TableCell>
                        <TableCell align="right">{animal.entry_weight != null ? `${animal.entry_weight} kg` : '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default EntryOrderDteList;
