import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { useWorkTemplatePrint } from '@/contexts/WorkTemplatePrintContext';
import { useMarkWeaningOrderPrinted } from '@/features/weaning-orders/hooks/useWeaningOrderMutations';
import { categoryColumnOf, useDest01Print } from './Dest01PrintContext';
import Dest01Page from './Dest01Page';
import { useDest01OrderPrint } from '../../hooks/useDest01OrderPrint';

const ROWS_PER_PAGE = 20;
/** Empty lines after the calves of an order, for calves that show up at the chute. */
const FREE_ROWS_FROM_ORDER = 4;

/**
 * DEST-01 printable sheet. Blank mode prints the chosen number of empty pages to number by hand;
 * order mode prints the order's calves with everything it decided, plus a few free lines.
 */
export const TemplateDEST01: React.FC = () => {
  const { template, farm, activeCompany, printAreaRef, activeFarm, setOnPrinted, setPrintLock } = useWorkTemplatePrint();
  const { mode, blankPages, calves, header, destinationMode, categoryMode, weaningOrderId, orderLockReason } = useDest01Print();
  const { mutate: markPrinted } = useMarkWeaningOrderPrinted();

  // Lives here and not in the config drawer: MUI does not mount a closed drawer.
  useDest01OrderPrint();

  // The paper is recorded when it actually goes out — printed or downloaded — never on opening.
  useEffect(() => {
    setOnPrinted(mode === 'from_order' && weaningOrderId ? () => markPrinted(weaningOrderId) : null);

    return () => setOnPrinted(null);
  }, [mode, weaningOrderId, setOnPrinted, markPrinted]);

  // A draft is previewed and a closed order is looked up; only an open order goes out on paper.
  useEffect(() => {
    setPrintLock(mode === 'from_order' ? orderLockReason : null);

    return () => setPrintLock(null);
  }, [mode, orderLockReason, setPrintLock]);

  const displayFarm = activeFarm || farm;
  const code = template?.code || 'DEST-01';
  const title = template?.title || 'Destete y Conformación de Lote de Destete';
  const establishment = `${activeCompany?.name || 'ESTABLECIMIENTO GANADERO'}${displayFarm ? ` • ${displayFarm.name}` : ''}${displayFarm?.renspa ? ` • RENSPA: ${displayFarm.renspa}` : ''}`;

  const fromOrder = mode === 'from_order' && calves.length > 0;
  const pageCount = fromOrder ? Math.ceil((calves.length + FREE_ROWS_FROM_ORDER) / ROWS_PER_PAGE) : blankPages;
  const printedHeader = mode === 'blank' ? { ...header, orden_destete: '', orden_es_borrador: false } : header;

  return (
    <Box ref={printAreaRef} sx={{ width: '210mm', maxWidth: '100%', mx: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {Array.from({ length: pageCount }).map((_, pageIndex) => {
        const pageCalves = fromOrder ? calves.slice(pageIndex * ROWS_PER_PAGE, (pageIndex + 1) * ROWS_PER_PAGE) : [];

        return (
          <Dest01Page
            key={pageIndex}
            code={code}
            title={title}
            establishment={establishment}
            header={printedHeader}
            destinationMode={destinationMode}
            categoryColumn={categoryColumnOf(mode, categoryMode)}
            calves={pageCalves}
            blankRows={ROWS_PER_PAGE - pageCalves.length}
            firstRowNumber={pageIndex * ROWS_PER_PAGE + 1}
            pageNumber={fromOrder ? pageIndex + 1 : null}
            pageTotal={fromOrder ? pageCount : null}
          />
        );
      })}
    </Box>
  );
};

export default TemplateDEST01;
