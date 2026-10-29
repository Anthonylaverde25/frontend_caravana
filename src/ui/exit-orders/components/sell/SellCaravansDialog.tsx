import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
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
import { useRegisterExit } from '@/features/exit-orders/hooks/useExitOrderMutations';
import { exitErrorBody } from '@/features/exit-orders/types';
import { useExitCandidates } from '../../hooks/useExitCandidates';
import { useExitLoadForm } from '../../hooks/useExitLoadForm';
import { formatKg, formatMoney } from '../exitOrderFormat';
import { ExitLoadPrefill, spreadErrors } from '../load/exitRows';
import SellAnimalsList from './SellAnimalsList';
import ExitPricingFields from '../load/ExitPricingFields';
import SellDteFields from './SellDteFields';
import SellSaleFields from './SellSaleFields';

interface SellCaravansDialogProps {
	open: boolean;
	onClose: () => void;
	caravanIds: number[];
	onDone?: () => void;
}

const primarySx = {
	bgcolor: 'primary.main',
	color: 'primary.contrastText',
	px: 3.5,
	fontWeight: 700,
	borderRadius: '6px',
	textTransform: 'none',
	boxShadow: 'none',
	'&:hover': { bgcolor: 'primary.dark' }
} as const;

/**
 * "Vender" from the herd (06 §4): a sale of one or a few animals without building an order by
 * hand. The registered order is created behind it; "Abrir en pantalla completa" carries
 * everything chosen to the full load.
 */
export function SellCaravansDialog({ open, onClose, caravanIds, onDone }: SellCaravansDialogProps) {
	const navigate = useNavigate();
	const herd = useExitCandidates();
	const prefill = useMemo<ExitLoadPrefill>(
		() => ({ rows: caravanIds.map((caravanId) => ({ caravanId })) }),
		[caravanIds]
	);
	const form = useExitLoadForm('register', undefined, herd.byId, !herd.isLoading, prefill);
	const register = useRegisterExit();
	const [problem, setProblem] = useState<string | null>(null);

	// The reason given on the last click stops applying as soon as the data it was about changes.
	useEffect(() => setProblem(null), [form.header, form.rows.length, form.pricing]);
	const left = caravanIds.length - form.rows.length;

	const confirm = () => {
		setProblem(form.problem);

		if (form.problem) return;

		const sentIds = form.sentIds;
		register.mutate(form.payloads.register, {
			onSuccess: () => {
				onDone?.();
				onClose();
			},
			onError: (error) => {
				const body = exitErrorBody(error);
				const spread = spreadErrors(body?.errors, sentIds);
				form.setErrors(spread);
				setProblem(
					Object.values(spread.general)[0] ??
						(Object.keys(spread.byRow).length > 0
							? 'Hay animales con errores.'
							: (body?.message ?? 'No se pudo registrar el egreso.'))
				);
			}
		});
	};

	const openFullScreen = () => {
		const exitPrefill: ExitLoadPrefill = {
			buyerId: form.header.buyerId,
			exitDate: form.header.exitDate,
			rows: form.rows.map((row) => ({ caravanId: row.caravanId, weight: row.weight })),
			calfDecisions: form.decisions,
			pricing: form.pricing,
			dte: form.dte.number.trim()
				? { number: form.dte.number, date: form.dte.date, heads: form.dte.headsTouched ? form.dte.heads : '' }
				: undefined
		};
		onClose();
		navigate('/exit-orders/register', { state: { exitPrefill } });
	};

	return (
		<Dialog
			open={open}
			onClose={register.isPending ? undefined : onClose}
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
					{caravanIds.length === 1 ? 'Vender' : `Vender ${caravanIds.length} animales`}
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
				{herd.isLoading ? (
					<Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
						<CircularProgress size={28} />
					</Box>
				) : (
					<Stack spacing={2.5}>
						{left > 0 && (
							<Alert
								severity="warning"
								sx={{ fontSize: '0.8rem', py: 0.5 }}
							>
								{left} animal(es) no pueden salir (muertos, ya vendidos o en un lote de egresos) y
								quedan fuera.
							</Alert>
						)}
						<SellAnimalsList form={form} />

						<SellSaleFields form={form} />

						<ExitPricingFields
							compact
							pricing={form.pricing}
							balance={form.balance}
							onChange={form.setPricing}
						/>

						<SellDteFields form={form} />

						<Typography
							variant="body2"
							sx={{ fontWeight: 700 }}
						>
							{form.totals.heads} cab.
							{form.totals.calves > 0 ? ` (con ${form.totals.calves} cría(s))` : ''}
							{form.totals.weightKg > 0 ? ` · ${formatKg(form.totals.weightKg)}` : ''}
							{form.totals.amount > 0 ? ` · ${formatMoney(form.totals.amount)}` : ''}
						</Typography>
						{problem && (
							<Alert
								severity="error"
								sx={{ borderRadius: '6px' }}
							>
								{problem}
							</Alert>
						)}
					</Stack>
				)}
			</DialogContent>

			<DialogActions
				sx={{
					p: 2,
					px: 3,
					bgcolor: 'background.default',
					borderTop: 1,
					borderColor: 'divider',
					display: 'flex',
					justifyContent: 'space-between'
				}}
			>
				<Button
					onClick={onClose}
					variant="text"
					sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}
				>
					Cancelar
				</Button>
				<Stack
					direction="row"
					spacing={1}
				>
					<Button
						onClick={openFullScreen}
						disabled={herd.isLoading}
						sx={{ fontWeight: 600, textTransform: 'none' }}
					>
						Abrir en pantalla completa
					</Button>
					<Button
						onClick={confirm}
						disabled={register.isPending}
						variant="contained"
						sx={primarySx}
					>
						{register.isPending ? 'Guardando...' : `Confirmar venta (${form.totals.heads})`}
					</Button>
				</Stack>
			</DialogActions>
		</Dialog>
	);
}

export default SellCaravansDialog;
