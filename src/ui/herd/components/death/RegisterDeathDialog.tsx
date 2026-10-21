import { useState } from 'react';
import type { AxiosError } from 'axios';
import {
	Alert,
	Box,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	IconButton,
	Stack,
	Typography
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useDeathBatches, useDeathCauses, useRegisterDeath } from '@/features/caravans/hooks/useRegisterDeath';
import RegisterDeathAnimalsList from './RegisterDeathAnimalsList';
import RegisterDeathFields from './RegisterDeathFields';
import { buildDeathPayload, deathFormProblem, emptyDeathForm, mapDeathErrors, type DyingAnimal } from './registerDeath';

interface RegisterDeathDialogProps {
	open: boolean;
	onClose: () => void;
	animals: DyingAnimal[];
	onDone?: () => void;
}

/**
 * "Registrar muerte": one or several animals, tagged or not, that died on the same day of the
 * same cause. They go to a death batch and leave every flow of the living herd.
 */
export function RegisterDeathDialog({ open, onClose, animals, onDone }: RegisterDeathDialogProps) {
	const { data: causes = [], isLoading: loadingCauses } = useDeathCauses(open);
	const { data: deathBatches = [], isLoading: loadingBatches } = useDeathBatches(open);
	const registerDeath = useRegisterDeath();
	const [form, setForm] = useState(emptyDeathForm);
	const [errors, setErrors] = useState<Record<number, string[]>>({});
	const [general, setGeneral] = useState<string[]>([]);

	const handleSubmit = () => {
		// Validated on click: the button is never disabled for missing data.
		const problem = deathFormProblem(form, deathBatches.length > 1);

		if (problem) {
			setGeneral([problem]);
			return;
		}

		const payload = buildDeathPayload(animals, form);
		setGeneral([]);
		registerDeath.mutate(payload, {
			onSuccess: () => {
				onDone?.();
				onClose();
			},
			onError: (error) => {
				const body = (error as AxiosError<{ message?: string; errors?: Record<string, string[]> }>).response
					?.data;
				const mapped = mapDeathErrors(body?.errors, payload);
				setErrors(mapped.byAnimal);
				setGeneral(
					mapped.general.length > 0 ? mapped.general : [body?.message ?? 'No se pudo registrar la muerte.']
				);
			}
		});
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			fullWidth
			maxWidth="sm"
			PaperProps={{ sx: { borderRadius: '8px', boxShadow: 1, bgcolor: 'background.paper' } }}
		>
			<Box
				sx={{
					p: 2,
					px: 3,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					borderBottom: 1,
					borderColor: 'divider'
				}}
			>
				<Typography
					variant="h6"
					sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.primary' }}
				>
					{animals.length === 1 ? 'Registrar muerte' : `Registrar muerte de ${animals.length} animales`}
				</Typography>
				<IconButton
					onClick={onClose}
					size="small"
					sx={{ color: 'primary.main' }}
				>
					<FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
				</IconButton>
			</Box>

			<DialogContent sx={{ p: 3 }}>
				{loadingCauses || loadingBatches ? (
					<Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
						<CircularProgress size={28} />
					</Box>
				) : (
					<Stack spacing={2.5}>
						<RegisterDeathAnimalsList
							animals={animals}
							errors={errors}
						/>
						{general.length > 0 && (
							<Alert
								severity="error"
								sx={{ borderRadius: '6px' }}
							>
								{general.join(' ')}
							</Alert>
						)}
						<RegisterDeathFields
							form={form}
							causes={causes}
							deathBatches={deathBatches}
							onChange={(change) => setForm((current) => ({ ...current, ...change }))}
						/>
					</Stack>
				)}
			</DialogContent>

			<DialogActions
				sx={{ p: 2, px: 3, bgcolor: 'background.default', borderTop: 1, borderColor: 'divider', gap: 1.5 }}
			>
				<Button
					onClick={onClose}
					variant="text"
					sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}
				>
					Cancelar
				</Button>
				<Button
					onClick={handleSubmit}
					disabled={registerDeath.isPending}
					variant="contained"
					sx={{
						bgcolor: 'primary.main',
						color: 'primary.contrastText',
						px: 4,
						fontWeight: 700,
						borderRadius: '6px',
						textTransform: 'none',
						boxShadow: 'none',
						'&:hover': { bgcolor: 'primary.dark' }
					}}
				>
					{registerDeath.isPending ? 'Guardando...' : 'Registrar muerte'}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export default RegisterDeathDialog;
