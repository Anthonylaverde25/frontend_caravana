'use client';

import { useState, useMemo } from 'react';
import { useSnackbar } from 'notistack';
import {
	Box,
	Typography,
	Paper,
	Stack,
	Card,
	CardContent,
	Chip,
	Button,
	Tabs,
	Tab,
	Avatar,
	Tooltip,
	alpha,
} from '@mui/material';
import ViewLayout from 'src/components/ViewLayout';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ReactECharts from 'echarts-for-react';
import DataTable from 'src/components/data-table/DataTable';
import { MRT_ColumnDef } from 'material-react-table';
import PendingSiresWidget from 'src/ui/dashboard/widgets/PendingSiresWidget';

// Interface definitions for our mock dashboard data
interface QuarantineCaravan {
	id: string;
	tag: string;
	entryDate: string;
	diagnosis: string;
	severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
	daysIsolated: number;
}

interface ConsumptionCaravan {
	id: string;
	tag: string;
	assignDate: string;
	weight: number;
	destination: string;
	status: string;
}

interface DeathCaravan {
	id: string;
	tag: string;
	deathDate: string;
	cause: string;
	diagnosedBy: string;
	status: string;
}

/**
 * Static mock database simulating internal batch caravans
 */
const MOCK_QUARANTINE_DATA: QuarantineCaravan[] = [
	{ id: 'AR-10024', tag: '10024', entryDate: '2026-05-18', diagnosis: 'Fiebre extrema (41.2°C) y decaimiento agudo', severity: 'CRITICAL', daysIsolated: 3 },
	{ id: 'AR-09822', tag: '09822', entryDate: '2026-05-20', diagnosis: 'Sintomatología respiratoria, disnea y tos seca', severity: 'HIGH', daysIsolated: 1 },
	{ id: 'AR-10543', tag: '10543', entryDate: '2026-05-19', diagnosis: 'Cojera grado 4 en miembro posterior izquierdo', severity: 'MEDIUM', daysIsolated: 2 },
	{ id: 'AR-10901', tag: '10901', entryDate: '2026-05-21', diagnosis: 'Aislamiento preventivo post-parto distócico', severity: 'LOW', daysIsolated: 0 },
];

const MOCK_CONSUMPTION_DATA: ConsumptionCaravan[] = [
	{ id: 'AR-08240', tag: '08240', assignDate: '2026-05-10', weight: 415.5, destination: 'Personal de Campo (Sector Norte)', status: 'Listo para faena' },
	{ id: 'AR-08912', tag: '08912', assignDate: '2026-05-12', weight: 398.2, destination: 'Casino Central de Empleados', status: 'Listo para faena' },
	{ id: 'AR-09122', tag: '09122', assignDate: '2026-05-15', weight: 380.0, destination: 'Premio Especial de Fin de Mes', status: 'En engorde final' },
];

const MOCK_DEATH_DATA: DeathCaravan[] = [
	{ id: 'AR-07412', tag: '07412', deathDate: '2026-05-02', cause: 'Timpanismo agudo espumoso', diagnosedBy: 'Vet. Carlos Gómez', status: 'Acta Firmada' },
	{ id: 'AR-06991', tag: '06991', deathDate: '2026-05-08', cause: 'Traumatismo severo (caída en manga)', diagnosedBy: 'Vet. Carlos Gómez', status: 'Acta Firmada' },
	{ id: 'AR-08815', tag: '08815', deathDate: '2026-05-15', cause: 'Neumonía enzoótica bovina', diagnosedBy: 'Vet. Sofía Martínez', status: 'Acta Pendiente' },
];

/**
 * DashboardView Component
 * Renders an interactive analytical panel showcasing internal batches distribution,
 * with static data and a prominent quarantine alarm system.
 */
function DashboardView() {
	const { enqueueSnackbar } = useSnackbar();
	const [activeTab, setActiveTab] = useState(0);

	// Common spreadsheet properties for Material React Table
	const spreadsheetProps = useMemo(() => ({
		enableColumnBorders: true,
		enableRowBorders: true,
		muiTableProps: {
			sx: {
				border: '1px solid',
				borderColor: 'divider',
			},
		},
		muiTableHeadCellProps: {
			sx: {
				borderRight: '1px solid',
				borderBottom: '2px solid',
				borderColor: 'divider',
				backgroundColor: 'action.hover',
				fontWeight: 800,
				fontSize: '0.75rem',
				p: '6px 8px',
			},
		},
		muiTableBodyCellProps: {
			sx: {
				borderRight: '1px solid',
				borderBottom: '1px solid',
				borderColor: 'divider',
				fontSize: '0.75rem',
				p: '6px 8px',
			},
		},
	}), []);

	// Handler to simulate action triggers
	const handleActionClick = (actionName: string, caravanTag: string) => {
		enqueueSnackbar(`Simulación: Acción [${actionName}] ejecutada con éxito para Caravana #${caravanTag}`, {
			variant: 'success',
			autoHideDuration: 3000,
		});
	};

	// Determine severity chip colors with compact spreadsheet height
	const getSeverityChip = (severity: QuarantineCaravan['severity']) => {
		switch (severity) {
			case 'CRITICAL':
				return <Chip label="CRÍTICO" size="small" sx={{ bgcolor: '#fee2e2', color: '#dc2626', fontWeight: 700, height: 18, fontSize: '0.65rem' }} />;
			case 'HIGH':
				return <Chip label="ALTO" size="small" sx={{ bgcolor: '#ffedd5', color: '#ea580c', fontWeight: 700, height: 18, fontSize: '0.65rem' }} />;
			case 'MEDIUM':
				return <Chip label="MEDIO" size="small" sx={{ bgcolor: '#fef9c3', color: '#ca8a04', fontWeight: 700, height: 18, fontSize: '0.65rem' }} />;
			case 'LOW':
				return <Chip label="BAJO" size="small" sx={{ bgcolor: '#f0fdf4', color: '#16a34a', fontWeight: 700, height: 18, fontSize: '0.65rem' }} />;
			default:
				return <Chip label="BAJO" size="small" sx={{ height: 18, fontSize: '0.65rem' }} />;
		}
	};

	// 1. Data for Monthly Distribution Chart
	const monthlyData = useMemo(() => {
		return {
			months: ['Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May'],
			quarantine: [5, 8, 4, 7, 9, MOCK_QUARANTINE_DATA.length],
			consumption: [2, 3, 2, 4, 3, MOCK_CONSUMPTION_DATA.length],
			deaths: [1, 2, 1, 3, 2, MOCK_DEATH_DATA.length],
		};
	}, []);

	// 2. Options for Monthly Distribution Chart (Grouped Bars)
	const monthlyChartOptions = useMemo(() => {
		return {
			grid: {
				top: 40,
				right: 15,
				bottom: 25,
				left: 30,
				containLabel: true,
			},
			legend: {
				top: 0,
				icon: 'rect',
				itemWidth: 10,
				itemHeight: 10,
				textStyle: {
					fontWeight: 600,
					color: '#64748b',
					fontSize: '0.75rem',
				}
			},
			tooltip: {
				trigger: 'axis',
				backgroundColor: 'rgba(255, 255, 255, 0.98)',
				borderWidth: 1,
				borderColor: '#e2e8f0',
				textStyle: { color: '#1e293b', fontSize: 11 },
				axisPointer: { type: 'shadow' }
			},
			xAxis: {
				type: 'category',
				data: monthlyData.months,
				axisLine: { lineStyle: { color: '#cbd5e1' } },
				axisLabel: { color: '#64748b', fontWeight: 600, fontSize: 10 }
			},
			yAxis: {
				type: 'value',
				splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } },
				axisLabel: { color: '#64748b', fontWeight: 600, fontSize: 10 }
			},
			series: [
				{
					name: 'Cuarentena',
					type: 'bar',
					barWidth: '22%',
					color: '#0a6ed1',
					data: monthlyData.quarantine,
				},
				{
					name: 'Consumo Interno',
					type: 'bar',
					barWidth: '22%',
					color: '#188351',
					data: monthlyData.consumption,
				},
				{
					name: 'Bajas',
					type: 'bar',
					barWidth: '22%',
					color: '#d32f2f',
					data: monthlyData.deaths,
				}
			],
			animationDuration: 1000,
		};
	}, [monthlyData]);

	// 3. Options for Distribution of Diagnoses (Doughnut Chart)
	const diagnosisChartOptions = useMemo(() => {
		return {
			tooltip: {
				trigger: 'item',
				backgroundColor: 'rgba(255, 255, 255, 0.98)',
				borderWidth: 1,
				borderColor: '#e2e8f0',
				textStyle: { color: '#1e293b', fontSize: 11 },
			},
			legend: {
				orient: 'vertical',
				left: 'left',
				top: 'middle',
				icon: 'circle',
				itemWidth: 8,
				itemHeight: 8,
				itemGap: 10,
				textStyle: {
					fontWeight: 600,
					color: '#64748b',
					fontSize: '0.75rem',
				}
			},
			series: [
				{
					name: 'Gravedad',
					type: 'pie',
					radius: ['55%', '80%'],
					center: ['65%', '50%'],
					avoidLabelOverlap: false,
					label: { show: false },
					labelLine: { show: false },
					data: [
						{ value: 1, name: 'Crítico (Fiebre)', itemStyle: { color: '#dc2626' } },
						{ value: 1, name: 'Alto (Respiratorio)', itemStyle: { color: '#ea580c' } },
						{ value: 1, name: 'Medio (Cojera)', itemStyle: { color: '#ca8a04' } },
						{ value: 1, name: 'Bajo (Aislamiento)', itemStyle: { color: '#16a34a' } },
					]
				}
			],
			animationDuration: 1000,
		};
	}, []);

	const quarantineColumns = useMemo<MRT_ColumnDef<QuarantineCaravan>[]>(
		() => [
			{
				accessorKey: 'id',
				header: 'ID Caravana',
				Cell: ({ cell }) => (
					<Typography sx={{ fontWeight: 700, color: 'primary.main', fontSize: '0.75rem' }}>
						{cell.getValue<string>()}
					</Typography>
				),
			},
			{
				accessorKey: 'entryDate',
				header: 'Fecha Ingreso',
				Cell: ({ cell }) => <span style={{ fontWeight: 600, fontSize: '0.75rem' }}>{cell.getValue<string>()}</span>,
			},
			{
				accessorKey: 'diagnosis',
				header: 'Diagnóstico / Causa',
				Cell: ({ cell }) => (
					<Typography sx={{ fontWeight: 500, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.75rem' }}>
						{cell.getValue<string>()}
					</Typography>
				),
			},
			{
				accessorKey: 'severity',
				header: 'Gravedad',
				Cell: ({ cell }) => getSeverityChip(cell.getValue<QuarantineCaravan['severity']>()),
			},
			{
				accessorKey: 'daysIsolated',
				header: 'Días Aislado',
				Cell: ({ cell }) => (
					<Chip label={`${cell.getValue<number>()} d`} size="small" variant="outlined" sx={{ fontWeight: 800, height: 18, fontSize: '0.65rem' }} />
				),
			},
			{
				id: 'actions',
				header: 'Acciones',
				Cell: ({ row }) => (
					<Tooltip title="Ver ficha médica de cuarentena">
						<Button
							size="small"
							variant="outlined"
							onClick={() => handleActionClick('Ficha Médica', row.original.tag)}
							sx={{ borderRadius: '4px', fontWeight: 700, textTransform: 'none', py: 0.25, px: 1, fontSize: '0.7rem', minHeight: 0, height: 22 }}
						>
							Ficha Médica
						</Button>
					</Tooltip>
				),
				enableSorting: false,
				enableColumnFilter: false,
			},
		],
		[]
	);

	const consumptionColumns = useMemo<MRT_ColumnDef<ConsumptionCaravan>[]>(
		() => [
			{
				accessorKey: 'id',
				header: 'ID Caravana',
				Cell: ({ cell }) => (
					<Typography sx={{ fontWeight: 700, color: 'primary.main', fontSize: '0.75rem' }}>
						{cell.getValue<string>()}
					</Typography>
				),
			},
			{
				accessorKey: 'assignDate',
				header: 'Fecha Asignación',
				Cell: ({ cell }) => <span style={{ fontWeight: 600, fontSize: '0.75rem' }}>{cell.getValue<string>()}</span>,
			},
			{
				accessorKey: 'weight',
				header: 'Peso Actual',
				Cell: ({ cell }) => <span style={{ fontWeight: 700, fontSize: '0.75rem' }}>{cell.getValue<number>()} kg</span>,
			},
			{
				accessorKey: 'destination',
				header: 'Destino de Consumo',
				Cell: ({ cell }) => <span style={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>{cell.getValue<string>()}</span>,
			},
			{
				accessorKey: 'status',
				header: 'Estado',
				Cell: ({ cell }) => {
					const status = cell.getValue<string>();
					return (
						<Chip
							label={status}
							size="small"
							sx={{
								bgcolor: status.includes('Listo') ? '#e0f2fe' : '#fef3c7',
								color: status.includes('Listo') ? '#0369a1' : '#b45309',
								fontWeight: 700,
								height: 18,
								fontSize: '0.65rem',
							}}
						/>
					);
				},
			},
			{
				id: 'actions',
				header: 'Acciones',
				Cell: ({ row }) => (
					<Button
						size="small"
						variant="outlined"
						onClick={() => handleActionClick('Autorizar Faena', row.original.tag)}
						sx={{ borderRadius: '4px', fontWeight: 700, textTransform: 'none', py: 0.25, px: 1, fontSize: '0.7rem', minHeight: 0, height: 22 }}
					>
						Autorizar Faena
					</Button>
				),
				enableSorting: false,
				enableColumnFilter: false,
			},
		],
		[]
	);

	const deathColumns = useMemo<MRT_ColumnDef<DeathCaravan>[]>(
		() => [
			{
				accessorKey: 'id',
				header: 'ID Caravana',
				Cell: ({ cell }) => (
					<Typography sx={{ fontWeight: 700, color: 'grey.700', fontSize: '0.75rem' }}>
						{cell.getValue<string>()}
					</Typography>
				),
			},
			{
				accessorKey: 'deathDate',
				header: 'Fecha de Baja',
				Cell: ({ cell }) => <span style={{ fontWeight: 600, fontSize: '0.75rem' }}>{cell.getValue<string>()}</span>,
			},
			{
				accessorKey: 'cause',
				header: 'Causa de Muerte',
				Cell: ({ cell }) => (
					<Typography sx={{ fontWeight: 700, color: 'error.main', fontSize: '0.75rem' }}>
						{cell.getValue<string>()}
					</Typography>
				),
			},
			{
				accessorKey: 'diagnosedBy',
				header: 'Diagnosticado Por',
				Cell: ({ cell }) => <span style={{ fontSize: '0.75rem' }}>{cell.getValue<string>()}</span>,
			},
			{
				accessorKey: 'status',
				header: 'Estado Acta',
				Cell: ({ cell }) => {
					const status = cell.getValue<string>();
					return (
						<Chip
							label={status}
							size="small"
							sx={{
								bgcolor: status.includes('Firmada') ? '#f3f4f6' : '#fee2e2',
								color: status.includes('Firmada') ? '#374151' : '#dc2626',
								fontWeight: 700,
								height: 18,
								fontSize: '0.65rem',
							}}
						/>
					);
				},
			},
			{
				id: 'actions',
				header: 'Acciones',
				Cell: ({ row }) => (
					<Button
						size="small"
						variant="outlined"
						onClick={() => handleActionClick('Ver Acta Necropsia', row.original.tag)}
						sx={{ borderRadius: '4px', fontWeight: 700, textTransform: 'none', py: 0.25, px: 1, fontSize: '0.7rem', minHeight: 0, height: 22 }}
					>
						Ver Acta
					</Button>
				),
				enableSorting: false,
				enableColumnFilter: false,
			},
		],
		[]
	);

	return (
		<ViewLayout
			title="Dashboard de Lotes Internos"
			subtitle="Monitoreo de bioseguridad, consumo interno y registro de decesos en tiempo real."
		>
			<Stack spacing={4}>
				{/* 0. Pending Sires Alert Widget — only shown when there are pending assignments */}
				<PendingSiresWidget />

				{/* 1. Summary Cards Section */}
				<Box
					sx={{
						display: 'grid',
						gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
						gap: 3,
					}}
				>
					{/* Quarantine Summary Card */}
					<Card
						elevation={0}
						sx={{
							borderRadius: '4px',
							border: '1px solid',
							borderColor: 'divider',
							bgcolor: 'background.paper',
							transition: 'none',
							minHeight: 108,
							display: 'flex',
							alignItems: 'center',
						}}
					>
						<CardContent sx={{ p: 2.5, width: '100%', '&:last-child': { pb: 2.5 } }}>
							<Stack direction="row" justifyContent="space-between" alignItems="center">
								<Stack spacing={0.5}>
									<Typography 
										variant="caption" 
										sx={{ 
											fontWeight: 600, 
											color: 'text.secondary', 
											letterSpacing: '0.5px',
											textTransform: 'uppercase',
											fontSize: '0.75rem' 
										}}
									>
										Cuarentena
									</Typography>
									<Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
										{MOCK_QUARANTINE_DATA.length}
									</Typography>
								</Stack>
								<Box sx={{ color: 'text.secondary', display: 'flex', opacity: 0.8 }}>
									<FuseSvgIcon size={20}>heroicons-outline:bell</FuseSvgIcon>
								</Box>
							</Stack>
						</CardContent>
					</Card>

					{/* Consumption Summary Card */}
					<Card
						elevation={0}
						sx={{
							borderRadius: '4px',
							border: '1px solid',
							borderColor: 'divider',
							bgcolor: 'background.paper',
							transition: 'none',
							minHeight: 108,
							display: 'flex',
							alignItems: 'center',
						}}
					>
						<CardContent sx={{ p: 2.5, width: '100%', '&:last-child': { pb: 2.5 } }}>
							<Stack direction="row" justifyContent="space-between" alignItems="center">
								<Stack spacing={0.5}>
									<Typography 
										variant="caption" 
										sx={{ 
											fontWeight: 600, 
											color: 'text.secondary', 
											letterSpacing: '0.5px',
											textTransform: 'uppercase',
											fontSize: '0.75rem' 
										}}
									>
										Consumo Interno
									</Typography>
									<Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
										{MOCK_CONSUMPTION_DATA.length}
									</Typography>
								</Stack>
								<Box sx={{ color: 'text.secondary', display: 'flex', opacity: 0.8 }}>
									<FuseSvgIcon size={20}>heroicons-outline:shopping-bag</FuseSvgIcon>
								</Box>
							</Stack>
						</CardContent>
					</Card>

					{/* Death Summary Card */}
					<Card
						elevation={0}
						sx={{
							borderRadius: '4px',
							border: '1px solid',
							borderColor: 'divider',
							bgcolor: 'background.paper',
							transition: 'none',
							minHeight: 108,
							display: 'flex',
							alignItems: 'center',
						}}
					>
						<CardContent sx={{ p: 2.5, width: '100%', '&:last-child': { pb: 2.5 } }}>
							<Stack direction="row" justifyContent="space-between" alignItems="center">
								<Stack spacing={0.5}>
									<Typography 
										variant="caption" 
										sx={{ 
											fontWeight: 600, 
											color: 'text.secondary', 
											letterSpacing: '0.5px',
											textTransform: 'uppercase',
											fontSize: '0.75rem' 
										}}
									>
										Bajas (Muerte)
									</Typography>
									<Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
										{MOCK_DEATH_DATA.length}
									</Typography>
								</Stack>
								<Box sx={{ color: 'text.secondary', display: 'flex', opacity: 0.8 }}>
									<FuseSvgIcon size={20}>heroicons-outline:no-symbol</FuseSvgIcon>
								</Box>
							</Stack>
						</CardContent>
					</Card>
				</Box>

				{/* 2. Analytical Section with comparative charts */}
				<Box
					sx={{
						display: 'grid',
						gridTemplateColumns: { xs: '1fr', lg: '3fr 2fr' },
						gap: 3,
					}}
				>
					{/* Left Panel: Grouped Bar Chart */}
					<Paper
						elevation={0}
						sx={{
							p: 3,
							borderRadius: '4px',
							border: '1px solid',
							borderColor: 'divider',
							bgcolor: 'background.paper',
						}}
					>
						<Stack spacing={2}>
							<Stack>
								<Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
									Movimientos Mensuales de Lotes Internos
								</Typography>
								<Typography variant="caption" sx={{ color: 'text.secondary' }}>
									Histórico comparativo de ingresos y registros de bajas por mes
								</Typography>
							</Stack>
							<Box sx={{ width: '100%', height: 260 }}>
								<ReactECharts
									option={monthlyChartOptions}
									style={{ height: '100%', width: '100%' }}
									opts={{ renderer: 'svg' }}
								/>
							</Box>
						</Stack>
					</Paper>

					{/* Right Panel: Severity Doughnut Chart & Key Metrics */}
					<Paper
						elevation={0}
						sx={{
							p: 3,
							borderRadius: '4px',
							border: '1px solid',
							borderColor: 'divider',
							bgcolor: 'background.paper',
						}}
					>
						<Stack spacing={2} sx={{ height: '100%' }}>
							<Stack>
								<Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
									Estado y Métricas de Bioseguridad
								</Typography>
								<Typography variant="caption" sx={{ color: 'text.secondary' }}>
									Severidad de cuarentena y rendimiento operativo
								</Typography>
							</Stack>
							<Box
								sx={{
									display: 'grid',
									gridTemplateColumns: { xs: '1fr', sm: '1.2fr 1fr' },
									gap: 2,
									alignItems: 'center',
									flexGrow: 1,
								}}
							>
								<Box sx={{ height: 200, width: '100%' }}>
									<ReactECharts
										option={diagnosisChartOptions}
										style={{ height: '100%', width: '100%' }}
										opts={{ renderer: 'svg' }}
									/>
								</Box>
								<Stack spacing={2.5} sx={{ borderLeft: { xs: 'none', sm: '1px solid' }, borderColor: 'divider', pl: { xs: 0, sm: 2.5 } }}>
									<Box>
										<Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block' }}>
											AISLAMIENTO PROMEDIO
										</Typography>
										<Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary' }}>
											4.2 días
										</Typography>
									</Box>
									<Box>
										<Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block' }}>
											PESO TOTAL CONSUMIDO
										</Typography>
										<Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary' }}>
											1,193.7 kg
										</Typography>
									</Box>
									<Box>
										<Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block' }}>
											TASA DE BAJAS (MENSUAL)
										</Typography>
										<Typography variant="body1" sx={{ fontWeight: 700, color: 'error.main' }}>
											1.2 %
										</Typography>
									</Box>
								</Stack>
							</Box>
						</Stack>
					</Paper>
				</Box>

				{/* 3. Detailed Caravans Tabs & Tables */}
				<Paper
					elevation={0}
					sx={{
						p: 3,
						borderRadius: '4px',
						border: '1px solid',
						borderColor: 'divider',
						bgcolor: 'background.paper',
					}}
				>
					<Stack spacing={3}>
						<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
							<Tabs
								value={activeTab}
								onChange={(_e, v) => setActiveTab(v)}
								variant="scrollable"
								scrollButtons="auto"
								sx={{
									'& .MuiTab-root': {
										fontWeight: 800,
										fontSize: '0.9rem',
										textTransform: 'none',
										px: 3,
										py: 1.5,
									},
								}}
							>
								<Tab
									icon={<FuseSvgIcon size={20} sx={{ mr: 1 }}>heroicons-outline:bell</FuseSvgIcon>}
									iconPosition="start"
									label="Cuarentena"
								/>
								<Tab
									icon={<FuseSvgIcon size={20} sx={{ mr: 1 }}>heroicons-outline:shopping-cart</FuseSvgIcon>}
									iconPosition="start"
									label="Consumo Interno"
								/>
								<Tab
									icon={<FuseSvgIcon size={20} sx={{ mr: 1 }}>heroicons-outline:x-mark</FuseSvgIcon>}
									iconPosition="start"
									label="Muerte (Bajas)"
								/>
							</Tabs>
						</Box>

						{/* TAB CONTENT: QUARANTINE */}
						{activeTab === 0 && (
							<DataTable
								columns={quarantineColumns}
								data={MOCK_QUARANTINE_DATA}
								enableRowSelection={false}
								enableColumnOrdering={true}
								enableGlobalFilter={true}
								enableRowActions={false}
								{...spreadsheetProps}
								initialState={{
									density: 'compact',
									showGlobalFilter: true,
									pagination: { pageSize: 10, pageIndex: 0 },
								}}
							/>
						)}

						{/* TAB CONTENT: INTERNAL CONSUMPTION */}
						{activeTab === 1 && (
							<DataTable
								columns={consumptionColumns}
								data={MOCK_CONSUMPTION_DATA}
								enableRowSelection={false}
								enableColumnOrdering={true}
								enableGlobalFilter={true}
								enableRowActions={false}
								{...spreadsheetProps}
								initialState={{
									density: 'compact',
									showGlobalFilter: true,
									pagination: { pageSize: 10, pageIndex: 0 },
								}}
							/>
						)}

						{/* TAB CONTENT: DEATH / LOSSES */}
						{activeTab === 2 && (
							<DataTable
								columns={deathColumns}
								data={MOCK_DEATH_DATA}
								enableRowSelection={false}
								enableColumnOrdering={true}
								enableGlobalFilter={true}
								enableRowActions={false}
								{...spreadsheetProps}
								initialState={{
									density: 'compact',
									showGlobalFilter: true,
									pagination: { pageSize: 10, pageIndex: 0 },
								}}
							/>
						)}
					</Stack>
				</Paper>
			</Stack>
		</ViewLayout>
	);
}

export default DashboardView;
