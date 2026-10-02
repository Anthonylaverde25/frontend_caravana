import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { useWorkTemplatePrint } from '@/contexts/WorkTemplatePrintContext';
import { useEntryOrder } from '@/features/entry-orders/hooks/useEntryOrders';
import { useMarkEntryOrderPrinted } from '@/features/entry-orders/hooks/useEntryOrderMutations';
import { useIng02Print } from './Ing02PrintContext';
import Ing02Page from './Ing02Page';

/**
 * ING-02 printable sheet: one page, blank or the document of an entry order. A draft is previewed
 * but not printed (the sheet records a closed purchase) and a cancelled order is only looked up.
 */
export const TemplateING02: React.FC = () => {
  const { template, printAreaRef, setOnPrinted, setPrintLock } = useWorkTemplatePrint();
  const { mode, entryOrderId } = useIng02Print();
  const { data: order } = useEntryOrder(mode === 'from_order' ? entryOrderId : null);
  const { mutate: markPrinted } = useMarkEntryOrderPrinted();
  const fromOrder = mode === 'from_order' && order ? order : null;

  // The paper is recorded when it actually goes out — printed or downloaded — never on opening.
  useEffect(() => {
    setOnPrinted(fromOrder && fromOrder.status !== 'DRAFT' ? () => markPrinted(fromOrder.id) : null);

    return () => setOnPrinted(null);
  }, [fromOrder, setOnPrinted, markPrinted]);

  useEffect(() => {
    setPrintLock(
      fromOrder?.status === 'DRAFT'
        ? 'Es un borrador: confirmá la compra para imprimirla.'
        : fromOrder?.status === 'CANCELLED'
          ? 'Orden anulada: la planilla es sólo de consulta.'
          : null
    );

    return () => setPrintLock(null);
  }, [fromOrder, setPrintLock]);

  return (
    <Box ref={printAreaRef} sx={{ width: '210mm', maxWidth: '100%', mx: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Ing02Page
        code={template?.code || 'ING-02'}
        title={template?.title || 'Orden de Ingreso de Hacienda Externa'}
        order={fromOrder}
      />
    </Box>
  );
};

export default TemplateING02;
