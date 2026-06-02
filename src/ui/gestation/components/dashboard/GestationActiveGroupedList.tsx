import React from 'react';
import {
  Paper,
  Box,
  Stack,
  Typography,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Tooltip,
  IconButton
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

// Caravan interface matches the structure used in dashboard
interface Caravan {
  id: number;
  identification: string;
  category: string | null;
  batch_name: string | null;
  active_gestation: {
    gestation_stage?: string;
    estimated_due_date?: string | null;
  } | null;
}

interface GestationActiveGroupedListProps {
  groupedAnimals: Record<string, Caravan[]>;
  filteredAnimals: Caravan[];
  gestatingCaravans: Caravan[];
  isDark: boolean;
  navigate: (path: string) => void;
  getDaysLeft: (dueDateStr?: string | null) => number;
  getRiskDetails: (category: string | null, daysLeft: number) => { risk: string; label: string };
  getStageLabel: (stage?: string) => string;
}

export default function GestationActiveGroupedList({
  groupedAnimals,
  filteredAnimals,
  gestatingCaravans,
  isDark,
  navigate,
  getDaysLeft,
  getRiskDetails,
  getStageLabel
}: GestationActiveGroupedListProps) {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: '4px',
        overflow: 'hidden',
        bgcolor: 'background.paper'
      }}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: isDark ? 'background.paper' : '#f8f9fa'
        }}
      >
        <Stack>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Monitoreo de Vientres Gestantes
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Registros filtrados: {filteredAnimals.length} de {gestatingCaravans.length}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => navigate('/gestation/list')}
            startIcon={<FuseSvgIcon size={16}>heroicons-outline:list-bullet</FuseSvgIcon>}
            sx={{
              textTransform: 'none',
              py: 0.5,
              px: 1.5,
              fontSize: '0.75rem',
              borderRadius: '4px',
              color: '#fff'
            }}
          >
            Ver Listado Completo
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<FuseSvgIcon size={16}>heroicons-outline:arrow-down-tray</FuseSvgIcon>}
            sx={{ textTransform: 'none', py: 0.5, px: 1.5, fontSize: '0.75rem', borderRadius: '4px' }}
          >
            Exportar
          </Button>
        </Stack>
      </Box>

      <TableContainer sx={{ maxHeight: 500 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  bgcolor: isDark ? '#1e293b' : '#f1f5f9',
                  color: 'text.secondary',
                  py: 1.5
                }}
              >
                Caravana
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  bgcolor: isDark ? '#1e293b' : '#f1f5f9',
                  color: 'text.secondary',
                  py: 1.5
                }}
              >
                Categoría
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  bgcolor: isDark ? '#1e293b' : '#f1f5f9',
                  color: 'text.secondary',
                  py: 1.5
                }}
              >
                Lote Actual
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  bgcolor: isDark ? '#1e293b' : '#f1f5f9',
                  color: 'text.secondary',
                  py: 1.5
                }}
                align="center"
              >
                Estadio Preñez
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  bgcolor: isDark ? '#1e293b' : '#f1f5f9',
                  color: 'text.secondary',
                  py: 1.5
                }}
                align="center"
              >
                Parto Estimado (FPP)
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  bgcolor: isDark ? '#1e293b' : '#f1f5f9',
                  color: 'text.secondary',
                  py: 1.5
                }}
                align="right"
              >
                Restante
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  bgcolor: isDark ? '#1e293b' : '#f1f5f9',
                  color: 'text.secondary',
                  py: 1.5
                }}
              >
                Riesgo
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  bgcolor: isDark ? '#1e293b' : '#f1f5f9',
                  color: 'text.secondary',
                  py: 1.5
                }}
                align="center"
              >
                Acción
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(groupedAnimals).length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    No se encontraron caravanas que coincidan con los filtros.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              Object.entries(groupedAnimals).map(([batchName, groupList]) => (
                <React.Fragment key={batchName}>
                  {/* Batch Header Row */}
                  <TableRow
                    sx={{
                      bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(10, 110, 209, 0.04)'
                    }}
                  >
                    <TableCell
                      colSpan={8}
                      sx={{
                        py: 1.5,
                        borderLeft: `4px solid ${theme.palette.primary.main}`,
                        fontWeight: 800
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <FuseSvgIcon size={18} sx={{ color: 'primary.main' }}>
                          heroicons-outline:circle-stack
                        </FuseSvgIcon>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                          Lote: {batchName} ({groupList.length} vientres)
                        </Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                  {/* Animals in this Batch */}
                  {groupList.map((row) => {
                    const activeGestation = row.active_gestation;
                    const daysLeft = getDaysLeft(activeGestation?.estimated_due_date);
                    const riskInfo = getRiskDetails(row.category, daysLeft);

                    return (
                      <TableRow
                        key={row.id}
                        hover
                        sx={{
                          '&:last-child td, &:last-child th': { borderBottom: 1, borderColor: 'divider' }
                        }}
                      >
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            color: '#0a6ed1',
                            fontFamily: 'monospace',
                            fontSize: '0.75rem'
                          }}
                        >
                          {row.identification}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.75rem', py: 1 }}>
                          {row.category || '-'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.75rem', py: 1 }}>
                          {row.batch_name || 'Sin Lote'}
                        </TableCell>
                        <TableCell align="center" sx={{ py: 1 }}>
                          <Chip
                            label={getStageLabel(activeGestation?.gestation_stage)}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              height: 18,
                              fontSize: '0.65rem',
                              bgcolor:
                                activeGestation?.gestation_stage === 'head'
                                  ? 'rgba(16, 185, 129, 0.1)'
                                  : activeGestation?.gestation_stage === 'body'
                                  ? 'rgba(245, 158, 11, 0.1)'
                                  : 'rgba(239, 68, 68, 0.1)',
                              color:
                                activeGestation?.gestation_stage === 'head'
                                  ? '#10b981'
                                  : activeGestation?.gestation_stage === 'body'
                                  ? '#f59e0b'
                                  : '#ef4444',
                              border: 1,
                              borderColor:
                                activeGestation?.gestation_stage === 'head'
                                  ? 'rgba(16, 185, 129, 0.2)'
                                  : activeGestation?.gestation_stage === 'body'
                                  ? 'rgba(245, 158, 11, 0.2)'
                                  : 'rgba(239, 68, 68, 0.2)'
                            }}
                          />
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.75rem', py: 1 }}
                        >
                          {activeGestation?.estimated_due_date || '-'}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1 }}
                        >
                          {daysLeft} d
                        </TableCell>
                        <TableCell sx={{ py: 1 }}>
                          <Chip
                            label={riskInfo.label}
                            size="small"
                            variant="outlined"
                            sx={{
                              fontWeight: 700,
                              height: 18,
                              fontSize: '0.65rem',
                              color:
                                riskInfo.risk === 'High'
                                  ? 'error.main'
                                  : riskInfo.risk === 'Medium'
                                  ? 'warning.main'
                                  : 'success.main',
                              borderColor:
                                riskInfo.risk === 'High'
                                  ? 'error.light'
                                  : riskInfo.risk === 'Medium'
                                  ? 'warning.light'
                                  : 'success.light',
                              bgcolor:
                                riskInfo.risk === 'High'
                                  ? 'rgba(239, 68, 68, 0.05)'
                                  : riskInfo.risk === 'Medium'
                                  ? 'rgba(245, 158, 11, 0.05)'
                                  : 'rgba(16, 185, 129, 0.05)',
                              borderRadius: '2px'
                            }}
                          />
                        </TableCell>
                        <TableCell align="center" sx={{ py: 0.5 }}>
                          <Tooltip title="Ver Ficha / Editar">
                            <IconButton size="small" color="primary" sx={{ p: 0.25 }}>
                              <FuseSvgIcon size={16}>heroicons-outline:pencil-square</FuseSvgIcon>
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
