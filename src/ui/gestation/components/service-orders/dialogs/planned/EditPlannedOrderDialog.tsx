import { useEffect, useMemo, useState } from 'react';
import { Autocomplete, Box, Button, Dialog, IconButton, Stack, TextField, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useSnackbar } from 'notistack';
import { useCompany } from '@/contexts/CompanyContext';
import { isBreedingCandidate } from '@/core/caravans/domain/rules/isBreedingCandidate';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import { useUpdatePlannedServiceOrder } from '@/features/gestation/hooks/useServiceOrderIssuance';
import type { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import { isMale } from '../create-order-v2/lotFemales';

interface EditPlannedOrderDialogProps {
	order: ServiceOrder;
	open: boolean;
	onClose: () => void;
}

const fieldSx = { bgcolor: 'action.hover' };

/** "Editar" a planned order: its dates, its bulls and its notes. */
export default function EditPlannedOrderDialog({ order, open, onClose }: EditPlannedOrderDialogProps) {
	const { enqueueSnackbar } = useSnackbar();
	const { activeCompanyId } = useCompany();
	const { data: caravans = [] } = useCaravans(open ? activeCompanyId : null, 'all');
	const update = useUpdatePlannedServiceOrder();
	const isAi = order.service_method === 'AI';

	const [startDate, setStartDate] = useState(order.planned_start_date);
	const [endDate, setEndDate] = useState(order.planned_end_date ?? '');
	const [observations, setObservations] = useState(order.observations ?? '');
	const [maleIds, setMaleIds] = useState<number[]>(order.male_caravan_ids);

	useEffect(() => {
		if (!open) return;

		setStartDate(order.planned_start_date);
		setEndDate(order.planned_end_date ?? '');
		setObservations(order.observations ?? '');
		setMaleIds(order.male_caravan_ids);
	}, [open, order]);

	const males = useMemo(() => caravans.filter((c) => isMale(c) && isBreedingCandidate(c)), [caravans]);

	const handleSave = async () => {
		if (!startDate) {
			enqueueSnackbar('Indicá la fecha de inicio.', { variant: 'warning' });
			return;
		}

		try {
			const result = await update.mutateAsync({
				id: order.id,
				payload: {
					start_date: startDate,
					end_date: endDate || null,
					observations: observations.trim() || null,
					male_caravan_ids: maleIds
				}
			});
			enqueueSnackbar(`Orden ${order.code} actualizada`, { variant: 'success' });
			result.warnings.forEach((warning) => enqueueSnackbar(warning, { variant: 'warning' }));
			onClose();
		} catch (error) {
			const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
			enqueueSnackbar(message ?? 'No se pudo actualizar la orden.', { variant: 'error' });
		}
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="sm"
			fullWidth
			onClick={(event) => event.stopPropagation()}
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
					Editar {order.code}
				</Typography>
				<IconButton
					size="small"
					onClick={onClose}
					sx={{ color: 'primary.main' }}
				>
					<FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
				</IconButton>
			</Box>
			<Stack
				spacing={2}
				sx={{ p: 3 }}
			>
				<TextField
					fullWidth
					variant="filled"
					type="date"
					label="Inicio previsto"
					value={startDate}
					onChange={(e) => setStartDate(e.target.value)}
					InputLabelProps={{ shrink: true }}
					sx={fieldSx}
				/>
				{!isAi && (
					<TextField
						fullWidth
						variant="filled"
						type="date"
						label="Fin previsto"
						value={endDate}
						onChange={(e) => setEndDate(e.target.value)}
						InputLabelProps={{ shrink: true }}
						sx={fieldSx}
					/>
				)}
				{!isAi && (
					<Autocomplete
						multiple
						options={males}
						value={males.filter((male) => maleIds.includes(male.id!))}
						getOptionLabel={(male) => male.identification}
						onChange={(_, value) => setMaleIds(value.map((male) => male.id!))}
						renderInput={(params) => (
							<TextField
								{...params}
								variant="filled"
								label="Toros"
								sx={fieldSx}
							/>
						)}
					/>
				)}
				<TextField
					fullWidth
					multiline
					minRows={2}
					variant="filled"
					label="Observaciones"
					value={observations}
					onChange={(e) => setObservations(e.target.value)}
					sx={fieldSx}
				/>
			</Stack>
			<Box
				sx={{
					p: 2,
					px: 3,
					bgcolor: 'background.default',
					borderTop: 1,
					borderColor: 'divider',
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center'
				}}
			>
				<Button
					variant="text"
					onClick={onClose}
					sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}
				>
					Cancelar
				</Button>
				<Button
					variant="contained"
					onClick={handleSave}
					disabled={update.isPending}
					sx={{
						bgcolor: 'primary.main',
						color: 'primary.contrastText',
						px: 3.5,
						fontWeight: 700,
						borderRadius: '6px',
						textTransform: 'none',
						boxShadow: 'none',
						'&:hover': { bgcolor: 'primary.dark' }
					}}
				>
					Guardar
				</Button>
			</Box>
		</Dialog>
	);
}
