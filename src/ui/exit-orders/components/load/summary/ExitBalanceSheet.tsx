import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { ExitLoadForm } from '../../../hooks/useExitLoadForm';
import type { CategoryBalance } from '../exitPricing';

interface ExitBalanceSheetProps {
	form: ExitLoadForm;
	onEditPrice: () => void;
}

const whole = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

/**
 * Fixed tracks that always fit the 376px of the left column: the category takes what is left and
 * wraps, the numbers never do. No horizontal scroll, whatever the amounts.
 */
const COLUMNS = '24px minmax(0, 1fr) 40px 74px 100px';

const kgOf = (weightKg: number, estimated: boolean): string =>
	weightKg > 0 ? `${estimated ? '≈ ' : ''}${whole.format(weightKg)}` : '—';

/**
 * The balance of the load by category, as a spreadsheet: row numbers, gridlines, the $/kg under each
 * category and a Σ row. A category the price leaves out asks for its $/kg right in its cell.
 */
export const ExitBalanceSheet: React.FC<ExitBalanceSheetProps> = ({ form, onEditPrice }) => {
	const theme = useTheme();
	const { balance, totals, pricing } = form;
	const bandBg = theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : '#eef2ef';
	const sumBorder = `2px solid ${theme.palette.text.secondary}`;

	const head = { px: 0.75, py: 0.6, bgcolor: bandBg, fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary' };
	const gutter = {
		bgcolor: bandBg,
		fontSize: '0.68rem',
		color: 'text.secondary',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center'
	};
	const cell = { px: 0.75, py: 0.75, bgcolor: 'background.paper', minWidth: 0 };
	const num = { ...cell, textAlign: 'right', whiteSpace: 'nowrap' } as const;
	const sum = { ...num, py: 0.9, bgcolor: 'background.default', fontWeight: 700, borderTop: sumBorder } as const;

	const captionOf = (group: CategoryBalance) => {
		if (group.pricePerKg != null) return { text: `$ ${whole.format(group.pricePerKg)}/kg`, warn: false };

		if (pricing.mode === 'PER_CATEGORY') return { text: 'falta $/kg', warn: true };

		if (pricing.mode === 'PER_HEAD' && pricing.pricePerHead.trim())
			return { text: `$ ${Number(pricing.pricePerHead).toLocaleString('es-AR')}/cab.`, warn: false };

		return null;
	};

	return (
		<Box
			role="table"
			aria-label="Desglose por categoría"
			sx={{
				display: 'grid',
				gridTemplateColumns: COLUMNS,
				gap: '1px',
				bgcolor: 'divider',
				border: 1,
				borderColor: 'divider',
				fontSize: '0.8rem',
				fontVariantNumeric: 'tabular-nums'
			}}
		>
			<Box sx={head} />
			<Box sx={head}>Categoría</Box>
			<Box sx={{ ...head, textAlign: 'right' }}>Cab.</Box>
			<Box sx={{ ...head, textAlign: 'right' }}>Kg</Box>
			<Box sx={{ ...head, textAlign: 'right' }}>Importe</Box>

			{balance.length === 0 && (
				<Box
					sx={{
						...cell,
						gridColumn: '1 / -1',
						py: 2.5,
						textAlign: 'center',
						color: 'text.disabled',
						fontStyle: 'italic'
					}}
				>
					Todavía no hay animales en la orden.
				</Box>
			)}

			{balance.map((group, index) => {
				const caption = captionOf(group);
				const asksPrice = caption?.warn === true;

				return (
					<React.Fragment key={group.category}>
						<Box sx={gutter}>{index + 1}</Box>
						<Box sx={cell}>
							<Typography sx={{ fontSize: '0.8rem', fontWeight: 600, lineHeight: 1.25 }}>
								{group.category}
							</Typography>
							{caption && (
								<Typography
									sx={{
										fontSize: '0.68rem',
										fontWeight: caption.warn ? 600 : 400,
										color: caption.warn ? 'warning.dark' : 'text.secondary'
									}}
								>
									{caption.text}
								</Typography>
							)}
						</Box>
						<Box sx={num}>{group.heads}</Box>
						<Box sx={{ ...num, color: group.estimated ? 'text.secondary' : 'text.primary' }}>
							{kgOf(group.weightKg, group.estimated)}
						</Box>
						{asksPrice ? (
							<Box
								sx={{
									...cell,
									p: '2px',
									outline: 2,
									outlineColor: 'warning.main',
									outlineOffset: '-2px'
								}}
							>
								<Button
									fullWidth
									size="small"
									color="warning"
									onClick={onEditPrice}
									sx={{
										height: '100%',
										minWidth: 0,
										px: 0.5,
										justifyContent: 'flex-end',
										textTransform: 'none',
										fontWeight: 700,
										fontSize: '0.74rem',
										color: 'warning.dark',
										borderRadius: 0
									}}
								>
									Poner $/kg
								</Button>
							</Box>
						) : (
							<Box
								sx={{
									...num,
									fontWeight: 600,
									color: group.amount > 0 ? 'text.primary' : 'text.disabled'
								}}
							>
								{group.amount > 0 ? whole.format(group.amount) : '—'}
							</Box>
						)}
					</React.Fragment>
				);
			})}

			{balance.length > 0 && (
				<>
					<Box sx={{ ...gutter, borderTop: sumBorder }}>Σ</Box>
					<Box sx={{ ...sum, textAlign: 'left', fontWeight: 800 }}>Totales</Box>
					<Box sx={sum}>{totals.heads}</Box>
					<Box sx={sum}>{kgOf(totals.weightKg, totals.weightEstimated)}</Box>
					<Box sx={{ ...sum, color: totals.amount > 0 ? 'text.primary' : 'text.disabled' }}>
						{totals.amount > 0 ? whole.format(totals.amount) : '—'}
					</Box>
				</>
			)}
		</Box>
	);
};

export default ExitBalanceSheet;
