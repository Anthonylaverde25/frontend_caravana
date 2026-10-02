import React from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Box, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { EntryOrder } from '@/features/entry-orders/types';
import { formatDate } from '../entryOrderFormat';

/** Each DTE loaded against the order, with the caravans it brought. */
export const EntryOrderDteList: React.FC<{ order: EntryOrder }> = ({ order }) => (
  <Box>
    <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary' }}>
      DTE cargados
    </Typography>
    {order.dtes.length === 0 ? (
      <Typography variant="body2" color="text.secondary">
        {order.accepts_dte
          ? 'Todavía no llegó ningún DTE. Las caravanas se asignan cuando se carga el documento.'
          : 'La orden no tuvo DTE.'}
      </Typography>
    ) : (
      <Stack spacing={1} sx={{ mt: 0.5 }}>
        {order.dtes.map((dte) => (
          <Accordion key={dte.id} disableGutters elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: '6px', '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<FuseSvgIcon size={18}>heroicons-outline:chevron-down</FuseSvgIcon>}>
              <Box>
                <Typography sx={{ fontWeight: 800, fontFamily: 'monospace' }}>DTE {dte.dte_number}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {dte.head_count} cabezas · emitido {formatDate(dte.dte_date)} · ingresó {formatDate(dte.entered_at)}
                  {dte.loaded_by?.name ? ` · cargó ${dte.loaded_by.name}` : ''}
                </Typography>
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

export default EntryOrderDteList;
