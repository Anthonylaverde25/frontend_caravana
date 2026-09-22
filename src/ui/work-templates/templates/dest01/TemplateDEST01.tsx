import React from 'react';
import { Box } from '@mui/material';
import { useWorkTemplatePrint } from '@/contexts/WorkTemplatePrintContext';
import { useDest01Print } from './Dest01PrintContext';
import Dest01Page from './Dest01Page';

const ROWS_PER_PAGE = 20;
/** Empty lines after the pre-loaded calves, for calves that show up in the chute. */
const FREE_ROWS_FROM_BATCH = 6;

/**
 * DEST-01 printable sheet. Blank mode prints the chosen number of empty pages with "Hoja __ de __"
 * to number by hand; batch mode paginates the pre-loaded calves plus a few free lines.
 */
export const TemplateDEST01: React.FC = () => {
  const { template, farm, activeCompany, printAreaRef, activeFarm } = useWorkTemplatePrint();
  const { mode, blankPages, calves, header } = useDest01Print();

  const displayFarm = activeFarm || farm;
  const code = template?.code || 'DEST-01';
  const title = template?.title || 'Destete y Conformación de Lote de Destete';
  const establishment = `${activeCompany?.name || 'ESTABLECIMIENTO GANADERO'}${displayFarm ? ` • ${displayFarm.name}` : ''}${displayFarm?.renspa ? ` • RENSPA: ${displayFarm.renspa}` : ''}`;

  const fromBatch = mode === 'from_batch' && calves.length > 0;
  const pageCount = fromBatch ? Math.ceil((calves.length + FREE_ROWS_FROM_BATCH) / ROWS_PER_PAGE) : blankPages;

  return (
    <Box ref={printAreaRef} sx={{ width: '210mm', maxWidth: '100%', mx: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {Array.from({ length: pageCount }).map((_, pageIndex) => {
        const pageCalves = fromBatch ? calves.slice(pageIndex * ROWS_PER_PAGE, (pageIndex + 1) * ROWS_PER_PAGE) : [];

        return (
          <Dest01Page
            key={pageIndex}
            code={code}
            title={title}
            establishment={establishment}
            header={header}
            calves={pageCalves}
            blankRows={ROWS_PER_PAGE - pageCalves.length}
            firstRowNumber={pageIndex * ROWS_PER_PAGE + 1}
            pageNumber={fromBatch ? pageIndex + 1 : null}
            pageTotal={fromBatch ? pageCount : null}
          />
        );
      })}
    </Box>
  );
};

export default TemplateDEST01;
