import { Button, Paper, Stack, TextField, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useNavigate } from 'react-router';
import type { DiagnosisRound } from '@/features/gestation/hooks/useServiceOrders';
import { filledInputProps, sectionTitleSx } from '@/ui/weaning-orders/components/form/formStyles';
import { todayIso } from '../../utils/reproductiveVerdict';
import { type TactoMode, roundLabel } from './tactoStart';

interface TactoRoundCardProps {
  orderId: number;
  mode: TactoMode;
  rounds: DiagnosisRound[];
  roundDate: string;
  onRoundDate: (date: string) => void;
}

const buttonSx = { textTransform: 'none', fontWeight: 700, justifyContent: 'flex-start' } as const;

/**
 * "2. Ronda": its day (the closing day too, in close mode) and the paper alternative: the REP-01
 * sheet of the pending females, printed and scanned back. Both paths can be mixed.
 */
export default function TactoRoundCard({ orderId, mode, rounds, roundDate, onRoundDate }: TactoRoundCardProps) {
  const navigate = useNavigate();
  const today = todayIso();

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: '8px' }}>
      <Typography sx={sectionTitleSx}>2. Ronda</Typography>
      <TextField
        label={mode === 'close' ? 'Fecha del tacto y del cierre' : 'Fecha de la ronda'}
        type="date"
        variant="filled"
        fullWidth
        value={roundDate}
        onChange={(e) => onRoundDate(e.target.value || today)}
        InputLabelProps={{ shrink: true }}
        InputProps={filledInputProps}
        inputProps={{ max: today }}
        helperText={roundLabel(rounds, roundDate)}
        sx={{ mt: 1.5 }}
      />
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, mb: 1, fontWeight: 600 }}>
        ¿Lo cargás con la planilla?
      </Typography>
      <Stack spacing={1}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<FuseSvgIcon size={16}>heroicons-outline:printer</FuseSvgIcon>}
          onClick={() => window.open(`/work-templates/REP-01?orderId=${orderId}&pending=1`, '_blank')}
          sx={buttonSx}
        >
          Imprimir REP-01 de pendientes
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<FuseSvgIcon size={16}>heroicons-outline:document-arrow-up</FuseSvgIcon>}
          onClick={() => navigate(`/livestock/upload?orderId=${orderId}`)}
          sx={buttonSx}
        >
          Escanear planilla
        </Button>
      </Stack>
    </Paper>
  );
}
