import {
	Dialog,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	Stack,
	Typography,
	Box,
	IconButton,
	MenuItem,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateBatch } from '@/features/batches/hooks/useCreateBatch';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import { useBatchTypes } from '@/features/batch-types/hooks/useBatchTypes';
import { internalBatchSchema, InternalBatchFormValues } from './InternalBatchSchema';

interface CreateInternalBatchDialogProps {
	open: boolean;
	onClose: () => void;
	onSuccess?: () => void;
	batchTypeCode: 'INTERNAL_CONSUMPTION' | 'INTERNAL_DEATH' | 'QUARANTINE';
	title: string;
}

/**
 * CreateInternalBatchDialog Component
 * Modal to quickly create internal batches linked directly to the company/establishment.
 */
function CreateInternalBatchDialog({
	open,
	onClose,
	onSuccess,
	batchTypeCode,
	title,
}: CreateInternalBatchDialogProps) {
	const { enqueueSnackbar } = useSnackbar();
	const { data: batchTypes = [], isLoading: isLoadingBatchTypes } = useBatchTypes();
	const { mutate, isPending } = useCreateBatch();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
		setValue,
	} = useForm<InternalBatchFormValues>({
		resolver: zodResolver(internalBatchSchema),
		defaultValues: {
			name: '',
			batch_type_id: undefined,
			observaciones: '',
		},
	});

	// Automatically resolve and set the batch_type_id based on batchTypeCode prop
	useEffect(() => {
		if (open) {
			console.log('Dialog opened. batchTypeCode:', batchTypeCode);
			console.log('Available batchTypes in Dialog:', batchTypes);
			if (batchTypes.length > 0 && batchTypeCode) {
				const typeObj = batchTypes.find((t) => t.code === batchTypeCode);
				console.log('Found matching batchType:', typeObj);
				if (typeObj) {
					setValue('batch_type_id', typeObj.id);
					console.log('Set batch_type_id to:', typeObj.id);
				} else {
					console.warn('Could not find batchType matching code:', batchTypeCode);
				}
			}
		}
	}, [batchTypes, batchTypeCode, setValue, open]);

	// Print form validation errors to console
	useEffect(() => {
		if (Object.keys(errors).length > 0) {
			console.warn('Form validation errors in CreateInternalBatchDialog:', errors);
		}
	}, [errors]);

	const handleOnSubmit = (data: InternalBatchFormValues) => {
		console.log('Data to send:', data);
		mutate(data as any, {
			onSuccess: () => {
				enqueueSnackbar('Lote interno creado exitosamente', { variant: 'success' });
				reset();
				if (onSuccess) onSuccess();
				onClose();
			},
			onError: (error: any) => {
				const message = error.response?.data?.message || 'Error al crear el lote';
				enqueueSnackbar(message, { variant: 'error' });
			},
		});
	};

	const handleClose = () => {
		reset();
		onClose();
	};

	return (
		<Dialog
			open={open}
			onClose={handleClose}
			fullWidth
			maxWidth="sm"
			PaperProps={{
				sx: {
					borderRadius: '8px',
					boxShadow: 1,
					bgcolor: 'background.paper',
				},
			}}
		>
			<Box
				sx={{
					p: 2,
					px: 3,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					borderBottom: 1,
					borderColor: 'divider',
					bgcolor: 'background.paper',
				}}
			>
				<Typography
					variant="h6"
					sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.primary' }}
				>
					{title}
				</Typography>
				<IconButton
					onClick={handleClose}
					size="small"
					sx={{ color: 'primary.main' }}
				>
					<FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
				</IconButton>
			</Box>

			<form onSubmit={handleSubmit(handleOnSubmit)}>
				<DialogContent sx={{ p: 3, bgcolor: 'background.paper' }}>
					<Stack spacing={3}>
						<TextField
							{...register('name')}
							label="Nombre del Lote"
							variant="filled"
							fullWidth
							required
							error={!!errors.name}
							helperText={errors.name?.message}
							sx={{ bgcolor: 'action.hover' }}
						/>

						<TextField
							{...register('observaciones')}
							label="Observaciones"
							variant="filled"
							fullWidth
							multiline
							rows={3}
							sx={{ bgcolor: 'action.hover' }}
						/>
					</Stack>
				</DialogContent>

				<DialogActions
					sx={{
						p: 2,
						px: 3,
						bgcolor: 'background.default',
						borderTop: 1,
						borderColor: 'divider',
						gap: 1.5,
					}}
				>
					<Button
						onClick={handleClose}
						variant="text"
						sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}
					>
						Cancelar
					</Button>
					<Button
						type="submit"
						variant="contained"
						disabled={isPending || isLoadingBatchTypes}
						sx={{
							bgcolor: 'primary.main',
							color: 'primary.contrastText',
							px: 4,
							fontWeight: 700,
							borderRadius: '6px',
							textTransform: 'none',
							boxShadow: 'none',
							'&:hover': { bgcolor: 'primary.dark' },
						}}
					>
						{isPending ? 'Guardando...' : 'Crear'}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
}

export default CreateInternalBatchDialog;
