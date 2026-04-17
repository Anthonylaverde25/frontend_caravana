import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControlLabel,
  Checkbox,
  Button,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  TextField
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { Field } from '../types/template.types';

interface TemplateConfigSidebarProps {
  fields: Field[];
  availableMappings: Record<string, string[]>;
  rowCount: number;
  onToggleField: (id: string) => void;
  onAliasChange: (id: string, alias: string) => void;
  onRowCountChange: (val: number) => void;
  onPrint: () => void;
  onReset: () => void;
  isPrintDisabled: boolean;
}

const TemplateConfigSidebar: React.FC<TemplateConfigSidebarProps> = ({
  fields,
  availableMappings,
  rowCount,
  onToggleField,
  onAliasChange,
  onRowCountChange,
  onPrint,
  onReset,
  isPrintDisabled
}) => {
  return (
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
      <Card 
        variant="outlined" 
        sx={{ 
          borderRadius: '8px', 
          border: '1px solid #d8dde6',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          bgcolor: '#ffffff'
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#32363a', fontSize: '1.1rem' }}>
              Configuración
            </Typography>
            <Tooltip title="Restablecer">
              <IconButton 
                size="small" 
                onClick={onReset}
                sx={{ color: '#0a6ed1' }}
              >
                <RestartAltIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Typography variant="body2" sx={{ color: '#6a6d70', mb: 3, fontWeight: 500 }}>
            Personaliza las columnas y alias para tu planilla de campos.
          </Typography>

          <Divider sx={{ mb: 3, borderColor: '#d8dde6' }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {fields.map(field => (
              <Box key={field.id} sx={{
                p: 1.5,
                borderRadius: '6px',
                border: '1px solid',
                borderColor: field.checked ? '#0a6ed1' : '#d8dde6',
                bgcolor: field.checked ? '#eff4f9' : 'transparent',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  borderColor: '#0a6ed1',
                }
              }}>
                <FormControlLabel
                  sx={{ margin: 0, width: '100%' }}
                  control={
                    <Checkbox
                      size="small"
                      checked={field.checked}
                      onChange={() => onToggleField(field.id)}
                      sx={{ 
                        color: '#d8dde6',
                        '&.Mui-checked': { color: '#0a6ed1' }
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#32363a' }}>
                      {field.label}
                    </Typography>
                  }
                />

                {field.checked && availableMappings[field.id] && (
                  <FormControl fullWidth size="small" sx={{ mt: 1.5 }}>
                    <Select
                      value={field.selectedAlias}
                      onChange={(e) => onAliasChange(field.id, e.target.value as string)}
                      variant="outlined"
                      sx={{ 
                        fontSize: '0.8rem', 
                        bgcolor: '#ffffff',
                        fontWeight: 500,
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#d8dde6' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#0a6ed1' },
                        height: 36
                      }}
                    >
                      {availableMappings[field.id].map(alias => (
                        <MenuItem key={alias} value={alias} sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
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
            <FormControl fullWidth size="small">
              <InputLabel sx={{ fontSize: '0.85rem' }}>Filas a Imprimir</InputLabel>
              <Select
                value={rowCount}
                label="Filas a Imprimir"
                variant="outlined"
                onChange={(e) => onRowCountChange(e.target.value as number)}
                sx={{ 
                  height: 40, 
                  bgcolor: '#f7f7f7',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#d8dde6' }
                }}
              >
                {[15, 25, 40, 50, 75, 100].map(val => (
                  <MenuItem key={val} value={val} sx={{ fontWeight: 500 }}>{val} Filas</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ textAlign: 'center', p: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Desarrollado con Ingeniería AI
        </Typography>
      </Box>
    </Box>
  );
};

export default TemplateConfigSidebar;
