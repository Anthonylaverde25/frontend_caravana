import React, { useRef, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Box,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
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
import PrintHeader from '@/ui/livestock/template/components/PrintHeader';

/**
 * WorkTemplatePrintView Component
 * Dedicated full-screen printable page for a Work Template by Code.
 * Populates data if an orderId is provided, otherwise renders a blank sheet.
 */
const WorkTemplatePrintView: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const printAreaRef = useRef<HTMLDivElement>(null);

  const orderId = searchParams.get('orderId') ? Number(searchParams.get('orderId')) : null;

  // Retrieve template structure
  const { template, isLoading: isLoadingTemplate, error: templateError } = useWorkTemplate(code);

  // Retrieve Company context & backend resources
  const { activeCompanyId } = useCompany();
  const { data: order, isLoading: isLoadingOrder } = useServiceOrder(orderId);
  const { data: caravans = [], isLoading: isLoadingCaravans } = useCaravans(activeCompanyId);
  const { data: batch, isLoading: isLoadingBatch } = useBatch(order?.batch_id);
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

  // Map female caravan ids to full caravan details
  const serviceFemales = useMemo(() => {
    if (!order || !caravans.length) return [];
    return order.female_caravan_ids
      .map((id) => caravans.find((c) => c.id === id))
      .filter(Boolean);
  }, [order, caravans]);

  // Parse template schema fields
  const schemaFields = useMemo(() => {
    if (!template?.schema_definition) return [];
    if (Array.isArray(template.schema_definition)) return template.schema_definition;
    try {
      return typeof template.schema_definition === 'string'
        ? JSON.parse(template.schema_definition)
        : template.schema_definition;
    } catch (e) {
      console.error('Error parsing schema_definition:', e);
      return [];
    }
  }, [template?.schema_definition]);

  // Classify fields into animal subject data vs diagnostic output data
  const animalFields = useMemo(() => {
    return schemaFields.filter((f: any) =>
      ['caravana', 'category', 'identification', 'animal', 'tag'].includes(f.name.toLowerCase())
    );
  }, [schemaFields]);

  const resultFields = useMemo(() => {
    return schemaFields.filter((f: any) =>
      !['caravana', 'category', 'identification', 'animal', 'tag'].includes(f.name.toLowerCase())
    );
  }, [schemaFields]);

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

  const getFieldWidth = (field: any) => {
    const name = field.name.toLowerCase();
    if (name === 'caravana' || name === 'identification') return '15%';
    if (name === 'category' || name === 'categoria') return '12%';
    if (field.type === 'select') {
      const optCount = field.options?.length || 0;
      if (optCount === 2) return '20%';
      if (optCount === 3) return '23%';
    }
    return undefined;
  };

  const renderCell = (field: any, caravan: any) => {
    const name = field.name.toLowerCase();
    
    if (name === 'caravana' || name === 'identification' || name === 'animal' || name === 'tag') {
      return (
        <TableCell key={field.name} sx={{ fontWeight: 900, fontFamily: 'monospace', fontSize: '0.72rem' }}>
          {caravan?.identification || ''}
        </TableCell>
      );
    }
    if (name === 'category' || name === 'categoria') {
      return (
        <TableCell key={field.name} sx={{ fontSize: '0.65rem' }}>
          {caravan?.category || 'Vientre'}
        </TableCell>
      );
    }
    if (field.type === 'select' && Array.isArray(field.options)) {
      return (
        <TableCell key={field.name} sx={{ p: '2px 4px !important' }}>
          <Box sx={{ display: 'flex', gap: 1.2, justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            {field.options.map((opt: any) => (
              <Box key={opt.value} sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.58rem', color: '#000' }}>
                  {opt.label}
                </Typography>
                <Box sx={{ width: 9, height: 9, border: '1px solid #000', borderRadius: '1px' }} />
              </Box>
            ))}
          </Box>
        </TableCell>
      );
    }
    return <TableCell key={field.name} />;
  };

  const loading =
    isLoadingTemplate ||
    (orderId ? isLoadingOrder || isLoadingCaravans || isLoadingBatch || isLoadingFarms || isLoadingProviders : false);

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

  const ROWS_PER_PAGE = 10;

  // Split animals or empty slots into pages of size ROWS_PER_PAGE
  const pages = useMemo(() => {
    if (orderId && serviceFemales.length > 0) {
      const chunks: any[][] = [];
      for (let i = 0; i < serviceFemales.length; i += ROWS_PER_PAGE) {
        chunks.push(serviceFemales.slice(i, i + ROWS_PER_PAGE));
      }
      return chunks;
    }
    // For blank templates, return one single page with 10 empty slots
    return [Array.from({ length: ROWS_PER_PAGE }).map(() => null)];
  }, [orderId, serviceFemales]);

  // Renders rows based on the page subset of data and page index
  const renderRows = (pageRows: any[], pageIndex: number) => {
    const startIndex = pageIndex * ROWS_PER_PAGE;
    return pageRows.map((caravan, index) => (
      <TableRow key={caravan?.id || index} sx={{ height: caravan ? 26 : 32 }}>
        <TableCell sx={{ textAlign: 'center', fontWeight: 600, fontSize: '0.65rem' }}>{startIndex + index + 1}</TableCell>
        {animalFields.map((field) => renderCell(field, caravan))}
        {resultFields.map((field) => renderCell(field, caravan))}
      </TableRow>
    ));
  };

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
          <Box
            ref={printAreaRef}
            sx={{
              width: '100%',
              maxWidth: '210mm',
              display: 'flex',
              flexDirection: 'column',
              gap: 0
            }}
          >
            {pages.map((pageRows, pageIndex) => (
              <Paper
                key={pageIndex}
                className="print-page"
                elevation={0}
                sx={{
                  p: '10mm',
                  width: '100%',
                  maxWidth: '210mm', // standard A4 width
                  minHeight: '297mm', // standard A4 height
                  bgcolor: '#ffffff',
                  borderRadius: '4px',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
                  border: '1px solid #d8dde6',
                  boxSizing: 'border-box',
                  pageBreakAfter: 'always',
                  breakAfter: 'page',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  mb: '10mm',
                  '@media print': {
                    boxShadow: 'none',
                    border: 'none',
                    borderRadius: 0,
                    p: '10mm',
                    margin: 0,
                    mb: 0,
                    pageBreakAfter: 'always',
                    breakAfter: 'page',
                    minHeight: '297mm',
                    height: '297mm'
                  },
                  '&:last-child': {
                    mb: 0,
                    pageBreakAfter: 'avoid',
                    breakAfter: 'avoid',
                    '@media print': {
                      mb: 0,
                      pageBreakAfter: 'avoid',
                      breakAfter: 'avoid'
                    }
                  }
                }}
              >
                <Box>
                  {/* Printable header */}
                  <PrintHeader
                    establishment={batch?.farm_name || ''}
                    cuit={provider?.cuit || ''}
                    renspa={farm?.renspa || ''}
                    lote={batch?.name || ''}
                    title={template?.title || 'Planilla de Tacto y Ecografía'}
                    templateCode={code}
                  />

                  {/* Subtitle / Context indicator */}
                  <Box sx={{ mb: 2, pb: 1, borderBottom: '1.5px solid #000' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      REGISTRO DE DIAGNÓSTICOS DE PREÑEZ EN CAMPO
                    </Typography>
                  </Box>

                  {/* Dynamic grid */}
                  <Table sx={{
                    borderCollapse: 'collapse',
                    width: '100%',
                    '& .MuiTableCell-root': {
                      border: '1px solid #000',
                      padding: '4px 6px',
                      fontSize: '0.68rem',
                      color: '#000',
                      height: 26,
                      boxSizing: 'border-box'
                    }
                  }}>
                    <TableHead>
                      {/* Header Groups */}
                      <TableRow>
                        <TableCell
                          colSpan={1 + animalFields.length}
                          align="center"
                          sx={{
                            backgroundColor: '#f0f0f0',
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            textAlign: 'center',
                            p: 0.5,
                            letterSpacing: '0.5px',
                            fontSize: '0.72rem'
                          }}
                        >
                          DATOS DE LA HEMBRA EN SERVICIO
                        </TableCell>
                        <TableCell
                          colSpan={resultFields.length}
                          align="center"
                          sx={{
                            backgroundColor: '#e8eff7',
                            color: '#0a6ed1 !important',
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            textAlign: 'center',
                            p: 0.5,
                            letterSpacing: '0.5px',
                            fontSize: '0.72rem'
                          }}
                        >
                          RESULTADO DEL DIAGNÓSTICO
                        </TableCell>
                      </TableRow>
                      {/* Sub-columns */}
                      <TableRow sx={{ backgroundColor: '#fafafa' }}>
                        <TableCell sx={{ width: '5%', fontWeight: 800, textAlign: 'center', p: 0.5, fontSize: '0.65rem' }}>#</TableCell>
                        {animalFields.map((field) => (
                          <TableCell key={field.name} sx={{ width: getFieldWidth(field), fontWeight: 800, textTransform: 'uppercase', p: 0.5, fontSize: '0.65rem' }}>
                            {field.label}
                          </TableCell>
                        ))}
                        {resultFields.map((field) => (
                          <TableCell key={field.name} sx={{ width: getFieldWidth(field), fontWeight: 800, textTransform: 'uppercase', p: 0.5, textAlign: 'center', fontSize: '0.65rem' }}>
                            {field.label}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {renderRows(pageRows, pageIndex)}
                    </TableBody>
                  </Table>
                </Box>

                {/* Document footer for OCR/Jhoangel validation */}
                <Box sx={{ mt: 5, pt: 1.5, borderTop: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#666', fontStyle: 'italic', fontSize: '0.65rem' }}>
                    Planilla de Diagnóstico Gestacional ({code}) • Generado por Jhoangel AI • Sincronización offline optimizada
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#333', fontWeight: 700, fontSize: '0.65rem' }}>
                    HOJA {pageIndex + 1} DE {pages.length}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default WorkTemplatePrintView;
