import React, { forwardRef, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Alert, AppBar, Box, Button, CircularProgress, Dialog, IconButton, Paper, Slide, Stack, TextField, Toolbar, Typography } from '@mui/material';
import type { TransitionProps } from '@mui/material/transitions';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useContrastTheme } from '@/contexts/ContrastThemeContext';
import { useCompany } from '@/contexts/CompanyContext';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import { useOpenBirthOrderMothers } from '@/features/birth-orders/hooks/useBirthOrders';
import { filledInputProps, sectionTitleSx } from '@/ui/weaning-orders/components/form/formStyles';
import PregnantFemalesByBatchSelector from './PregnantFemalesByBatchSelector';
import { usePregnantFemalesByBatch } from './usePregnantFemalesByBatch';
import { BirthFormMode, BirthOrderHeader, BirthOrderStart, emptyBirthHeader } from './birthOrderStart';

/** The slide-up of the Material UI full-screen dialog. */
const SlideUp = forwardRef(function SlideUp(props: TransitionProps & { children: React.ReactElement }, ref: React.Ref<unknown>) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface BirthOrderStartDialogProps {
  open: boolean;
  mode: BirthFormMode;
  /** What was already declared: a batch chosen in Monitoreo Gestacional, or the order coming back from its confirmation. */
  initial?: BirthOrderStart | null;
  onClose: () => void;
  onExited?: () => void;
}

const NO_IDS: number[] = [];

/**
 * "Nueva orden de parición" / "Registrar partos" (`/birth-orders/new`, `/birth-orders/register`):
 * which pregnant females, chosen by batch, and — for an order — the calving window and who walks the
 * rounds. There is no destination to choose: each calf is born in its mother's batch.
 */
export const BirthOrderStartDialog: React.FC<BirthOrderStartDialogProps> = ({ open, mode, initial, onClose, onExited }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings: contrast } = useContrastTheme();
  const barBg = (contrast.enabled && (contrast.headerBg || contrast.primaryButtonBg)) || 'primary.main';
  const barText = (contrast.enabled && contrast.headerBg && contrast.headerText) || 'common.white';

  const { activeCompanyId } = useCompany();
  const { data: caravans = [], isLoading } = useCaravans(activeCompanyId);
  const { data: committed = new Map<number, string>() } = useOpenBirthOrderMothers();
  const keep = initial?.orderId ? initial.motherIds : NO_IDS;
  const groups = usePregnantFemalesByBatch(caravans, committed, keep);
  const [motherIds, setMotherIds] = useState<number[]>([]);
  const [header, setHeader] = useState<BirthOrderHeader>(emptyBirthHeader);
  const [appliedBatch, setAppliedBatch] = useState(false);

  useEffect(() => {
    if (!open) return;

    setMotherIds(initial?.motherIds ?? []);
    setHeader(initial?.header ?? emptyBirthHeader());
    setAppliedBatch(false);
  }, [open]);

  // Coming from a batch of Monitoreo Gestacional: its available pregnant females start chosen.
  useEffect(() => {
    if (!open || appliedBatch || !initial?.batchId || isLoading || initial.motherIds.length > 0) return;

    const group = groups.find((g) => g.batchId === initial.batchId);
    setMotherIds(group ? group.females.map((f) => f.caravanId) : []);
    setAppliedBatch(true);
  }, [open, appliedBatch, initial, groups, isLoading]);

  const setField = <K extends keyof BirthOrderHeader>(field: K, value: BirthOrderHeader[K]) => setHeader((prev) => ({ ...prev, [field]: value }));

  const available = useMemo(() => new Set(groups.flatMap((g) => g.females.map((f) => f.caravanId))), [groups]);
  const chosen = motherIds.filter((id) => available.has(id) || isLoading);

  const problems: string[] = [];
  if (chosen.length === 0) problems.push('Elegí al menos un vientre preñado.');
  if (header.periodStart && header.periodEnd && header.periodEnd < header.periodStart) problems.push('El período termina antes de empezar.');

  const proceed = () => {
    const start: BirthOrderStart = { orderId: initial?.orderId ?? null, orderCode: initial?.orderCode ?? null, motherIds: chosen, header };
    const confirm = `${location.pathname}/confirm${start.orderId ? `?orderId=${start.orderId}` : ''}`;

    // This step keeps what was declared, so going back from the confirmation finds it again.
    navigate(location.pathname, { replace: true, state: start });
    navigate(confirm, { state: start });
  };

  const title = mode === 'register' ? 'Registrar partos' : initial?.orderId ? `Editar borrador ${initial.orderCode ?? ''}`.trim() : 'Nueva orden de parición';

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      TransitionComponent={SlideUp}
      TransitionProps={{ onExited }}
      PaperProps={{ sx: { borderRadius: 0, bgcolor: 'background.default' } }}
    >
      <AppBar position="relative" elevation={0} sx={{ bgcolor: barBg, color: barText }}>
        <Toolbar sx={{ gap: 2 }}>
          <IconButton edge="start" color="inherit" onClick={onClose} aria-label="Cerrar">
            <FuseSvgIcon size={22}>heroicons-outline:x-mark</FuseSvgIcon>
          </IconButton>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }} noWrap>
              {title}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8, display: { xs: 'none', md: 'block' } }} noWrap>
              {mode === 'register'
                ? 'Qué vientres parieron o perdieron la preñez. Después se carga vientre por vientre.'
                : 'Qué vientres se esperan parir y en qué período. La planilla PAR-01 se cumple en las recorridas.'}
            </Typography>
          </Box>
          <Button color="inherit" onClick={onClose} sx={{ textTransform: 'none', fontWeight: 600, display: { xs: 'none', sm: 'inline-flex' } }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="inherit"
            disableElevation
            disabled={problems.length > 0}
            onClick={proceed}
            endIcon={<FuseSvgIcon size={16}>heroicons-outline:arrow-right</FuseSvgIcon>}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '6px',
              bgcolor: 'common.white',
              color: barBg,
              '&:hover': { bgcolor: 'grey.100' },
              '&.Mui-disabled': { bgcolor: 'rgba(255, 255, 255, 0.24)', color: 'rgba(255, 255, 255, 0.6)' }
            }}
          >
            Continuar con {chosen.length} vientre(s)
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          p: { xs: 2, md: 3 },
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '380px minmax(0, 1fr)' },
          gap: 2.5,
          alignItems: 'start'
        }}
      >
        <Stack spacing={2.5}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: '8px' }}>
            <Typography sx={sectionTitleSx}>1. Destino de las crías</Typography>
            <Alert severity="info" icon={<FuseSvgIcon size={18}>heroicons-outline:home</FuseSvgIcon>} sx={{ mt: 1.5, borderRadius: '6px' }}>
              Cada cría nace en el lote de su madre, el día que nace. No hay lote destino que elegir.
            </Alert>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2, borderRadius: '8px' }}>
            <Typography sx={sectionTitleSx}>2. {mode === 'register' ? 'Quién' : 'Cuándo y quién'}</Typography>
            <Stack spacing={1.5} sx={{ mt: 1.5 }}>
              {mode === 'order' && (
                <Stack direction="row" spacing={1.5}>
                  <TextField
                    label="Período desde"
                    type="date"
                    variant="filled"
                    value={header.periodStart}
                    onChange={(e) => setField('periodStart', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    InputProps={filledInputProps}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="Período hasta"
                    type="date"
                    variant="filled"
                    value={header.periodEnd}
                    onChange={(e) => setField('periodEnd', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    InputProps={filledInputProps}
                    sx={{ flex: 1 }}
                  />
                </Stack>
              )}
              <TextField
                label="Responsable de las recorridas"
                variant="filled"
                value={header.responsable}
                onChange={(e) => setField('responsable', e.target.value)}
                InputProps={filledInputProps}
              />
              <TextField
                label="Observaciones"
                variant="filled"
                multiline
                minRows={2}
                value={header.observations}
                onChange={(e) => setField('observations', e.target.value)}
                InputProps={filledInputProps}
              />
            </Stack>
          </Paper>

          <Alert severity={problems.length > 0 ? 'info' : 'success'} sx={{ borderRadius: '6px' }}>
            {problems.length > 0 ? problems.join(' ') : `Listo para continuar con ${chosen.length} vientre(s).`}
          </Alert>
        </Stack>

        <Paper variant="outlined" sx={{ p: 2, borderRadius: '8px', position: { lg: 'sticky' }, top: 0 }}>
          <Typography sx={{ ...sectionTitleSx, mb: 1.5 }}>3. Vientres preñados</Typography>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={28} />
            </Box>
          ) : (
            <PregnantFemalesByBatchSelector
              groups={groups}
              selected={chosen}
              onChange={setMotherIds}
              maxHeight={{ xs: 440, lg: 'calc(100vh - 250px)' }}
            />
          )}
        </Paper>
      </Box>
    </Dialog>
  );
};

export default BirthOrderStartDialog;
