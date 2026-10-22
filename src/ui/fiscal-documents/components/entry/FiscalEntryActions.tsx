import { Button, CircularProgress, Stack } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ReadFromImageButton from './image/ReadFromImageButton';

interface FiscalEntryActionsProps {
	/** Null when there is no paper to read (a conversion inherits everything). */
	onReadImage: ((file: File) => void) | null;
	reading: boolean;
	saving: boolean;
	primary: string;
	onCancel: () => void;
	onSubmit: () => void;
}

/** The bar of "Cargar comprobante": read from an image, cancel, register. */
export default function FiscalEntryActions({
	onReadImage,
	reading,
	saving,
	primary,
	onCancel,
	onSubmit
}: FiscalEntryActionsProps) {
	return (
		<Stack
			direction="row"
			spacing={1.5}
			alignItems="center"
		>
			{onReadImage && (
				<ReadFromImageButton
					onPick={onReadImage}
					disabled={reading || saving}
				/>
			)}
			<Button
				variant="outlined"
				color="inherit"
				onClick={onCancel}
				disabled={saving}
				sx={{
					fontWeight: 600,
					textTransform: 'none',
					borderRadius: '6px',
					borderColor: 'divider'
				}}
			>
				Cancelar
			</Button>
			<Button
				variant="contained"
				color="primary"
				onClick={onSubmit}
				disabled={saving}
				startIcon={
					saving ? (
						<CircularProgress
							size={16}
							color="inherit"
						/>
					) : (
						<FuseSvgIcon size={18}>heroicons-outline:check</FuseSvgIcon>
					)
				}
				sx={{
					fontWeight: 700,
					textTransform: 'none',
					borderRadius: '6px',
					boxShadow: 'none'
				}}
			>
				{primary}
			</Button>
		</Stack>
	);
}
