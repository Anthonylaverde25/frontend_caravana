import { Box, Typography } from '@mui/material';
import { CategoryCurve, hasChangedWeighedCount } from './categoryWeightModel';

const noteSx = { fontSize: '0.75rem', color: 'text.secondary' } as const;

/** What the lines of the chart mean, and the dashed stretch only when one is drawn. */
export function BatchCategoryWeightNote({
	curves,
	days,
	mode = 'average'
}: {
	curves: CategoryCurve[];
	days: string[];
	mode?: 'average' | 'biomass';
}) {
	if (mode === 'biomass') {
		return (
			<Box sx={{ display: 'flex', flexWrap: 'wrap', columnGap: 2, rowGap: 0.25, minWidth: 0 }}>
				<Typography sx={noteSx}>
					Área apilada de biomasa: cada capa representa los kilos totales aportados por categoría. La silueta superior refleja la biomasa total del lote.
					{days.length === 1 && ' Hay un solo pesaje: la evolución aparece con el próximo.'}
				</Typography>
			</Box>
		);
	}

	return (
		<Box sx={{ display: 'flex', flexWrap: 'wrap', columnGap: 2, rowGap: 0.25, minWidth: 0 }}>
			<Typography sx={noteSx}>
				Último peso de cada animal que hoy está en el lote.
				{days.length === 1 && ' Hay un solo pesaje: la evolución aparece con el próximo.'}
			</Typography>
			{hasChangedWeighedCount(curves) && (
				<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
					<Box sx={{ width: 22, borderTop: '2px dashed', borderColor: 'text.secondary', flexShrink: 0 }} />
					<Typography sx={noteSx}>Cambió la cantidad pesada: no es ganancia ni pérdida.</Typography>
				</Box>
			)}
		</Box>
	);
}

export default BatchCategoryWeightNote;
