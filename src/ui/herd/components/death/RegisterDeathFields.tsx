import { Alert, MenuItem, Stack, TextField } from '@mui/material';
import type { DeathBatchOption, DeathCause } from '@/core/caravans/domain/entities/Death';
import { today, type RegisterDeathForm } from './registerDeath';

interface RegisterDeathFieldsProps {
	form: RegisterDeathForm;
	causes: DeathCause[];
	deathBatches: DeathBatchOption[];
	onChange: (change: Partial<RegisterDeathForm>) => void;
}

const filledSx = { bgcolor: 'action.hover' } as const;

/** Day, cause, note and, only when the company has several, the death batch it goes to. */
export function RegisterDeathFields({ form, causes, deathBatches, onChange }: RegisterDeathFieldsProps) {
	return (
		<Stack spacing={2}>
			<TextField
				label="Fecha de la muerte"
				type="date"
				variant="filled"
				value={form.deathDate}
				onChange={(e) => onChange({ deathDate: e.target.value })}
				InputLabelProps={{ shrink: true }}
				inputProps={{ max: today() }}
				sx={filledSx}
			/>
			<TextField
				select
				label="Causa"
				variant="filled"
				value={form.causeId}
				onChange={(e) => onChange({ causeId: Number(e.target.value) })}
				sx={filledSx}
			>
				{causes.map((cause) => (
					<MenuItem
						key={cause.id}
						value={cause.id}
					>
						{cause.name}
					</MenuItem>
				))}
			</TextField>
			<TextField
				label="Observaciones (opcional)"
				variant="filled"
				multiline
				minRows={2}
				value={form.observations}
				onChange={(e) => onChange({ observations: e.target.value })}
				sx={filledSx}
			/>
			{deathBatches.length > 1 ? (
				<TextField
					select
					label="Lote de Muertes"
					variant="filled"
					value={form.deathBatchId}
					onChange={(e) => onChange({ deathBatchId: Number(e.target.value) })}
					sx={filledSx}
				>
					{deathBatches.map((batch) => (
						<MenuItem
							key={batch.id}
							value={batch.id}
						>
							{batch.name}
						</MenuItem>
					))}
				</TextField>
			) : (
				<Alert
					severity="info"
					sx={{ borderRadius: '6px' }}
				>
					{deathBatches.length === 1
						? `Va a «${deathBatches[0].name}».`
						: 'No hay un Lote de Muertes: se crea «Lote de Muertes».'}
				</Alert>
			)}
		</Stack>
	);
}

export default RegisterDeathFields;
