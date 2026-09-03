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
import PrintHeader from '@/ui/livestock/template/components/PrintHeader';
import { useWorkTemplatePrint } from '@/contexts/WorkTemplatePrintContext';

const ROWS_PER_PAGE = 12;

const TemplateGeneric: React.FC = () => {
  const {
    template,
    batch,
    farm,
    provider,
    caravans = [],
    printAreaRef
  } = useWorkTemplatePrint();

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

  // Separate caravan/animal identification fields from payload/diagnostic fields
  const animalFields = useMemo(() => {
    return schemaFields.filter((f: any) =>
      ['caravana', 'category', 'identification', 'animal', 'tag'].includes(f.name.toLowerCase())
    );
  }, [schemaFields]);

  const customFields = useMemo(() => {
    return schemaFields.filter((f: any) =>
      !['caravana', 'category', 'identification', 'animal', 'tag'].includes(f.name.toLowerCase())
    );
  }, [schemaFields]);

  // Dynamic pagination
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

  const renderCellContent = (field: any, caravan: any) => {
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
          {caravan?.category_name || caravan?.category || ''}
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
    return <TableCell key={field.name} sx={{ fontSize: '0.65rem' }} />;
  };

  const renderRows = (pageRows: any[], pageIndex: number) => {
    const startIndex = pageIndex * ROWS_PER_PAGE;
    return pageRows.map((caravan, index) => (
      <TableRow key={caravan?.id || index} sx={{ height: 28 }}>
        <TableCell sx={{ textAlign: 'center', fontWeight: 600, fontSize: '0.65rem' }}>
          {startIndex + index + 1}
        </TableCell>
        {animalFields.map((field) => renderCellContent(field, caravan))}
        {customFields.map((field) => renderCellContent(field, caravan))}
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
            <PrintHeader
              establishment={batch?.farm_name || ''}
              cuit={provider?.cuit || ''}
              renspa={farm?.renspa || ''}
              lote={batch?.name || ''}
              title={template?.title || 'Planilla de Campo'}
              templateCode={template?.code}
            />

            <Box sx={{ mb: 2, pb: 1, borderBottom: '1.5px solid #000' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {template?.title || 'REGISTRO DE CAMPO OPERATIVO'}
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
                height: 28,
                boxSizing: 'border-box'
              }
            }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#fafafa' }}>
                  <TableCell sx={{ width: '5%', fontWeight: 800, textAlign: 'center', p: 0.5, fontSize: '0.65rem' }}>#</TableCell>
                  {animalFields.map((field) => (
                    <TableCell key={field.name} sx={{ fontWeight: 800, textTransform: 'uppercase', p: 0.5, fontSize: '0.65rem' }}>
                      {field.label}
                    </TableCell>
                  ))}
                  {customFields.map((field) => (
                    <TableCell key={field.name} sx={{ fontWeight: 800, textTransform: 'uppercase', p: 0.5, fontSize: '0.65rem' }}>
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

          <Box sx={{ mt: 5, pt: 1.5, borderTop: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: '#666', fontStyle: 'italic', fontSize: '0.65rem' }}>
              Planilla Operativa de Campo ({template?.code || 'GENÉRICA'}) • Generado por Jhoangel AI • Sincronización offline optimizada
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

export default TemplateGeneric;
