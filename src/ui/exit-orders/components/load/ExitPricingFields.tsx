import React from 'react';
import { InputAdornment, Paper, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { filledInputProps, sectionTitleSx } from '@/ui/weaning-orders/components/form/formStyles';
import { CategoryBalance, ExitPricing, PRICING_LABELS, PricingMode, WeightSource } from './exitPricing';
import ExitCategoryPrices from './ExitCategoryPrices';

interface ExitPricingFieldsProps {
	pricing: ExitPricing;
	onChange: (patch: Partial<ExitPricing>) => void;
	/** Fewer words, for the "Vender" dialog. */
	compact?: boolean;
	number?: string;
	/** The load by category, for "Por kg según categoría". */
	balance: CategoryBalance[];
	/** An issued order only agrees a $/kg (optional); a sale says how it was charged. */
	agreement?: boolean;
	/** Inside the price dialog: the dialog carries the title and the frame. */
	inDialog?: boolean;
}

const MODES: PricingMode[] = ['PER_KG', 'PER_CATEGORY', 'PER_HEAD', 'TOTAL', 'NONE'];
/** What an issued order can keep: a $/kg per animal, the same for all or by category. */
const AGREEMENT_MODES: PricingMode[] = ['NONE', 'PER_KG', 'PER_CATEGORY'];

const HINTS: Record<PricingMode, string> = {
	PER_KG: 'El importe de cada animal es su peso por el precio.',
	PER_HEAD: 'El mismo precio para cada animal.',
	TOTAL: 'Se reparte entre los animales según su peso (o en partes iguales si falta alguno).',
	PER_CATEGORY: 'Un $/kg para cada categoría: el importe de cada animal es su peso por el precio de su categoría.',
	NONE: 'Se guarda sin importe. El precio se puede saber después; el egreso no espera.'
};

const money = { startAdornment: <InputAdornment position="start">$</InputAdornment> };

/**
 * "3. ¿Cómo se cobró?": asked once for the load, as the deal was made, instead of a price in every
 * row. Each way shows only the numbers it needs, and the amount of each animal follows from them.
 */
export const ExitPricingFields: React.FC<ExitPricingFieldsProps> = ({
	pricing,
	onChange,
	compact,
	number = '3',
	balance,
	agreement,
	inDialog
}) => (
	<Paper
		variant="outlined"
		sx={{
			p: compact || inDialog ? 0 : { xs: 2, md: 2.5 },
			border: compact || inDialog ? 0 : undefined,
			borderRadius: '8px'
		}}
	>
		{!inDialog && (
			<Typography sx={{ ...sectionTitleSx, mb: 1.5 }}>
				{agreement
					? `${number}. Precio pactado (opcional)`
					: compact
						? 'Cómo se cobró'
						: `${number}. ¿Cómo se cobró?`}
			</Typography>
		)}
		<Stack spacing={1.5}>
			<ToggleButtonGroup
				exclusive
				size="small"
				value={pricing.mode}
				onChange={(_, value: PricingMode | null) => value && onChange({ mode: value })}
				sx={{ flexWrap: 'wrap' }}
			>
				{(agreement ? AGREEMENT_MODES : MODES).map((mode) => (
					<ToggleButton
						key={mode}
						value={mode}
						sx={{ textTransform: 'none', fontWeight: 600, px: 2 }}
					>
						{PRICING_LABELS[mode]}
					</ToggleButton>
				))}
			</ToggleButtonGroup>
			{!compact && (
				<Typography
					variant="caption"
					color="text.secondary"
				>
					{agreement
						? pricing.mode === 'NONE'
							? 'Sin precio pactado: se declara el día de la carga.'
							: `${HINTS[pricing.mode]} Los kg son el último peso de cada animal; el $/kg queda en la orden y se precarga al registrar la salida.`
						: HINTS[pricing.mode]}
				</Typography>
			)}

			{pricing.mode === 'PER_KG' && (
				<Stack
					direction={{ xs: 'column', sm: 'row' }}
					spacing={2}
					alignItems={{ sm: 'center' }}
				>
					<TextField
						label="Precio por kg"
						variant="filled"
						inputMode="decimal"
						value={pricing.pricePerKg}
						onChange={(e) => onChange({ pricePerKg: e.target.value })}
						InputProps={{ ...filledInputProps, ...money }}
						sx={{ width: { sm: 180 } }}
					/>
					{!agreement && (
						<ToggleButtonGroup
							exclusive
							size="small"
							value={pricing.weightSource}
							onChange={(_, value: WeightSource | null) => value && onChange({ weightSource: value })}
						>
							<ToggleButton
								value="ANIMAL"
								sx={{ textTransform: 'none', px: 1.5 }}
							>
								Kg de cada animal
							</ToggleButton>
							<ToggleButton
								value="LOAD"
								sx={{ textTransform: 'none', px: 1.5 }}
							>
								Kg totales del camión
							</ToggleButton>
						</ToggleButtonGroup>
					)}
					{!agreement && pricing.weightSource === 'LOAD' && (
						<TextField
							label="Kg totales"
							variant="filled"
							inputMode="decimal"
							value={pricing.loadKg}
							onChange={(e) => onChange({ loadKg: e.target.value })}
							InputProps={{
								...filledInputProps,
								endAdornment: <InputAdornment position="end">kg</InputAdornment>
							}}
							sx={{ width: { sm: 160 } }}
						/>
					)}
				</Stack>
			)}
			{pricing.mode === 'PER_CATEGORY' && (
				<ExitCategoryPrices
					balance={balance}
					prices={pricing.categoryPrices}
					onChange={(category, value) =>
						onChange({ categoryPrices: { ...pricing.categoryPrices, [category]: value } })
					}
				/>
			)}
			{pricing.mode === 'PER_HEAD' && (
				<TextField
					label="Precio por cabeza"
					variant="filled"
					inputMode="decimal"
					value={pricing.pricePerHead}
					onChange={(e) => onChange({ pricePerHead: e.target.value })}
					InputProps={{ ...filledInputProps, ...money }}
					sx={{ width: { sm: 220 } }}
				/>
			)}
			{pricing.mode === 'TOTAL' && (
				<TextField
					label="Monto total de la venta"
					variant="filled"
					inputMode="decimal"
					value={pricing.total}
					onChange={(e) => onChange({ total: e.target.value })}
					InputProps={{ ...filledInputProps, ...money }}
					sx={{ width: { sm: 260 } }}
				/>
			)}
			{pricing.mode === 'PER_KG' && pricing.weightSource === 'LOAD' && !compact && (
				<Typography
					variant="caption"
					color="text.secondary"
				>
					Los kg se reparten entre los animales según su último peso. Quedan como estimados: no se guardan
					como pesada de cada animal.
				</Typography>
			)}
		</Stack>
	</Paper>
);

export default ExitPricingFields;
