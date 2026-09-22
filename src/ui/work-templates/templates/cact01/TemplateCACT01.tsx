import React from 'react';
import { Box } from '@mui/material';
import { useWorkTemplatePrint } from '@/contexts/WorkTemplatePrintContext';
import { useCact01Print } from './Cact01PrintContext';
import Cact01Page from './Cact01Page';

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
  const { template, farm, activeCompany, printAreaRef, activeFarm } = useWorkTemplatePrint();
  const { mode, destinationMode, blankPages, animals, header } = useCact01Print();

  const displayFarm = activeFarm || farm;
  const code = template?.code || 'CACT-01';
  const title = template?.title || 'Cambio de Actividad de Hacienda';
  const establishment = `${activeCompany?.name || 'ESTABLECIMIENTO GANADERO'}${displayFarm ? ` • ${displayFarm.name}` : ''}${displayFarm?.renspa ? ` • RENSPA: ${displayFarm.renspa}` : ''}`;

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
            showDestinationColumn={destinationMode === 'per_row'}
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
