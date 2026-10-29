import React from 'react';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { filledInputProps } from '@/ui/weaning-orders/components/form/formStyles';
import type { ExitLoadForm } from '../../hooks/useExitLoadForm';
import { formatKg, formatMoney } from '../exitOrderFormat';
import CalfChip from '../load/CalfChip';
import { rowError } from '../load/exitRows';

/**
 * The animals of "Vender", one compact line each: its kg and what it is worth once the load is
 * priced. A cow with her calf at foot says what happens to it on her own line.
 */
export const SellAnimalsList: React.FC<{ form: ExitLoadForm }> = ({ form }) => {
	const fromLoad = form.pricing.mode === 'PER_KG' && form.pricing.weightSource === 'LOAD';
	const canFill = !fromLoad && form.rows.some((row) => row.weight === '' && row.lastWeight != null);

	return (
		<Box>
			<Stack
				direction="row"
				alignItems="center"
				sx={{ mb: 1 }}
			>
				<Typography
					variant="caption"
					sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', flexGrow: 1 }}
				>
					Animales ({form.rows.length})
				</Typography>
				{canFill && (
					<Button
						size="small"
						onClick={form.fillLastWeights}
						startIcon={<FuseSvgIcon size={16}>heroicons-outline:scale</FuseSvgIcon>}
						sx={{ textTransform: 'none', fontWeight: 600 }}
					>
						Completar con el último peso
					</Button>
				)}
			</Stack>
			<Stack
				spacing={1}
				sx={{ maxHeight: 280, overflowY: 'auto', pr: 0.5 }}
			>
				{form.rows.map((row) => {
					const error = rowError(form.errors.byRow[row.caravanId]);
					const calves = form.calves.get(row.caravanId);
					const priced = form.priced.get(row.caravanId);

					return (
						<Box
							key={row.caravanId}
							sx={{ border: 1, borderColor: error ? 'error.main' : 'divider', borderRadius: '6px', p: 1 }}
						>
							<Stack
								direction="row"
								spacing={1}
								alignItems="center"
							>
								<Box sx={{ flexGrow: 1, minWidth: 0 }}>
									<Stack
										direction="row"
										alignItems="center"
									>
										<Typography
											sx={{
												fontFamily: 'monospace',
												fontWeight: 700,
												color: 'primary.main',
												fontSize: '0.85rem',
												whiteSpace: 'nowrap'
											}}
										>
											{row.label}
										</Typography>
										{calves && (
											<CalfChip
												calves={calves}
												decision={form.decisions[row.caravanId]}
												onChange={(decision) => form.setDecision(row.caravanId, decision)}
											/>
										)}
									</Stack>
									<Typography
										variant="caption"
										color="text.secondary"
										noWrap
										component="div"
									>
										{[row.categoryName, row.batchName, row.isPregnant ? 'preñada' : null]
											.filter(Boolean)
											.join(' · ')}
									</Typography>
								</Box>
								{fromLoad ? (
									<Typography
										variant="caption"
										sx={{
											width: 100,
											textAlign: 'right',
											fontStyle: 'italic',
											color: 'text.secondary'
										}}
									>
										{priced?.weightKg != null ? `≈ ${formatKg(priced.weightKg)}` : '—'}
									</Typography>
								) : (
									<TextField
										size="small"
										variant="filled"
										label="Kg"
										value={row.weight}
										placeholder={row.lastWeight != null ? `últ. ${row.lastWeight}` : undefined}
										InputLabelProps={{ shrink: true }}
										onChange={(e) => form.updateRow(row.caravanId, { weight: e.target.value })}
										InputProps={filledInputProps}
										sx={{ width: 100 }}
									/>
								)}
								<Typography
									variant="caption"
									sx={{ width: 110, textAlign: 'right', fontWeight: 700 }}
								>
									{formatMoney(priced?.amount ?? null)}
								</Typography>
							</Stack>
							{error && (
								<Typography
									variant="caption"
									color="error"
									component="div"
									sx={{ mt: 0.5, fontWeight: 600 }}
								>
									{error}
								</Typography>
							)}
						</Box>
					);
				})}
			</Stack>
		</Box>
	);
};

export default SellAnimalsList;
