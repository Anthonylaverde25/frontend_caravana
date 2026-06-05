import React, { useRef, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Box,
  CircularProgress,
  Stack
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import { useReactToPrint } from 'react-to-print';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { useWorkTemplate } from '../hooks/useWorkTemplate';
import { useCompany } from '@/contexts/CompanyContext';
import { useServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import { useBatch } from '@/features/batches/hooks/useBatch';
import { useFarms } from '@/features/suppliers/hooks/useFarms';
import { useSuppliers } from '@/features/suppliers/hooks/useSuppliers';
import TemplateREP01 from '../components/TemplateREP01';
import TemplateREP02 from '../components/TemplateREP02';

/**
 * WorkTemplatePrintView Component
 * Dedicated full-screen printable page for a Work Template by Code.
 * Populates data if an orderId/batchId is provided, otherwise renders a blank sheet.
 */
const WorkTemplatePrintView: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const printAreaRef = useRef<HTMLDivElement>(null);

  const orderId = searchParams.get('orderId') ? Number(searchParams.get('orderId')) : null;
  const batchId = searchParams.get('batchId') ? Number(searchParams.get('batchId')) : null;

  // Retrieve template structure
  const { template, isLoading: isLoadingTemplate, error: templateError } = useWorkTemplate(code);

  // Retrieve Company context & backend resources
  const { activeCompanyId } = useCompany();
  const { data: order, isLoading: isLoadingOrder } = useServiceOrder(orderId);
  const { data: caravans = [], isLoading: isLoadingCaravans } = useCaravans(code === 'REP-01' ? activeCompanyId : null);
  const { data: batch, isLoading: isLoadingBatch } = useBatch(batchId || order?.batch_id);
  const { data: allFarms = [], isLoading: isLoadingFarms } = useFarms();
  const { data: providers = [], isLoading: isLoadingProviders } = useSuppliers();

  // Find farm and supplier related to batch (if order loaded)
  const farm = useMemo(() => {
    if (!batch?.farm_id) return null;
    return allFarms.find((f) => f.id === batch.farm_id);
  }, [allFarms, batch?.farm_id]);

  const provider = useMemo(() => {
    if (!batch?.provider_id) return null;
    return providers.find((p) => p.id === batch.provider_id);
  }, [providers, batch?.provider_id]);

  // Setup printing configuration
  const handlePrint = useReactToPrint({
    contentRef: printAreaRef,
    documentTitle: `Planilla_De_${code || 'Plantilla'}_${order?.code || 'Vacia'}`,
    pageStyle: `
      @page { size: A4 portrait; margin: 0; }
      @media print {
        body { -webkit-print-color-adjust: exact; }
      }
    `,
  });

  // Setup PDF download configuration
  const handleDownload = () => {
    const element = printAreaRef.current;
    if (!element) return;

    const opt = {
      margin: 0,
      filename: `Planilla_${code || 'Plantilla'}_${order?.code || 'Vacia'}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: 3,
        useCORS: true,
        letterRendering: true,
        logging: false,
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
      pagebreak: { mode: ['css', 'legacy'], before: '.print-page', avoid: '.print-page' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const handleBack = () => {
    navigate(-1);
  };

  const loading =
    isLoadingTemplate ||
    (orderId ? isLoadingOrder || isLoadingCaravans || isLoadingBatch || isLoadingFarms || isLoadingProviders : false) ||
    (batchId ? isLoadingCaravans || isLoadingBatch || isLoadingFarms || isLoadingProviders : false);

  if (templateError) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: 2 }}>
        <Typography variant="h6" color="error">
          Error loading work template
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {templateError}
        </Typography>
        <Button variant="outlined" onClick={handleBack} startIcon={<ArrowBackIcon />}>
          Volver
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#edf2f6' }}>
      {/* Top Navbar */}
      <AppBar sx={{ position: 'relative', bgcolor: '#faf9f6', color: 'text.primary', boxShadow: 'none', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleBack}
            aria-label="back"
            sx={{ mr: 2, color: 'text.secondary' }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1, fontWeight: 800, color: 'text.primary' }} variant="h6" component="div">
            {template?.title || 'Planilla de Campo'} {order?.code ? `- Orden: ${order.code}` : ''}
          </Typography>
          {!loading && template && (
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                Descargar PDF
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<PrintIcon />}
                onClick={handlePrint}
                sx={{ textTransform: 'none', fontWeight: 800, color: '#ffffff' }}
              >
                Imprimir Planilla
              </Button>
            </Stack>
          )}
        </Toolbar>
      </AppBar>

      {/* Main Canvas View */}
      <Box sx={{
        flexGrow: 1,
        p: { xs: 2, md: 4 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        overflowY: 'auto',
        backgroundImage: 'radial-gradient(#d8dde6 0.5px, transparent 0.5px)',
        backgroundSize: '20px 20px',
        minHeight: 'calc(100vh - 64px)'
      }}>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              Preparando vista previa de la planilla...
            </Typography>
          </Box>
        ) : (
          <>
            {code === 'REP-01' && (
              <TemplateREP01
                template={template}
                order={order}
                batch={batch}
                farm={farm}
                provider={provider}
                caravans={caravans}
                printAreaRef={printAreaRef}
              />
            )}
            {code === 'REP-02' && (
              <TemplateREP02
                template={template}
                batchId={batchId}
                batch={batch}
                farm={farm}
                provider={provider}
                printAreaRef={printAreaRef}
              />
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default WorkTemplatePrintView;
