import { Box, Checkbox, FormControlLabel, List, ListItemButton, ListItemText, Typography } from '@mui/material';
import { WidgetCategory } from '../../../types/dashboard.types';
import { WIDGET_CATEGORY_LABELS } from '../../../registry/widgetRegistry';

export type CategoryFilter = WidgetCategory | 'ALL';

interface WidgetCategoryNavProps {
	value: CategoryFilter;
	counts: Record<CategoryFilter, number>;
	showUnavailable: boolean;
	onChange: (value: CategoryFilter) => void;
	onToggleUnavailable: (value: boolean) => void;
}

export function WidgetCategoryNav({
	value,
	counts,
	showUnavailable,
	onChange,
	onToggleUnavailable
}: WidgetCategoryNavProps) {
	const items: { key: CategoryFilter; label: string }[] = [
		{ key: 'ALL', label: 'Todos' },
		...(Object.keys(WIDGET_CATEGORY_LABELS) as WidgetCategory[]).map((key) => ({
			key,
			label: WIDGET_CATEGORY_LABELS[key]
		}))
	];

	return (
		<Box
			component="nav"
			aria-label="Categorías de widgets"
			sx={{
				display: 'flex',
				flexDirection: 'column',
				height: '100%',
				py: 2,
				px: 1.5,
				borderRight: 1,
				borderColor: 'divider'
			}}
		>
			<Typography
				sx={{
					px: 1.5,
					pb: 1,
					fontSize: '0.75rem',
					fontWeight: 600,
					letterSpacing: '0.06em',
					textTransform: 'uppercase',
					color: 'text.secondary'
				}}
			>
				Categorías
			</Typography>
			<List
				dense
				disablePadding
			>
				{items.map((item) => (
					<ListItemButton
						key={item.key}
						selected={value === item.key}
						onClick={() => onChange(item.key)}
						sx={{ borderRadius: '6px', mb: 0.25 }}
					>
						<ListItemText
							primary={item.label}
							primaryTypographyProps={{
								fontSize: '0.875rem',
								fontWeight: value === item.key ? 600 : 500
							}}
						/>
						<Typography
							sx={{ fontSize: '0.75rem', color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}
						>
							{counts[item.key]}
						</Typography>
					</ListItemButton>
				))}
			</List>
			<FormControlLabel
				sx={{
					mt: 'auto',
					mx: 0,
					px: 1,
					alignItems: 'flex-start',
					'& .MuiFormControlLabel-label': { fontSize: '0.8125rem', pt: 1 }
				}}
				control={
					<Checkbox
						size="small"
						checked={showUnavailable}
						onChange={(e) => onToggleUnavailable(e.target.checked)}
					/>
				}
				label="Mostrar los que requieren datos nuevos"
			/>
		</Box>
	);
}

export default WidgetCategoryNav;
