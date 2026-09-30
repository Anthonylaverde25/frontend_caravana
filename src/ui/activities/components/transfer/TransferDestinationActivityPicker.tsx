import React, { useState } from 'react';
import {
	Box,
	Button,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	MenuItem,
	Stack,
	TextField,
	Typography
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useTransferPalette } from './transferPalette';

interface ActivityOption {
	id: number;
	name: string;
	code: string;
}

interface TransferDestinationActivityPickerProps {
	value: number | null;
	onChange: (activityId: number | null) => void;
	activities: ActivityOption[];
	sourceActivityName: string | null;
	/** How many destinations are already declared: changing the activity would invalidate them. */
	declaredCount: number;
	/** Drops the declared destinations, because they belonged to the previous activity. */
	onDiscardDestinations: () => void;
	/**
	 * Where the activity was already declared ("Nueva orden de transferencia", the destination
	 * chosen before switching mode, the order being resumed). When set, the activity is shown as
	 * the fact it is, not asked again; "Cambiar" is there for the rare case it has to change.
	 */
	declaredIn?: string | null;
}

/**
 * The destination activity of the movement, declared once for the whole sheet.
 *
 * This is the piece that makes a movement readable as "from activity/batch to
 * activity/batch". It governs every destination card, so it renders as the HEADER of that
 * block rather than as a card of its own: a separate panel read as a second, unrelated
 * decision, and each panel ended up explaining the same rule over again.
 *
 * One activity per sheet, however many pages it runs to. Splitting a batch into several
 * destinations is normal; splitting it across two productive stages is two sheets, so that
 * whoever writes a batch name by hand at the chute has one closed list to write from.
 */
export const TransferDestinationActivityPicker: React.FC<TransferDestinationActivityPickerProps> = ({
	value,
	onChange,
	activities,
	sourceActivityName,
	declaredCount,
	onDiscardDestinations,
	declaredIn = null
}) => {
	const [editing, setEditing] = useState(false);
	// Wrapped in an object rather than held as a bare id, because clearing the activity is a
	// legitimate change to confirm and `null` cannot mean both "no pending change" and
	// "pending change to none".
	const [pending, setPending] = useState<{ activityId: number | null } | null>(null);

	const palette = useTransferPalette();
	// Compared as numbers: an id that arrives as "2" from a URL or an API must still find its name.
	const selected = activities.find((activity) => Number(activity.id) === Number(value)) ?? null;
	const showDeclared = declaredIn !== null && selected !== null && !editing;

	// Las etapas que se nombran como ejemplo dejan afuera la de origen: mover dentro de la
	// misma etapa es válido, pero como ejemplo de "a dónde pasan" no dice nada.
	const examples = activities
		.filter((activity) => activity.name !== sourceActivityName)
		.slice(0, 3)
		.map((activity) => activity.name)
		.join(', ');

	// Changing the activity with destinations already declared is asked about, never done
	// quietly: silently dragging batches of another activity along is exactly the disorder
	// this declaration exists to prevent.
	const requestChange = (nextId: number | null) => {
		if (declaredCount > 0 && nextId !== value) {
			setPending({ activityId: nextId });
			return;
		}

		onChange(nextId);
	};

	const confirmChange = () => {
		if (!pending) return;

		onDiscardDestinations();
		onChange(pending.activityId);
		setPending(null);
	};

	return (
		<>
			<Stack
				direction={{ xs: 'column', sm: 'row' }}
				spacing={{ xs: 2, sm: 4 }}
				alignItems={{ sm: 'flex-start' }}
			>
				{sourceActivityName && (
					<Box sx={{ minWidth: 150 }}>
						<Typography
							variant="overline"
							sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 1, display: 'block', mb: 0.75 }}
						>
							Origen actual
						</Typography>
						<Stack
							direction="row"
							spacing={1}
							alignItems="center"
						>
							<Chip
								size="small"
								label={sourceActivityName}
								sx={{ fontWeight: 800, bgcolor: palette.softBg, border: '1px solid', borderColor: palette.cardBorder }}
							/>
							<FuseSvgIcon
								size={16}
								sx={{ color: 'text.disabled' }}
							>
								heroicons-outline:arrow-long-right
							</FuseSvgIcon>
							<Typography
								variant="body2"
								color="text.secondary"
								sx={{ fontWeight: 600 }}
							>
								Destino:
							</Typography>
						</Stack>
					</Box>
				)}

				{showDeclared ? (
					<Box sx={{ flexGrow: 1, width: '100%' }}>
						<Typography
							variant="overline"
							sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 1, display: 'block', mb: 0.75 }}
						>
							Etapa productiva de destino
						</Typography>
						<Stack
							direction="row"
							spacing={1.5}
							alignItems="center"
						>
							<Chip
								label={selected?.name}
								sx={{ fontWeight: 800, bgcolor: palette.softBg, border: '1px solid', borderColor: palette.cardBorder }}
							/>
							<Typography
								variant="caption"
								color="text.secondary"
							>
								Declarada en {declaredIn}. Vale para toda la planilla.
							</Typography>
							<Button
								size="small"
								onClick={() => setEditing(true)}
								sx={{ textTransform: 'none', fontWeight: 600 }}
							>
								Cambiar
							</Button>
						</Stack>
					</Box>
				) : (
				<Box sx={{ flexGrow: 1, width: '100%' }}>
					{/* La etiqueta va arriba del campo, no flotando adentro: es un dato que se lee
					    de un vistazo junto al origen, no un formulario que se recorre. */}
					<Typography
						variant="body2"
						sx={{ fontWeight: 700, mb: 0.75 }}
					>
						Etapa productiva de destino{' '}
						<Box
							component="span"
							sx={{ color: 'error.main' }}
						>
							*
						</Box>
					</Typography>
					<TextField
						select
						size="small"
						fullWidth
						required
						value={selected ? Number(selected.id) : ''}
						onChange={(e) => requestChange(e.target.value === '' ? null : Number(e.target.value))}
						SelectProps={{ displayEmpty: true }}
						helperText={
							value == null
								? 'Elegila para poder agregar lotes: es lo que hace verificable el lote escrito a mano en la manga.'
								: 'Vale para toda la planilla, todas sus hojas. Cada lote de destino pertenece a esta etapa.'
						}
					>
						<MenuItem value="">
							<Typography
								variant="body2"
								color="text.secondary"
							>
								Seleccione etapa{examples ? ` (ej. ${examples})` : ''}…
							</Typography>
						</MenuItem>
						{activities.map((activity) => (
							<MenuItem
								key={activity.id}
								value={Number(activity.id)}
							>
								{activity.name}
							</MenuItem>
						))}
					</TextField>
				</Box>
				)}
			</Stack>

			<Dialog
				open={pending !== null}
				onClose={() => setPending(null)}
				maxWidth="xs"
				fullWidth
				PaperProps={{ sx: { borderRadius: '8px', boxShadow: 3 } }}
			>
				<DialogTitle sx={{ fontSize: '1.1rem', fontWeight: 600 }}>Cambiar la actividad de destino</DialogTitle>
				<DialogContent dividers>
					<DialogContentText sx={{ fontSize: '0.85rem' }}>
						Ya declaraste {declaredCount} destino(s) en {selected?.name ?? 'la actividad actual'}. Esos lotes no
						pertenecen a la etapa que estás eligiendo, así que se descartan y los animales quedan sin asignar.
					</DialogContentText>
				</DialogContent>
				<DialogActions sx={{ p: 2 }}>
					<Button
						onClick={() => setPending(null)}
						sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
					>
						Cancelar
					</Button>
					<Button
						variant="contained"
						color="warning"
						onClick={confirmChange}
						sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '6px' }}
					>
						Cambiar y descartar
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

export default TransferDestinationActivityPicker;
