import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { useWorkTemplatePrint } from '@/contexts/WorkTemplatePrintContext';
import { useCact01Print } from './Cact01PrintContext';
import Cact01Page from './Cact01Page';
import { useCact01SourceAnimals } from '../../hooks/useCact01SourceAnimals';
import { useCact01ScanOptions } from '../../hooks/useCact01ScanOptions';
import { useMarkTransferOrderPrinted } from '@/features/transfer-orders/hooks/useTransferOrderMutations';

const ROWS_PER_PAGE = 20;
/** Empty lines after the pre-loaded animals, for the ones that turn up in the chute. */
const FREE_ROWS_FROM_BATCH = 6;

/**
 * CACT-01 printable sheet. Blank mode prints the chosen number of empty pages with
 * "Hoja __ de __" to number by hand; batch mode paginates the pre-loaded animals plus a
 * few free lines.
 *
 * The summary box is computed from the SELECTION, not from the page, so every page
 * carries the figures of the whole troop: a single page found on its own still says how
 * many head the movement was.
 */
export const TemplateCACT01: React.FC = () => {
  const { template, farm, activeCompany, printAreaRef, activeFarm, setOnPrinted, setPrintLock } = useWorkTemplatePrint();
  const { mode, destinationMode, blankPages, animals, header, transferOrderId, orderLockReason, categoryMode } =
    useCact01Print();
  const { mutate: markPrinted } = useMarkTransferOrderPrinted();

  // "Emitted" no longer implies paper, so the paper is recorded when it actually goes out —
  // printed or downloaded — never when the view merely opens.
  useEffect(() => {
    setOnPrinted(transferOrderId ? () => markPrinted(transferOrderId) : null);

    return () => setOnPrinted(null);
  }, [transferOrderId, setOnPrinted, markPrinted]);

  // A draft is previewed and a closed order is looked up; only an open order goes out on paper.
  useEffect(() => {
    setPrintLock(orderLockReason);

    return () => setPrintLock(null);
  }, [orderLockReason, setPrintLock]);

  // Loads the animals of the source batch and publishes them for this sheet. It lives here
  // and not in the config drawer because MUI does not mount a closed drawer: printing
  // without opening it used to produce blank pages over a selection already made.
  useCact01SourceAnimals({ publish: true });

  const displayFarm = activeFarm || farm;
  const code = template?.code || 'CACT-01';
  const title = template?.title || 'Cambio de Actividad de Hacienda';
  const establishment = `${activeCompany?.name || 'ESTABLECIMIENTO GANADERO'}${displayFarm ? ` • ${displayFarm.name}` : ''}${displayFarm?.renspa ? ` • RENSPA: ${displayFarm.renspa}` : ''}`;

  /**
   * The M cell goes out with the destination column, unless the destination activity is a
   * non-productive one — those batches have no management system to declare, so the cell
   * would be a question with no possible answer.
   *
   * A sheet printed without declaring the activity keeps the cell: its header is filled in by
   * hand too, and an unused blank cell costs nothing next to a missing one.
   */
  const perRow = destinationMode === 'per_row';
  const { activities: productiveActivities } = useCact01ScanOptions();
  const showManagementColumn =
    perRow &&
    (header.actividad_destino_id == null ||
      productiveActivities.some((activity) => activity.id === header.actividad_destino_id));

  // The C/S nueva column: printed by a declared order, blank when the category is decided at the
  // chute — which a sheet without an order always is: nobody declared anything for it. Only an
  // order that says the category does not change leaves the column out.
  const categoryColumn =
    categoryMode === 'DECLARED' ? 'declared' : categoryMode === 'KEEP' ? 'none' : 'at_chute';

  const fromBatch = mode === 'from_batch' && animals.length > 0;
  const pageCount = fromBatch ? Math.ceil((animals.length + FREE_ROWS_FROM_BATCH) / ROWS_PER_PAGE) : blankPages;

  const weighed = animals.filter((animal) => animal.currentWeight != null);
  const totalHead = fromBatch ? animals.length : null;
  const totalWeight = fromBatch && weighed.length > 0
    ? weighed.reduce((sum, animal) => sum + Number(animal.currentWeight), 0)
    : null;

  return (
    <Box ref={printAreaRef} sx={{ width: '210mm', maxWidth: '100%', mx: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {Array.from({ length: pageCount }).map((_, pageIndex) => {
        const pageAnimals = fromBatch ? animals.slice(pageIndex * ROWS_PER_PAGE, (pageIndex + 1) * ROWS_PER_PAGE) : [];

        return (
          <Cact01Page
            key={pageIndex}
            code={code}
            title={title}
            establishment={establishment}
            header={header}
            animals={pageAnimals}
            blankRows={ROWS_PER_PAGE - pageAnimals.length}
            firstRowNumber={pageIndex * ROWS_PER_PAGE + 1}
            showDestinationColumn={perRow}
            showManagementColumn={showManagementColumn}
            categoryColumn={categoryColumn}
            totalHead={totalHead}
            totalWeight={totalWeight}
            pageNumber={fromBatch ? pageIndex + 1 : null}
            pageTotal={fromBatch ? pageCount : null}
          />
        );
      })}
    </Box>
  );
};

export default TemplateCACT01;
