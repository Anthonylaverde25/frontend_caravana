import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  FormControlLabel, 
  Checkbox, 
  Button, 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody,
  Divider,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  IconButton,
  Tooltip,
  TextField
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import DescriptionIcon from '@mui/icons-material/Description';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

import axiosInstance from '@/lib/axiosInstance';

interface Field {
  id: string;
  label: string;
  checked: boolean;
  selectedAlias: string;
}

interface Mapping {
  id: number;
  alias_name: string;
  target_field: string;
}

const TemplateGenerator: React.FC = () => {
  const [fields, setFields] = useState<Field[]>([
    { id: 'identification', label: 'Identificación', checked: true, selectedAlias: 'caravana' },
    { id: 'category', label: 'Categoría', checked: true, selectedAlias: 'categoria' },
    { id: 'teeth', label: 'Dentición', checked: true, selectedAlias: 'dientes' },
    { id: 'breed', label: 'Raza', checked: true, selectedAlias: 'raza' },
    { id: 'entry_weight', label: 'Peso Entrada', checked: true, selectedAlias: 'peso_entrada' },
    { id: 'sex', label: 'Sexo', checked: false, selectedAlias: 'sexo' },
    { id: 'entry_date', label: 'Fecha Ingreso', checked: false, selectedAlias: 'fecha_ingreso' },
  ]);

  const [availableMappings, setAvailableMappings] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [rowCount, setRowCount] = useState(25);
  const [establishment, setEstablishment] = useState('');

  useEffect(() => {
    axiosInstance.get('/field-mappings/caravans')
      .then(response => {
        const result = response.data;
        if (result.status === 'success') {
          const grouped: Record<string, string[]> = {};
          result.data.forEach((m: Mapping) => {
            if (!grouped[m.target_field]) grouped[m.target_field] = [];
            if (!grouped[m.target_field].includes(m.alias_name)) {
              grouped[m.target_field].push(m.alias_name);
            }
          });
          setAvailableMappings(grouped);
          
          setFields(prev => prev.map(f => ({
            ...f,
            selectedAlias: grouped[f.id]?.[0] || f.selectedAlias
          })));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching mappings:', err);
        setLoading(false);
      });
  }, []);

  const handleToggle = (id: string) => {
    setFields(fields.map(f => f.id === id ? { ...f, checked: !f.checked } : f));
  };

  const handleAliasChange = (id: string, alias: string) => {
    setFields(fields.map(f => f.id === id ? { ...f, selectedAlias: alias } : f));
  };

  const resetFields = () => {
    setFields(prev => prev.map(f => ({ ...f, checked: ['identification', 'category', 'teeth', 'breed', 'entry_weight'].includes(f.id) })));
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedFields = fields.filter(f => f.checked);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      {/* Layout Container with Flex instead of Grid */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        gap: 3,
        alignItems: 'flex-start'
      }}>
        
        {/* Sidebar Configuration - Aside */}
        <Box 
          component="aside" 
          className="no-print"
          sx={{ 
            width: { xs: '100%', md: 320, lg: 360 },
            flexShrink: 0,
            position: { md: 'sticky' },
            top: { md: 100 }
          }}
        >
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Configuración</Typography>
                <Tooltip title="Restablecer">
                  <IconButton size="small" onClick={resetFields}>
                    <RestartAltIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Personaliza las columnas y alias para tu planilla de campo.
              </Typography>

              <TextField 
                fullWidth 
                label="Establecimiento" 
                size="small" 
                value={establishment}
                onChange={(e) => setEstablishment(e.target.value)}
                sx={{ mb: 3 }}
                placeholder="Ej: La Esperanza"
              />

              <Divider sx={{ mb: 3 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {fields.map(field => (
                  <Box key={field.id} sx={{ 
                    p: 1.5, 
                    borderRadius: 2, 
                    border: '1px solid', 
                    borderColor: field.checked ? 'primary.light' : 'transparent',
                    bgcolor: field.checked ? 'rgba(26, 115, 232, 0.04)' : 'transparent',
                    transition: 'all 0.2s'
                  }}>
                    <FormControlLabel
                      control={
                        <Checkbox 
                          size="small"
                          checked={field.checked} 
                          onChange={() => handleToggle(field.id)} 
                        />
                      }
                      label={<Typography variant="body2" sx={{ fontWeight: 600 }}>{field.label}</Typography>}
                    />
                    
                    {field.checked && availableMappings[field.id] && (
                      <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                        <Select
                          value={field.selectedAlias}
                          onChange={(e) => handleAliasChange(field.id, e.target.value as string)}
                          sx={{ fontSize: '0.75rem', bgcolor: 'white' }}
                        >
                          {availableMappings[field.id].map(alias => (
                            <MenuItem key={alias} value={alias} sx={{ fontSize: '0.75rem' }}>
                              {alias}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  </Box>
                ))}
              </Box>

              <Box sx={{ mt: 4 }}>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Filas a Imprimir</InputLabel>
                  <Select
                    value={rowCount}
                    label="Filas a Imprimir"
                    onChange={(e) => setRowCount(e.target.value as number)}
                  >
                    {[15, 25, 40, 50, 75, 100].map(val => (
                      <MenuItem key={val} value={val}>{val} Filas</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button 
                  fullWidth
                  variant="contained" 
                  startIcon={<PrintIcon />}
                  onClick={handlePrint}
                  disabled={selectedFields.length === 0}
                  sx={{ py: 1.5 }}
                >
                  Imprimir Planilla
                </Button>
              </Box>
            </CardContent>
          </Card>
          
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Desarrollado con Ingeniería AI
            </Typography>
          </Box>
        </Box>

        {/* Preview Area - Flex Grow */}
        <Box sx={{ 
          flexGrow: 1,
          bgcolor: '#f5f7f9', 
          p: { xs: 2, md: 4 }, 
          borderRadius: 3, 
          minHeight: '80vh',
          display: 'flex',
          justifyContent: 'center',
          border: '1px solid #e1e4e8',
          overflowX: 'auto',
          width: '100%'
        }}>
          <Paper className="print-area" elevation={3} sx={{ 
            p: 6, 
            width: '100%', 
            maxWidth: '210mm',
            minHeight: '297mm',
            bgcolor: 'white',
            borderRadius: 0,
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
          }}>
            {/* Print Header */}
            <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#000', letterSpacing: '-0.5px' }}>PLANILLA DE CAMPO</Typography>
                <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>Sustentabilidad Ganadera • Procesamiento Inteligente</Typography>
              </Box>
              <Box sx={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#999' }}>ESTABLECIMIENTO:</Typography>
                  <Typography variant="body2" sx={{ borderBottom: '1px solid #000', minWidth: 150, fontWeight: 600 }}>
                    {establishment}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#999' }}>FECHA:</Typography>
                  <Typography variant="body2" sx={{ borderBottom: '1px solid #000', minWidth: 100 }}>____ / ____ / ________</Typography>
                </Box>
              </Box>
            </Box>

            <Table sx={{ 
              '& .MuiTableCell-root': { 
                border: '1px solid #000',
                padding: '4px 8px',
                fontSize: '0.8rem'
              }
            }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
                  <TableCell sx={{ width: 30, fontWeight: 800, textAlign: 'center' }}>#</TableCell>
                  {selectedFields.map(field => (
                    <TableCell key={field.id} sx={{ fontWeight: 800, textTransform: 'uppercase', textAlign: 'center' }}>
                      {field.selectedAlias}
                    </TableCell>
                  ))}
                  <TableCell sx={{ fontWeight: 800, width: 150, textAlign: 'center' }}>OBSERVACIONES</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.from({ length: rowCount }).map((_, index) => (
                  <TableRow key={index} sx={{ height: 26 }}>
                    <TableCell sx={{ color: '#000', textAlign: 'center', fontSize: '0.7rem', fontWeight: 600 }}>{index + 1}</TableCell>
                    {selectedFields.map(field => (
                      <TableCell key={field.id}></TableCell>
                    ))}
                    <TableCell></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Print Footer */}
            <Box sx={{ mt: 6, pt: 2, borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ color: '#aaa', fontStyle: 'italic' }}>
                ID Documento: {Math.random().toString(36).substr(2, 9).toUpperCase()} • Sincronizado con Jhoangel AI
              </Typography>
              <Typography variant="caption" sx={{ color: '#aaa', fontWeight: 600 }}>
                HOJA 1 DE 1
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Print-specific Styles */}
      <style>{`
        @media print {
          body {
            background-color: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-area {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
          .MuiContainer-root {
            max-width: none !important;
            padding: 0 !important;
          }
          header, footer, .MuiBox-root:has(header), .MuiBox-root:has(footer) {
            display: none !important;
          }
          @page {
            size: portrait;
            margin: 0.8cm;
          }
        }
      `}</style>
    </Box>
  );
};

export default TemplateGenerator;
