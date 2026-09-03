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
} from '@mui/material';
import { useWorkTemplatePrint } from '@/contexts/WorkTemplatePrintContext';

const ROWS_PER_PAGE = 12;

export const TemplateTOR01: React.FC = () => {
  const {
    template,
    farm,
    activeCompany,
    caravans = [],
    printAreaRef,
    activeFarm,
  } = useWorkTemplatePrint();

  const displayFarm = activeFarm || farm;

  // Paginate rows to 12 per page
  const pages = useMemo(() => {
    if (caravans.length > 0) {
      const chunks: Record<string, unknown>[][] = [];
      for (let i = 0; i < caravans.length; i += ROWS_PER_PAGE) {
        chunks.push(caravans.slice(i, i + ROWS_PER_PAGE));
      }
      return chunks;
    }
    return [Array.from({ length: ROWS_PER_PAGE }).map(() => null)];
  }, [caravans]);

  const renderRows = (pageRows: (Record<string, unknown> | null)[], pageIndex: number) => {
    const startIndex = pageIndex * ROWS_PER_PAGE;
    return pageRows.map((bull, index) => {
      const rowNum = startIndex + index + 1;
      const identification = (bull?.identification || bull?.caravan_number || '') as string;
      const observations = (bull?.observations || '') as string;

      return (
        <TableRow key={(bull?.id as string | number) || index} sx={{ height: 30 }}>
          {/* 1. Correlativo */}
          <TableCell sx={{ textAlign: 'center', fontWeight: 700, fontSize: '0.65rem' }}>
            {rowNum}
          </TableCell>

          {/* 2. Caravana / Tag */}
          <TableCell sx={{ fontWeight: 900, fontFamily: 'monospace', fontSize: '0.75rem' }}>
            {identification}
          </TableCell>

          {/* 3. CE (cm) */}
          <TableCell sx={{ textAlign: 'center', p: '2px !important' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.2 }}>
              <Box sx={{ width: 11, height: 14, border: '1px solid #64748b', borderRadius: '1px' }} />
              <Box sx={{ width: 11, height: 14, border: '1px solid #64748b', borderRadius: '1px' }} />
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 800 }}>.</Typography>
              <Box sx={{ width: 10, height: 14, border: '1px solid #64748b', borderRadius: '1px' }} />
            </Box>
          </TableCell>

          {/* 4. CC (1.0 - 5.0) - Escritura a pulso */}
          <TableCell sx={{ textAlign: 'center', p: '2px !important' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box sx={{ width: 22, height: 16, border: '1px solid #64748b', borderRadius: '1px' }} />
            </Box>
          </TableCell>

          {/* 5. Líbido - Escritura de texto o inicial */}
          <TableCell sx={{ textAlign: 'center', p: '2px !important' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box sx={{ width: 34, height: 16, borderBottom: '1px solid #64748b' }} />
            </Box>
          </TableCell>

          {/* 6. Aplomos - Campo de texto para escribir */}
          <TableCell sx={{ p: '2px 4px !important' }}>
            <Box sx={{ width: '100%', height: 16, borderBottom: '1px dashed #94a3b8' }} />
          </TableCell>

          {/* 7. Raspaje ETS */}
          <TableCell sx={{ p: '2px !important', bgcolor: '#fffbeb' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                <Typography sx={{ fontSize: '0.55rem', fontWeight: 800, color: '#92400e' }}>SÍ</Typography>
                <Box sx={{ width: 8, height: 8, border: '1.2px solid #b45309', borderRadius: '1px' }} />
              </Box>
              <Typography sx={{ fontSize: '0.5rem', color: '#78350f', fontWeight: 600 }}>Tubo:</Typography>
              <Box sx={{ width: 30, height: 13, borderBottom: '1px solid #b45309' }} />
            </Box>
          </TableCell>

          {/* 8. Serología (Sangre) */}
          <TableCell sx={{ p: '2px !important', bgcolor: '#eff6ff' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                <Typography sx={{ fontSize: '0.55rem', fontWeight: 800, color: '#1e40af' }}>SÍ</Typography>
                <Box sx={{ width: 8, height: 8, border: '1.2px solid #1d4ed8', borderRadius: '1px' }} />
              </Box>
              <Typography sx={{ fontSize: '0.5rem', color: '#1e3a8a', fontWeight: 600 }}>Tubo:</Typography>
              <Box sx={{ width: 30, height: 13, borderBottom: '1px solid #1d4ed8' }} />
            </Box>
          </TableCell>

          {/* 9. Dictamen Físico en Manga */}
          <TableCell sx={{ textAlign: 'center', p: '2px !important' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2 }}>
                <Typography sx={{ fontSize: '0.52rem', fontWeight: 800, color: '#15803d' }}>A</Typography>
                <Box sx={{ width: 7, height: 7, border: '1px solid #15803d', borderRadius: '1px' }} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2 }}>
                <Typography sx={{ fontSize: '0.52rem', fontWeight: 800, color: '#b91c1c' }}>R</Typography>
                <Box sx={{ width: 7, height: 7, border: '1px solid #b91c1c', borderRadius: '1px' }} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2 }}>
                <Typography sx={{ fontSize: '0.52rem', fontWeight: 800, color: '#b45309' }}>T</Typography>
                <Box sx={{ width: 7, height: 7, border: '1px solid #b45309', borderRadius: '1px' }} />
              </Box>
            </Box>
          </TableCell>

          {/* 10. Observaciones */}
          <TableCell sx={{ fontSize: '0.65rem', p: '2px 4px !important' }}>
            {observations || (
              <Box sx={{ width: '100%', height: 16, borderBottom: '1px dashed #cbd5e1' }} />
            )}
          </TableCell>
        </TableRow>
      );
    });
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
        gap: 0,
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
              height: '297mm',
            },
            '&:last-child': {
              mb: 0,
              pageBreakAfter: 'avoid',
              breakAfter: 'avoid',
              '@media print': {
                mb: 0,
                pageBreakAfter: 'avoid',
                breakAfter: 'avoid',
              },
            },
          }}
        >
          <Box>
            {/* Top Title Bar (ING-01 Benchmark Style) */}
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#000', letterSpacing: '-1px', textTransform: 'uppercase', fontSize: '1.5rem' }}>
                  {template?.title || 'Revisación Andrológica de Toros'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#444', fontWeight: 600, mt: -0.5, fontSize: '0.72rem' }}>
                  Sustentabilidad Ganadera • Procesamiento Inteligente Jhoangel AI • Criterio Carrillo (1988)
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#000', fontSize: '0.65rem', display: 'block' }}>
                  DOCUMENTO DE REGISTRO OFICIAL
                </Typography>
              </Box>
            </Box>

            {/* Table 1: ESTABLECIMIENTO & TEMPLATE CODE */}
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                marginBottom: '10px',
                border: '2px solid #000',
                color: '#000',
              }}
            >
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #000', backgroundColor: '#f0f0f0', padding: '3px 8px', width: '75%' }}>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#000', textTransform: 'uppercase', fontSize: '0.58rem' }}>
                      ESTABLECIMIENTO GANADERO
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
                      {`${activeCompany?.name || 'ESTABLECIMIENTO GANADERO'}${displayFarm ? ` • ${displayFarm.name}` : ''}${displayFarm?.renspa ? ` • RENSPA: ${displayFarm.renspa}` : (activeCompany?.renspa ? ` • RENSPA: ${activeCompany.renspa}` : '')}`}
                    </Typography>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '3px 10px', verticalAlign: 'middle', textAlign: 'center', backgroundColor: '#fafafa' }}>
                    <Typography variant="body1" sx={{ fontWeight: 900, fontSize: '0.9rem', color: '#000', fontFamily: 'monospace', letterSpacing: '1px' }}>
                      {template?.code || 'TOR-01'}
                    </Typography>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Table 2: METADATOS DE VETERINARIO Y PROTOCOLO */}
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                marginBottom: '10px',
                border: '2px solid #000',
                color: '#000',
              }}
            >
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #000', backgroundColor: '#f0f0f0', padding: '3px 6px', width: '45%' }}>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#000', display: 'block', fontSize: '0.58rem' }}>
                      MÉDICO VETERINARIO ACTUANTE
                    </Typography>
                  </td>
                  <td style={{ border: '1px solid #000', backgroundColor: '#f0f0f0', padding: '3px 6px', width: '25%' }}>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#000', display: 'block', fontSize: '0.58rem' }}>
                      MATRÍCULA PROFESIONAL
                    </Typography>
                  </td>
                  <td style={{ border: '1px solid #000', backgroundColor: '#f0f0f0', padding: '3px 6px', width: '30%', textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#000', display: 'block', fontSize: '0.58rem' }}>
                      FECHA DE EVALUACIÓN
                    </Typography>
                  </td>
                </tr>
                <tr style={{ height: 28 }}>
                  <td style={{ border: '1px solid #000', padding: '3px 8px', verticalAlign: 'middle' }}>
                    <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.8rem', color: '#002B49' }}>
                      Dr. Veterinario Actuante
                    </Typography>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '3px 8px', verticalAlign: 'middle' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#002B49' }}>
                      MP: _______________
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

            {/* Protocol Scope & Carrillo Quick Box */}
            <Box
              sx={{
                border: '1.5px solid #000',
                bgcolor: '#fffbeb',
                p: '4px 8px',
                mb: 1.5,
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 0.5,
              }}
            >
              <Box>
                <Typography sx={{ fontSize: '0.58rem', fontWeight: 800, color: '#92400e' }}>
                  ALCANCE DE JORNADA: [  ] 1º Raspaje ETS &nbsp;&nbsp; [  ] 2º Raspaje ETS &nbsp;&nbsp; [  ] Sangrado Serológico (Brucelosis BPA)
                </Typography>
                <Typography sx={{ fontSize: '0.52rem', color: '#78350f' }}>
                  Raspajes en caldo/solución (Tricomoniasis/Campylobacter) • Serología en tubo al vacío sin anticoagulante.
                </Typography>
              </Box>
              <Box sx={{ borderLeft: '1px solid #b45309', pl: 1 }}>
                <Typography sx={{ fontSize: '0.52rem', fontWeight: 700, color: '#92400e' }}>
                  UMBRAL CARRILLO: CE ≥ 28 cm • CC 3.0-3.5 • Venéreas / Brucelosis: Descarte Inmediato
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mb: 1.5, pb: 0.5, borderBottom: '1.5px solid #000' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.75rem' }}>
                REGISTRO DE EVALUACIÓN Y MUESTREO EN MANGA (TORADA)
              </Typography>
            </Box>

            {/* Table Grid (ING-01 Dual Header Level Format) */}
            <Table
              sx={{
                borderCollapse: 'collapse',
                width: '100%',
                '& .MuiTableCell-root': {
                  border: '1px solid #000',
                  padding: '4px 6px',
                  fontSize: '0.68rem',
                  color: '#000',
                  height: 30,
                  boxSizing: 'border-box',
                },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell
                    colSpan={6}
                    align="center"
                    sx={{ backgroundColor: '#f0f0f0', fontWeight: 900, textTransform: 'uppercase', textAlign: 'center', p: 0.5, fontSize: '0.7rem' }}
                  >
                    EXAMEN FÍSICO Y BIOMÉTRICO EN MANGA
                  </TableCell>
                  <TableCell
                    colSpan={4}
                    align="center"
                    sx={{ backgroundColor: '#e8eff7', color: '#0a6ed1 !important', fontWeight: 900, textTransform: 'uppercase', textAlign: 'center', p: 0.5, fontSize: '0.7rem' }}
                  >
                    MUESTREO ETS, SEROLOGÍA Y DICTAMEN ANDROLÓGICO
                  </TableCell>
                </TableRow>
                <TableRow sx={{ backgroundColor: '#fafafa' }}>
                  <TableCell sx={{ width: '3%', fontWeight: 800, textAlign: 'center', p: 0.5, fontSize: '0.65rem' }}>#</TableCell>
                  <TableCell sx={{ width: '14%', fontWeight: 800, textTransform: 'uppercase', p: 0.5, fontSize: '0.65rem' }}>CARAVANA</TableCell>
                  <TableCell sx={{ width: '9%', fontWeight: 800, textTransform: 'uppercase', p: 0.5, textAlign: 'center', fontSize: '0.65rem' }}>CE (CM)</TableCell>
                  <TableCell sx={{ width: '8%', fontWeight: 800, textTransform: 'uppercase', p: 0.5, textAlign: 'center', fontSize: '0.65rem' }}>COND. C. (1-5)</TableCell>
                  <TableCell sx={{ width: '9%', fontWeight: 800, textTransform: 'uppercase', p: 0.5, textAlign: 'center', fontSize: '0.65rem' }}>LÍBIDO</TableCell>
                  <TableCell sx={{ width: '14%', fontWeight: 800, textTransform: 'uppercase', p: 0.5, textAlign: 'center', fontSize: '0.65rem' }}>APLOMOS</TableCell>
                  <TableCell sx={{ width: '12%', fontWeight: 800, textTransform: 'uppercase', p: 0.5, bgcolor: '#fef3c7', color: '#92400e !important', fontSize: '0.65rem' }}>RASPAJE ETS</TableCell>
                  <TableCell sx={{ width: '12%', fontWeight: 800, textTransform: 'uppercase', p: 0.5, bgcolor: '#eff6ff', color: '#1e40af !important', fontSize: '0.65rem' }}>SEROLOGÍA</TableCell>
                  <TableCell sx={{ width: '7%', fontWeight: 800, textTransform: 'uppercase', p: 0.5, textAlign: 'center', fontSize: '0.65rem' }}>DICTAMEN</TableCell>
                  <TableCell sx={{ width: '12%', fontWeight: 800, textTransform: 'uppercase', p: 0.5, fontSize: '0.65rem' }}>OBSERVACIONES</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>{renderRows(pageRows, pageIndex)}</TableBody>
            </Table>
          </Box>

          {/* Bottom Signatures & Footer (ING-01 Aligned) */}
          <Box sx={{ mt: 2 }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                marginBottom: '10px',
                border: '1.5px solid #000',
                color: '#000',
              }}
            >
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '10px 12px 4px 12px', width: '50%', height: 44, verticalAlign: 'bottom' }}>
                    <div style={{ borderTop: '1px dashed #000', paddingTop: '4px', textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#000', fontSize: '0.6rem' }}>
                        Firma y Aclaración: Operador / Encargado de Manga
                      </Typography>
                    </div>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '10px 12px 4px 12px', width: '50%', height: 44, verticalAlign: 'bottom' }}>
                    <div style={{ borderTop: '1px dashed #000', paddingTop: '4px', textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#000', fontSize: '0.6rem' }}>
                        Firma, Sello y Matrícula: Médico Veterinario Actuante
                      </Typography>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <Box sx={{ pt: 1, borderTop: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: '#666', fontStyle: 'italic', fontSize: '0.65rem' }}>
                Planilla de Revisación Andrológica de Toros ({template?.code || 'TOR-01'}) • Jhoangel AI Microservice • Sincronización offline optimizada
              </Typography>
              <Typography variant="caption" sx={{ color: '#333', fontWeight: 700, fontSize: '0.65rem' }}>
                HOJA {pageIndex + 1} DE {pages.length}
              </Typography>
            </Box>
          </Box>
        </Paper>
      ))}
    </Box>
  );
};

export default TemplateTOR01;
