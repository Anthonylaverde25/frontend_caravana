import { Container, Box, Tabs, Tab } from '@mui/material';
import { useState } from 'react';
import AssessmentIcon from '@mui/icons-material/Assessment';
import GridOnIcon from '@mui/icons-material/GridOn';
import StorageIcon from '@mui/icons-material/Storage';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ViewHeader from 'src/components/ViewHeader';
import UploadSection from '../UploadSection';
import TemplateGenerator from '../TemplateGenerator';
import CaravanDataTable from '../CaravanDataTable';
import MockWorkdayLedger from './MockWorkdayLedger';

function LivestockView() {
	const [activeTab, setActiveTab] = useState(0);

	const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
		setActiveTab(newValue);
	};

	const titles = ['Analizador Documental AI', 'Historial de Jornadas', 'Base de Datos Ganadera', 'Generador de Planillas'];

	const descriptions = [
		'Importa tus planillas de campo, archivos locales o almacenamiento en la nube para procesamiento automático con Azure y Google AI.',
		'Audita y consulta el registro histórico de todas las sesiones de trabajo y los animales procesados en ellas.',
		'Visualiza y gestiona todos tus registros de animales procesados y guardados en el sistema.',
		'Configura y genera planillas en blanco profesionales listas para imprimir y llevar al campo.'
	];

	return (
		<Container
			maxWidth="xl"
			sx={{ 
				py: 4, 
				display: 'flex', 
				flexDirection: 'column', 
				width: '100%', 
				px: { xs: 2, md: 6 } 
			}}
		>
			<ViewHeader
				title={titles[activeTab]}
				subtitle={descriptions[activeTab]}
			/>

			<Box
				className="no-print"
				sx={{ mb: 6 }}
			>
				<Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
					<Tabs
						value={activeTab}
						onChange={handleTabChange}
						variant="scrollable"
						scrollButtons="auto"
						aria-label="workspace categories"
					>
						<Tab
							icon={<AssessmentIcon />}
							iconPosition="start"
							label="Analizador OCR"
						/>
						<Tab
							icon={<EventNoteIcon />}
							iconPosition="start"
							label="Historial de Jornadas"
						/>
						<Tab
							icon={<StorageIcon />}
							iconPosition="start"
							label="Registros"
						/>
						<Tab
							icon={<GridOnIcon />}
							iconPosition="start"
							label="Generador de Planillas"
						/>
					</Tabs>
				</Box>
			</Box>

			<Box sx={{ mt: 2 }}>
				{activeTab === 0 && <UploadSection />}
				{activeTab === 1 && <MockWorkdayLedger />}
				{activeTab === 2 && <CaravanDataTable />}
				{activeTab === 3 && <TemplateGenerator />}
			</Box>
		</Container>
	);
}

export default LivestockView;
