import { useState } from 'react';
import { Paper, Stack, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { sectionTitleSx } from '@/ui/weaning-orders/components/form/formStyles';
import { useFiscalDiscrepancies, useResolveDiscrepancy } from '@/features/fiscal/hooks/useDeliveryNotes';
import { DiscrepancyFilters, FiscalDiscrepancy } from '@/core/fiscal/domain/entities/DeliveryNote';
import { readApiErrors } from '@/ui/items/components/apiErrors';
import ReasonDialog from '@/ui/stock/components/dialogs/ReasonDialog';
import DiscrepanciesGrid from './DiscrepanciesGrid';

interface DiscrepanciesSectionProps {
	filters: DiscrepancyFilters;
}

/**
 * "Diferencias con remitos": every difference between the papers (DC7). They are settled with the
 * provider, outside the system, and closed here with how (DC8); nothing changes in stock or cost.
 */
export default function DiscrepanciesSection({ filters }: DiscrepanciesSectionProps) {
	const { enqueueSnackbar } = useSnackbar();
	const { data: rows = [], isLoading } = useFiscalDiscrepancies(filters);
	const { mutateAsync, isPending } = useResolveDiscrepancy();
	const [resolving, setResolving] = useState<FiscalDiscrepancy | null>(null);
	const [error, setError] = useState<string | null>(null);

	const confirm = async (resolution: string) => {
		if (!resolving) return;

		try {
			await mutateAsync({ id: resolving.id, resolution });
			setResolving(null);
			enqueueSnackbar('Novedad resuelta.', { variant: 'success' });
		} catch (e) {
			const { fields, domain } = readApiErrors(e, 'No se pudo resolver.');
			setError(domain ?? Object.values(fields)[0] ?? 'No se pudo resolver.');
		}
	};

	if (!isLoading && rows.length === 0) return null;

	return (
		<Paper
			variant="outlined"
			sx={{ p: 2, borderRadius: '8px' }}
		>
			<Stack spacing={1.5}>
				<Typography sx={sectionTitleSx}>
					Diferencias con remitos ({rows.filter((r) => r.status === 'OPEN').length} abiertas)
				</Typography>
				<DiscrepanciesGrid
					rows={rows}
					loading={isLoading}
					onResolve={(row) => {
						setError(null);
						setResolving(row);
					}}
				/>
			</Stack>
			<ReasonDialog
				open={!!resolving}
				title={`Resolver: ${resolving?.typeLabel ?? ''}`}
				consequences={resolving ? [resolving.detail] : []}
				reasonLabel="Cómo se resolvió con el proveedor"
				note="Queda como constancia. No cambia el stock ni el costo: si hay que corregirlos, va con la nota de crédito del proveedor."
				confirmLabel="Marcar resuelta"
				confirmColor="primary"
				busy={isPending}
				error={error}
				onClose={() => setResolving(null)}
				onConfirm={confirm}
			/>
		</Paper>
	);
}
