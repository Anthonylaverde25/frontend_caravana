import {
  Box,
  Typography,
  Paper,
  Switch,
  Stack,
  Chip,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
  alpha,
  Alert,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useCompanyActivitiesDraft } from './useCompanyActivitiesDraft';

const STAGE_COLORS: Record<string, string> = {
  CRIA: '#10b981',
  RECRIA: '#0284c7',
  INVERNADA: '#f59e0b',
  INTERNAL: '#64748b',
};

interface CompanyActivitiesConfigCardProps {
  onSuccess?: () => void;
  isModal?: boolean;
}

export default function CompanyActivitiesConfigCard({ onSuccess, isModal = false }: CompanyActivitiesConfigCardProps) {
  const {
    items,
    pipeline: enabledPipeline,
    isLoading,
    isPending,
    toggle: handleToggle,
    setInitial: handleSetInitial,
    setFinal: handleSetFinal,
    move: handleMove,
    save: handleSave,
  } = useCompanyActivitiesDraft(onSuccess);

  if (isLoading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  const hasNoEnabled = enabledPipeline.length === 0;

  return (
    <Box sx={{ width: '100%' }}>
      {/* 1. Previsualización Dinámica del Flujo */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: '8px',
          bgcolor: '#f8fafc',
          border: '1px solid #e2e8f0',
        }}
      >
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            fontWeight: 800,
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            mb: 1.5,
          }}
        >
          Flujo Productivo Resultante (En Tiempo Real)
        </Typography>

        {hasNoEnabled ? (
          <Alert severity="warning" sx={{ py: 0.5, fontSize: '0.8rem' }}>
            La empresa debe tener al menos una actividad habilitada.
          </Alert>
        ) : (
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{
              overflowX: 'auto',
              py: 0.5,
              '&::-webkit-scrollbar': { height: 6 },
              '&::-webkit-scrollbar-thumb': { bgcolor: '#cbd5e1', borderRadius: 3 },
            }}
          >
            {enabledPipeline.map((stage, idx) => {
              const color = STAGE_COLORS[stage.code] || '#64748b';
              const isFirst = idx === 0;
              const isLast = idx === enabledPipeline.length - 1;

              return (
                <Stack key={stage.id} direction="row" alignItems="center" spacing={1.5} sx={{ flexShrink: 0 }}>
                  <Box
                    sx={{
                      px: 2,
                      py: 1,
                      borderRadius: '6px',
                      bgcolor: '#ffffff',
                      border: `1.5px solid ${color}`,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#1e293b', fontSize: '0.85rem' }}>
                      {stage.name}
                    </Typography>

                    {stage.isInitial && (
                      <Chip
                        label="INICIAL"
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: '0.65rem',
                          fontWeight: 900,
                          bgcolor: alpha('#10b981', 0.15),
                          color: '#059669',
                        }}
                      />
                    )}

                    {stage.isFinal && (
                      <Chip
                        label="ÚLTIMO DESTINO"
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: '0.65rem',
                          fontWeight: 900,
                          bgcolor: alpha('#f59e0b', 0.15),
                          color: '#d97706',
                        }}
                      />
                    )}
                  </Box>

                  {!isLast && (
                    <FuseSvgIcon size={18} sx={{ color: '#94a3b8' }}>
                      heroicons-outline:arrow-right
                    </FuseSvgIcon>
                  )}
                </Stack>
              );
            })}
          </Stack>
        )}
      </Paper>

      {/* 2. Tabla / Lista de Controles por Actividad */}
      <Stack spacing={1.5} sx={{ mb: 3 }}>
        {items.map((item, index) => {
          const color = STAGE_COLORS[item.code] || '#64748b';

          return (
            <Paper
              key={item.id}
              elevation={0}
              sx={{
                p: 1.5,
                px: 2,
                borderRadius: '8px',
                border: '1px solid',
                borderColor: item.isEnabled ? '#e2e8f0' : '#f1f5f9',
                bgcolor: item.isEnabled ? '#ffffff' : '#f8fafc',
                opacity: item.isEnabled ? 1 : 0.65,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: item.isEnabled ? '#cbd5e1' : '#f1f5f9',
                  boxShadow: item.isEnabled ? '0 2px 6px rgba(0,0,0,0.03)' : 'none',
                },
              }}
            >
              {/* Lado Izquierdo: Reordenar + Switch + Nombre */}
              <Stack direction="row" spacing={1.5} alignItems="center">
                {/* Botones de orden */}
                <Stack direction="column" spacing={0.2}>
                  <IconButton
                    size="small"
                    disabled={index === 0 || !item.isEnabled}
                    onClick={() => handleMove(index, 'up')}
                    sx={{ p: 0.2, color: '#94a3b8', '&:hover': { color: '#0f172a' } }}
                  >
                    <FuseSvgIcon size={14}>heroicons-outline:chevron-up</FuseSvgIcon>
                  </IconButton>
                  <IconButton
                    size="small"
                    disabled={index === items.length - 1 || !item.isEnabled}
                    onClick={() => handleMove(index, 'down')}
                    sx={{ p: 0.2, color: '#94a3b8', '&:hover': { color: '#0f172a' } }}
                  >
                    <FuseSvgIcon size={14}>heroicons-outline:chevron-down</FuseSvgIcon>
                  </IconButton>
                </Stack>

                {/* Switch de Habilitación */}
                <Tooltip title={item.isEnabled ? 'Deshabilitar de la empresa' : 'Habilitar para la empresa'}>
                  <Switch
                    checked={item.isEnabled}
                    onChange={() => handleToggle(item.id)}
                    color="primary"
                    size="small"
                  />
                </Tooltip>

                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color }} />

                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#1e293b' }}>
                    {item.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                    Código: {item.code}
                  </Typography>
                </Box>
              </Stack>

              {/* Lado Derecho: Selectores de Inicial y Último Destino */}
              <Stack direction="row" spacing={1} alignItems="center">
                <Tooltip title="Marcar como etapa inicial (ingreso o nacimientos)">
                  <span>
                    <Chip
                      label="Inicial"
                      size="small"
                      clickable={item.isEnabled}
                      disabled={!item.isEnabled}
                      onClick={() => item.isEnabled && handleSetInitial(item.id)}
                      icon={
                        item.isInitial ? (
                          <FuseSvgIcon size={14}>heroicons-outline:check-circle</FuseSvgIcon>
                        ) : undefined
                      }
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        height: 24,
                        bgcolor: item.isInitial ? alpha('#10b981', 0.15) : 'transparent',
                        color: item.isInitial ? '#059669' : '#94a3b8',
                        borderColor: item.isInitial ? '#10b981' : '#e2e8f0',
                        borderWidth: 1,
                        borderStyle: 'solid',
                        '&:hover': {
                          bgcolor: item.isEnabled ? alpha('#10b981', 0.1) : 'transparent',
                        },
                      }}
                    />
                  </span>
                </Tooltip>

                <Tooltip title="Marcar como etapa final (último destino comercial / faena)">
                  <span>
                    <Chip
                      label="Último Destino"
                      size="small"
                      clickable={item.isEnabled}
                      disabled={!item.isEnabled}
                      onClick={() => item.isEnabled && handleSetFinal(item.id)}
                      icon={
                        item.isFinal ? (
                          <FuseSvgIcon size={14}>heroicons-outline:check-circle</FuseSvgIcon>
                        ) : undefined
                      }
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        height: 24,
                        bgcolor: item.isFinal ? alpha('#f59e0b', 0.15) : 'transparent',
                        color: item.isFinal ? '#d97706' : '#94a3b8',
                        borderColor: item.isFinal ? '#f59e0b' : '#e2e8f0',
                        borderWidth: 1,
                        borderStyle: 'solid',
                        '&:hover': {
                          bgcolor: item.isEnabled ? alpha('#f59e0b', 0.1) : 'transparent',
                        },
                      }}
                    />
                  </span>
                </Tooltip>
              </Stack>
            </Paper>
          );
        })}
      </Stack>

      {/* 3. Barra de Acciones */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={isPending || hasNoEnabled}
          startIcon={
            isPending ? <CircularProgress size={16} color="inherit" /> : <FuseSvgIcon size={18}>heroicons-outline:check</FuseSvgIcon>
          }
          sx={{
            textTransform: 'none',
            fontWeight: 800,
            borderRadius: '6px',
            px: 3,
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' },
          }}
        >
          {isPending ? 'Guardando...' : 'Guardar Configuración'}
        </Button>
      </Box>
    </Box>
  );
}
