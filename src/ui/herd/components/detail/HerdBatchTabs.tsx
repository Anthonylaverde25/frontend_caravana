import { Box, ButtonBase } from '@mui/material';

export type HerdBatchTab = 'summary' | 'novelties' | 'caravans' | 'consumption';

interface HerdBatchTabsProps {
	value: HerdBatchTab;
	caravanCount: number | null;
	alertsCount?: number;
	onChange: (tab: HerdBatchTab) => void;
}

const TABS: { value: HerdBatchTab; label: string }[] = [
	{ value: 'summary', label: 'Resumen' },
	{ value: 'novelties', label: 'Novedades' },
	{ value: 'caravans', label: 'Caravanas' },
	{ value: 'consumption', label: 'Consumos y costos' }
];

/**
 * The sections of the batch page, underlined on the rule of the header. Blue is left to the actions.
 * ButtonBase, not Button: the theme paints every text button with the palette colour.
 */
export function HerdBatchTabs({ value, caravanCount, alertsCount, onChange }: HerdBatchTabsProps) {
	const countOf = (tab: HerdBatchTab) => {
		if (tab === 'novelties' && typeof alertsCount === 'number' && alertsCount > 0) return alertsCount;

		if (tab === 'caravans' && caravanCount != null) return caravanCount;

		return null;
	};

	return (
		<Box
			component="nav"
			aria-label="Secciones del lote"
			sx={{ display: 'flex', flexWrap: 'wrap', columnGap: 3 }}
		>
			{TABS.map((tab) => {
				const active = tab.value === value;
				const count = countOf(tab.value);

				return (
					<ButtonBase
						key={tab.value}
						onClick={() => onChange(tab.value)}
						aria-current={active ? 'page' : undefined}
						sx={{
							py: 1.25,
							fontSize: '0.82rem',
							fontWeight: active ? 600 : 400,
							color: active ? 'text.primary' : 'text.secondary',
							borderBottom: 2,
							borderColor: active ? 'text.primary' : 'transparent',
							'&:hover': { color: 'text.primary' }
						}}
					>
						{tab.label}
						{count !== null && (
							<Box
								component="span"
								sx={{ ml: 0.75, fontWeight: 600, color: 'text.primary' }}
							>
								{count}
							</Box>
						)}
					</ButtonBase>
				);
			})}
		</Box>
	);
}

export default HerdBatchTabs;
