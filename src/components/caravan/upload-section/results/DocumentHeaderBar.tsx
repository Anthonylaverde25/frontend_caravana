import { Box, Typography, Chip, alpha } from '@mui/material';
import {
  CheckCircleOutline as VerifiedIcon,
  ErrorOutline as UnverifiedIcon,
  BusinessOutlined as EstablishmentIcon,
  AssignmentOutlined as OrderIcon,
  CodeOutlined as CodeIcon,
  Inventory2Outlined as BatchIcon,
  BadgeOutlined as CuitIcon,
  PlaceOutlined as RenspaIcon,
  CalendarTodayOutlined as DateIcon
} from '@mui/icons-material';
import { DocumentContext } from '../types';

interface DocumentHeaderBarProps {
  context?: DocumentContext;
  identifiedTemplate?: {
    code?: string;
    title?: string;
    category?: string;
  };
}

/**
 * DocumentHeaderBar Component
 * Renders the document header metadata extracted by OCR,
 * faithfully replicating the PrintHeader structure from the physical form.
 */
export const DocumentHeaderBar = ({ context, identifiedTemplate }: DocumentHeaderBarProps) => {
  if (!context && !identifiedTemplate) return null;

  const templateCode = identifiedTemplate?.code;
  const serviceOrderCode = context?.service_order_code;

  return (
    <Box sx={{ px: 2, pt: 2, pb: 1 }}>
      {/* Row 1: Establecimiento | Service Order | Template Code */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: serviceOrderCode
            ? (templateCode ? '1fr auto auto' : '1fr auto')
            : (templateCode ? '1fr auto' : '1fr'),
          border: '1.5px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
          mb: 1.5,
        }}
      >
        {/* Establecimiento */}
        <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <EstablishmentIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.disabled', textTransform: 'uppercase', fontSize: '0.55rem', letterSpacing: '0.5px' }}>
              Establecimiento
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
              {context?.establecimiento || '—'}
            </Typography>
            {context?.farm_id ? (
              <Chip
                icon={<VerifiedIcon sx={{ fontSize: '12px !important' }} />}
                label="Verificado"
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.55rem',
                  fontWeight: 700,
                  bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
                  color: 'success.main',
                  '& .MuiChip-icon': { color: 'inherit' }
                }}
              />
            ) : context?.establecimiento ? (
              <Chip
                icon={<UnverifiedIcon sx={{ fontSize: '12px !important' }} />}
                label="Sin resolver"
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.55rem',
                  fontWeight: 700,
                  bgcolor: (theme) => alpha(theme.palette.warning.main, 0.1),
                  color: 'warning.main',
                  '& .MuiChip-icon': { color: 'inherit' }
                }}
              />
            ) : null}
          </Box>
        </Box>

        {/* Service Order */}
        {serviceOrderCode && (
          <Box
            sx={{
              p: 1.5,
              borderLeft: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
              minWidth: 160,
              alignItems: 'center',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <OrderIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.disabled', textTransform: 'uppercase', fontSize: '0.55rem', letterSpacing: '0.5px' }}>
                Service Order
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 900, fontSize: '0.85rem', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                {serviceOrderCode}
              </Typography>
              {context?.service_order_id ? (
                <VerifiedIcon sx={{ fontSize: 14, color: 'success.main' }} />
              ) : (
                <UnverifiedIcon sx={{ fontSize: 14, color: 'warning.main' }} />
              )}
            </Box>
          </Box>
        )}

        {/* Template Code */}
        {templateCode && (
          <Box
            sx={{
              p: 1.5,
              borderLeft: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
              minWidth: 120,
              alignItems: 'center',
              bgcolor: (theme) => alpha(theme.palette.text.primary, 0.03),
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CodeIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.disabled', textTransform: 'uppercase', fontSize: '0.55rem', letterSpacing: '0.5px' }}>
                Template Code
              </Typography>
            </Box>
            <Chip
              label={templateCode}
              size="small"
              color="primary"
              sx={{ fontWeight: 900, fontFamily: 'monospace', letterSpacing: '1px', fontSize: '0.75rem' }}
            />
          </Box>
        )}
      </Box>

      {/* Row 2: Lote | CUIT | RENSPA | Fecha */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr',
          border: '1.5px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        {/* Lote */}
        <HeaderCell
          icon={<BatchIcon sx={{ fontSize: 12 }} />}
          label="Lote"
          value={context?.lote || '—'}
          verified={!!context?.batch_id}
          showBadge={!!context?.lote}
        />

        {/* CUIT */}
        <HeaderCell
          icon={<CuitIcon sx={{ fontSize: 12 }} />}
          label="CUIT"
          value={context?.cuit || '—'}
          verified={!!context?.provider_id}
          showBadge={!!context?.cuit}
          borderLeft
        />

        {/* RENSPA */}
        <HeaderCell
          icon={<RenspaIcon sx={{ fontSize: 12 }} />}
          label="RENSPA"
          value={context?.renspa || '—'}
          verified={!!context?.farm_id}
          showBadge={!!context?.renspa}
          borderLeft
        />

        {/* Fecha */}
        <HeaderCell
          icon={<DateIcon sx={{ fontSize: 12 }} />}
          label="Fecha"
          value={context?.fecha || new Date().toLocaleDateString('es-AR')}
          verified={false}
          showBadge={false}
          borderLeft
        />
      </Box>
    </Box>
  );
};

/**
 * HeaderCell - Reusable cell for the secondary metadata row.
 */
const HeaderCell = ({
  icon,
  label,
  value,
  verified,
  showBadge,
  borderLeft = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  verified: boolean;
  showBadge: boolean;
  borderLeft?: boolean;
}) => (
  <Box
    sx={{
      p: 1.5,
      display: 'flex',
      flexDirection: 'column',
      gap: 0.5,
      alignItems: 'center',
      ...(borderLeft && { borderLeft: '1px solid', borderColor: 'divider' }),
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.disabled' }}>
      {icon}
      <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.55rem', letterSpacing: '0.5px' }}>
        {label}
      </Typography>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.78rem' }}>
        {value}
      </Typography>
      {showBadge && (
        verified ? (
          <VerifiedIcon sx={{ fontSize: 12, color: 'success.main' }} />
        ) : (
          <UnverifiedIcon sx={{ fontSize: 12, color: 'warning.main' }} />
        )
      )}
    </Box>
  </Box>
);
