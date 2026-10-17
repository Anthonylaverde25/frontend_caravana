import { Box, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import type { Caravan } from '@/core/caravans/domain/entities/Caravan';
import { formatDate } from 'src/ui/herd/utils/herdFormat';
import { reproductiveState } from './caravanDrawerModel';
import DrawerFact from './DrawerFact';

interface CaravanReproductionCardProps {
	caravan: Caravan;
}

/** Reproductive state of a female: gestation progress, sires, the owner's eligibility, stillbirths. */
export function CaravanReproductionCard({ caravan }: CaravanReproductionCardProps) {
	const repro = reproductiveState(caravan);
	const sires = caravan.active_gestation?.sires ?? [];

	return (
		<Box
			component="section"
			aria-label="Reproducción"
		>
			<Typography
				component="h3"
				sx={{ fontSize: '0.82rem', fontWeight: 600, mb: 1.25 }}
			>
				Reproducción
			</Typography>
			<Paper
				variant="outlined"
				sx={{ p: 1.75, borderRadius: '8px' }}
			>
				<Stack
					direction="row"
					justifyContent="space-between"
					alignItems="baseline"
					spacing={1}
				>
					<Typography
						sx={{
							fontSize: '1rem',
							fontWeight: 700,
							color: repro.pregnant ? 'success.dark' : 'text.primary'
						}}
					>
						{repro.pregnant ? (repro.months ? `Preñada · ${repro.months} meses` : 'Preñada') : 'Vacía'}
					</Typography>
					{caravan.physiological_state?.label && (
						<Typography
							variant="caption"
							sx={{ color: 'text.secondary' }}
						>
							{caravan.physiological_state.label}
						</Typography>
					)}
				</Stack>

				{repro.pregnant && repro.months !== null && (
					<Box sx={{ mt: 1.5 }}>
						<LinearProgress
							variant="determinate"
							value={repro.progressPct}
							color="success"
							aria-label={`${repro.months} de 9 meses de gestación`}
							sx={{ height: 8, borderRadius: '4px' }}
						/>
						<Stack
							direction="row"
							justifyContent="space-between"
							sx={{ mt: 0.75 }}
						>
							<Typography
								variant="caption"
								sx={{ color: 'text.secondary' }}
							>
								{`Inicio ${formatDate(repro.startDate)}`}
							</Typography>
							<Typography
								variant="caption"
								sx={{ color: 'text.secondary' }}
							>
								Parto estimado{' '}
								<Box
									component="strong"
									sx={{ color: repro.overdueDays !== null ? 'error.main' : 'warning.dark' }}
								>
									{formatDate(repro.dueDate)}
								</Box>
							</Typography>
						</Stack>
					</Box>
				)}

				<Box
					component="dl"
					sx={{
						m: 0,
						mt: 1.5,
						pt: 1.5,
						display: 'grid',
						gridTemplateColumns: '1fr auto',
						rowGap: 1,
						columnGap: 2,
						borderTop: 1,
						borderColor: 'divider'
					}}
				>
					{repro.pregnant && (
						<DrawerFact
							label="Toros"
							mono
						>
							{sires.length > 0 ? sires.map((s) => s.identification).join(' · ') : 'Sin asignar'}
						</DrawerFact>
					)}
					<DrawerFact
						label="Aptitud (ganadero)"
						color={caravan.is_breeding_eligible ? 'success.dark' : 'warning.dark'}
					>
						{caravan.is_breeding_eligible ? 'Apta' : (caravan.breeding_exclusion_reason_label ?? 'No apta')}
					</DrawerFact>
					<DrawerFact label="Nacidos muertos">
						{caravan.stillborn_count > 0
							? `${caravan.stillborn_count} · último ${formatDate(caravan.last_stillborn_date)}`
							: '0'}
					</DrawerFact>
				</Box>
			</Paper>
		</Box>
	);
}

export default CaravanReproductionCard;
