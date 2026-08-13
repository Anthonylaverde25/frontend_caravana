import { Paper, Stack, Box, Typography, Tooltip, Button, alpha } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { PedigreeRecord } from '@/core/caravans/domain/services/pedigreeAnalysis';

interface PedigreeSelectionBannerProps {
  selectedCaravanIds: number[];
  selectedRecordsList: PedigreeRecord[];
  selectedFemalesList: PedigreeRecord[];
  onOpenRescueDialog?: (females: PedigreeRecord[]) => void;
  onOpenIsolateDialog?: (records: PedigreeRecord[]) => void;
  onClearSelection: () => void;
  isDark: boolean;
}

export default function PedigreeSelectionBanner({
  selectedCaravanIds,
  selectedRecordsList,
  selectedFemalesList,
  onOpenRescueDialog,
  onOpenIsolateDialog,
  onClearSelection,
  isDark,
}: PedigreeSelectionBannerProps) {
  if (selectedCaravanIds.length === 0) return null;

  const active = isDark ? '#60a5fa' : '#0a6ed1';
  const success = isDark ? '#4ade80' : '#15803d';

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 2,
        p: 1.5,
        borderRadius: '8px',
        border: '1px solid',
        borderColor: alpha(active, isDark ? 0.22 : 0.16),
        bgcolor: alpha(active, isDark ? 0.08 : 0.05),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1.5,
        animation: 'fadeIn 0.2s ease-in-out',
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box
          sx={{
            px: 1.25,
            py: 0.5,
            borderRadius: '6px',
            bgcolor: alpha(active, 0.14),
            color: active,
            fontSize: '0.75rem',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          {selectedCaravanIds.length} seleccionados
        </Box>
        <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
          Gestión de Lotes: Transferencia de animales con consanguinidad o descartes
        </Typography>
      </Stack>

      <Stack direction="row" spacing={1} alignItems="center">
        {selectedFemalesList.length > 0 && onOpenRescueDialog && (
          <Tooltip
            title={
              selectedRecordsList.length > selectedFemalesList.length
                ? `Se incluyen ${selectedFemalesList.length} vientres (hembras). Se excluyeron ${
                    selectedRecordsList.length - selectedFemalesList.length
                  } macho(s) por ser reproductores/novillos.`
                : 'Planificar Orden de Servicio de Rescate Exogámico para los vientres seleccionados'
            }
            arrow
          >
            <Button
              variant="text"
              size="small"
              startIcon={<FuseSvgIcon size={16}>heroicons-outline:sparkles</FuseSvgIcon>}
              onClick={() => onOpenRescueDialog(selectedFemalesList)}
              sx={{
                fontWeight: 600,
                textTransform: 'none',
                px: 1.25,
                color: success,
                bgcolor: alpha(success, 0.12),
                '&:hover': { bgcolor: alpha(success, 0.2) },
              }}
            >
              Orden de Rescate ({selectedFemalesList.length} Vientres)
            </Button>
          </Tooltip>
        )}

        {onOpenIsolateDialog && (
          <Button
            variant="text"
            size="small"
            startIcon={<FuseSvgIcon size={16}>heroicons-outline:archive-box</FuseSvgIcon>}
            onClick={() => onOpenIsolateDialog(selectedRecordsList)}
            sx={{
              fontWeight: 600,
              textTransform: 'none',
              px: 1.25,
              color: active,
              bgcolor: alpha(active, 0.12),
              '&:hover': { bgcolor: alpha(active, 0.2) },
            }}
          >
            Apartar a Lote Reserva ({selectedCaravanIds.length})
          </Button>
        )}

        <Button
          variant="text"
          size="small"
          onClick={onClearSelection}
          sx={{ fontWeight: 500, textTransform: 'none', color: 'text.secondary' }}
        >
          Limpiar Selección
        </Button>
      </Stack>
    </Paper>
  );
}
