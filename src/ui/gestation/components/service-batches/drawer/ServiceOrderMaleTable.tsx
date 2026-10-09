import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';

interface MaleDetailItem {
  male_caravan_id: number;
  status: string;
  retired_at?: string | null;
  scrotal_circumference?: number | null;
  service_capacity?: string | null;
}

interface ServiceOrderMaleTableProps {
  maleCaravans: Caravan[];
  maleDetails?: MaleDetailItem[];
  onOpenReplaceDialog?: (bull: Caravan) => void;
}

export const ServiceOrderMaleTable: React.FC<ServiceOrderMaleTableProps> = ({
  maleCaravans,
  maleDetails = [],
  onOpenReplaceDialog,
}) => {
  const maleStatusMap = useMemo(() => {
    const map = new Map<number, MaleDetailItem>();
    maleDetails.forEach((d) => map.set(d.male_caravan_id, d));
    return map;
  }, [maleDetails]);

  const activeCount = useMemo(() => {
    if (maleDetails.length === 0) return maleCaravans.length;
    return maleCaravans.filter((m) => {
      const d = maleStatusMap.get(m.id);
      return !d || d.status === 'ACTIVE';
    }).length;
  }, [maleCaravans, maleDetails, maleStatusMap]);

  return (
    <>
      <Box
        sx={{
          mb: 1.5,
          pl: 1,
          borderLeft: (theme) => `3px solid ${theme.palette.primary.main}`,
        }}
      >
        <Typography
          variant="overline"
          sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1 }}
        >
          Reproductores Machos (♂) ({activeCount} Activo{activeCount === 1 ? '' : 's'}{maleCaravans.length > activeCount ? ` · ${maleCaravans.length} en Historial` : ''})
        </Typography>
      </Box>

      <Paper
        variant="outlined"
        sx={{
          p: 1.5,
          mb: 2,
          borderRadius: '8px',
          backgroundColor: (theme) => theme.palette.background.paper,
        }}
      >
        {maleCaravans.length === 0 ? (
          <Typography variant="caption" color="text.secondary" sx={{ p: 1, display: 'block' }}>
            No hay machos asignados actualmente a este lote.
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: '0.7rem', fontWeight: 700, py: 1 }}>Caravana</TableCell>
                  <TableCell sx={{ fontSize: '0.7rem', fontWeight: 700, py: 1 }}>Categoría / Raza</TableCell>
                  <TableCell sx={{ fontSize: '0.7rem', fontWeight: 700, py: 1, textAlign: 'center' }}>Estado</TableCell>
                  <TableCell sx={{ fontSize: '0.7rem', fontWeight: 700, py: 1, textAlign: 'right' }}>Peso</TableCell>
                  {onOpenReplaceDialog && (
                    <TableCell sx={{ fontSize: '0.7rem', fontWeight: 700, py: 1, textAlign: 'center' }}>
                      Acción
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {maleCaravans.map((male) => {
                  const detail = maleStatusMap.get(male.id);
                  const isRetired = detail && detail.status !== 'ACTIVE';

                  return (
                    <TableRow key={male.id} hover sx={{ opacity: isRetired ? 0.65 : 1 }}>
                      <TableCell sx={{ py: 1 }}>
                        <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.82rem', color: isRetired ? 'text.secondary' : 'primary.main' }}>
                          #{male.identification}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1 }}>
                        <Typography variant="body2" sx={{ fontSize: '0.78rem' }}>
                          {male.category_name || male.category || 'Toro'} {male.breed ? `• ${male.breed}` : ''}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1, textAlign: 'center' }}>
                        {isRetired ? (
                          <Chip
                            label="Retirado"
                            size="small"
                            color="warning"
                            variant="filled"
                            sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
                          />
                        ) : (
                          <Chip
                            label="Activo"
                            size="small"
                            color="success"
                            variant="outlined"
                            sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
                          />
                        )}
                      </TableCell>
                      <TableCell sx={{ py: 1, textAlign: 'right' }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.78rem' }}>
                          {male.current_weight ? `${male.current_weight} kg` : '—'}
                        </Typography>
                      </TableCell>
                      {onOpenReplaceDialog && (
                        <TableCell sx={{ py: 1, textAlign: 'center' }}>
                          {!isRetired ? (
                            <Tooltip title="Reportar novedad o sustituir reproductor">
                              <IconButton
                                size="small"
                                color="warning"
                                onClick={() => onOpenReplaceDialog(male)}
                                sx={{ p: 0.5 }}
                              >
                                <FuseSvgIcon size={16}>heroicons-outline:arrows-right-left</FuseSvgIcon>
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                              —
                            </Typography>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </>
  );
};

export default ServiceOrderMaleTable;
