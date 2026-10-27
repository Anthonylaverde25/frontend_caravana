import { useState } from 'react';
import {
	Box,
	Skeleton,
	ToggleButton,
	ToggleButtonGroup
} from '@mui/material';
import { WidgetRenderProps } from '../../types/dashboard.types';
import { WidgetCard } from '../../components/primitives/WidgetCard';
import { SexVolumeMatrixTable } from './components/HerdVolumeMatrixTable';
import { SexVolumeBarAreaChart } from './components/SexVolumeBarAreaChart';
import { useHerdVolumeData } from './hooks/useHerdVolumeData';
import { formatNumber, formatPercent } from '../../theme/formatters';

type ViewMode = 'chart' | 'table';

export function StockFemalesMatrixWidget({ instance }: WidgetRenderProps) {
	const [viewMode, setViewMode] = useState<ViewMode>('chart');
	const { hierarchy, isLoading } = useHerdVolumeData();
	const females = hierarchy.females;

	return (
		<WidgetCard
			title={instance.title ?? 'Existencias · Hembras'}
			subtitle={
				<Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
					<span>{formatNumber(females.heads)} cabezas</span>
					<span>·</span>
					<span>{formatPercent(females.pctOfTotal, 1)} del rodeo general</span>
				</Box>
			}
			actions={
				<ToggleButtonGroup
					size="small"
					exclusive
					value={viewMode}
					onChange={(_, val: ViewMode | null) => val && setViewMode(val)}
					aria-label="Modo de visualización"
					sx={{
						'& .MuiToggleButton-root': {
							py: 0.35,
							px: 1.25,
							fontSize: '0.75rem',
							textTransform: 'none',
							fontWeight: 600
						}
					}}
				>
					<ToggleButton value="chart">Gráfico</ToggleButton>
					<ToggleButton value="table">Detalle</ToggleButton>
				</ToggleButtonGroup>
			}
			footnote="Vientres en producción y terneras/vaquillonas de reposición."
		>
			{isLoading ? (
				<Box sx={{ p: 1.5 }}>
					<Skeleton variant="rounded" height={260} />
				</Box>
			) : viewMode === 'table' ? (
				<SexVolumeMatrixTable
					data={females}
					totalHerdHeads={hierarchy.totalHeads}
					accentColor="#059669"
					hideOuterHeader
				/>
			) : (
				<SexVolumeBarAreaChart
					data={females}
					totalHerdHeads={hierarchy.totalHeads}
					accentColor="#059669"
					height={260}
				/>
			)}
		</WidgetCard>
	);
}

export default StockFemalesMatrixWidget;
