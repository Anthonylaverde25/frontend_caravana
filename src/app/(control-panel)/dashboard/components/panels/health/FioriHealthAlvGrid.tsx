import React, { useState, useMemo } from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
import { useSnackbar } from 'notistack';
import { QuarantineCaravan, ConsumptionCaravan, DeathCaravan } from '../DashboardHealthPanel';

interface FioriHealthAlvGridProps {
  quarantineData: QuarantineCaravan[];
  consumptionData: ConsumptionCaravan[];
  deathData: DeathCaravan[];
  onActionClick: (action: string, tag: string) => void;
}

export const FioriHealthAlvGrid: React.FC<FioriHealthAlvGridProps> = ({
  quarantineData,
  consumptionData,
  deathData,
  onActionClick,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState<'QUARANTINE' | 'CONSUMPTION' | 'DEATH'>('QUARANTINE');
  const [filterText, setFilterText] = useState('');

  const handleExportXLS = () => {
    enqueueSnackbar(`Exportando registros sanitarios (${activeTab}) a Excel...`, { variant: 'info' });
  };

  const filteredQuarantine = useMemo(() => {
    if (!filterText.trim()) return quarantineData;
    const q = filterText.toLowerCase();
    return quarantineData.filter(
      (item) => item.tag.includes(q) || item.diagnosis.toLowerCase().includes(q) || item.severity.toLowerCase().includes(q)
    );
  }, [quarantineData, filterText]);

  const filteredConsumption = useMemo(() => {
    if (!filterText.trim()) return consumptionData;
    const q = filterText.toLowerCase();
    return consumptionData.filter(
      (item) => item.tag.includes(q) || item.destination.toLowerCase().includes(q) || item.status.toLowerCase().includes(q)
    );
  }, [consumptionData, filterText]);

  const filteredDeath = useMemo(() => {
    if (!filterText.trim()) return deathData;
    const q = filterText.toLowerCase();
    return deathData.filter(
      (item) => item.tag.includes(q) || item.cause.toLowerCase().includes(q) || item.diagnosedBy.toLowerCase().includes(q)
    );
  }, [deathData, filterText]);

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
      {/* Header Toolbar */}
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
            <Box sx={{ width: 10, height: 10, bgcolor: '#0284c7', borderRadius: '2px' }} />
            <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem', color: 'text.primary', letterSpacing: '0.02em' }}>
              SAP ALV Grid · Control Sanitario y Trazabilidad
            </Typography>
          </Box>

          {/* Sub-tab pills */}
          <Box sx={{ display: 'inline-flex', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: '6px', p: 0.3 }}>
            <Box
              component="button"
              onClick={() => setActiveTab('QUARANTINE')}
              sx={{
                border: 'none',
                cursor: 'pointer',
                px: 1.25,
                py: 0.3,
                borderRadius: '4px',
                fontSize: '0.72rem',
                fontWeight: activeTab === 'QUARANTINE' ? 700 : 500,
                bgcolor: activeTab === 'QUARANTINE' ? '#0a4d3c' : 'transparent',
                color: activeTab === 'QUARANTINE' ? '#ffffff' : 'text.secondary',
                transition: 'all 0.15s ease',
              }}
            >
              Cuarentena ({quarantineData.length})
            </Box>
            <Box
              component="button"
              onClick={() => setActiveTab('CONSUMPTION')}
              sx={{
                border: 'none',
                cursor: 'pointer',
                px: 1.25,
                py: 0.3,
                borderRadius: '4px',
                fontSize: '0.72rem',
                fontWeight: activeTab === 'CONSUMPTION' ? 700 : 500,
                bgcolor: activeTab === 'CONSUMPTION' ? '#0a4d3c' : 'transparent',
                color: activeTab === 'CONSUMPTION' ? '#ffffff' : 'text.secondary',
                transition: 'all 0.15s ease',
              }}
            >
              Consumo ({consumptionData.length})
            </Box>
            <Box
              component="button"
              onClick={() => setActiveTab('DEATH')}
              sx={{
                border: 'none',
                cursor: 'pointer',
                px: 1.25,
                py: 0.3,
                borderRadius: '4px',
                fontSize: '0.72rem',
                fontWeight: activeTab === 'DEATH' ? 700 : 500,
                bgcolor: activeTab === 'DEATH' ? '#0a4d3c' : 'transparent',
                color: activeTab === 'DEATH' ? '#ffffff' : 'text.secondary',
                transition: 'all 0.15s ease',
              }}
            >
              Bajas ({deathData.length})
            </Box>
          </Box>
        </Box>

        {/* Right Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ position: 'relative', width: 170 }}>
            <Box
              component="input"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Filtrar registro..."
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
            }}
            startIcon={
              <svg style={{ width: 14, height: 14, color: '#16a34a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            }
          >
            Exportar XLS
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
            },
            '& td': {
              borderBottom: '1px solid #e2e8f0',
              borderRight: '1px solid #e2e8f0',
              py: 1,
              px: 1.5,
              fontSize: '0.75rem',
              whiteSpace: 'nowrap',
            },
            '& tbody tr:hover': { bgcolor: '#f8fafc' },
          }}
        >
          {activeTab === 'QUARANTINE' && (
            <>
              <thead>
                <tr>
                  <th style={{ textAlign: 'center', width: 40, backgroundColor: '#e2e8f0' }}>#</th>
                  <th>Caravana</th>
                  <th>Fecha Ingreso</th>
                  <th>Diagnóstico Presuntivo</th>
                  <th>Severidad</th>
                  <th style={{ textAlign: 'right' }}>Días Aislado</th>
                  <th style={{ textAlign: 'center', width: 110 }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuarantine.map((row, idx) => {
                  const isCrit = row.severity === 'CRITICAL';
                  return (
                    <tr key={row.id}>
                      <td style={{ textAlign: 'center', fontFamily: 'monospace', color: '#94a3b8', backgroundColor: '#f8fafc' }}>{idx + 1}</td>
                      <td style={{ fontWeight: 700, color: '#0a4d3c', fontFamily: 'monospace' }}>#{row.tag}</td>
                      <td style={{ color: '#475569' }}>{row.entryDate}</td>
                      <td style={{ color: '#1e293b', fontWeight: 500 }}>{row.diagnosis}</td>
                      <td>
                        <Chip
                          label={row.severity}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.65rem',
                            height: 20,
                            bgcolor: isCrit ? '#fee2e2' : row.severity === 'HIGH' ? '#ffedd5' : '#f0fdf4',
                            color: isCrit ? '#dc2626' : row.severity === 'HIGH' ? '#ea580c' : '#16a34a',
                            border: '1px solid',
                            borderColor: isCrit ? '#fecaca' : row.severity === 'HIGH' ? '#fed7aa' : '#bbf7d0',
                          }}
                        />
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>{row.daysIsolated} d</td>
                      <td style={{ textAlign: 'center' }}>
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          onClick={() => onActionClick('Alta Sanitaria', row.tag)}
                          sx={{ fontSize: '0.68rem', py: 0.2, px: 1, textTransform: 'none' }}
                        >
                          Alta Sanitaria
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 700 }}>
                  <td style={{ textAlign: 'center', fontFamily: 'monospace', color: '#94a3b8', backgroundColor: '#e2e8f0' }}>∑</td>
                  <td colSpan={4} style={{ color: '#334155', textTransform: 'uppercase' }}>Total Animales en Aislamiento Clínico</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#b91c1c', fontWeight: 800 }}>
                    {filteredQuarantine.length} Casos
                  </td>
                  <td style={{ textAlign: 'center', color: '#64748b', fontSize: '0.7rem' }}>Supervisión Activa</td>
                </tr>
              </tfoot>
            </>
          )}

          {activeTab === 'CONSUMPTION' && (
            <>
              <thead>
                <tr>
                  <th style={{ textAlign: 'center', width: 40, backgroundColor: '#e2e8f0' }}>#</th>
                  <th>Caravana</th>
                  <th>Fecha Asignación</th>
                  <th style={{ textAlign: 'right' }}>Peso Vivo</th>
                  <th>Destino / Asignación</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredConsumption.map((row, idx) => (
                  <tr key={row.id}>
                    <td style={{ textAlign: 'center', fontFamily: 'monospace', color: '#94a3b8', backgroundColor: '#f8fafc' }}>{idx + 1}</td>
                    <td style={{ fontWeight: 700, color: '#0a4d3c', fontFamily: 'monospace' }}>#{row.tag}</td>
                    <td style={{ color: '#475569' }}>{row.assignDate}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>{row.weight} kg</td>
                    <td style={{ color: '#1e293b' }}>{row.destination}</td>
                    <td>
                      <Chip label={row.status} size="small" sx={{ fontWeight: 600, fontSize: '0.68rem', height: 20, bgcolor: '#eff6ff', color: '#1d4ed8' }} />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 700 }}>
                  <td style={{ textAlign: 'center', fontFamily: 'monospace', color: '#94a3b8', backgroundColor: '#e2e8f0' }}>∑</td>
                  <td colSpan={2} style={{ color: '#334155', textTransform: 'uppercase' }}>Total Faena Interna Acumulada</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#047857', fontWeight: 800 }}>
                    {filteredConsumption.reduce((acc, c) => acc + c.weight, 0).toFixed(1)} kg
                  </td>
                  <td colSpan={2} style={{ color: '#64748b', fontSize: '0.7rem' }}>{filteredConsumption.length} Animales Asignados</td>
                </tr>
              </tfoot>
            </>
          )}

          {activeTab === 'DEATH' && (
            <>
              <thead>
                <tr>
                  <th style={{ textAlign: 'center', width: 40, backgroundColor: '#e2e8f0' }}>#</th>
                  <th>Caravana</th>
                  <th>Fecha Deceso</th>
                  <th>Causa Dictaminada</th>
                  <th>Profesional Veterinario</th>
                  <th>Estado Acta</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeath.map((row, idx) => (
                  <tr key={row.id}>
                    <td style={{ textAlign: 'center', fontFamily: 'monospace', color: '#94a3b8', backgroundColor: '#f8fafc' }}>{idx + 1}</td>
                    <td style={{ fontWeight: 700, color: '#dc2626', fontFamily: 'monospace' }}>#{row.tag}</td>
                    <td style={{ color: '#475569' }}>{row.deathDate}</td>
                    <td style={{ color: '#1e293b', fontWeight: 500 }}>{row.cause}</td>
                    <td style={{ color: '#475569' }}>{row.diagnosedBy}</td>
                    <td>
                      <Chip
                        label={row.status}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.68rem',
                          height: 20,
                          bgcolor: row.status.includes('Firmada') ? '#f0fdf4' : '#fef3c7',
                          color: row.status.includes('Firmada') ? '#16a34a' : '#b45309',
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 700 }}>
                  <td style={{ textAlign: 'center', fontFamily: 'monospace', color: '#94a3b8', backgroundColor: '#e2e8f0' }}>∑</td>
                  <td colSpan={2} style={{ color: '#334155', textTransform: 'uppercase' }}>Total Bajas Registradas</td>
                  <td colSpan={3} style={{ fontFamily: 'monospace', color: '#dc2626', fontWeight: 800 }}>
                    {filteredDeath.length} Bajas · Tasa 1.2% Mensual
                  </td>
                </tr>
              </tfoot>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default FioriHealthAlvGrid;
