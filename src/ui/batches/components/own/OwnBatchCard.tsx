import React from 'react';
import {
  Box,
  Paper,
  Stack,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  alpha,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Batch } from '@/core/batches/domain/entities/Batch';
import { useNavigate } from 'react-router';
import BatchHeadCount from '../BatchHeadCount';

interface OwnBatchCardProps {
  batch: Batch;
  onViewDetails: (batch: Batch) => void;
  onAddCaravans: (batch: Batch) => void;
  onStartService: (batch: Batch) => void;
  onOpenService?: (serviceOrderId: number) => void;
}

export const OwnBatchCard: React.FC<OwnBatchCardProps> = ({
  batch,
  onViewDetails,
  onAddCaravans,
  onStartService,
  onOpenService,
}) => {
  const navigate = useNavigate();

  // Only a Cría batch without a running service can start one.
  const isCria = (batch.activity_code ?? '').toUpperCase() === 'CRIA' && !batch.active_service_order;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        px: 3,
        borderRadius: '6px',
        border: 1,
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        bgcolor: 'background.paper',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        },
      }}
    >
      <Stack direction="row" spacing={3} alignItems="center">
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
              {batch.name}
            </Typography>

            {batch.activity_name && (
              <>
                <Typography variant="caption" sx={{ color: 'divider', fontWeight: 900 }}>
                  |
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: 'primary.main',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  {batch.activity_name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'divider', fontWeight: 900 }}>
                  |
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'secondary.main' }}>
                  {batch.current_weight ? `${batch.current_weight} kg/cab` : 'SIN PESO'}
                </Typography>
              </>
            )}
          </Stack>

          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
            Establecimiento: {batch.farm_name || 'Propio (RENSPA de la Compañía)'}
          </Typography>

          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <FuseSvgIcon size={16} sx={{ color: 'text.secondary' }}>
                heroicons-outline:users
              </FuseSvgIcon>
              <Typography
                variant="caption"
                component="div"
                sx={{ fontWeight: 600, color: 'text.primary' }}
              >
                <BatchHeadCount
                  batch={batch}
                  withUnit
                />
              </Typography>
            </Stack>

            {batch.batch_type_name && (
              <Chip
                label={batch.batch_type_name.toUpperCase()}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                  border: 'none',
                }}
              />
            )}

            {batch.active_service_order && (
              <Tooltip
                title={
                  onOpenService
                    ? `Servicio ${batch.active_service_order.code} sobre este lote. Clic para ver detalles y gestionar servicio`
                    : `Servicio ${batch.active_service_order.code} sobre este lote`
                }
              >
                <Chip
                  icon={
                    <FuseSvgIcon size={14} sx={{ color: '#ea580c !important' }}>
                      heroicons-outline:fire
                    </FuseSvgIcon>
                  }
                  label={`En servicio (${batch.active_service_order.code})`}
                  size="small"
                  onClick={onOpenService ? () => onOpenService(batch.active_service_order!.id) : undefined}
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    bgcolor: alpha('#ea580c', 0.12),
                    color: '#ea580c',
                    border: '1px solid',
                    borderColor: alpha('#ea580c', 0.35),
                    cursor: onOpenService ? 'pointer' : 'default',
                    '&:hover': onOpenService
                      ? {
                          bgcolor: alpha('#ea580c', 0.22),
                        }
                      : undefined,
                  }}
                />
              </Tooltip>
            )}
          </Stack>
        </Box>
      </Stack>

      <Stack direction="row" spacing={1} alignItems="center">
        {batch.active_service_order && onOpenService && (
          <Tooltip title={`Ver Servicio en Curso (${batch.active_service_order.code})`}>
            <IconButton
              size="small"
              onClick={() => onOpenService(batch.active_service_order!.id)}
              sx={{
                color: '#ea580c',
                bgcolor: alpha('#ea580c', 0.1),
                border: '1px solid',
                borderColor: alpha('#ea580c', 0.35),
                '&:hover': { bgcolor: alpha('#ea580c', 0.22) },
              }}
            >
              <FuseSvgIcon size={20}>heroicons-outline:fire</FuseSvgIcon>
            </IconButton>
          </Tooltip>
        )}

        {isCria && (
          <Tooltip title="Iniciar Servicio de Entore (Vientres + Torada)">
            <IconButton
              size="small"
              onClick={() => onStartService(batch)}
              sx={{
                color: '#d97706',
                bgcolor: alpha('#d97706', 0.1),
                border: '1px solid',
                borderColor: alpha('#d97706', 0.35),
                '&:hover': { bgcolor: alpha('#d97706', 0.22) },
              }}
            >
              <FuseSvgIcon size={20}>heroicons-outline:fire</FuseSvgIcon>
            </IconButton>
          </Tooltip>
        )}

        <Tooltip title="Ver Detalles y Evolución">
          <IconButton
            size="small"
            onClick={() => onViewDetails(batch)}
            sx={{
              color: 'primary.main',
              bgcolor: 'action.hover',
              '&:hover': { bgcolor: 'action.selected' },
            }}
          >
            <FuseSvgIcon size={20}>heroicons-outline:eye</FuseSvgIcon>
          </IconButton>
        </Tooltip>

        <Tooltip title="Ingreso Múltiple (Manual)">
          <IconButton
            size="small"
            onClick={() => navigate(`/batches/${batch.id}/bulk-entry`)}
            sx={{
              color: 'secondary.main',
              bgcolor: 'action.hover',
              '&:hover': { bgcolor: 'action.selected' },
            }}
          >
            <FuseSvgIcon size={20}>heroicons-outline:table-cells</FuseSvgIcon>
          </IconButton>
        </Tooltip>

        <Tooltip title="Añadir Caravana">
          <IconButton
            size="small"
            onClick={() => onAddCaravans(batch)}
            sx={{
              color: (t) => (t.palette.mode === 'dark' ? '#ffffff' : 'primary.main'),
              bgcolor: 'action.hover',
              '&:hover': { bgcolor: 'action.selected' },
            }}
          >
            <FuseSvgIcon size={20}>heroicons-outline:plus-circle</FuseSvgIcon>
          </IconButton>
        </Tooltip>

        <Chip
          label={batch.is_active ? 'Activo' : 'Inactivo'}
          size="small"
          color={batch.is_active ? 'success' : 'default'}
          variant="outlined"
          sx={{ fontWeight: 600, fontSize: '0.7rem' }}
        />
      </Stack>
    </Paper>
  );
};
