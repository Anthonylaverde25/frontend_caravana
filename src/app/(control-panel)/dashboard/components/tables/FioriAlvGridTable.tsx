import React, { useState, useMemo } from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
import { useNavigate } from 'react-router';
import { useSnackbar } from 'notistack';
import { AlvRodeoLotRow } from './types';

const DEFAULT_LOT_ROWS: AlvRodeoLotRow[] = [
  {
    id: 'lote-01',
    lotNumber: 1,
    lotName: 'Lote 01 - Potrero Norte',
    paddockName: 'Potrero Norte',
    statusColor: 'green',
    category: 'Vaquillonas 15M (Primer servicio)',
    femalesCount: 65,
    malesCount: 2,
    bullRatio: 3.08,
    bullRatioLabel: 'Óptimo',
    bullRatioStatus: 'OPTIMAL',
    sanitaryStatus: 'APPROVED',
    sanitaryLabel: 'Aprobado (Bruc/TBC)',
    pregnancyRate: 72,
    pregnancyModel: 'Proy. Balcarce',
  },
  {
    id: 'lote-02',
    lotNumber: 2,
    lotName: 'Lote 02 - Potrero El Bajo',
    paddockName: 'Potrero El Bajo',
    statusColor: 'green',
    category: 'Vacas con Cría al pie (Multíparas)',
    femalesCount: 70,
    malesCount: 2,
    bullRatio: 2.86,
    bullRatioLabel: 'Óptimo',
    bullRatioStatus: 'OPTIMAL',
    sanitaryStatus: 'APPROVED',
    sanitaryLabel: 'Aprobado (Bruc/TBC)',
    pregnancyRate: 84,
    pregnancyModel: 'Proy. Balcarce',
  },
  {
    id: 'lote-03',
    lotNumber: 3,
    lotName: 'Lote 03 - Laguna Este',
    paddockName: 'Laguna Este',
    statusColor: 'amber',
    category: 'Vacas CUT (Último servicio)',
    femalesCount: 50,
    malesCount: 2,
    bullRatio: 4.00,
    bullRatioLabel: 'Refuerzo',
    bullRatioStatus: 'REINFORCEMENT',
    sanitaryStatus: 'PENDING',
    sanitaryLabel: 'Revisión Clínica Pend.',
    pregnancyRate: 68,
    pregnancyModel: 'Proy. Balcarce',
  },
  {
    id: 'lote-04',
    lotNumber: 4,
    lotName: 'Lote 04 - Potrero La Posta',
    paddockName: 'Potrero La Posta',
    statusColor: 'green',
    category: 'Vaquillonas 24M (Segundo entore)',
    femalesCount: 80,
    malesCount: 3,
    bullRatio: 3.75,
    bullRatioLabel: 'Óptimo',
    bullRatioStatus: 'OPTIMAL',
    sanitaryStatus: 'APPROVED',
    sanitaryLabel: 'Aprobado (Bruc/TBC)',
    pregnancyRate: 79,
    pregnancyModel: 'Proy. Balcarce',
  },
  {
    id: 'lote-05',
    lotNumber: 5,
    lotName: 'Lote 05 - Corral Las Moras',
    paddockName: 'Corral Las Moras',
    statusColor: 'blue',
    category: 'Rodeo General Cría (IA + Repaso)',
    femalesCount: 80,
    malesCount: 3,
    bullRatio: 3.75,
    bullRatioLabel: 'Óptimo',
    bullRatioStatus: 'OPTIMAL',
    sanitaryStatus: 'APPROVED',
    sanitaryLabel: 'Aprobado (Bruc/TBC)',
    pregnancyRate: 91,
    pregnancyModel: 'Proy. Balcarce',
  },
];

interface FioriAlvGridTableProps {
  rows?: AlvRodeoLotRow[];
}

export const FioriAlvGridTable: React.FC<FioriAlvGridTableProps> = ({
  rows = DEFAULT_LOT_ROWS,
}) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [filterText, setFilterText] = useState('');

  const filteredRows = useMemo(() => {
    if (!filterText.trim()) return rows;
    const q = filterText.toLowerCase();
    return rows.filter(
      (r) =>
        r.lotName.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.sanitaryLabel.toLowerCase().includes(q)
    );
  }, [rows, filterText]);

  const totals = useMemo(() => {
    const totalFemales = filteredRows.reduce((acc, r) => acc + r.femalesCount, 0);
    const totalMales = filteredRows.reduce((acc, r) => acc + r.malesCount, 0);
    const avgRatio = totalFemales > 0 ? Number(((totalMales / totalFemales) * 100).toFixed(2)) : 0;
    return { totalFemales, totalMales, avgRatio };
  }, [filteredRows]);

  const handleExportXLS = () => {
    enqueueSnackbar('Exportando matriz de lotes a Microsoft Excel (XLSX)...', { variant: 'info' });
  };

  return (
    <Box
      sx={{
        borderRadius: '8px',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {/* Table Section Header Toolbar */}
      <Box
        sx={{
          px: 2.5,
          py: 1.25,
          bgcolor: 'slate.50',
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 10, height: 10, bgcolor: '#107e3e', borderRadius: '2px' }} />
            <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem', color: 'text.primary', letterSpacing: '0.02em' }}>
              Gestión Integral del Rodeo de Cría
            </Typography>
          </Box>
          <Chip
            label={`${filteredRows.length} lotes en servicio activo`}
            size="small"
            sx={{
              fontWeight: 600,
              fontSize: '0.68rem',
              height: 22,
              bgcolor: '#ecfdf5',
              color: '#065f46',
              border: '1px solid #a7f3d0',
            }}
          />
          <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', display: { xs: 'none', md: 'inline' } }}>
            ({totals.totalFemales} vientres con {totals.totalMales} toros · Ratio global torada {totals.avgRatio}% Óptimo)
          </Typography>
        </Box>

        {/* Action Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Quick Filter Input */}
          <Box sx={{ position: 'relative', width: 180 }}>
            <Box
              component="input"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Filtrar lote..."
              sx={{
                width: '100%',
                bgcolor: 'background.paper',
                fontSize: '0.75rem',
                borderRadius: '5px',
                px: 1.25,
                py: 0.5,
                border: '1px solid',
                borderColor: 'divider',
                outline: 'none',
                '&:focus': { borderColor: '#0a4d3c' },
              }}
            />
          </Box>

          <Button
            variant="outlined"
            size="small"
            onClick={handleExportXLS}
            sx={{
              textTransform: 'none',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'text.primary',
              borderColor: 'divider',
              borderRadius: '5px',
              px: 1.5,
              py: 0.5,
              '&:hover': { bgcolor: 'action.hover' },
            }}
            startIcon={
              <svg style={{ width: 14, height: 14, color: '#16a34a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            }
          >
            Exportar XLS
          </Button>

          <Button
            variant="contained"
            size="small"
            onClick={() => navigate('/gestation/service-batches')}
            sx={{
              textTransform: 'none',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#ffffff',
              bgcolor: '#0a4d3c',
              borderRadius: '5px',
              px: 1.5,
              py: 0.5,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#07382c', boxShadow: 'none' },
            }}
          >
            Ver Lotes de Servicio
          </Button>
        </Box>
      </Box>

      {/* Dense Table */}
      <Box sx={{ overflowX: 'auto' }}>
        <Box
          component="table"
          sx={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.75rem',
            textAlign: 'left',
            '& th': {
              bgcolor: '#f1f5f9',
              fontSize: '0.7rem',
              fontWeight: 700,
              color: '#475569',
              borderBottom: '1px solid #cbd5e1',
              borderRight: '1px solid #e2e8f0',
              py: 1,
              px: 1.5,
              whiteSpace: 'nowrap',
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
            },
            '& td': {
              borderBottom: '1px solid #e2e8f0',
              borderRight: '1px solid #e2e8f0',
              py: 1,
              px: 1.5,
              fontSize: '0.75rem',
              whiteSpace: 'nowrap',
            },
            '& tbody tr:hover': {
              bgcolor: '#f8fafc',
            },
          }}
        >
          <thead>
            <tr>
              <th style={{ textAlign: 'center', width: 40, backgroundColor: '#e2e8f0' }}>#</th>
              <th>Lote / Potrero</th>
              <th>Categoría Rodeo</th>
              <th style={{ textAlign: 'right' }}>Vientres (♀)</th>
              <th style={{ textAlign: 'right' }}>Toros (♂)</th>
              <th style={{ textAlign: 'right' }}>Ratio Torada</th>
              <th>Estado Sanitario</th>
              <th>Avance Preñez</th>
              <th style={{ textAlign: 'center', width: 90 }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => {
              const dotColor =
                row.statusColor === 'green'
                  ? '#10b981'
                  : row.statusColor === 'amber'
                  ? '#f59e0b'
                  : row.statusColor === 'blue'
                  ? '#3b82f6'
                  : '#ef4444';

              return (
                <tr key={row.id}>
                  <td style={{ textAlign: 'center', fontFamily: 'monospace', color: '#94a3b8', backgroundColor: '#f8fafc' }}>
                    {row.lotNumber}
                  </td>
                  <td style={{ fontWeight: 600, color: '#0a4d3c' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: dotColor }} />
                      <Typography component="span" sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#0a4d3c' }}>
                        {row.lotName}
                      </Typography>
                    </Box>
                  </td>
                  <td style={{ color: '#475569' }}>{row.category}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>{row.femalesCount}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>{row.malesCount}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                    <Box component="span" sx={{ fontWeight: 700, color: row.bullRatioStatus === 'OPTIMAL' ? '#047857' : '#1d4ed8' }}>
                      {row.bullRatio.toFixed(2)}%
                    </Box>{' '}
                    <Box
                      component="span"
                      sx={{
                        fontSize: '0.625rem',
                        fontWeight: 700,
                        px: 0.6,
                        py: 0.1,
                        borderRadius: '3px',
                        bgcolor: row.bullRatioStatus === 'OPTIMAL' ? '#ecfdf5' : '#eff6ff',
                        color: row.bullRatioStatus === 'OPTIMAL' ? '#047857' : '#1d4ed8',
                        border: row.bullRatioStatus === 'OPTIMAL' ? '1px solid #a7f3d0' : '1px solid #bfdbfe',
                      }}
                    >
                      {row.bullRatioLabel}
                    </Box>
                  </td>
                  <td>
                    {row.sanitaryStatus === 'APPROVED' ? (
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: '#047857', fontWeight: 600, fontSize: '0.72rem' }}>
                        <svg style={{ width: 13, height: 13 }} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                        </svg>
                        {row.sanitaryLabel}
                      </Box>
                    ) : (
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: '#d97706', fontWeight: 600, fontSize: '0.72rem' }}>
                        <svg style={{ width: 13, height: 13 }} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" clipRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" />
                        </svg>
                        {row.sanitaryLabel}
                      </Box>
                    )}
                  </td>
                  <td>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary' }}>{row.pregnancyModel}</Typography>
                      <Box sx={{ width: 70, height: 6, bgcolor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <Box
                          sx={{
                            height: '100%',
                            width: `${row.pregnancyRate}%`,
                            bgcolor: row.pregnancyRate >= 70 ? '#10b981' : '#f59e0b',
                          }}
                        />
                      </Box>
                      <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, fontFamily: 'monospace' }}>
                        {row.pregnancyRate}%
                      </Typography>
                    </Box>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <Button
                      size="small"
                      onClick={() => navigate('/gestation/service-batches')}
                      sx={{
                        textTransform: 'none',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: '#0a4d3c',
                        p: 0,
                        minWidth: 'auto',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      Detalles →
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 700 }}>
              <td style={{ textAlign: 'center', fontFamily: 'monospace', color: '#94a3b8', backgroundColor: '#e2e8f0' }}>∑</td>
              <td colSpan={2} style={{ color: '#334155', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                Totales Consolidados de Entore Activo
              </td>
              <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#064e3b', fontWeight: 800 }}>
                {totals.totalFemales} ♀
              </td>
              <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#064e3b', fontWeight: 800 }}>
                {totals.totalMales} ♂
              </td>
              <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#064e3b', fontWeight: 800 }}>
                {totals.avgRatio}% Global
              </td>
              <td colSpan={2} style={{ color: '#64748b', fontWeight: 500, fontSize: '0.7rem' }}>
                Actualizado hoy a las 07:30 hs por Sistema Telemetría RFID
              </td>
              <td style={{ textAlign: 'center', fontFamily: 'monospace', color: '#64748b', fontSize: '0.7rem' }}>
                {filteredRows.length} lotes
              </td>
            </tr>
          </tfoot>
        </Box>
      </Box>
    </Box>
  );
};

export default FioriAlvGridTable;
