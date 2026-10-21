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
import { useTagCalves, useUntaggedCalves } from '@/features/caravans/hooks/useTagCalves';
import TagCalvesContextCard from './TagCalvesContextCard';
import TagCalvesTable from './TagCalvesTable';
import RegisterDeathDialog from '../death/RegisterDeathDialog';
import type { UntaggedCalf } from '@/core/caravans/domain/entities/UntaggedCalf';
import {
	buildTagCalvesPayload,
	mapTagCalvesErrors,
	today,
	type TagCalvesErrors,
	type TagCalvesValues
} from './tagCalves';

interface TagCalvesDialogProps {
	open: boolean;
	onClose: () => void;
	batch: { id: number; name: string };
}

/**
 * "Caravanear crías": the calves of a batch born without a tag, and the tag put on each. Rows left
 * empty keep waiting. The server checks every row at once; its objections mark the cells.
 */
export function TagCalvesDialog({ open, onClose, batch }: TagCalvesDialogProps) {
	const { data: calves = [], isLoading } = useUntaggedCalves(open ? batch.id : null);
	const tagCalves = useTagCalves();
	const [taggedAt, setTaggedAt] = useState(today());
	const [values, setValues] = useState<TagCalvesValues>({});
	const [errors, setErrors] = useState<TagCalvesErrors>({});
	const [general, setGeneral] = useState<string[]>([]);
	const [dying, setDying] = useState<UntaggedCalf | null>(null);

	const handleChange = (calfId: number, tag: string) => {
		setValues((current) => ({ ...current, [calfId]: tag }));
		setErrors(({ [calfId]: _cleared, ...rest }) => rest);
	};

	const handleSubmit = () => {
		const payload = buildTagCalvesPayload(values, taggedAt);

		// Validated on click, not by disabling the button: nothing typed is the one thing to say.
		if (payload.items.length === 0) {
			setGeneral(['Escribí la caravana de al menos una cría.']);
			return;
		}

		setGeneral([]);
		tagCalves.mutate(payload, {
			onSuccess: onClose,
			onError: (error) => {
				const body = (error as AxiosError<{ message?: string; errors?: Record<string, string[]> }>).response
					?.data;
				const mapped = mapTagCalvesErrors(body?.errors, payload);
				setErrors(mapped.byCalf);
				setGeneral(mapped.general.length > 0 ? mapped.general : [body?.message ?? 'No se pudo caravanear.']);
			}
		});
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			fullWidth
			maxWidth="md"
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
					Caravanear crías
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
				{isLoading ? (
					<Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
						<CircularProgress size={28} />
					</Box>
				) : calves.length === 0 ? (
					<Alert
						severity="success"
						sx={{ borderRadius: '6px' }}
					>
						Todas las crías del lote tienen caravana.
					</Alert>
				) : (
					<Stack spacing={2}>
						<TagCalvesContextCard
							batchName={batch.name}
							pending={calves.length}
							taggedAt={taggedAt}
							onTaggedAtChange={setTaggedAt}
						/>
						{general.length > 0 && (
							<Alert
								severity="error"
								sx={{ borderRadius: '6px' }}
							>
								{general.join(' ')}
							</Alert>
						)}
						<TagCalvesTable
							calves={calves}
							values={values}
							errors={errors}
							onChange={handleChange}
							onDied={setDying}
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
				{calves.length > 0 && (
					<Button
						onClick={handleSubmit}
						disabled={tagCalves.isPending}
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
						{tagCalves.isPending ? 'Guardando...' : 'Caravanear'}
					</Button>
				)}
			</DialogActions>
			{dying && (
				<RegisterDeathDialog
					open
					onClose={() => setDying(null)}
					animals={[{ id: dying.id, label: dying.label }]}
				/>
			)}
		</Dialog>
	);
}

export default TagCalvesDialog;
