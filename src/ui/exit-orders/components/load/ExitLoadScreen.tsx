import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Alert, Box, Button, Stack } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import FullScreenEntryBar from '@/components/FullScreenEntryBar';
import { usePartner } from '@/features/partners/hooks/usePartners';
import {
	useExecuteExitOrder,
	useIssueExitOrder,
	useRegisterExit,
	useUpdateExitOrder
} from '@/features/exit-orders/hooks/useExitOrderMutations';
import { exitErrorBody, type ExitOrder } from '@/features/exit-orders/types';
import { useExitCandidates } from '../../hooks/useExitCandidates';
import { useExitLoadForm } from '../../hooks/useExitLoadForm';
import ExitAnimalsSection from './ExitAnimalsSection';
import ExitSaleFields from './ExitSaleFields';
import ExitPricingDialog from './ExitPricingDialog';
import ExitOrderPreviewDialog from './ExitOrderPreviewDialog';
import ExitInvoiceSummary from './ExitInvoiceSummary';
import ExitDteDialog from './ExitDteDialog';
import ExitDteCard from './ExitDteCard';
import { ExitLoadMode, ExitLoadPrefill, NO_ERRORS, spreadErrors } from './exitRows';

interface ExitLoadScreenProps {
	mode: ExitLoadMode;
	order?: ExitOrder;
	prefill: ExitLoadPrefill | null;
	onClose: () => void;
}

const COPY: Record<ExitLoadMode, { title: string; subtitle: string }> = {
	issue: {
		title: 'Nueva orden de egreso',
		subtitle: 'Qué animales van a salir, para quién y cuándo. La salida se registra el día de la carga.'
	},
	execute: {
		title: 'Registrar salida',
		subtitle: 'Marcá los animales que subieron al camión. Los que no suben quedan pendientes.'
	},
	register: {
		title: 'Registrar venta',
		subtitle: 'Animales que ya salieron del campo: qué animales, a quién, cómo se cobró y su DTE.'
	}
};

const primaryLabel = (mode: ExitLoadMode, heads: number, isEdit: boolean): string =>
	mode === 'issue'
		? isEdit
			? 'Guardar cambios'
			: `Emitir orden (${heads})`
		: mode === 'execute'
			? `Confirmar salida (${heads})`
			: `Confirmar venta (${heads})`;

/**
 * The exit load in one full-screen sheet and three modes (06 §3), laid out like "Registrar destete":
 * the client, the DTE and the balance of the load on the left, the animals on the right. The price
 * and the DTE are set in their own dialogs; "Previsualizar" shows the whole order and confirms it
 * (rediseño del 29/10/2026).
 */
export const ExitLoadScreen: React.FC<ExitLoadScreenProps> = ({ mode, order, prefill, onClose }) => {
	const navigate = useNavigate();
	const herd = useExitCandidates();
	const form = useExitLoadForm(mode, order, herd.byId, !herd.isLoading, prefill);
	const { data: buyer } = usePartner(form.header.buyerId);
	const issue = useIssueExitOrder();
	const update = useUpdateExitOrder();
	const execute = useExecuteExitOrder();
	const register = useRegisterExit();
	const [serverProblem, setServerProblem] = useState<string | null>(null);
	const [tried, setTried] = useState(false);
	const [pricingOpen, setPricingOpen] = useState(false);
	const [previewOpen, setPreviewOpen] = useState(false);
	const [dteOpen, setDteOpen] = useState(false);
	const isPending = issue.isPending || update.isPending || execute.isPending || register.isPending;
	const copy = order && mode === 'issue' ? { ...COPY.issue, title: `Editar orden ${order.code}` } : COPY[mode];
	const label = primaryLabel(mode, form.totals.heads, !!order && mode === 'issue');

	// The server's last answer stops applying as soon as the data it was about changes.
	useEffect(() => setServerProblem(null), [form.header, form.rows.length, form.pricing]);

	const submit = () => {
		// Validated on click: the button is never disabled for missing data.
		setTried(true);

		if (form.problem) return;

		const sentIds = form.sentIds;
		const callbacks = {
			onSuccess: (saved: ExitOrder) => navigate(`/exit-orders?orderId=${saved.id}`),
			// The server's objections go back to their rows and fields; the sheet stays as it was.
			onError: (error: unknown) => {
				const body = exitErrorBody(error);
				const spread = body?.errors ? spreadErrors(body.errors, sentIds) : NO_ERRORS;
				form.setErrors(spread);
				setServerProblem(
					Object.values(spread.general)[0] ??
						(Object.keys(spread.byRow).length > 0 ? null : (body?.message ?? 'No se pudo guardar.'))
				);
			}
		};

		if (mode === 'issue' && order) update.mutate({ id: order.id, payload: form.payloads.issue }, callbacks);
		else if (mode === 'issue') issue.mutate(form.payloads.issue, callbacks);
		else if (mode === 'execute' && order)
			execute.mutate({ id: order.id, payload: form.payloads.execute }, callbacks);
		else register.mutate(form.payloads.register, callbacks);
	};

	return (
		<>
			<FullScreenEntryBar
				title={copy.title}
				subtitle={copy.subtitle}
				primaryLabel={label}
				primaryIcon={mode === 'issue' ? 'heroicons-outline:paper-airplane' : 'heroicons-outline:check'}
				busy={isPending}
				onClose={onClose}
				onPrimary={submit}
				secondaryAction={
					<Button
						variant="outlined"
						color="inherit"
						onClick={() => setPreviewOpen(true)}
						startIcon={<FuseSvgIcon size={18}>heroicons-outline:eye</FuseSvgIcon>}
						sx={{
							textTransform: 'none',
							fontWeight: 600,
							borderRadius: '6px',
							px: 2,
							borderColor: 'divider',
							'&:hover': { borderColor: 'currentColor', bgcolor: 'action.hover' }
						}}
					>
						Previsualizar
					</Button>
				}
			/>

			<Box
				sx={{
					flex: 1,
					minHeight: 0,
					overflow: 'auto',
					p: { xs: 2, md: 3 },
					display: 'grid',
					gridTemplateColumns: { xs: '1fr', lg: '420px minmax(0, 1fr)' },
					gap: 2.5,
					alignItems: 'start'
				}}
			>
				<Stack spacing={2.5}>
					{order && mode === 'execute' && order.status === 'PARTIAL' && (
						<Alert
							severity="info"
							sx={{ borderRadius: '6px', fontSize: '0.8rem', py: 0.5 }}
						>
							Ya salieron {order.exited_count} animales en otra carga. Acá están los {order.pending_count}{' '}
							que quedan.
						</Alert>
					)}
					<ExitSaleFields
						mode={mode}
						header={form.header}
						onChange={form.setHeader}
						errors={form.errors.general}
						buyerName={order?.buyer?.name}
					/>
					{mode !== 'issue' && (
						<ExitDteCard
							dte={form.dte}
							onOpen={() => setDteOpen(true)}
						/>
					)}
					<ExitInvoiceSummary
						form={form}
						orderCode={order?.code}
						onEditPrice={() => setPricingOpen(true)}
					/>
					{(serverProblem || (tried && form.problem)) && (
						<Alert
							severity="error"
							sx={{ borderRadius: '6px', fontSize: '0.8rem' }}
						>
							{serverProblem ?? form.problem}
						</Alert>
					)}
				</Stack>

				<Box sx={{ position: { lg: 'sticky' }, top: 0 }}>
					<ExitAnimalsSection
						form={form}
						candidates={herd.candidates}
						batches={herd.batches}
					/>
				</Box>
			</Box>

			<ExitPricingDialog
				open={pricingOpen}
				form={form}
				onClose={() => setPricingOpen(false)}
			/>

			<ExitDteDialog
				open={dteOpen}
				onClose={() => setDteOpen(false)}
				dte={form.dte}
				onChange={form.setDte}
				errors={form.errors.general}
			/>

			<ExitOrderPreviewDialog
				open={previewOpen}
				onClose={() => setPreviewOpen(false)}
				form={form}
				partner={buyer}
				orderCode={order?.code}
				confirmLabel={label}
				busy={isPending}
				onConfirm={() => {
					setPreviewOpen(false);
					submit();
				}}
			/>
		</>
	);
};

export default ExitLoadScreen;
