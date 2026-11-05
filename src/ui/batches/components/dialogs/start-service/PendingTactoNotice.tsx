import React from 'react';
import { Alert, Button } from '@mui/material';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import type { PendingTactoFemale } from '@/features/gestation/hooks/useServiceOrderIssuance';

const NAMED = 5;

interface PendingTactoNoticeProps {
  /** Empty females of the batch that still owe their tacto to another order. */
  females: Caravan[];
  owingTacto: ReadonlyMap<number, PendingTactoFemale>;
  picksIndividually: boolean;
  /** Opens the batch transfer with these females ticked. */
  onSetApart: (ids: number[]) => void;
}

/**
 * A female moved to this batch before her tacto may already be pregnant. In a natural service she
 * shares the paddock with the bulls, so she is exposed and recorded as such; picked one by one, she
 * waits for her verdict.
 */
export const PendingTactoNotice: React.FC<PendingTactoNoticeProps> = ({
  females,
  owingTacto,
  picksIndividually,
  onSetApart,
}) => {
  if (females.length === 0) return null;

  const named = females
    .slice(0, NAMED)
    .map((female) => `${female.identification} (${owingTacto.get(female.id!)?.order_code ?? ''})`)
    .join(', ');
  const others = females.length > NAMED ? ` y ${females.length - NAMED} más` : '';
  const who = `${named}${others}`;

  return (
    <Alert
      severity={picksIndividually ? 'info' : 'warning'}
      sx={{ fontSize: '0.8rem', py: 0.5 }}
      action={
        !picksIndividually && (
          <Button
            size="small"
            color="inherit"
            variant="outlined"
            onClick={() => onSetApart(females.map((female) => female.id!))}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            Apartar
          </Button>
        )
      }
    >
      {picksIndividually
        ? `Con el tacto pendiente en otra orden, no se pueden elegir: ${who}.`
        : `Con el tacto pendiente en otra orden: ${who}. Si iniciás así quedan con los toros: tactalas o apartalas antes.`}
    </Alert>
  );
};

export default PendingTactoNotice;
