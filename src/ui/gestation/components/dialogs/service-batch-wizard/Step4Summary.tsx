import React from 'react';
import {
  Box,
  Typography,
  Paper,
  FormControlLabel,
  Switch,
  Stack,
} from '@mui/material';

interface Step4SummaryProps {
  name: string;
  selectedFemaleCount: number;
  selectedMaleCount: number;
  currentRatio: number;
  autoCreateServiceOrder: boolean;
  setAutoCreateServiceOrder: (val: boolean) => void;
}

export const Step4Summary: React.FC<Step4SummaryProps> = ({
  name,
  selectedFemaleCount,
  selectedMaleCount,
  currentRatio,
  autoCreateServiceOrder,
  setAutoCreateServiceOrder,
}) => {
  return (
    <Stack spacing={2.5}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
          gap: 2,
        }}
      >
        <Paper
          variant="outlined"
          sx={{ p: 2, textAlign: 'center', borderRadius: '8px', bgcolor: 'action.hover', border: 1, borderColor: 'divider' }}
        >
          <Typography variant="caption" color="text.secondary">
            Nombre Lote
          </Typography>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 0.5, wordBreak: 'break-word' }}>
            {name}
          </Typography>
        </Paper>

        <Paper
          variant="outlined"
          sx={{ p: 2, textAlign: 'center', borderRadius: '8px', bgcolor: 'action.hover', border: 1, borderColor: 'divider' }}
        >
          <Typography variant="caption" color="text.secondary">
            Vientres Reclutados
          </Typography>
          <Typography variant="h6" fontWeight={700} color="primary.main" sx={{ mt: 0.5 }}>
            {selectedFemaleCount}
          </Typography>
        </Paper>

        <Paper
          variant="outlined"
          sx={{ p: 2, textAlign: 'center', borderRadius: '8px', bgcolor: 'action.hover', border: 1, borderColor: 'divider' }}
        >
          <Typography variant="caption" color="text.secondary">
            Toros Asignados
          </Typography>
          <Typography variant="h6" fontWeight={700} color="primary.main" sx={{ mt: 0.5 }}>
            {selectedMaleCount}
          </Typography>
        </Paper>

        <Paper
          variant="outlined"
          sx={{ p: 2, textAlign: 'center', borderRadius: '8px', bgcolor: 'action.hover', border: 1, borderColor: 'divider' }}
        >
          <Typography variant="caption" color="text.secondary">
            Ratio Torada
          </Typography>
          <Typography
            variant="h6"
            fontWeight={700}
            color={currentRatio >= 2.0 ? 'success.main' : 'warning.main'}
            sx={{ mt: 0.5 }}
          >
            {currentRatio}%
          </Typography>
        </Paper>
      </Box>

      <Paper
        variant="outlined"
        sx={{
          p: 2.5,
          borderRadius: '8px',
          bgcolor: 'action.hover',
          border: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="subtitle2" fontWeight={700} gutterBottom>
          Acciones Atómicas que se ejecutarán:
        </Typography>
        <Typography variant="body2" color="text.secondary" component="div">
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>Creación del nuevo Lote propio de tipo <strong>SERVICE</strong>.</li>
            <li>
              Transferencia atómica de <strong>{selectedFemaleCount} vientres</strong> y{' '}
              <strong>{selectedMaleCount} toros</strong> a este nuevo lote.
            </li>
            <li>
              Registro de trazabilidad y movimientos en el libro de campo (<em>caravan_movements</em>).
            </li>
          </ul>
        </Typography>
      </Paper>

      <FormControlLabel
        control={
          <Switch
            checked={autoCreateServiceOrder}
            onChange={(e) => setAutoCreateServiceOrder(e.target.checked)}
            color="primary"
          />
        }
        label={
          <Box sx={{ userSelect: 'none' }}>
            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
              Generar automáticamente la Orden de Servicio Reproductivo (OS)
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
              Crea la OS vinculada en estado APROBADA con su hoja de trabajo lista para imprimir.
            </Typography>
          </Box>
        }
      />
    </Stack>
  );
};

export default Step4Summary;
