import React, { useMemo } from 'react';
import {
  Box,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Stack
} from '@mui/material';
import PrintHeader from '@/ui/livestock/template/components/PrintHeader';
import { useWorkTemplatePrint } from '@/contexts/WorkTemplatePrintContext';

const ROWS_PER_PAGE = 12;

const TemplateING01: React.FC = () => {
  const {
    template,
    batch,
    farm,
    provider,
    activeCompany,
    caravans = [],
    printAreaRef,
    activeProvider,
    activeFarm,
    activeActivity
  } = useWorkTemplatePrint();

  const displayProvider = activeProvider || provider;
  const displayFarm = activeFarm || farm;

  // Paginate rows
  const pages = useMemo(() => {
    if (caravans.length > 0) {
      const chunks: any[][] = [];
      for (let i = 0; i < caravans.length; i += ROWS_PER_PAGE) {
        chunks.push(caravans.slice(i, i + ROWS_PER_PAGE));
      }
      return chunks;
    }
    return [Array.from({ length: ROWS_PER_PAGE }).map(() => null)];
  }, [caravans]);
  
  // Helper to extract primary farm details from provider if not explicitly selected
  const providerDefaultFarm = useMemo(() => {
    if (displayProvider?.farms && Array.isArray(displayProvider.farms) && displayProvider.farms.length > 0) {
      return displayProvider.farms[0];
    }
    return null;
  }, [displayProvider]);

  const renderRows = (pageRows: any[], pageIndex: number) => {
    const startIndex = pageIndex * ROWS_PER_PAGE;
    return pageRows.map((caravan, index) => (
      <TableRow key={caravan?.id || index} sx={{ height: 30 }}>
        {/* 1. Correlativo */}
        <TableCell sx={{ textAlign: 'center', fontWeight: 700, fontSize: '0.65rem' }}>
          {startIndex + index + 1}
        </TableCell>

        {/* 2. Caravana / Tag */}
        <TableCell sx={{ fontWeight: 900, fontFamily: 'monospace', fontSize: '0.75rem' }}>
          {caravan?.identification || ''}
        </TableCell>

        {/* 3. Categoría / Subcategoría */}
        <TableCell sx={{ fontSize: '0.68rem', fontWeight: 600 }}>
          {caravan?.category_name || caravan?.category || ''}
        </TableCell>

        {/* 4. Sexo (M / H) */}
        <TableCell sx={{ p: '2px 2px !important', textAlign: 'center' }}>
          {caravan?.sex ? (
            <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.7rem' }}>
              {caravan.sex === 'H' ? 'H' : 'M'}
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.58rem', color: '#000' }}>M</Typography>
              <Box sx={{ width: 8, height: 8, border: '1px solid #000', borderRadius: '1px' }} />
              <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.58rem', color: '#000' }}>H</Typography>
              <Box sx={{ width: 8, height: 8, border: '1px solid #000', borderRadius: '1px' }} />
            </Box>
          )}
        </TableCell>

        {/* 5. Raza */}
        <TableCell sx={{ fontSize: '0.65rem' }}>
          {caravan?.breed || ''}
        </TableCell>

        {/* 6. Dentición */}
        <TableCell sx={{ fontSize: '0.65rem', textAlign: 'center' }}>
          {caravan?.teeth !== undefined && caravan?.teeth !== null ? `${caravan.teeth}D` : ''}
        </TableCell>

        {/* 7. Peso Inicial de Ingreso */}
        <TableCell sx={{ fontSize: '0.68rem', textAlign: 'right', fontWeight: 700 }}>
          {caravan?.entry_weight || caravan?.weight ? `${caravan.entry_weight || caravan.weight} kg` : ''}
        </TableCell>

        {/* 8. Observaciones */}
        <TableCell sx={{ fontSize: '0.65rem' }}>
          {caravan?.observations || ''}
        </TableCell>
      </TableRow>
    ));
  };

  return (
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
            maxWidth: '210mm',
            minHeight: '297mm',
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
            {/* Top Title Bar */}
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#000', letterSpacing: '-1px', textTransform: 'uppercase', fontSize: '1.5rem' }}>
                  {template?.title || 'Ingreso de Compra Directa'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#444', fontWeight: 600, mt: -0.5, fontSize: '0.72rem' }}>
                  Sustentabilidad Ganadera • Procesamiento Inteligente Jhoangel AI
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#000', fontSize: '0.65rem', display: 'block' }}>
                  DOCUMENTO DE REGISTRO OFICIAL
                </Typography>
              </Box>
            </Box>

            {/* Table 1: ESTABLECIMIENTO (RECEPTOR) & TEMPLATE CODE */}
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: '10px',
              border: '2px solid #000',
              color: '#000'
            }}>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #000', backgroundColor: '#f0f0f0', padding: '3px 8px', width: '75%' }}>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#000', textTransform: 'uppercase', fontSize: '0.58rem' }}>
                      ESTABLECIMIENTO (RECEPTOR)
                    </Typography>
                  </td>
                  <td style={{ border: '1px solid #000', backgroundColor: '#000000', padding: '3px 8px', width: '25%', textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#ffffff', textTransform: 'uppercase', fontSize: '0.58rem', letterSpacing: '0.5px' }}>
                      TEMPLATE CODE
                    </Typography>
                  </td>
                </tr>
                <tr style={{ height: 28 }}>
                  <td style={{ border: '1px solid #000', padding: '3px 10px', verticalAlign: 'middle' }}>
                    <Typography variant="body1" sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#000' }}>
                      {`${activeCompany?.name || farm?.name || 'ESTABLECIMIENTO PRINCIPAL'}${activeCompany?.renspa ? ` • RENSPA: ${activeCompany.renspa}` : (farm?.renspa ? ` • RENSPA: ${farm.renspa}` : '')}`}
                    </Typography>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '3px 10px', verticalAlign: 'middle', textAlign: 'center', backgroundColor: '#fafafa' }}>
                    <Typography variant="body1" sx={{ fontWeight: 900, fontSize: '0.9rem', color: '#000', fontFamily: 'monospace', letterSpacing: '1px' }}>
                      {template?.code || 'ING-01'}
                    </Typography>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Table 2: METADATOS DE ORIGEN (PROVEEDOR) Y DESTINO (LOTE PROPIO) */}
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: '14px',
              border: '2px solid #000',
              color: '#000'
            }}>
              <tbody>
                {/* Fila 1 Labels: Origen / Proveedor */}
                <tr>
                  <td style={{ border: '1px solid #000', backgroundColor: '#f0f0f0', padding: '3px 6px', width: '28%' }}>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#000', display: 'block', fontSize: '0.58rem' }}>
                      PROVEEDOR / VENDEDOR
                    </Typography>
                  </td>
                  <td style={{ border: '1px solid #000', backgroundColor: '#f0f0f0', padding: '3px 6px', width: '18%' }}>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#000', display: 'block', fontSize: '0.58rem' }}>
                      CUIT PROVEEDOR
                    </Typography>
                  </td>
                  <td style={{ border: '1px solid #000', backgroundColor: '#f0f0f0', padding: '3px 6px', width: '20%' }}>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#000', display: 'block', fontSize: '0.58rem' }}>
                      ESTAB. ORIGEN
                    </Typography>
                  </td>
                  <td style={{ border: '1px solid #000', backgroundColor: '#f0f0f0', padding: '3px 6px', width: '18%' }}>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#000', display: 'block', fontSize: '0.58rem' }}>
                      RENSPA ORIGEN
                    </Typography>
                  </td>
                  <td style={{ border: '1px solid #000', backgroundColor: '#e8eff7', padding: '3px 6px', width: '16%' }}>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#0a6ed1', display: 'block', fontSize: '0.58rem', textAlign: 'center' }}>
                      LT. ORIGEN (PROV.)
                    </Typography>
                  </td>
                </tr>
                {/* Fila 1 Values */}
                <tr style={{ height: 28 }}>
                  <td style={{ border: '1px solid #000', padding: '3px 8px', verticalAlign: 'middle' }}>
                    <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.8rem', color: '#002B49' }}>
                      {displayProvider?.name || displayProvider?.commercial_name || ''}
                    </Typography>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '3px 8px', verticalAlign: 'middle' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#002B49' }}>
                      {displayProvider?.cuit || ''}
                    </Typography>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '3px 8px', verticalAlign: 'middle' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#002B49' }}>
                      {displayFarm?.name || providerDefaultFarm?.name || displayProvider?.location || ''}
                    </Typography>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '3px 8px', verticalAlign: 'middle' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#002B49' }}>
                      {displayFarm?.renspa || providerDefaultFarm?.renspa || ''}
                    </Typography>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '3px 8px', verticalAlign: 'middle', textAlign: 'center', backgroundColor: '#fafafa' }}>
                    <Typography variant="body2" sx={{ fontWeight: 900, fontSize: '0.8rem', color: '#0a6ed1' }}>
                      {/* Placeholder for origin batch if handwritten */}
                    </Typography>
                  </td>
                </tr>

                {/* Fila 2 Labels: Destino Propio, Actividad & Logística */}
                <tr>
                  <td style={{ border: '1px solid #000', backgroundColor: '#f0f0f0', padding: '3px 6px', width: '28%' }}>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#000', display: 'block', fontSize: '0.58rem' }}>
                      LOTE DESTINO (PROPIO)
                    </Typography>
                  </td>
                  <td style={{ border: '1px solid #000', backgroundColor: '#f0f0f0', padding: '3px 6px', width: '18%' }}>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#000', display: 'block', fontSize: '0.58rem' }}>
                      ACTIVIDAD (DESTINO)
                    </Typography>
                  </td>
                  <td colSpan={2} style={{ border: '1px solid #000', backgroundColor: '#f0f0f0', padding: '3px 6px', width: '38%' }}>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#000', display: 'block', fontSize: '0.58rem' }}>
                      GUÍA DTe / REMITO
                    </Typography>
                  </td>
                  <td style={{ border: '1px solid #000', backgroundColor: '#f0f0f0', padding: '3px 6px', width: '16%', textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#000', display: 'block', fontSize: '0.58rem' }}>
                      FECHA INGRESO
                    </Typography>
                  </td>
                </tr>
                {/* Fila 2 Values */}
                <tr style={{ height: 28 }}>
                  <td style={{ border: '1px solid #000', padding: '3px 8px', verticalAlign: 'middle' }}>
                    <Typography variant="body1" sx={{ fontWeight: 900, fontSize: '0.85rem', color: '#000' }}>
                      {batch?.name || ''}
                    </Typography>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '3px 8px', verticalAlign: 'middle' }}>
                    <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.8rem', color: '#002B49' }}>
                      {activeActivity?.name || batch?.activity_name || batch?.activity?.name || ''}
                    </Typography>
                  </td>
                  <td colSpan={2} style={{ border: '1px solid #000', padding: '3px 8px', verticalAlign: 'middle' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#002B49' }}>
                      {/* DTE handwritten or populated */}
                    </Typography>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '3px 8px', verticalAlign: 'middle', textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#002B49' }}>
                      ____ / ____ / ________
                    </Typography>
                  </td>
                </tr>
              </tbody>
            </table>

            <Box sx={{ mb: 1.5, pb: 0.5, borderBottom: '1.5px solid #000' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.75rem' }}>
                REGISTRO DE INGRESO DE TROPA / CREACIÓN DIRECTA DE LOTE
              </Typography>
            </Box>

            <Table sx={{
              borderCollapse: 'collapse',
              width: '100%',
              '& .MuiTableCell-root': {
                border: '1px solid #000',
                padding: '4px 6px',
                fontSize: '0.68rem',
                color: '#000',
                height: 30,
                boxSizing: 'border-box'
              }
            }}>
              <TableHead>
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ backgroundColor: '#f0f0f0', fontWeight: 900, textTransform: 'uppercase', textAlign: 'center', p: 0.5, fontSize: '0.7rem' }}>
                    IDENTIFICACIÓN Y TIPIFICACIÓN DEL ANIMAL
                  </TableCell>
                  <TableCell colSpan={3} align="center" sx={{ backgroundColor: '#e8eff7', color: '#0a6ed1 !important', fontWeight: 900, textTransform: 'uppercase', textAlign: 'center', p: 0.5, fontSize: '0.7rem' }}>
                    DENTICIÓN, PESAJE Y OBSERVACIONES
                  </TableCell>
                </TableRow>
                <TableRow sx={{ backgroundColor: '#fafafa' }}>
                  <TableCell sx={{ width: '4%', fontWeight: 800, textAlign: 'center', p: 0.5, fontSize: '0.65rem' }}>#</TableCell>
                  <TableCell sx={{ width: '18%', fontWeight: 800, textTransform: 'uppercase', p: 0.5, fontSize: '0.65rem' }}>CARAVANA / TAG</TableCell>
                  <TableCell sx={{ width: '21%', fontWeight: 800, textTransform: 'uppercase', p: 0.5, fontSize: '0.65rem' }}>CATEGORÍA / SUBCAT.</TableCell>
                  <TableCell sx={{ width: '9%', fontWeight: 800, textTransform: 'uppercase', p: 0.5, textAlign: 'center', fontSize: '0.65rem' }}>SEXO</TableCell>
                  <TableCell sx={{ width: '12%', fontWeight: 800, textTransform: 'uppercase', p: 0.5, fontSize: '0.65rem' }}>RAZA / PELAJE</TableCell>
                  <TableCell sx={{ width: '10%', fontWeight: 800, textTransform: 'uppercase', p: 0.5, textAlign: 'center', fontSize: '0.65rem' }}>DENTICIÓN</TableCell>
                  <TableCell sx={{ width: '12%', fontWeight: 800, textTransform: 'uppercase', p: 0.5, textAlign: 'right', fontSize: '0.65rem' }}>PESO ING. (KG)</TableCell>
                  <TableCell sx={{ width: '14%', fontWeight: 800, textTransform: 'uppercase', p: 0.5, fontSize: '0.65rem' }}>OBSERVACIONES</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {renderRows(pageRows, pageIndex)}
              </TableBody>
            </Table>
          </Box>

          <Box sx={{ mt: 4, pt: 1.5, borderTop: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: '#666', fontStyle: 'italic', fontSize: '0.65rem' }}>
              Planilla de Ingreso y Creación de Lote ({template?.code || 'ING-01'}) • Jhoangel AI Microservice • Sincronización offline optimizada
            </Typography>
            <Typography variant="caption" sx={{ color: '#333', fontWeight: 700, fontSize: '0.65rem' }}>
              HOJA {pageIndex + 1} DE {pages.length}
            </Typography>
          </Box>
        </Paper>
      ))}
    </Box>
  );
};

export default TemplateING01;
