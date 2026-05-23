import React, { useRef, useMemo } from 'react';
import {
  Dialog,
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
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useReactToPrint } from 'react-to-print';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { useBatch } from '@/features/batches/hooks/useBatch';
import { useFarms } from '@/features/suppliers/hooks/useFarms';
import { useSuppliers } from '@/features/suppliers/hooks/useSuppliers';
import PrintHeader from '@/ui/livestock/template/components/PrintHeader';

interface GestationBirthSheetDialogProps {
  open: boolean;
  onClose: () => void;
  batchId: number | undefined;
  caravans: any[];
}

/**
 * GestationBirthSheetDialog Component
 * Full-screen printable sheet viewer for parition data collection.
 */
const GestationBirthSheetDialog: React.FC<GestationBirthSheetDialogProps> = ({
  open,
  onClose,
  batchId,
  caravans
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Fetch batch details
  const { data: batch, isLoading: isLoadingBatch } = useBatch(batchId);
  const { data: allFarms = [], isLoading: isLoadingFarms } = useFarms();
  const { data: providers = [], isLoading: isLoadingProviders } = useSuppliers();

  // Find farm and supplier related to batch
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
    documentTitle: `Planilla_De_Paricion_${batch?.name || 'Lote'}`,
    pageStyle: `
      @page { size: portrait; margin: 5mm; }
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
      margin: [5, 5, 5, 5] as [number, number, number, number],
      filename: `Planilla_Paricion_${batch?.name.replace(/\s+/g, '_') || 'Lote'}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: 3,
        useCORS: true,
        letterRendering: true,
        logging: false,
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
    };

    html2pdf().set(opt).from(element).save();
  };

  const loading = isLoadingBatch || isLoadingFarms || isLoadingProviders;

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
    >
      {/* Top Navbar */}
      <AppBar sx={{ position: 'relative', bgcolor: '#faf9f6', color: 'text.primary', boxShadow: 'none', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={onClose}
            aria-label="close"
            sx={{ mr: 2, color: 'text.secondary' }}
          >
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1, fontWeight: 800, color: 'text.primary' }} variant="h6" component="div">
            Planilla de Parición - Lote: {batch?.name || 'Cargando...'}
          </Typography>
          {!loading && (
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
        bgcolor: '#edf2f6',
        p: { xs: 2, md: 4 },
        display: 'flex',
        justifyContent: 'center',
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
          <Paper
            ref={printAreaRef}
            className="print-area"
            elevation={0}
            sx={{
              p: { xs: '10mm', md: '15mm' },
              width: '100%',
              maxWidth: '210mm', // standard A4 width
              minHeight: '297mm', // standard A4 height
              bgcolor: '#ffffff',
              borderRadius: '4px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
              border: '1px solid #d8dde6',
              boxSizing: 'border-box'
            }}
          >
            {/* Custom printable header */}
            <PrintHeader
              establishment={batch?.farm_name || ''}
              cuit={provider?.cuit || ''}
              renspa={farm?.renspa || ''}
              lote={batch?.name || ''}
              title="Planilla de Parición"
            />

            {/* Subtitle / Context indicator */}
            <Box sx={{ mb: 2, pb: 1, borderBottom: '1.5px solid #000' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                REGISTRO MASIVO DE PARTOS (PARICIÓN)
              </Typography>
            </Box>

            {/* Parition grid */}
            <Table sx={{
              borderCollapse: 'collapse',
              width: '100%',
              '& .MuiTableCell-root': {
                border: '1px solid #000',
                padding: '4px 8px',
                fontSize: '0.7rem',
                color: '#000',
                height: 26,
                boxSizing: 'border-box'
              }
            }}>
              <TableHead>
                {/* Row 1: Header Groups for OCR segmentation */}
                <TableRow>
                  <TableCell
                    colSpan={2}
                    align="center"
                    sx={{
                      backgroundColor: '#f0f0f0',
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      textAlign: 'center',
                      p: 0.5,
                      letterSpacing: '0.5px',
                      fontSize: '0.75rem'
                    }}
                  >
                    DATOS DE LA MADRE (GESTANTE)
                  </TableCell>
                  <TableCell
                    colSpan={5}
                    align="center"
                    sx={{
                      backgroundColor: '#e8eff7',
                      color: '#0a6ed1 !important',
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      textAlign: 'center',
                      p: 0.5,
                      letterSpacing: '0.5px',
                      fontSize: '0.75rem'
                    }}
                  >
                    DATOS DEL TERNERO (A REGISTRAR)
                  </TableCell>
                </TableRow>
                {/* Row 2: Sub-columns */}
                <TableRow sx={{ backgroundColor: '#fafafa' }}>
                  <TableCell sx={{ width: '5%', fontWeight: 800, textAlign: 'center', p: 0.5, fontSize: '0.65rem' }}>#</TableCell>
                  <TableCell sx={{ width: '25%', fontWeight: 800, textTransform: 'uppercase', p: 0.5, fontSize: '0.65rem' }}>Identificación</TableCell>
                  <TableCell sx={{ width: '20%', fontWeight: 800, textTransform: 'uppercase', p: 0.5, textAlign: 'center', fontSize: '0.65rem' }}>Caravana</TableCell>
                  <TableCell sx={{ width: '15%', fontWeight: 800, textTransform: 'uppercase', p: 0.5, textAlign: 'center', fontSize: '0.65rem' }}>Sexo</TableCell>
                  <TableCell sx={{ width: '10%', fontWeight: 800, textTransform: 'uppercase', p: 0.5, textAlign: 'center', fontSize: '0.65rem' }}>Peso (kg)</TableCell>
                  <TableCell sx={{ width: '15%', fontWeight: 800, textTransform: 'uppercase', p: 0.5, textAlign: 'center', fontSize: '0.65rem' }}>Raza</TableCell>
                  <TableCell sx={{ width: '10%', fontWeight: 800, textTransform: 'uppercase', p: 0.5, textAlign: 'center', fontSize: '0.65rem' }}>Fecha Nac.</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {caravans.map((caravan, index) => (
                  <TableRow key={caravan.id} sx={{ height: 26 }}>
                    <TableCell sx={{ textAlign: 'center', fontWeight: 600, fontSize: '0.65rem' }}>{index + 1}</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontFamily: 'monospace', fontSize: '0.75rem' }}>
                      {caravan.identification}
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell sx={{ p: '2px 4px !important' }}>
                      <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.65rem', color: '#000' }}>M</Typography>
                          <Box sx={{ width: 12, height: 12, border: '1px solid #000', borderRadius: '1.5px', bgcolor: 'transparent' }} />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.65rem', color: '#000' }}>H</Typography>
                          <Box sx={{ width: 12, height: 12, border: '1px solid #000', borderRadius: '1.5px', bgcolor: 'transparent' }} />
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell sx={{ textAlign: 'center', color: '#ddd !important', fontSize: '0.75rem' }}>/  /</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Document footer for OCR/Jhoangel validation */}
            <Box sx={{ mt: 5, pt: 1.5, borderTop: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: '#666', fontStyle: 'italic', fontSize: '0.65rem' }}>
                Planilla de Registro Parición • Generado por Jhoangel AI • Sincronización offline optimizada
              </Typography>
              <Typography variant="caption" sx={{ color: '#333', fontWeight: 700, fontSize: '0.65rem' }}>
                HOJA 1 DE 1
              </Typography>
            </Box>
          </Paper>
        )}
      </Box>
    </Dialog>
  );
};

export default GestationBirthSheetDialog;
