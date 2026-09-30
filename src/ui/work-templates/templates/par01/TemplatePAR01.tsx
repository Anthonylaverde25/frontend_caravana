import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { useWorkTemplatePrint } from '@/contexts/WorkTemplatePrintContext';
import { useMarkBirthOrderPrinted } from '@/features/birth-orders/hooks/useBirthOrderMutations';
import { usePar01Print } from './Par01PrintContext';
import Par01Page from './Par01Page';
import { usePar01OrderPrint } from '../../hooks/usePar01OrderPrint';

const ROWS_PER_PAGE = 20;
/**
 * Empty lines after the females of an order, for calvings found at the round that it did not list:
 * the same row as every other, with the "Fuera de orden" box crossed.
 */
const FREE_ROWS_FROM_ORDER = 4;

/**
 * PAR-01 printable sheet. Blank mode prints the chosen number of empty pages; order mode prints the
 * order's pending females soonest due first — the sheet to take on the next round — plus a few free
 * lines for calvings outside the order.
 */
export const TemplatePAR01: React.FC = () => {
  const { template, farm, activeCompany, printAreaRef, activeFarm, setOnPrinted, setPrintLock } = useWorkTemplatePrint();
  const { mode, blankPages, females, header, birthOrderId, orderLockReason } = usePar01Print();
  const { mutate: markPrinted } = useMarkBirthOrderPrinted();

  // Lives here and not in the config drawer: MUI does not mount a closed drawer.
  usePar01OrderPrint();

  // The paper is recorded when it actually goes out — printed or downloaded — never on opening.
  useEffect(() => {
    setOnPrinted(mode === 'from_order' && birthOrderId ? () => markPrinted(birthOrderId) : null);

    return () => setOnPrinted(null);
  }, [mode, birthOrderId, setOnPrinted, markPrinted]);

  // A draft is previewed and a closed order is looked up; only an open order goes out on paper.
  useEffect(() => {
    setPrintLock(mode === 'from_order' ? orderLockReason : null);

    return () => setPrintLock(null);
  }, [mode, orderLockReason, setPrintLock]);

  const displayFarm = activeFarm || farm;
  const code = template?.code || 'PAR-01';
  const title = template?.title || 'Planilla de Parición';
  const establishment = `${activeCompany?.name || 'ESTABLECIMIENTO GANADERO'}${displayFarm ? ` • ${displayFarm.name}` : ''}${displayFarm?.renspa ? ` • RENSPA: ${displayFarm.renspa}` : ''}`;

  const fromOrder = mode === 'from_order' && females.length > 0;
  const pageCount = fromOrder ? Math.ceil((females.length + FREE_ROWS_FROM_ORDER) / ROWS_PER_PAGE) : blankPages;
  const printedHeader = mode === 'blank' ? { ...header, orden_paricion: '', orden_es_borrador: false } : header;

  return (
    <Box ref={printAreaRef} sx={{ width: '210mm', maxWidth: '100%', mx: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {Array.from({ length: pageCount }).map((_, pageIndex) => {
        const pageFemales = fromOrder ? females.slice(pageIndex * ROWS_PER_PAGE, (pageIndex + 1) * ROWS_PER_PAGE) : [];
        const blankRows = ROWS_PER_PAGE - pageFemales.length;

        return (
          <Par01Page
            key={pageIndex}
            code={code}
            title={title}
            establishment={establishment}
            header={printedHeader}
            females={pageFemales}
            blankRows={blankRows}
            firstRowNumber={pageIndex * ROWS_PER_PAGE + 1}
            pageNumber={fromOrder ? pageIndex + 1 : null}
            pageTotal={fromOrder ? pageCount : null}
          />
        );
      })}
    </Box>
  );
};

export default TemplatePAR01;
