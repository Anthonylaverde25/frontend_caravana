import React, { useState, useEffect, useRef } from 'react';
import { Box, CircularProgress, Button, Stack } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import axiosInstance from '@/utils/axios';
import { useReactToPrint } from 'react-to-print';
// @ts-ignore - html2pdf handles its own loading or requires manual type declaration
import html2pdf from 'html2pdf.js';
import ViewLayout from 'src/components/ViewLayout';
import { Field, Mapping } from './types/template.types';
import TemplateConfigSidebar from './components/TemplateConfigSidebar';
import TemplatePreview from './components/TemplatePreview';
import TemplateHeader from './components/TemplateHeader';

/**
 * TemplateGenerator Component
 * Tool for creating and printing field data collection sheets.
 * Standardized using ViewLayout for consistent industrial workspace.
 */
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
	const [renspa, setRenspa] = useState('');
	const [selectedProviderId, setSelectedProviderId] = useState<number | undefined>();
	const [selectedFarmId, setSelectedFarmId] = useState<number | undefined>();

	useEffect(() => {
		axiosInstance
			.get('/field-mappings/caravans')
			.then((response) => {
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

					setFields((prev) =>
						prev.map((f) => ({
							...f,
							selectedAlias: grouped[f.id]?.[0] || f.selectedAlias,
						}))
					);
				}
				setLoading(false);
			})
			.catch((err) => {
				console.error('Error fetching mappings:', err);
				setLoading(false);
			});
	}, []);

	const handleToggle = (id: string) => {
		setFields(fields.map((f) => (f.id === id ? { ...f, checked: !f.checked } : f)));
	};

	const handleAliasChange = (id: string, alias: string) => {
		setFields(fields.map((f) => (f.id === id ? { ...f, selectedAlias: alias } : f)));
	};

	const resetFields = () => {
		setFields((prev) =>
			prev.map((f) => ({
				...f,
				checked: ['identification', 'category', 'teeth', 'breed', 'entry_weight'].includes(f.id),
			}))
		);
	};

	// Configuración de react-to-print para impresión aislada
	const handlePrint = useReactToPrint({
		contentRef: componentRef,
		documentTitle: 'Planilla_De_Campo_Jhoangel',
		pageStyle: `
      @page { size: portrait; margin: 5mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; }
      }
    `,
	});

	// Función para descarga automática de PDF (Sin diálogo de impresión)
	const handleDownload = () => {
		const element = componentRef.current;
		if (!element) return;

		// Configuración de alta fidelidad para el PDF
		const opt = {
			margin: [5, 5, 5, 5], // 5mm de márgenes
			filename: `Planilla_${establishment.replace(/\s+/g, '_') || 'Campo'}.pdf`,
			image: { type: 'jpeg', quality: 0.98 },
			html2canvas: {
				scale: 3,
				useCORS: true,
				letterRendering: true,
				logging: false,
			},
			jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
		};

		// Ejecutar generación y descarga
		html2pdf().set(opt).from(element).save();
	};

	const selectedFields = fields.filter((f) => f.checked);

	if (loading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<ViewLayout
			title="Generador de Planillas de Campo"
			subtitle="Diseñe y exporte documentos A4 optimizados para la toma de datos offline en el establecimiento."
			actions={
				<Stack
					direction="row"
					spacing={2}
				>
					<Button
						variant="outlined"
						startIcon={<DownloadIcon />}
						onClick={handleDownload}
						disabled={selectedFields.length === 0}
						sx={{
							borderColor: '#0a6ed1',
							color: '#0a6ed1',
							fontWeight: 700,
							textTransform: 'none',
							px: 3,
							'&:hover': {
								borderColor: '#0854a1',
								bgcolor: '#eff4f9',
							},
						}}
					>
						Descargar PDF
					</Button>
					<Button
						variant="contained"
						startIcon={<PrintIcon />}
						onClick={handlePrint}
						disabled={selectedFields.length === 0}
						sx={{
							bgcolor: '#0a6ed1',
							color: '#fff',
							fontWeight: 700,
							textTransform: 'none',
							px: 3,
							'&:hover': {
								bgcolor: '#0854a1',
							},
							'&.Mui-disabled': {
								bgcolor: '#d8dde6',
								color: '#999',
							},
						}}
					>
						Imprimir Planilla
					</Button>
				</Stack>
			}
		>
			<Box>
				<TemplateHeader
					selectedProviderId={selectedProviderId}
					selectedFarmId={selectedFarmId}
					onProviderChange={(id, val) => {
						setSelectedProviderId(id);
						setCuit(val);
					}}
					onFarmChange={(id, name, rs) => {
						setSelectedFarmId(id);
						setEstablishment(name);
						setRenspa(rs);
					}}
				/>

				<Box
					sx={{
						display: 'flex',
						flexDirection: { xs: 'column', md: 'row' },
						gap: 4,
						alignItems: 'flex-start',
					}}
				>
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
						renspa={renspa}
						selectedFields={selectedFields}
						rowCount={rowCount}
					/>
				</Box>
			</Box>
		</ViewLayout>
	);
};

export default TemplateGenerator;
