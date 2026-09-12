import React from 'react';
import {
  TableRow,
  TableCell,
  Chip,
  Box,
  Stack,
  Typography,
  IconButton,
  Button,
  Tooltip,
  useTheme,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { DiagnosticProtocol } from '@/core/veterinary/domain/VeterinaryTypes';

interface DiagnosticProtocolsRowProps {
  protocol: DiagnosticProtocol;
  index: number;
  onViewDetail: (id: number) => void;
}

export const DiagnosticProtocolsRow: React.FC<DiagnosticProtocolsRowProps> = ({
  protocol,
  index,
  onViewDetail,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isEven = index % 2 === 1;

  const zebraBg = isDark ? 'rgba(255, 255, 255, 0.02)' : '#fafafa';

  const bodyCellStyle = {
    px: 1.5,
    py: 1.25,
    borderRight: '1px solid',
    borderBottom: '1px solid',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9',
  };

  const hasAttachments = (protocol.attachments?.length ?? 0) > 0;

  return (
    <TableRow
      hover
      sx={{
        bgcolor: isEven ? zebraBg : 'transparent',
        transition: 'background-color 0.15s ease',
        '&:hover': {
          bgcolor: isDark ? 'rgba(255, 255, 255, 0.04) !important' : '#f1f5f9 !important',
        },
      }}
    >
      {/* 1. Protocol Number & Origin Channel */}
      <TableCell sx={bodyCellStyle}>
        <Stack spacing={0.5} alignItems="flex-start">
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              fontSize: '0.84rem',
              color: 'text.primary',
              fontFamily: 'monospace',
              letterSpacing: '0.02em',
            }}
          >
            {protocol.protocol_number}
          </Typography>

          {protocol.source_channel === 'PORTAL_VET' ? (
            <Chip
              size="small"
              icon={<FuseSvgIcon size={13}>heroicons-outline:shield-check</FuseSvgIcon>}
              label="Portal M.V."
              sx={{
                height: 20,
                fontSize: '0.68rem',
                fontWeight: 700,
                bgcolor: isDark ? 'rgba(96, 165, 250, 0.15)' : 'rgba(10, 110, 209, 0.1)',
                color: isDark ? '#60a5fa' : '#0a6ed1',
                borderRadius: '4px',
              }}
            />
          ) : (
            <Chip
              size="small"
              icon={<FuseSvgIcon size={13}>heroicons-outline:document-arrow-up</FuseSvgIcon>}
              label="Digitalizado"
              sx={{
                height: 20,
                fontSize: '0.68rem',
                fontWeight: 700,
                bgcolor: isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(100, 116, 139, 0.1)',
                color: isDark ? '#94a3b8' : '#64748b',
                borderRadius: '4px',
              }}
            />
          )}
        </Stack>
      </TableCell>

      {/* 2. Professional / Veterinarian */}
      <TableCell sx={bodyCellStyle}>
        <Stack spacing={0.25}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              fontSize: '0.82rem',
              color: 'text.primary',
            }}
          >
            {protocol.signed_veterinarian_name ?? protocol.veterinarian_name ?? 'Sin asignar'}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontSize: '0.72rem',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            {protocol.signed_license_number
              ? `MP: ${protocol.signed_license_number}`
              : 'Matrícula no informada'}
          </Typography>
        </Stack>
      </TableCell>

      {/* 3. Laboratory / Health Center */}
      <TableCell sx={bodyCellStyle}>
        <Stack spacing={0.25}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              fontSize: '0.82rem',
              color: 'text.primary',
            }}
          >
            {protocol.analysing_institution?.nombre ??
              protocol.reporting_institution?.nombre ??
              'Institución no declarada'}
          </Typography>
          {/* ADR-31 (rev.): la derivación es un hecho declarado, así que se lee. */}
          <Typography
            variant="caption"
            sx={{
              color: protocol.is_derived ? 'warning.dark' : 'text.secondary',
              fontSize: '0.7rem',
            }}
          >
            {protocol.is_derived
              ? `Derivado desde ${protocol.reporting_institution?.nombre ?? 'otro centro'}`
              : 'Centro de Diagnóstico'}
          </Typography>
        </Stack>
      </TableCell>

      {/* 4. Dates */}
      <TableCell sx={bodyCellStyle}>
        <Stack spacing={0.25}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              fontSize: '0.8rem',
              color: 'text.primary',
            }}
          >
            {protocol.result_date}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontSize: '0.7rem',
            }}
          >
            Muestra: {protocol.sample_date}
          </Typography>
        </Stack>
      </TableCell>

      {/* 5. Determinations */}
      <TableCell sx={{ ...bodyCellStyle, textAlign: 'center' }}>
        <Box>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              fontSize: '0.85rem',
              color: 'text.primary',
            }}
          >
            {protocol.samples_count}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontSize: '0.68rem',
              textTransform: 'uppercase',
              letterSpacing: 0.2,
            }}
          >
            Muestras
          </Typography>
        </Box>
      </TableCell>

      {/* 6. Positive Findings */}
      <TableCell sx={{ ...bodyCellStyle, textAlign: 'center' }}>
        {protocol.positive_findings_count > 0 ? (
          <Chip
            size="small"
            icon={<FuseSvgIcon size={14}>heroicons-outline:exclamation-triangle</FuseSvgIcon>}
            label={`${protocol.positive_findings_count} Positivo${protocol.positive_findings_count > 1 ? 's' : ''}`}
            sx={{
              bgcolor: isDark ? 'rgba(248, 113, 113, 0.15)' : 'rgba(239, 68, 68, 0.12)',
              color: isDark ? '#f87171' : '#dc2626',
              fontWeight: 700,
              borderRadius: '6px',
              fontSize: '0.72rem',
            }}
          />
        ) : (
          <Chip
            size="small"
            icon={<FuseSvgIcon size={14}>heroicons-outline:check</FuseSvgIcon>}
            label="0 Reactivos"
            sx={{
              bgcolor: isDark ? 'rgba(52, 211, 153, 0.12)' : 'rgba(16, 185, 129, 0.1)',
              color: isDark ? '#34d399' : '#059669',
              fontWeight: 600,
              borderRadius: '6px',
              fontSize: '0.72rem',
            }}
          />
        )}
      </TableCell>

      {/* 7. Status & Certification */}
      <TableCell sx={{ ...bodyCellStyle, textAlign: 'center' }}>
        {protocol.status === 'VOIDED' ? (
          <Chip
            size="small"
            icon={<FuseSvgIcon size={14}>heroicons-outline:no-symbol</FuseSvgIcon>}
            label="Anulado"
            variant="outlined"
            sx={{
              color: 'text.secondary',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1',
              fontWeight: 600,
              fontSize: '0.72rem',
              borderRadius: '6px',
            }}
          />
        ) : protocol.verification_status === 'VERIFIED' ? (
          <Chip
            size="small"
            icon={<FuseSvgIcon size={14}>heroicons-outline:check-circle</FuseSvgIcon>}
            label="Verificado"
            sx={{
              bgcolor: isDark ? 'rgba(52, 211, 153, 0.15)' : 'rgba(16, 185, 129, 0.12)',
              color: isDark ? '#34d399' : '#059669',
              fontWeight: 700,
              fontSize: '0.72rem',
              borderRadius: '6px',
            }}
          />
        ) : (
          <Chip
            size="small"
            icon={<FuseSvgIcon size={14}>heroicons-outline:clock</FuseSvgIcon>}
            label="Sin Aval"
            sx={{
              bgcolor: isDark ? 'rgba(251, 146, 60, 0.15)' : 'rgba(245, 158, 11, 0.12)',
              color: isDark ? '#fb923c' : '#d97706',
              fontWeight: 700,
              fontSize: '0.72rem',
              borderRadius: '6px',
            }}
          />
        )}
      </TableCell>

      {/* 8. Actions */}
      <TableCell align="right" sx={{ ...bodyCellStyle, borderRight: 0 }}>
        <Stack direction="row" spacing={0.5} justifyContent="flex-end" alignItems="center">
          {hasAttachments && (
            <Tooltip title="Contiene documento adjunto original">
              <Box
                sx={{
                  color: isDark ? '#60a5fa' : '#0a6ed1',
                  display: 'flex',
                  alignItems: 'center',
                  p: 0.5,
                }}
              >
                <FuseSvgIcon size={18}>heroicons-outline:paper-clip</FuseSvgIcon>
              </Box>
            </Tooltip>
          )}

          <Button
            size="small"
            variant="outlined"
            onClick={() => onViewDetail(protocol.id)}
            startIcon={<FuseSvgIcon size={16}>heroicons-outline:eye</FuseSvgIcon>}
            sx={{
              fontWeight: 600,
              fontSize: '0.75rem',
              textTransform: 'none',
              borderRadius: '6px',
              px: 1.5,
              py: 0.35,
              color: 'primary.main',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: isDark ? 'rgba(59, 130, 246, 0.08)' : 'rgba(10, 110, 209, 0.04)',
              },
            }}
          >
            Ver
          </Button>
        </Stack>
      </TableCell>
    </TableRow>
  );
};

export default DiagnosticProtocolsRow;
