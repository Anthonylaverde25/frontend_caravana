import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useSnackbar } from 'notistack';
import type { Batch } from '@/core/batches/domain/entities/Batch';
import { useIssueServiceOrders, useRegisterServiceOrders } from '@/features/gestation/hooks/useServiceOrderIssuance';
import type { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import { LotFemales } from './lotFemales';
import { isFutureDay } from './orderSheetDates';
import { buildIssuePayload, buildRegisterPayload } from './orderSheetPayload';
import { orderSheetProblems, serverErrorLines } from './orderSheetRules';
import { OrderSelection } from './useCreateOrderV2Wizard';
import { OrderSheetDetails } from './useOrderSheetDetails';
import { OrderSheetMode, ServiceMethodType } from './types';

interface OrderSheetFlowParams {
	open: boolean;
	mode: OrderSheetMode;
	type: ServiceMethodType;
	selection: OrderSelection;
	details: OrderSheetDetails;
	batches: Batch[];
	femalesByBatch: Map<number, LotFemales>;
	onClose: () => void;
}

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

/** Validation on click, the confirmation over the sheet, and the single request that saves every batch or none. */
export function useOrderSheetFlow({
	open,
	mode,
	type,
	selection,
	details,
	batches,
	femalesByBatch,
	onClose
}: OrderSheetFlowParams) {
	const { enqueueSnackbar } = useSnackbar();
	const navigate = useNavigate();
	const issue = useIssueServiceOrders();
	const register = useRegisterServiceOrders();
	const [confirming, setConfirming] = useState(false);

	const lots = Array.from(selection.selectedBatches.values());
	const planned = mode === 'issue' && isFutureDay(details.startDate);
	const problems = orderSheetProblems({ mode, type, lots, batches, femalesByBatch, details });

	useEffect(() => {
		setConfirming(false);
	}, [open]);

	const submitLabel =
		mode === 'register'
			? `Registrar ${plural(lots.length, 'orden', 'órdenes')}`
			: planned
				? `Planificar ${plural(lots.length, 'orden', 'órdenes')}`
				: `Iniciar ${plural(lots.length, 'servicio', 'servicios')}`;

	/** An AI service that already started goes on to load its inseminations, when it is only one. */
	const finish = (orders: ServiceOrder[], successMessage: string, warnings: string[] = []) => {
		enqueueSnackbar(successMessage, { variant: 'success' });
		warnings.forEach((warning) => enqueueSnackbar(warning, { variant: 'warning' }));
		onClose();

		if (type === 'AI' && !planned && orders.length === 1) {
			navigate(`/gestation/service-orders/${orders[0].id}/inseminations`);
		}
	};

	const submit = async () => {
		details.setErrors({});
		try {
			if (mode === 'register') {
				const { orders } = await register.mutateAsync(buildRegisterPayload(type, lots, details));
				finish(
					orders,
					`${plural(orders.length, 'orden registrada', 'órdenes registradas')}: ${orders.map((o) => o.code).join(', ')}`
				);
			} else {
				const result = await issue.mutateAsync(buildIssuePayload(type, lots, details));
				const codes = result.orders.map((o) => o.code).join(', ');
				finish(
					result.orders,
					result.planned
						? `${plural(result.orders.length, 'orden planificada', 'órdenes planificadas')}: ${codes}`
						: `${plural(result.orders.length, 'servicio iniciado', 'servicios iniciados')}: ${codes}`,
					result.warnings
				);
			}
		} catch (error) {
			const data = (error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })
				.response?.data;
			const errors = data?.errors ?? {};
			details.setErrors(errors);
			enqueueSnackbar(data?.message ?? 'No se pudo guardar la orden.', { variant: 'error' });

			// What the server objected to is corrected on the sheet, where it shows in red.
			if (Object.keys(errors).length > 0) setConfirming(false);
		}
	};

	const proceed = () => {
		if (problems.length > 0) {
			enqueueSnackbar(problems[0], { variant: 'warning' });
			return;
		}

		setConfirming(true);
	};

	return {
		lots,
		problems,
		confirming,
		proceed,
		cancelConfirm: () => setConfirming(false),
		submit,
		submitLabel,
		busy: issue.isPending || register.isPending,
		errorLines: serverErrorLines(details.errors, lots)
	};
}
