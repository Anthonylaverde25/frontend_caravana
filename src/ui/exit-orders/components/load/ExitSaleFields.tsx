import React, { useState } from 'react';
import { Button, Collapse, InputAdornment, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { filledInputProps, sectionTitleSx } from '@/ui/weaning-orders/components/form/formStyles';
import { useExitBatches } from '@/features/exit-orders/hooks/useExitOrders';
import type { ExitHeader } from '../../hooks/useExitLoadForm';
import { localToday } from '../exitOrderFormat';
import type { ExitLoadMode } from './exitRows';
import BuyerSelectField from './BuyerSelectField';

interface ExitSaleFieldsProps {
	mode: ExitLoadMode;
	header: ExitHeader;
	onChange: (patch: Partial<ExitHeader>) => void;
	errors: Record<string, string>;
	/** Execute: the buyer is the order's, shown and not changed. */
	buyerName?: string | null;
}

/**
 * "Cliente": who buys, what we know of them, and when. The two facts every sale needs. Who was in charge and the notes
 * stay folded under "Más datos". The exit batch is asked only when the company has several (P4).
 */
export const ExitSaleFields: React.FC<ExitSaleFieldsProps> = ({ mode, header, onChange, errors, buyerName }) => {
	const { data: exitBatches = [] } = useExitBatches(mode !== 'issue');
	const [showMore, setShowMore] = useState(Boolean(header.responsable || header.observations));

	return (
		<Paper
			variant="outlined"
			sx={{ p: { xs: 2, md: 2.5 }, borderRadius: '8px' }}
		>
			<Typography sx={{ ...sectionTitleSx, mb: 1.5 }}>Cliente</Typography>
			<Stack spacing={2}>
				<Stack
					direction="column"
					spacing={2}
				>
					{mode === 'execute' ? (
						<TextField
							label="Comprador · de la orden"
							variant="filled"
							fullWidth
							disabled
							value={buyerName ?? '—'}
							InputProps={{
								...filledInputProps,
								endAdornment: (
									<InputAdornment position="end">
										<FuseSvgIcon size={16}>heroicons-outline:lock-closed</FuseSvgIcon>
									</InputAdornment>
								)
							}}
						/>
					) : (
						<BuyerSelectField
							value={header.buyerId}
							onChange={(buyerId) => onChange({ buyerId })}
							error={errors.buyer_partner_id}
						/>
					)}
					<TextField
						label={mode === 'issue' ? 'Fecha prevista de carga' : 'Fecha del egreso'}
						type="date"
						variant="filled"
						fullWidth
						value={header.exitDate}
						onChange={(e) => onChange({ exitDate: e.target.value })}
						InputProps={filledInputProps}
						InputLabelProps={{ shrink: true }}
						inputProps={mode === 'issue' ? undefined : { max: localToday() }}
						error={!!errors.exit_date}
						helperText={errors.exit_date}
					/>
				</Stack>
				{exitBatches.length > 1 && (
					<TextField
						select
						label="Lote de Egresos"
						variant="filled"
						fullWidth
						value={header.exitBatchId ?? ''}
						onChange={(e) => onChange({ exitBatchId: Number(e.target.value) })}
						InputProps={filledInputProps}
						error={!!errors.exit_batch_id}
						helperText={errors.exit_batch_id ?? 'Hay varios: elegí a cuál van.'}
					>
						{exitBatches.map((batch) => (
							<MenuItem
								key={batch.id}
								value={batch.id}
							>
								{batch.name}
							</MenuItem>
						))}
					</TextField>
				)}
				{mode !== 'execute' && (
					<>
						<Button
							size="small"
							onClick={() => setShowMore((open) => !open)}
							startIcon={
								<FuseSvgIcon size={16}>
									{showMore ? 'heroicons-outline:chevron-up' : 'heroicons-outline:chevron-down'}
								</FuseSvgIcon>
							}
							sx={{ alignSelf: 'flex-start', textTransform: 'none', fontWeight: 600 }}
						>
							Responsable y observaciones
						</Button>
						<Collapse in={showMore}>
							<Stack
								direction="column"
								spacing={2}
							>
								<TextField
									label="Responsable"
									variant="filled"
									fullWidth
									value={header.responsable}
									onChange={(e) => onChange({ responsable: e.target.value })}
									InputProps={filledInputProps}
								/>
								<TextField
									label="Observaciones"
									variant="filled"
									fullWidth
									value={header.observations}
									onChange={(e) => onChange({ observations: e.target.value })}
									InputProps={filledInputProps}
								/>
							</Stack>
						</Collapse>
					</>
				)}
			</Stack>
		</Paper>
	);
};

export default ExitSaleFields;
