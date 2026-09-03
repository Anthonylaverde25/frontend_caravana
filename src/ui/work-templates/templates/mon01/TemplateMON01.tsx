import React, { useMemo } from 'react';
import {
  Box,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography
} from '@mui/material';
import { useWorkTemplatePrint } from '@/contexts/WorkTemplatePrintContext';

const ROWS_PER_PAGE = 12;

export interface TemplateMON01Props {
  order?: any;
  batch?: any;
  farm?: any;
  activeCompany?: any;
  caravans?: any[];
  printAreaRef?: React.RefObject<HTMLDivElement | null>;
}

export const TemplateMON01: React.FC<TemplateMON01Props> = (props) => {
  // Gracefully attempt to consume context if props are omitted
  let contextData: any = {};
  try {
    contextData = useWorkTemplatePrint();
  } catch (e) {
    contextData = {};
  }

  const order = props.order !== undefined ? props.order : contextData.order;
  const batch = props.batch !== undefined ? props.batch : contextData.batch;
  const farm = props.farm !== undefined ? props.farm : (contextData.activeFarm || contextData.farm);
  const activeCompany = props.activeCompany !== undefined ? props.activeCompany : contextData.activeCompany;
  const caravans = props.caravans !== undefined ? props.caravans : (contextData.caravans || []);
  const printAreaRef = props.printAreaRef !== undefined ? props.printAreaRef : contextData.printAreaRef;
  const template = contextData.template;

  // Extract male and female caravans
  const maleCaravans = useMemo(() => {
    if (!order || !caravans.length) {
      return caravans.filter((c: any) => c.sex === 'M' || (c.batch_id === batch?.id && c.sex === 'M'));
    }
    return (order.male_caravan_ids || [])
      .map((id: number) => caravans.find((c: any) => c.id === id))
      .filter(Boolean);
  }, [order, caravans, batch]);

  const femaleCaravans = useMemo(() => {
    if (!order || !caravans.length) {
      return caravans.filter((c: any) => c.sex === 'H' || (c.batch_id === batch?.id && c.sex === 'H'));
    }
    return (order.female_caravan_ids || [])
      .map((id: number) => caravans.find((c: any) => c.id === id))
      .filter(Boolean);
  }, [order, caravans, batch]);

  // Paginate female rows (12 per page)
  const pages = useMemo(() => {
    if (femaleCaravans.length > 0) {
      const chunks: any[][] = [];
      for (let i = 0; i < femaleCaravans.length; i += ROWS_PER_PAGE) {
        chunks.push(femaleCaravans.slice(i, i + ROWS_PER_PAGE));
      }
      return chunks;
    }
    return [Array.from({ length: ROWS_PER_PAGE }).map(() => null)];
  }, [femaleCaravans]);

  const detail = batch?.service_detail;

  const ratio = useMemo(() => {
    if (femaleCaravans.length === 0) return 0;
    return Number(((maleCaravans.length / femaleCaravans.length) * 100).toFixed(1));
  }, [maleCaravans, femaleCaravans]);

  const getServiceTypeLabel = (type?: string) => {
    if (!type) return 'Colectivo (Multi-Toro)';
    if (type === 'rotation') return 'Rotación de Padrillos';
    if (type === 'single') return 'Individual / Controlado';
    return 'Colectivo (Multi-Toro)';
  };

  const renderRows = (pageRows: any[], pageIndex: number) => {
    const startIndex = pageIndex * ROWS_PER_PAGE;
    return pageRows.map((caravan, index) => (
      <TableRow key={caravan?.id || index} sx={{ height: 28 }}>
        {/* 1. Correlativo */}
        <TableCell sx={{ textAlign: 'center', fontWeight: 700, fontSize: '0.65rem' }}>
          {startIndex + index + 1}
        </TableCell>

        {/* 2. Caravana / Tag Vientre */}
        <TableCell sx={{ fontWeight: 900, fontFamily: 'monospace', fontSize: '0.75rem' }}>
          {caravan?.identification || ''}
        </TableCell>

        {/* 3. Categoría */}
        <TableCell sx={{ fontSize: '0.68rem', fontWeight: 600 }}>
          {caravan?.category_name || caravan?.category || detail?.female_category_name || 'Vientre'}
        </TableCell>

        {/* 4. Raza */}
        <TableCell sx={{ fontSize: '0.65rem' }}>
          {caravan?.breed || ''}
        </TableCell>

        {/* 5. Dentición */}
        <TableCell sx={{ fontSize: '0.65rem', textAlign: 'center' }}>
          {caravan?.teeth !== undefined && caravan?.teeth !== null ? `${caravan.teeth}D` : ''}
        </TableCell>

        {/* 6. Condición Corporal (1 a 5 con casillas de marcado rápido) */}
        <TableCell sx={{ p: '2px 2px !important', textAlign: 'center' }}>
          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', alignItems: 'center' }}>
            {[1, 2, 3, 4, 5].map((cc) => (
              <Box key={cc} sx={{ display: 'flex', alignItems: 'center', gap: 0.2 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.52rem', color: '#000' }}>
                  {cc}
                </Typography>
                <Box sx={{ width: 7, height: 7, border: '1px solid #000', borderRadius: '1px' }} />
              </Box>
            ))}
          </Box>
        </TableCell>

        {/* 7. Toro Asignado / Detección Monta */}
        <TableCell sx={{ fontSize: '0.68rem', textAlign: 'center', fontFamily: 'monospace', fontWeight: 700 }}>
          {/* Handwritten or populated if controlled service */}
        </TableCell>

        {/* 8. Fecha Monta / Servicio */}
        <TableCell sx={{ fontSize: '0.65rem', textAlign: 'center' }}>
          {/* Handwritten placeholder */}
          ____/____
        </TableCell>

        {/* 9. Observaciones Zootécnicas */}
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
        width: '210mm',
        maxWidth: '100%',
        mx: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
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
            width: '210mm',
            maxWidth: '100%',
            mx: 'auto',
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
            {/* Top Title Bar (Identical to ING-01) */}
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#000', letterSpacing: '-1px', textTransform: 'uppercase', fontSize: '1.45rem' }}>
                  {template?.title || 'Servicio de Monta / Entore Reproductivo'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#444', fontWeight: 600, mt: -0.5, fontSize: '0.72rem' }}>
                  Sustentabilidad Ganadera • Procesamiento Inteligente Jhoangel AI
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#000', fontSize: '0.65rem', display: 'block' }}>
                  DOCUMENTO DE REGISTRO OFICIAL
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#0a6ed1', fontSize: '0.68rem', fontFamily: 'monospace' }}>
                  {order?.code ? `ORDEN: #${order.code}` : `LOTE: #${batch?.id || 'TEST'}`}
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
                      {template?.code || 'MON-01'}
                    </Typography>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Table 2: METADATOS DEL SERVICIO REPRODUCTIVO (LOTE, MODALIDAD, FECHAS, RATIO) */}
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: '12px',
              border: '2px solid #000',
              color: '#000'
            }}>
              <tbody>
                {/* Fila 1 Labels */}
                <tr>
                  <td style={{ border: '1px solid #000', backgroundColor: '#f0f0f0', padding: '3px 6px', width: '26%' }}>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#000', display: 'block', fontSize: '0.58rem' }}>
                      LOTE DE SERVICIO (DESTINO)
                    </Typography>
                  </td>
                  <td style={{ border: '1px solid #000', backgroundColor: '#f0f0f0', padding: '3px 6px', width: '24%' }}>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#000', display: 'block', fontSize: '0.58rem' }}>
                      MODALIDAD DE ENTORE
                    </Typography>
                  </td>
                  <td style={{ border: '1px solid #000', backgroundColor: '#f0f0f0', padding: '3px 6px', width: '22%' }}>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#000', display: 'block', fontSize: '0.58rem' }}>
                      CATEGORÍA VIENTRES
                    </Typography>
                  </td>
                  <td style={{ border: '1px solid #000', backgroundColor: '#f0f0f0', padding: '3px 6px', width: '14%', textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#000', display: 'block', fontSize: '0.58rem' }}>
                      RATIO TORADA
                    </Typography>
                  </td>
                  <td style={{ border: '1px solid #000', backgroundColor: '#e8eff7', padding: '3px 6px', width: '14%', textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#0a6ed1', display: 'block', fontSize: '0.58rem' }}>
                      ESTADO ORDEN
                    </Typography>
                  </td>
                </tr>
                {/* Fila 1 Values */}
                <tr style={{ height: 26 }}>
                  <td style={{ border: '1px solid #000', padding: '3px 8px', verticalAlign: 'middle' }}>
                    <Typography variant="body2" sx={{ fontWeight: 900, fontSize: '0.82rem', color: '#002B49' }}>
                      {batch?.name || 'LOTE TEST CRIA'}
                    </Typography>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '3px 8px', verticalAlign: 'middle' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.76rem', color: '#002B49' }}>
                      {getServiceTypeLabel(order?.service_type)}
                    </Typography>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '3px 8px', verticalAlign: 'middle' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.76rem', color: '#002B49' }}>
                      {detail?.female_category_name || 'Vaca de Cría (Homogénea)'}
                    </Typography>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '3px 8px', verticalAlign: 'middle', textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 900, fontSize: '0.8rem', color: ratio >= 2.0 ? '#107e3e' : '#e6600d' }}>
                      {ratio}%
                    </Typography>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '3px 8px', verticalAlign: 'middle', textAlign: 'center', backgroundColor: '#fafafa' }}>
                    <Typography variant="body2" sx={{ fontWeight: 900, fontSize: '0.76rem', color: '#0a6ed1' }}>
                      {order?.status || 'EN SERVICIO'}
                    </Typography>
                  </td>
                </tr>

                {/* Fila 2 Labels */}
                <tr>
                  <td style={{ border: '1px solid #000', backgroundColor: '#f0f0f0', padding: '3px 6px' }}>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#000', display: 'block', fontSize: '0.58rem' }}>
                      FECHA INICIO PLANIFICADA
                    </Typography>
                  </td>
                  <td style={{ border: '1px solid #000', backgroundColor: '#f0f0f0', padding: '3px 6px' }}>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#000', display: 'block', fontSize: '0.58rem' }}>
                      FECHA FIN ESTIMADA
                    </Typography>
                  </td>
                  <td style={{ border: '1px solid #000', backgroundColor: '#f0f0f0', padding: '3px 6px' }}>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#000', display: 'block', fontSize: '0.58rem' }}>
                      FECHA INICIO EFECTIVO
                    </Typography>
                  </td>
                  <td style={{ border: '1px solid #000', backgroundColor: '#f0f0f0', padding: '3px 6px', textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#000', display: 'block', fontSize: '0.58rem' }}>
                      POB. VIENTRES
                    </Typography>
                  </td>
                  <td style={{ border: '1px solid #000', backgroundColor: '#f0f0f0', padding: '3px 6px', textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#000', display: 'block', fontSize: '0.58rem' }}>
                      PADRILLOS
                    </Typography>
                  </td>
                </tr>
                {/* Fila 2 Values */}
                <tr style={{ height: 26 }}>
                  <td style={{ border: '1px solid #000', padding: '3px 8px', verticalAlign: 'middle' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.78rem' }}>
                      {order?.planned_start_date || detail?.planned_start_date || '____ / ____ / ________'}
                    </Typography>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '3px 8px', verticalAlign: 'middle' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.78rem' }}>
                      {detail?.planned_end_date || '____ / ____ / ________'}
                    </Typography>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '3px 8px', verticalAlign: 'middle' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.78rem' }}>
                      {order?.actual_start_date || '____ / ____ / ________'}
                    </Typography>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '3px 8px', verticalAlign: 'middle', textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 900, fontSize: '0.82rem', color: '#db2777' }}>
                      {femaleCaravans.length}
                    </Typography>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '3px 8px', verticalAlign: 'middle', textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 900, fontSize: '0.82rem', color: '#2563eb' }}>
                      {maleCaravans.length}
                    </Typography>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Table 3: NÓMINA DE PADRILLOS / TOROS ASIGNADOS (ROSTER) */}
            {maleCaravans.length > 0 && (
              <Box sx={{ mb: 1.5 }}>
                <Box sx={{ mb: 0.5, pb: 0.25, borderBottom: '1.5px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 900, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.68rem' }}>
                    NÓMINA DE PADRILLOS / TOROS EN SERVICIO ({maleCaravans.length})
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#444', fontSize: '0.6rem' }}>
                    TORADA ASIGNADA PARA ENTORE
                  </Typography>
                </Box>

                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  border: '1.5px solid #000',
                  color: '#000',
                  fontSize: '0.65rem'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f0f0f0', height: 22 }}>
                      <th style={{ border: '1px solid #000', padding: '2px 4px', width: '5%', textAlign: 'center', fontWeight: 800 }}>#</th>
                      <th style={{ border: '1px solid #000', padding: '2px 6px', width: '22%', textAlign: 'left', fontWeight: 800 }}>CARAVANA TORO</th>
                      <th style={{ border: '1px solid #000', padding: '2px 6px', width: '25%', textAlign: 'left', fontWeight: 800 }}>CATEGORÍA / RAZA</th>
                      <th style={{ border: '1px solid #000', padding: '2px 4px', width: '12%', textAlign: 'center', fontWeight: 800 }}>DENTICIÓN</th>
                      <th style={{ border: '1px solid #000', padding: '2px 6px', width: '16%', textAlign: 'right', fontWeight: 800 }}>PESO ACTUAL</th>
                      <th style={{ border: '1px solid #000', padding: '2px 6px', width: '20%', textAlign: 'center', fontWeight: 800 }}>ASIGNACIÓN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maleCaravans.map((male: any, i: number) => (
                      <tr key={male.id || i} style={{ height: 22 }}>
                        <td style={{ border: '1px solid #000', padding: '2px 4px', textAlign: 'center', fontWeight: 700 }}>{i + 1}</td>
                        <td style={{ border: '1px solid #000', padding: '2px 6px', fontWeight: 900, fontFamily: 'monospace', color: '#2563eb' }}>
                          #{male.identification}
                        </td>
                        <td style={{ border: '1px solid #000', padding: '2px 6px' }}>
                          {male.category_name || male.category || 'Toro'} {male.breed ? `• ${male.breed}` : ''}
                        </td>
                        <td style={{ border: '1px solid #000', padding: '2px 4px', textAlign: 'center', fontWeight: 700 }}>
                          {male.teeth !== undefined && male.teeth !== null ? `${male.teeth}D` : '4D'}
                        </td>
                        <td style={{ border: '1px solid #000', padding: '2px 6px', textAlign: 'right', fontWeight: 700 }}>
                          {male.current_weight || male.weight ? `${male.current_weight || male.weight} kg` : '—'}
                        </td>
                        <td style={{ border: '1px solid #000', padding: '2px 6px', textAlign: 'center', fontWeight: 600 }}>
                          {order?.is_controlled_service ? 'Controlado / Fijo' : 'Rodeo General'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            )}

            {/* Table 4: PLANILLA DE REGISTRO DE VIENTRES */}
            <Box sx={{ mb: 1, pb: 0.5, borderBottom: '1.5px solid #000' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.72rem' }}>
                PLANILLA DE REGISTRO DE VIENTRES EN ENTORE (PÁGINA {pageIndex + 1})
              </Typography>
            </Box>

            <Table sx={{
              borderCollapse: 'collapse',
              width: '100%',
              '& .MuiTableCell-root': {
                border: '1px solid #000',
                padding: '3px 5px',
                fontSize: '0.66rem',
                color: '#000',
                height: 28,
                boxSizing: 'border-box'
              }
            }}>
              <TableHead>
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ backgroundColor: '#f0f0f0', fontWeight: 900, textTransform: 'uppercase', textAlign: 'center', p: 0.4, fontSize: '0.68rem' }}>
                    IDENTIFICACIÓN Y DATOS DEL VIENTRE
                  </TableCell>
                  <TableCell colSpan={4} align="center" sx={{ backgroundColor: '#e8eff7', color: '#0a6ed1 !important', fontWeight: 900, textTransform: 'uppercase', textAlign: 'center', p: 0.4, fontSize: '0.68rem' }}>
                    EVALUACIÓN ZOOTÉCNICA Y CONTROL DE MONTA
                  </TableCell>
                </TableRow>
                <TableRow sx={{ backgroundColor: '#fafafa' }}>
                  <TableCell sx={{ width: '4%', fontWeight: 800, textAlign: 'center', p: 0.4, fontSize: '0.64rem' }}>#</TableCell>
                  <TableCell sx={{ width: '18%', fontWeight: 800, textTransform: 'uppercase', p: 0.4, fontSize: '0.64rem' }}>CARAVANA VIENTRE</TableCell>
                  <TableCell sx={{ width: '18%', fontWeight: 800, textTransform: 'uppercase', p: 0.4, fontSize: '0.64rem' }}>CATEGORÍA</TableCell>
                  <TableCell sx={{ width: '12%', fontWeight: 800, textTransform: 'uppercase', p: 0.4, fontSize: '0.64rem' }}>RAZA</TableCell>
                  <TableCell sx={{ width: '8%', fontWeight: 800, textTransform: 'uppercase', p: 0.4, textAlign: 'center', fontSize: '0.64rem' }}>DENT.</TableCell>
                  <TableCell sx={{ width: '14%', fontWeight: 800, textTransform: 'uppercase', p: 0.4, textAlign: 'center', fontSize: '0.64rem' }}>COND. CORP. (1-5)</TableCell>
                  <TableCell sx={{ width: '13%', fontWeight: 800, textTransform: 'uppercase', p: 0.4, textAlign: 'center', fontSize: '0.64rem' }}>TORO MONTA</TableCell>
                  <TableCell sx={{ width: '10%', fontWeight: 800, textTransform: 'uppercase', p: 0.4, textAlign: 'center', fontSize: '0.64rem' }}>F. MONTA</TableCell>
                  <TableCell sx={{ width: '13%', fontWeight: 800, textTransform: 'uppercase', p: 0.4, fontSize: '0.64rem' }}>OBSERVACIONES</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {renderRows(pageRows, pageIndex)}
              </TableBody>
            </Table>
          </Box>

          {/* Table 5: Section on Last Page: Firmas de Responsabilidad */}
          {pageIndex === pages.length - 1 && (
            <Box sx={{ mt: 2, pt: 1 }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                border: '1.5px solid #000',
                color: '#000',
                fontSize: '0.65rem'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f0f0f0', height: 22 }}>
                    <th style={{ border: '1px solid #000', padding: '3px 8px', width: '50%', textAlign: 'left', fontWeight: 800 }}>
                      RESPONSABLE DE CAMPO / RECORREDOR
                    </th>
                    <th style={{ border: '1px solid #000', padding: '3px 8px', width: '50%', textAlign: 'left', fontWeight: 800 }}>
                      MÉDICO VETERINARIO / ASESOR TÉCNICO
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ height: 42 }}>
                    <td style={{ border: '1px solid #000', padding: '6px 10px', verticalAlign: 'bottom' }}>
                      <Typography variant="caption" sx={{ color: '#555', display: 'block', fontSize: '0.58rem' }}>
                        Firma y Aclaración: _____________________________________
                      </Typography>
                    </td>
                    <td style={{ border: '1px solid #000', padding: '6px 10px', verticalAlign: 'bottom' }}>
                      <Typography variant="caption" sx={{ color: '#555', display: 'block', fontSize: '0.58rem' }}>
                        Firma y Matrícula: _____________________________________
                      </Typography>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Box>
          )}

          {/* Bottom Page Footer */}
          <Box sx={{ mt: 2, pt: 1, borderTop: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: '#666', fontStyle: 'italic', fontSize: '0.62rem' }}>
              Planilla Oficial de Servicio de Monta y Entore ({template?.code || 'MON-01'}) • Jhoangel AI Microservice • Sincronización zootécnica de campo
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

export default TemplateMON01;
