import React, { useEffect } from 'react';
import { Alert, Box, CircularProgress } from '@mui/material';
import { useWorkTemplatePrint } from '@/contexts/WorkTemplatePrintContext';
import { useMarkReceiptSheetPrinted } from '@/features/entry-orders/hooks/useEntryOrderMutations';
import Ing03Page from './Ing03Page';
import { ING03_ROWS_PER_PAGE, useIng03Sheet } from './useIng03Sheet';

/**
 * ING-03 printable sheet: the receipt sheet of a DTE, an appendix of the ING-02. It is never printed
 * blank — its lines are the caravans of a DTE — so it is opened from the order ("Hoja ING-03" on the
 * DTE). A replaced or processed sheet is only looked up: what goes out to the chute is the active one.
 * It prints portrait (the traditional sheet) or landscape (the same grid, laid out like a
 * spreadsheet), as chosen in the toolbar.
 */
export const TemplateING03: React.FC = () => {
  const { template, printAreaRef, setOnPrinted, setPrintLock, pageOrientation } = useWorkTemplatePrint();
  const { order, sheet, animals, isLoading } = useIng03Sheet();
  const { mutate: markPrinted } = useMarkReceiptSheetPrinted();

  // The paper is recorded when it actually goes out — printed or downloaded — never on opening.
  useEffect(() => {
    setOnPrinted(order && sheet?.is_active ? () => markPrinted({ id: order.id, sheetId: sheet.id }) : null);

    return () => setOnPrinted(null);
  }, [order, sheet, setOnPrinted, markPrinted]);

  useEffect(() => {
    setPrintLock(
      !sheet
        ? 'La ING-03 se genera desde la orden de ingreso: "Hoja ING-03" en el DTE.'
        : sheet.status === 'REPLACED'
          ? `La hoja ${sheet.label} fue reemplazada: imprimí la más nueva.`
          : sheet.status === 'PROCESSED'
            ? `La hoja ${sheet.label} ya se procesó: es sólo de consulta.`
            : null
    );

    return () => setPrintLock(null);
  }, [sheet, setPrintLock]);

  if (isLoading) {
    return (
      <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (!order || !sheet) {
    return (
      <Alert severity="info" sx={{ maxWidth: 640, borderRadius: '6px' }}>
        La ING-03 es la hoja de recepción de un DTE y se genera desde su orden de ingreso: abrí la orden y usá "Hoja ING-03" en el DTE que
        querés recibir en la manga.
      </Alert>
    );
  }

  return (
    <Box ref={printAreaRef} sx={{ width: pageOrientation === 'landscape' ? '297mm' : '210mm', maxWidth: '100%', mx: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      {Array.from({ length: sheet.page_count }).map((_, pageIndex) => {
        const pageAnimals = animals.slice(pageIndex * ING03_ROWS_PER_PAGE, (pageIndex + 1) * ING03_ROWS_PER_PAGE);

        return (
          <Ing03Page
            key={pageIndex}
            code={template?.code || 'ING-03'}
            title={template?.title || 'Recepción de DTE'}
            order={order}
            sheet={sheet}
            animals={pageAnimals}
            blankRows={ING03_ROWS_PER_PAGE - pageAnimals.length}
            firstRowNumber={pageIndex * ING03_ROWS_PER_PAGE + 1}
            pageNumber={pageIndex + 1}
            orientation={pageOrientation}
          />
        );
      })}
    </Box>
  );
};

export default TemplateING03;
