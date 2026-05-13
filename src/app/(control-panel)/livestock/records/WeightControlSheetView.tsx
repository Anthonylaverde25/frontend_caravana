import React, { useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Box, CircularProgress, Typography, Container, Button, Stack } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { useReactToPrint } from 'react-to-print';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import { useCompany } from '@/contexts/CompanyContext';
import WeightControlSheet from 'src/components/caravan/WeightControlSheet';
import ViewHeader from 'src/components/ViewHeader';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

function WeightControlSheetView() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const componentRef = useRef<HTMLDivElement>(null);
  const { activeCompanyId, companies } = useCompany();
  const { data: caravans = [], isLoading } = useCaravans(activeCompanyId);

  const activeCompany = useMemo(() => 
    companies.find(c => c.id === activeCompanyId), 
    [companies, activeCompanyId]
  );

  const batchIds = useMemo(() => 
    batchId?.split(',').map(Number) || [], 
    [batchId]
  );

  const batches = useMemo(() => {
    const grouped: Record<number, any[]> = {};
    caravans.forEach(c => {
      if (batchIds.includes(c.batch_id)) {
        if (!grouped[c.batch_id]) grouped[c.batch_id] = [];
        grouped[c.batch_id].push(c);
      }
    });
    return Object.entries(grouped).map(([id, items]) => ({
      id: Number(id),
      name: items[0]?.batch_name || 'Lote',
      caravans: items
    }));
  }, [caravans, batchIds]);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Planillas_Pesaje_${batchIds.length}_Lotes`,
    pageStyle: `
      @page { size: portrait; margin: 0mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; }
        .print-page { 
          page-break-after: always; 
          margin: 0 !important;
          padding: 5mm !important;
        }
        .print-page:last-child { page-break-after: auto; }
      }
    `
  });

  const handleDownload = () => {
    const element = componentRef.current;
    if (!element) return;

    const opt = {
      margin: [0, 0, 0, 0],
      filename: `Planillas_Pesaje_${batchIds.length}_Lotes.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true,
        logging: false
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <ViewHeader
        title="Planillas de Control de Pesaje"
        subtitle={`Generación de planillas para ${batches.length} lotes seleccionados.`}
        actions={
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => navigate('/caravans')}
              sx={{ fontWeight: 700 }}
            >
              Volver
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              sx={{ fontWeight: 700 }}
            >
              Descargar PDF
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PrintIcon />}
              onClick={() => handlePrint()}
              sx={{ fontWeight: 700 }}
            >
              Imprimir Todo
            </Button>
          </Stack>
        }
      />

      <Box ref={componentRef} sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {batches.map((batch) => (
          <Box key={batch.id} className="print-page">
            <WeightControlSheet
              batchName={batch.name}
              establishment={activeCompany?.name || ''}
              cuit="-"
              renspa={activeCompany?.renspa || ''}
              caravans={batch.caravans}
            />
          </Box>
        ))}
      </Box>
    </Container>
  );
}

export default WeightControlSheetView;
