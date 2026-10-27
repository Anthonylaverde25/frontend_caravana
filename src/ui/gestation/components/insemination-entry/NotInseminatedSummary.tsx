import { Stack, Typography } from '@mui/material';
import NotInseminatedGrid from './NotInseminatedGrid';
import type { useNotInseminated } from './useNotInseminated';

interface NotInseminatedSummaryProps {
  notInseminated: ReturnType<typeof useNotInseminated>;
}

/** "Cerrar orden" of an AI order: the never inseminated, with an optional reason each (IA12, DB5). */
export default function NotInseminatedSummary({ notInseminated }: NotInseminatedSummaryProps) {
  if (notInseminated.females.length === 0) return null;

  return (
    <Stack spacing={1} sx={{ mt: 2.5 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        {notInseminated.females.length} vientre(s) sin inseminar
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Cerrar la orden termina el servicio. Estos vientres no se tactan ni cuentan en la preñez; el motivo es opcional.
      </Typography>
      <NotInseminatedGrid females={notInseminated.females} reasons={notInseminated.reasons} onChange={notInseminated.setReason} />
    </Stack>
  );
}
