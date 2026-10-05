import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { ZOOTECHNICAL_CATALOG } from '../../data/zootechnicalLibraryData';

interface WorkTemplateSheetThumbnailProps {
	code: string;
	title: string;
	isArchived?: boolean;
}

interface TemplateDocumentDefinition {
	officialTitle: string;
	headerBoxes: Array<{ label: string; value: string }>;
	columns: string[];
	footerNotes?: string;
}

const DOCUMENT_DEFINITIONS: Record<string, TemplateDocumentDefinition> = {
	'TOR-01': {
		officialTitle: 'REVISACIÓN ANDROLÓGICA Y MUESTREO EN MANGA',
		headerBoxes: [
			{ label: 'ESTABLECIMIENTO', value: 'Campo Central' },
			{ label: 'RENSPA', value: '01.002.0.00123/00' },
			{ label: 'VETERINARIO MP', value: 'Dr. Actuante — MP 4821' },
			{ label: 'RONDA RASPAJE', value: '[ 1 ]  [ 2 ]' }
		],
		columns: ['ORD', 'CARAVANA', 'CE (cm)', 'CC', 'LÍBIDO', 'APLOMOS', 'ETS', 'SEROL.', 'DICTAMEN'],
		footerNotes: 'Umbral CE mínimo: 28.0 cm • Diagnóstico ETS por duplicado'
	},
	'LSER-01': {
		officialTitle: 'CONFORMACIÓN DE LOTE DE SERVICIO — TORO ÚNICO',
		headerBoxes: [
			{ label: 'TORO PADRILLO ASIGNADO', value: 'TR-104 (Angus Negro)' },
			{ label: 'LOTE DE ENTORE', value: 'Potrero 4 — Vaquillonas' },
			{ label: 'FECHA INICIO', value: '15 / 10 / 2026' },
			{ label: 'CARGA ESTIMADA', value: '3.2 % (1 Toro / 31 Vientres)' }
		],
		columns: ['ORD', 'CARAVANA DEL VIENTRE', 'CATEGORÍA', 'COND. CORP.', 'OBSERVACIONES'],
		footerNotes: 'Asignación uniparental con fecha fija de inicio y retiro'
	},
	'MON-01': {
		officialTitle: 'SERVICIO DE MONTA Y ENTORE A CAMPO',
		headerBoxes: [
			{ label: 'LOTE DE REPRODUCCIÓN', value: 'Rodeo General de Cría' },
			{ label: 'MODALIDAD', value: '[ Colectivo ]  [ Rotación ]' },
			{ label: 'INICIO PLANIFICADO', value: '01 / 11 / 2026' }
		],
		columns: ['ORD', 'CARAVANA VIENTRE', 'CATEGORÍA', 'CC (1-5)', 'TORO DETECTADO', 'FECHA MONTA', 'OBS.'],
		footerNotes: 'Registro de condición corporal y detección de servicio'
	},
	'REP-01': {
		officialTitle: 'PLANILLA DE TACTO Y ECOGRAFÍA RECTAL',
		headerBoxes: [
			{ label: 'ESTABLECIMIENTO', value: 'La Rinconada' },
			{ label: 'RODEO / LOTE', value: 'Vientres Primavera' },
			{ label: 'DIAGNÓSTICO', value: '60 días post-servicio' },
			{ label: 'VETERINARIO', value: 'Ecografía Doppler' }
		],
		columns: ['ORD', 'CARAVANA', 'CATEGORÍA', 'DIAGNÓSTICO', 'ESTADIO FETAL', 'COND. UTERINA', 'OBSERVACIONES'],
		footerNotes: 'Clasificación de gestación: Cabeza / Cuerpo / Cola / Vacía CUT'
	},
	'PAR-01': {
		officialTitle: 'PLANILLA OFICIAL DE PARICIÓN Y MATERNIDAD',
		headerBoxes: [
			{ label: 'ORDEN PARICIÓN', value: 'PA-20261001-0042' },
			{ label: 'POTRERO MATERNIDAD', value: 'Lote 12 — Parición' },
			{ label: 'FECHA RECORRIDA', value: '28 / 09 / 2026' }
		],
		columns: ['ORD', 'MADRE', 'PARIÓ', 'MUERTO', 'ABORTO', 'CRÍA', 'SEXO', 'PESO', 'FECHA', 'F/O'],
		footerNotes: 'Control de distocias, peso al nacer y filiación materna directa'
	},
	'DEST-01': {
		officialTitle: 'DESTETE Y CONFORMACIÓN DE LOTE DE DESTETE',
		headerBoxes: [
			{ label: 'ORDEN DESTETE', value: 'DS-20260415-0018' },
			{ label: 'LOTE DESTETE DESTINO', value: 'Recría 2026' },
			{ label: 'SISTEMA MANEJO', value: '[ CORRAL ]  [ PASTURA ]' },
			{ label: 'TIPO DESTETE', value: '[ Tradicional ] [ Anticipado ] [ Precoz ]' }
		],
		columns: ['ORD', 'CRÍA', 'MADRE', 'C/S ACT.', 'C/S NUEVA', 'PESO (KG)', 'LOTE DESTINO', 'M', 'OBS.'],
		footerNotes: 'Desmadre zootécnico: corte de lactancia y pesaje individual'
	},
	'CACT-01': {
		officialTitle: 'CAMBIO DE ACTIVIDAD DE HACIENDA',
		headerBoxes: [
			{ label: 'ACTIVIDAD ORIGEN', value: 'Recría Pastoril' },
			{ label: 'ACTIVIDAD DESTINO', value: 'Invernada / Feedlot' },
			{ label: 'LOTE ORIGEN', value: 'Lote 104' },
			{ label: 'SISTEMA', value: '[ CORRAL ]  [ PASTURA ]' }
		],
		columns: ['ORD', 'CARAVANA', 'PESO BALANZA', 'M', 'H', 'CATEGORÍA', 'C/S NUEVA', 'DIENTES', 'LOTE DESTINO', 'M'],
		footerNotes: 'Transición productiva con pesaje balanza de entrada y dentición'
	},
	'OP-01': {
		officialTitle: 'CONTROL MENSUAL DE LOTES — PESAJE DE RUTINA',
		headerBoxes: [
			{ label: 'LOTE EN RECRÍA', value: 'Novillitos Lote 8' },
			{ label: 'FECHA PESAJE', value: 'Mensual de Control' },
			{ label: 'BALANZA MANGA', value: 'Electrónica Tru-Test' }
		],
		columns: ['ORD', 'CARAVANA / ID', 'CATEGORÍA', 'PESO BALANZA (KG)', 'GANANCIA DIARIA (GDPV)', 'COND. CORP.', 'OBS.'],
		footerNotes: 'Cálculo de GDPV para ajuste de carga forrajera y suplementación'
	},
	'ING-01': {
		officialTitle: 'INGRESO DE COMPRA DIRECTA EN MANGA',
		headerBoxes: [
			{ label: 'PROVEEDOR', value: 'Cabaña Don Roberto' },
			{ label: 'DTE / GUÍA TRASLADO', value: 'DTE-9812-40192' },
			{ label: 'LOTE PROPIO DESTINO', value: 'Cuarentena Norte' }
		],
		columns: ['ORD', 'CARAVANA / BOTÓN', 'CATEGORÍA', 'SEXO', 'RAZA / PELAJE', 'DENTICIÓN', 'PESO (KG)', 'OBS.'],
		footerNotes: 'Alta oficial en manga con verificación sanitaria y de dentición'
	},
	'ING-02': {
		officialTitle: 'ORDEN DE INGRESO DE HACIENDA EXTERNA',
		headerBoxes: [
			{ label: 'VENDEDOR / CONSIGNATARIA', value: 'Remate Feria Ganadera' },
			{ label: 'TOTAL CABEZAS', value: '140 Cabezas' },
			{ label: 'DESBASTE TRANSPORTE', value: '3.5 %' },
			{ label: 'SABE COMER', value: '[ X ] SI   [  ] NO' },
			{ label: 'GARRAPATA', value: '[ X ] LIMPIO' }
		],
		columns: ['ORD', 'RAZA / BIOTIPO', 'PELAJE', 'CANTIDAD', 'PESO PROM. (KG)', 'ESTADO', 'OBSERVACIONES'],
		footerNotes: 'Recepción comercial de compra de tropas antes de caravaneación'
	},
	'OP-02': {
		officialTitle: 'TRANSFERENCIA A INVERNADA [PLANILLA HISTÓRICA]',
		headerBoxes: [
			{ label: 'LOTE ORIGEN', value: 'Recría Histórica' },
			{ label: 'LOTE DESTINO', value: 'Invernada' },
			{ label: 'ESTADO', value: 'Reemplazada por CACT-01' }
		],
		columns: ['ORD', 'CARAVANA / ID', 'CATEGORÍA', 'LOTE SALIENTE', 'LOTE ENTRANTE', 'OBSERVACIONES'],
		footerNotes: 'Planilla archivada conservada para auditoría histórica'
	}
};

export const WorkTemplateSheetThumbnail: React.FC<WorkTemplateSheetThumbnailProps> = ({
	code,
	title,
	isArchived
}) => {
	const meta = ZOOTECHNICAL_CATALOG[code];
	const doc = DOCUMENT_DEFINITIONS[code] || {
		officialTitle: title.toUpperCase(),
		headerBoxes: [
			{ label: 'ESTABLECIMIENTO', value: 'Establecimiento Agropecuario' },
			{ label: 'FECHA', value: '__ / __ / ____' }
		],
		columns: ['ORD', 'CARAVANA / ID', 'CATEGORÍA', 'PESO (KG)', 'OBSERVACIONES'],
		footerNotes: 'Planilla de Registro Operativo de Manga'
	};

	const accentColor = meta?.stageColor || '#374151';

	return (
		<Box
			sx={{
				width: '100%',
				height: 250,
				position: 'relative',
				bgcolor: '#f8fafc',
				p: 1.5,
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				overflow: 'hidden',
				borderBottom: '1px solid',
				borderColor: 'divider',
				borderTopLeftRadius: '12px',
				borderTopRightRadius: '12px'
			}}
		>
			{/* Simulated A4 Sheet Container */}
			<Box
				sx={{
					width: '92%',
					height: '94%',
					bgcolor: '#ffffff',
					borderRadius: '3px',
					boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0,0,0,0.06)',
					border: '1px solid #d1d5db',
					p: 1.25,
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'space-between',
					opacity: isArchived ? 0.65 : 1,
					position: 'relative',
					userSelect: 'none',
					pointerEvents: 'none'
				}}
			>
				{/* Watermark in background */}
				<Box
					sx={{
						position: 'absolute',
						top: '52%',
						left: '50%',
						transform: 'translate(-50%, -50%) rotate(-12deg)',
						color: 'rgba(0, 0, 0, 0.035)',
						fontWeight: 900,
						fontSize: '2.8rem',
						fontFamily: 'monospace',
						letterSpacing: '0.15em',
						whiteSpace: 'nowrap',
						zIndex: 0
					}}
				>
					{code}
				</Box>

				{/* 1. Sheet Header Banner */}
				<Box sx={{ borderBottom: `2px solid ${accentColor}`, pb: 0.75, zIndex: 1 }}>
					<Stack direction="row" justifyContent="space-between" alignItems="flex-start">
						<Box sx={{ maxWidth: '75%' }}>
							<Typography
								sx={{
									fontSize: '0.45rem',
									fontWeight: 800,
									color: 'text.secondary',
									letterSpacing: '0.08em',
									textTransform: 'uppercase',
									lineHeight: 1
								}}
							>
								ESTABLECIMIENTO GANADERO • PLANILLA DE CAMPO
							</Typography>
							<Typography
								sx={{
									fontSize: '0.62rem',
									fontWeight: 900,
									color: '#0f172a',
									lineHeight: 1.15,
									mt: 0.25,
									letterSpacing: '-0.01em',
									overflow: 'hidden',
									textOverflow: 'ellipsis',
									whiteSpace: 'nowrap'
								}}
							>
								{doc.officialTitle}
							</Typography>
						</Box>

						{/* Code Stamp Box */}
						<Box
							sx={{
								border: `1.5px solid ${accentColor}`,
								borderRadius: '3px',
								px: 0.75,
								py: 0.2,
								bgcolor: `${accentColor}10`,
								textAlign: 'center'
							}}
						>
							<Typography
								sx={{
									fontSize: '0.52rem',
									fontWeight: 900,
									fontFamily: 'monospace',
									color: accentColor,
									letterSpacing: '0.05em',
									lineHeight: 1
								}}
							>
								{code}
							</Typography>
						</Box>
					</Stack>
				</Box>

				{/* 2. Metadata Field Boxes */}
				<Box sx={{ my: 0.5, zIndex: 1 }}>
					<Stack direction="row" spacing={0.5} sx={{ width: '100%' }}>
						{doc.headerBoxes.slice(0, 3).map((box, i) => (
							<Box
								key={i}
								sx={{
									flex: 1,
									border: '1px solid #cbd5e1',
									borderRadius: '2px',
									p: 0.35,
									bgcolor: '#f8fafc'
								}}
							>
								<Typography sx={{ fontSize: '0.38rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', lineHeight: 1 }}>
									{box.label}
								</Typography>
								<Typography
									sx={{
										fontSize: '0.46rem',
										fontWeight: 700,
										color: '#1e293b',
										lineHeight: 1.2,
										mt: 0.2,
										overflow: 'hidden',
										textOverflow: 'ellipsis',
										whiteSpace: 'nowrap'
									}}
								>
									{box.value}
								</Typography>
							</Box>
						))}
					</Stack>
				</Box>

				{/* 3. Sheet Ruled Table (Manga Grid Simulation) */}
				<Box
					sx={{
						border: '1px solid #0f172a',
						borderRadius: '1px',
						overflow: 'hidden',
						flexGrow: 1,
						my: 0.25,
						bgcolor: '#ffffff',
						display: 'flex',
						flexDirection: 'column',
						zIndex: 1
					}}
				>
					{/* Table Column Header */}
					<Box
						sx={{
							display: 'flex',
							bgcolor: '#0f172a',
							color: '#ffffff',
							py: 0.3,
							px: 0.25,
							borderBottom: '1px solid #0f172a'
						}}
					>
						{doc.columns.map((col, idx) => (
							<Box
								key={idx}
								sx={{
									flex: idx === 0 ? '0 0 16px' : idx === 1 ? '1 1 28%' : 1,
									textAlign: idx === 0 ? 'center' : 'left',
									px: 0.25,
									overflow: 'hidden',
									textOverflow: 'ellipsis',
									whiteSpace: 'nowrap'
								}}
							>
								<Typography sx={{ fontSize: '0.4rem', fontWeight: 900, letterSpacing: '0.02em' }}>
									{col}
								</Typography>
							</Box>
						))}
					</Box>

					{/* 5 Ruled Rows */}
					<Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
						{[1, 2, 3, 4, 5].map((rowNum) => (
							<Box
								key={rowNum}
								sx={{
									display: 'flex',
									borderBottom: rowNum === 5 ? 'none' : '1px solid #e2e8f0',
									py: 0.25,
									px: 0.25,
									alignItems: 'center'
								}}
							>
								<Typography
									sx={{
										flex: '0 0 16px',
										fontSize: '0.38rem',
										fontWeight: 700,
										color: '#94a3b8',
										textAlign: 'center'
									}}
								>
									{rowNum}
								</Typography>
								{doc.columns.slice(1).map((_, cIdx) => (
									<Box
										key={cIdx}
										sx={{
											flex: cIdx === 0 ? '1 1 28%' : 1,
											borderLeft: '1px dotted #e2e8f0',
											height: '8px',
											mx: 0.2
										}}
									/>
								))}
							</Box>
						))}
					</Box>
				</Box>

				{/* 4. Sheet Footer: Signatures & Rules */}
				<Box sx={{ borderTop: '1px solid #cbd5e1', pt: 0.4, zIndex: 1 }}>
					<Stack direction="row" justifyContent="space-between" alignItems="center">
						<Typography sx={{ fontSize: '0.36rem', fontWeight: 600, color: '#64748b', fontStyle: 'italic' }}>
							{doc.footerNotes || 'Planilla oficial de registro zootécnico en manga.'}
						</Typography>
						<Typography sx={{ fontSize: '0.36rem', fontWeight: 700, color: '#0f172a' }}>
							Firma y Sello Responsable: ____________________
						</Typography>
					</Stack>
				</Box>
			</Box>
		</Box>
	);
};

export default WorkTemplateSheetThumbnail;
