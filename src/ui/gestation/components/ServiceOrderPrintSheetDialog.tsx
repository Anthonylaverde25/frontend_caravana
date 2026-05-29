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
import { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import { useBatch } from '@/features/batches/hooks/useBatch';
import { useFarms } from '@/features/suppliers/hooks/useFarms';
import { useSuppliers } from '@/features/suppliers/hooks/useSuppliers';
import axiosInstance from '@/utils/axios';
import { toast } from 'sonner';
import PrintHeader from '@/ui/livestock/template/components/PrintHeader';

interface ServiceOrderPrintSheetDialogProps {
  open: boolean;
  onClose: () => void;
  order: ServiceOrder | null;
  caravans: any[];
  autoShare?: boolean;
}

/**
 * ServiceOrderPrintSheetDialog Component
 * Full-screen printable sheet viewer for Service Order details, optimized for A4 paper and PDF downloads.
 */
const ServiceOrderPrintSheetDialog: React.FC<ServiceOrderPrintSheetDialogProps> = ({
  open,
  onClose,
  order,
  caravans,
  autoShare = false
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = React.useState(false);

  // Fetch batch details from the order's batch_id
  const { data: batch, isLoading: isLoadingBatch } = useBatch(order?.batch_id);
  const { data: allFarms = [], isLoading: isLoadingFarms } = useFarms();
  const { data: providers = [], isLoading: isLoadingProviders } = useSuppliers();

  // Find farm and provider related to batch
  const farm = useMemo(() => {
    if (!batch?.farm_id) return null;
    return allFarms.find((f) => f.id === batch.farm_id);
  }, [allFarms, batch?.farm_id]);

  const provider = useMemo(() => {
    if (!batch?.provider_id) return null;
    return providers.find((p) => p.id === batch.provider_id);
  }, [providers, batch?.provider_id]);

  // Map male caravan ids to full caravan details
  const maleCaravans = useMemo(() => {
    if (!order || !caravans.length) return [];
    return order.male_caravan_ids
      .map((id) => caravans.find((c) => c.id === id))
      .filter(Boolean);
  }, [order, caravans]);

  // Map female caravan ids to full caravan details
  const femaleCaravans = useMemo(() => {
    if (!order || !caravans.length) return [];
    return order.female_caravan_ids
      .map((id) => caravans.find((c) => c.id === id))
      .filter(Boolean);
  }, [order, caravans]);

  // Helper to format status names in Spanish
  const getStatusLabel = (status?: string) => {
    if (!status) return '';
    switch (status.toUpperCase()) {
      case 'DRAFT':
        return 'BORRADOR';
      case 'APPROVED':
        return 'APROBADA';
      case 'SUCCESS':
        return 'COMPLETADA';
      case 'REJECTED':
        return 'RECHAZADA';
      case 'CANCELLED':
        return 'CANCELADA';
      default:
        return status;
    }
  };

  const loading = isLoadingBatch || isLoadingFarms || isLoadingProviders;

  // Setup WhatsApp sending configuration
  const handleSendWhatsApp = async () => {
    const element = printAreaRef.current;
    if (!element || !order) return;

    setIsSharing(true);

    const opt = {
      margin: [8, 8, 8, 8] as [number, number, number, number],
      filename: `Orden_Servicio_${order.code || 'Doc'}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        logging: false,
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
    };

    try {
      toast.info("Generando y preparando el PDF de la orden...");
      const pdfBlob = await html2pdf().set(opt).from(element).outputPdf('blob');
      
      const formData = new FormData();
      formData.append('pdf', pdfBlob, `Orden_Servicio_${order.code}.pdf`);

      const response = await axiosInstance.post(`/service-orders/${order.id}/upload-pdf`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      const pdfUrl = response.data.url;

      const batchName = batch?.name || `Lote #${order.batch_id}`;
      const farmName = batch?.farm_name || farm?.name || '';
      
      const bullsText = maleCaravans.length > 0
        ? maleCaravans.map((bull) => `• *${bull.identification}* (${bull.breed || 'Sin Raza'})`).join('\n')
        : '• _Ninguno asignado_';

      const femaleCaravansList = femaleCaravans.length > 0
        ? femaleCaravans.map((cow) => `\`${cow.identification}\``).join(', ')
        : '_Ninguna asignada_';

      const text = `*ORDEN DE TRABAJO REPRODUCTIVO* 🐮📋\n\n` +
        `Hola! Te comparto las indicaciones para iniciar las tareas de servicio reproductivo en el campo.\n\n` +
        `🔹 *Detalles del Servicio:*\n` +
        `• *Código:* \`${order.code}\`\n` +
        `• *Lote de Trabajo:* ${batchName} ${farmName ? `(${farmName})` : ''}\n` +
        `• *Fecha Programada:* ${order.planned_start_date}\n` +
        `• *Estado:* ${getStatusLabel(order.status)}\n\n` +
        `🐂 *Reproductores (Toros) a Asignar:*\n` +
        `(Debes ingresar estos toros al lote de vientres)\n` +
        `${bullsText}\n\n` +
        `🐄 *Vientres en Servicio:*\n` +
        `• Cantidad: *${order.female_caravan_ids.length} animales* (vacías/aptas)\n` +
        `• Caravanas a Controlar: ${femaleCaravansList}\n\n` +
        `📄 *Planilla de Campo / PDF:*\n` +
        `Puedes descargar, revisar e imprimir la planilla oficial aquí:\n` +
        `🔗 ${pdfUrl}\n\n` +
        (order.observations ? `⚠️ *Observaciones:*\n_${order.observations}_\n\n` : '') +
        `_Por favor, confirma la recepción de esta orden y el inicio de las tareas en campo._`;
      
      const whatsappUrl = `https://api.whatsapp.com/send?phone=5491128601715&text=${encodeURIComponent(text)}`;
      window.open(whatsappUrl, '_blank');
      toast.success("Redirigiendo a WhatsApp...");
    } catch (error) {
      console.error(error);
      toast.error("Error al generar o subir el PDF de la orden");
    } finally {
      setIsSharing(false);
    }
  };

  // Trigger autoShare if requested and data is fully loaded
  React.useEffect(() => {
    if (open && autoShare && order && !loading && caravans.length > 0 && batch && !isSharing) {
      handleSendWhatsApp().then(() => {
        onClose();
      });
    }
  }, [open, autoShare, order, loading, caravans, batch]);

  // Setup printing configuration using react-to-print
  const handlePrint = useReactToPrint({
    contentRef: printAreaRef,
    documentTitle: `Orden_de_Servicio_${order?.code || 'Doc'}`,
    pageStyle: `
      @page { size: portrait; margin: 8mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; }
      }
    `,
  });

  // Setup PDF download configuration using html2pdf
  const handleDownload = () => {
    const element = printAreaRef.current;
    if (!element) return;

    const opt = {
      margin: [8, 8, 8, 8] as [number, number, number, number],
      filename: `Orden_Servicio_${order?.code || 'Doc'}.pdf`,
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
            Vista de Documento - Orden de Servicio: {order?.code || 'Cargando...'}
          </Typography>
          {!loading && order && (
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                color="success"
                disabled={isSharing}
                startIcon={isSharing ? <CircularProgress size={16} color="inherit" /> : <FuseSvgIcon size={16}>heroicons-outline:chat-bubble-left-right</FuseSvgIcon>}
                onClick={handleSendWhatsApp}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  borderColor: '#25D366',
                  color: '#25D366',
                  '&:hover': {
                    borderColor: '#128C7E',
                    bgcolor: 'rgba(37, 211, 102, 0.04)'
                  }
                }}
              >
                {isSharing ? 'Preparando...' : 'Enviar a WhatsApp'}
              </Button>
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
                Imprimir Documento
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
        {loading || !order ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              Preparando vista previa del documento...
            </Typography>
          </Box>
        ) : (
          <Paper
            ref={printAreaRef}
            className="print-area"
            elevation={0}
            sx={{
              p: { xs: '10mm', md: '12mm' },
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
              establishment={batch?.farm_name || farm?.name || ''}
              cuit={provider?.cuit || ''}
              renspa={farm?.renspa || ''}
              lote={batch?.name || ''}
              title="Orden de Servicio Reproductivo"
            />

            {/* Subtitle / Context indicator */}
            <Box sx={{ mb: 2, pb: 1, borderBottom: '1.5px solid #000' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                DETALLES DE LA ORDEN Y PLANILLA DE CAMPO
              </Typography>
            </Box>

            {/* Metadata Table for Service Order */}
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: '15px',
              border: '1.5px solid #000',
              color: '#000'
            }}>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #000', backgroundColor: '#f0f0f0', padding: '4px 6px', width: '20%' }}>
                    <Typography variant="caption" sx={{ fontWeight: 900, fontSize: '0.62rem' }}>CÓDIGO</Typography>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '4px 8px', width: '30%', fontWeight: 700, fontSize: '0.75rem', fontFamily: 'monospace' }}>
                    {order.code}
                  </td>
                  <td style={{ border: '1px solid #000', backgroundColor: '#f0f0f0', padding: '4px 6px', width: '20%' }}>
                    <Typography variant="caption" sx={{ fontWeight: 900, fontSize: '0.62rem' }}>ESTADO</Typography>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '4px 8px', width: '30%', fontWeight: 700, fontSize: '0.72rem' }}>
                    {getStatusLabel(order.status)}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', backgroundColor: '#f0f0f0', padding: '4px 6px' }}>
                    <Typography variant="caption" sx={{ fontWeight: 900, fontSize: '0.62rem' }}>FECHA PLANIF.</Typography>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '4px 8px', fontSize: '0.72rem' }}>
                    {order.planned_start_date}
                  </td>
                  <td style={{ border: '1px solid #000', backgroundColor: '#f0f0f0', padding: '4px 6px' }}>
                    <Typography variant="caption" sx={{ fontWeight: 900, fontSize: '0.62rem' }}>FECHA EJECUCIÓN</Typography>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '4px 8px', fontSize: '0.72rem' }}>
                    {order.actual_start_date || 'NO INICIADO'}
                  </td>
                </tr>
                {order.observations && (
                  <tr>
                    <td style={{ border: '1px solid #000', backgroundColor: '#f0f0f0', padding: '4px 6px' }}>
                      <Typography variant="caption" sx={{ fontWeight: 900, fontSize: '0.62rem' }}>OBSERVACIONES</Typography>
                    </td>
                    <td colSpan={3} style={{ border: '1px solid #000', padding: '6px 8px', fontSize: '0.7rem', fontStyle: 'italic' }}>
                      {order.observations}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Bulls Section */}
            <Typography variant="caption" sx={{ fontWeight: 900, color: '#000', display: 'block', mb: 0.5, letterSpacing: '0.5px' }}>
              REPRODUCTORES ASIGNADOS (TOROS)
            </Typography>
            <Table sx={{
              borderCollapse: 'collapse',
              width: '100%',
              mb: 3,
              '& .MuiTableCell-root': {
                border: '1px solid #000',
                padding: '4px 6px',
                fontSize: '0.68rem',
                color: '#000',
                height: 24,
                boxSizing: 'border-box'
              }
            }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
                  <TableCell sx={{ width: '5%', fontWeight: 900, textAlign: 'center' }}>#</TableCell>
                  <TableCell sx={{ width: '25%', fontWeight: 900 }}>IDENTIFICACIÓN (CARAVANA)</TableCell>
                  <TableCell sx={{ width: '25%', fontWeight: 900 }}>RAZA</TableCell>
                  <TableCell sx={{ width: '20%', fontWeight: 900 }}>CATEGORÍA</TableCell>
                  <TableCell sx={{ width: '25%', fontWeight: 900, textAlign: 'center' }}>CONTROL EN CAMPO (FIRMA/OBS)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {maleCaravans.map((bull, index) => (
                  <TableRow key={bull.id}>
                    <TableCell sx={{ textAlign: 'center', fontWeight: 700 }}>{index + 1}</TableCell>
                    <TableCell sx={{ fontWeight: 900, fontFamily: 'monospace', fontSize: '0.75rem' }}>{bull.identification}</TableCell>
                    <TableCell>{bull.breed || 'N/A'}</TableCell>
                    <TableCell>{bull.category || 'TORO'}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                ))}
                {maleCaravans.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ fontStyle: 'italic', py: 1.5 }}>
                      No se encontraron detalles de los toros asignados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Females Section */}
            <Typography variant="caption" sx={{ fontWeight: 900, color: '#000', display: 'block', mb: 0.5, letterSpacing: '0.5px' }}>
              VIENTRES APTOS DEL LOTE (VACAS Y VAQUILLONAS)
            </Typography>
            <Table sx={{
              borderCollapse: 'collapse',
              width: '100%',
              '& .MuiTableCell-root': {
                border: '1px solid #000',
                padding: '4px 6px',
                fontSize: '0.65rem',
                color: '#000',
                height: 24,
                boxSizing: 'border-box'
              }
            }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
                  <TableCell sx={{ width: '5%', fontWeight: 900, textAlign: 'center' }}>#</TableCell>
                  <TableCell sx={{ width: '20%', fontWeight: 900 }}>CARAVANA</TableCell>
                  <TableCell sx={{ width: '15%', fontWeight: 900 }}>CATEGORÍA</TableCell>
                  <TableCell sx={{ width: '15%', fontWeight: 900 }}>RAZA</TableCell>
                  <TableCell sx={{ width: '12%', fontWeight: 900, textAlign: 'right' }}>PESO ACT.</TableCell>
                  <TableCell sx={{ width: '15%', fontWeight: 900, textAlign: 'center' }}>FECHA SERV.</TableCell>
                  <TableCell sx={{ width: '18%', fontWeight: 900, textAlign: 'center' }}>TORO REAL / OBS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {femaleCaravans.map((cow, index) => (
                  <TableRow key={cow.id}>
                    <TableCell sx={{ textAlign: 'center', fontWeight: 600 }}>{index + 1}</TableCell>
                    <TableCell sx={{ fontWeight: 900, fontFamily: 'monospace', fontSize: '0.72rem' }}>{cow.identification}</TableCell>
                    <TableCell>{cow.category || 'N/A'}</TableCell>
                    <TableCell>{cow.breed || 'N/A'}</TableCell>
                    <TableCell align="right">{cow.current_weight ? `${cow.current_weight} kg` : 'N/A'}</TableCell>
                    <TableCell sx={{ textAlign: 'center', color: '#ccc', fontSize: '0.7rem' }}>/  /</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                ))}
                {femaleCaravans.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ fontStyle: 'italic', py: 2 }}>
                      No se encontraron detalles de los vientres asignados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Document footer for audit, signing and offline validation */}
            <Box sx={{ mt: 5, pt: 1.5, borderTop: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: '#666', fontStyle: 'italic', fontSize: '0.62rem' }}>
                Orden de Servicio Reproductivo • Generado por Jhoangel AI • Sincronización offline
              </Typography>
              <Typography variant="caption" sx={{ color: '#333', fontWeight: 800, fontSize: '0.62rem' }}>
                HOJA 1 DE 1
              </Typography>
            </Box>
          </Paper>
        )}
      </Box>
    </Dialog>
  );
};

export default ServiceOrderPrintSheetDialog;
