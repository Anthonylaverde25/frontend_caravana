import React, { useState, useEffect, useRef } from 'react';
import { Box, CircularProgress } from '@mui/material';
import axiosInstance from '@/lib/axiosInstance';
import { useReactToPrint } from 'react-to-print';
import { Field, Mapping } from './types/template.types';
import TemplateConfigSidebar from './components/TemplateConfigSidebar';
import TemplatePreview from './components/TemplatePreview';
import TemplateHeader from './components/TemplateHeader';

const TemplateGenerator: React.FC = () => {
  const componentRef = useRef<HTMLDivElement>(null);

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
  const [cuit, setCuit] = useState('');
  const [selectedProviderId, setSelectedProviderId] = useState<number | undefined>();
  const [selectedFarmId, setSelectedFarmId] = useState<number | undefined>();

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

  // Configuración de react-to-print para impresión aislada
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'Planilla_De_Campo_Jhoangel',
    pageStyle: `
      @page { size: portrait; margin: 10mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; }
      }
    `
  });

  const selectedFields = fields.filter(f => f.checked);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{
      width: '100%',
      mt: 2,
      bgcolor: '#f2f5f9',
      p: { xs: 2, md: 3 },
      borderRadius: '12px',
      border: '1px solid #d8dde6'
    }}>
      <TemplateHeader
        selectedProviderId={selectedProviderId}
        selectedFarmId={selectedFarmId}
        onProviderChange={(id, val) => {
          setSelectedProviderId(id);
          setCuit(val);
        }}
        onFarmChange={(id, name) => {
          setSelectedFarmId(id);
          setEstablishment(name);
        }}
      />

      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 4,
        alignItems: 'flex-start'
      }}>

        <TemplateConfigSidebar
          fields={fields}
          availableMappings={availableMappings}
          rowCount={rowCount}
          onToggleField={handleToggle}
          onAliasChange={handleAliasChange}
          onRowCountChange={setRowCount}
          onPrint={handlePrint}
          onReset={resetFields}
          isPrintDisabled={selectedFields.length === 0}
        />

        <TemplatePreview
          ref={componentRef}
          establishment={establishment}
          cuit={cuit}
          selectedFields={selectedFields}
          rowCount={rowCount}
        />

      </Box>

      {/* Print-specific Styles */}

    </Box>
  );
};

export default TemplateGenerator;
