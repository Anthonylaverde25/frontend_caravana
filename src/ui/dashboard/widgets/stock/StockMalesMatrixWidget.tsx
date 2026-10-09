import { useState } from 'react';
import {
	Box,
	Chip,
	Skeleton,
	Stack,
	ToggleButton,
	ToggleButtonGroup,
	Typography
} from '@mui/material';
import { WidgetRenderProps } from '../../types/dashboard.types';
import { WidgetCard } from '../../components/primitives/WidgetCard';
import { StatusPill } from '../../components/primitives/StatusPill';
import { SexVolumeMatrixTable } from './components/HerdVolumeMatrixTable';
import { SexVolumeBarAreaChart, ChartDisplayMode } from './components/SexVolumeBarAreaChart';
import { useHerdVolumeData } from './hooks/useHerdVolumeData';
import { formatNumber, formatPercent } from '../../theme/formatters';

type ViewMode = ChartDisplayMode | 'table';

export function StockMalesMatrixWidget({ instance }: WidgetRenderProps) {
	const [viewMode, setViewMode] = useState<ViewMode>('combo');
	const { hierarchy, isLoading } = useHerdVolumeData();
	const males = hierarchy.males;

	return (
		<WidgetCard
			title={instance.title ?? 'Existencias · Machos'}
			subtitle={
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 0.25 }}>
					<span>
						{formatNumber(males.heads)} cabezas · {formatPercent(males.pctOfTotal, 1)} del rodeo general
					</span>
				</Box>
			}
			actions={
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<ToggleButtonGroup
						size="small"
						exclusive
						value={viewMode}
						onChange={(_, val: ViewMode | null) => val && setViewMode(val)}
						aria-label="Modo de visualización"
						sx={{ '& .MuiToggleButton-root': { py: 0.35, px: 1.1, fontSize: '0.75rem', textTransform: 'none', fontWeight: 600 } }}
					>
						<ToggleButton value="combo">Barra + Área</ToggleButton>
						<ToggleButton value="bar">Barras</ToggleButton>
						<ToggleButton value="area">Área</ToggleButton>
						<ToggleButton value="table">Tabla</ToggleButton>
					</ToggleButtonGroup>
					<StatusPill
						tone={hierarchy.isLive ? 'ok' : 'neutral'}
						label={hierarchy.isLive ? 'API' : 'Mocks'}
					/>
				</Box>
			}
			footnote="Invernada, recría macho y torada reproductora. Las barras y área reflejan el volumen relativo."
		>
			<Stack
				direction="row"
				alignItems="center"
				justifyContent="space-between"
				sx={{
					p: 1.25,
					mb: 1.5,
					borderRadius: '8px',
					bgcolor: 'rgba(37, 99, 235, 0.08)',
					border: '1px solid rgba(37, 99, 235, 0.25)'
				}}
			>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#2563EB' }} />
					<Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#2563EB' }}>
						Invernada, Recría & Toros
					</Typography>
				</Box>
				<Chip
					size="small"
					label={`${formatNumber(males.heads)} cabezas`}
					sx={{
						bgcolor: 'background.paper',
						color: '#2563EB',
						fontWeight: 800,
						fontSize: '0.75rem',
						border: '1px solid rgba(37, 99, 235, 0.3)'
					}}
				/>
			</Stack>

			{isLoading ? (
				<Box sx={{ p: 1.5 }}>
					<Skeleton variant="rounded" height={260} />
				</Box>
			) : viewMode === 'table' ? (
				<SexVolumeMatrixTable
					data={males}
					totalHerdHeads={hierarchy.totalHeads}
					accentColor="#2563EB"
					hideOuterHeader
				/>
			) : (
				<SexVolumeBarAreaChart
					data={males}
					totalHerdHeads={hierarchy.totalHeads}
					accentColor="#2563EB"
					mode={viewMode}
					height={260}
				/>
			)}
		</WidgetCard>
	);
}
