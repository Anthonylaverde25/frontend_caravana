import React, { forwardRef } from 'react';
import { Alert, Box, CircularProgress, Dialog, Paper, Slide, Stack, Typography } from '@mui/material';
import type { TransitionProps } from '@mui/material/transitions';
import FullScreenEntryBar from '@/components/FullScreenEntryBar';
import type { Batch } from '@/core/batches/domain/entities/Batch';
import type { PendingTactoFemale } from '@/features/gestation/hooks/useServiceOrderIssuance';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import { sectionTitleSx } from '@/ui/weaning-orders/components/form/formStyles';
import { LotFemales } from './lotFemales';
import { lotFemaleCount } from './orderSheetPayload';
import { OrderSelection } from './useCreateOrderV2Wizard';
import { OrderSheetDetails } from './useOrderSheetDetails';
import { useOrderSheetFlow } from './useOrderSheetFlow';
import { OrderSheetMode } from './types';
import BullStaysPanel from './components/BullStaysPanel';
import LotBullsPanel from './components/LotBullsPanel';
import LotFemalesSelector from './components/LotFemalesSelector';
import LotFemalesWithSemen from './components/LotFemalesWithSemen';
import OrderSheetForm from './components/OrderSheetForm';
import ServiceOrderConfirmDialog from './confirm/ServiceOrderConfirmDialog';

const SlideUp = forwardRef(function SlideUp(
	props: TransitionProps & { children: React.ReactElement },
	ref: React.Ref<unknown>
) {
	return (
		<Slide
			direction="up"
			ref={ref}
			{...props}
		/>
	);
});

interface CreateServiceOrderFullScreenDialogProps {
	open: boolean;
	mode: OrderSheetMode;
	selection: OrderSelection;
	details: OrderSheetDetails;
	batches: Batch[];
	allCaravans: Caravan[];
	femalesByBatch: Map<number, LotFemales>;
	owingTacto: ReadonlyMap<number, PendingTactoFemale>;
	isLoading: boolean;
	onClose: () => void;
}

const LOTS_HINT = {
	register:
		'Marcá los lotes que tuvieron el servicio y revisá quiénes estuvieron: se precargan los vientres vacíos que hoy están en el lote.',
	natural:
		'Cada lote genera su propia orden. Completo: los toros comparten el potrero con todos los vientres vacíos. Parcial es un servicio controlado: se exponen sólo los que marques.',
	ai: 'Cada lote genera su propia orden. El semen es opcional: se puede decidir en la manga. No reserva pajuelas; sólo avisa si no alcanzan.'
};

/**
 * "Nueva orden de servicio" / "Registrar orden de servicio", one screen: what the order says as a
 * whole on the left, its batches and animals on the right. It is confirmed in a modal over this dialog.
 */
export const CreateServiceOrderFullScreenDialog: React.FC<CreateServiceOrderFullScreenDialogProps> = ({
	open,
	mode,
	selection,
	details,
	batches,
	allCaravans,
	femalesByBatch,
	owingTacto,
	isLoading,
	onClose
}) => {
	const type = selection.serviceType;
	const flow = useOrderSheetFlow({ open, mode, type, selection, details, batches, femalesByBatch, onClose });
	const registering = mode === 'register';
	const isAi = type === 'AI';
	const plansSemen = !registering && isAi;
	const hasBullsSection = !isAi;
	const femaleCount = flow.lots.reduce((sum, lot) => sum + lotFemaleCount(lot, femalesByBatch.get(lot.batchId)), 0);

	const lotsProps = { batches, allCaravans, femalesByBatch, owingTacto, mode, type, selection };
	const lotsHeight = hasBullsSection
		? { xs: 440, lg: 380 }
		: { xs: 440, lg: plansSemen ? 'calc(100vh - 400px)' : 'calc(100vh - 300px)' };

	return (
		<Dialog
			fullScreen
			open={open}
			onClose={onClose}
			TransitionComponent={SlideUp}
			PaperProps={{ sx: { borderRadius: 0, bgcolor: 'background.default' } }}
		>
			<FullScreenEntryBar
				title={registering ? 'Registrar orden de servicio' : 'Nueva orden de servicio'}
				subtitle={
					registering
						? 'Qué lotes tuvieron el servicio, cuándo fue y qué toros estuvieron. La orden queda registrada ya terminada.'
						: 'Qué lotes entran, cuándo y con qué toros o semen. Después se confirma la orden.'
				}
				primaryLabel={`Continuar con ${flow.lots.length} lote(s)`}
				primaryIcon="heroicons-outline:arrow-right"
				busy={false}
				onClose={onClose}
				onPrimary={flow.proceed}
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
					{flow.errorLines.length > 0 && (
						<Alert
							severity="error"
							sx={{ borderRadius: '6px', fontSize: '0.8rem' }}
						>
							{flow.errorLines.map((line) => (
								<div key={line}>{line}</div>
							))}
						</Alert>
					)}

					<OrderSheetForm
						mode={mode}
						type={type}
						hasLots={flow.lots.length > 0}
						onTypeChange={selection.selectServiceType}
						details={details}
					/>

					<Alert
						severity={flow.problems.length > 0 ? 'info' : 'success'}
						sx={{ borderRadius: '6px' }}
					>
						{flow.problems.length > 0
							? flow.problems.join(' ')
							: `Listo para continuar con ${flow.lots.length} lote(s) y ${femaleCount} vientre(s).`}
					</Alert>
				</Stack>

				<Stack
					spacing={2.5}
					sx={{ minWidth: 0 }}
				>
					<Paper
						variant="outlined"
						sx={{
							p: 2,
							borderRadius: '8px',
							position: { lg: hasBullsSection ? 'static' : 'sticky' },
							top: 0
						}}
					>
						<Typography sx={sectionTitleSx}>3. Lotes de cría y vientres</Typography>
						<Typography
							variant="caption"
							component="p"
							sx={{ color: 'text.secondary', mt: 0.5, mb: 1.5 }}
						>
							{registering ? LOTS_HINT.register : isAi ? LOTS_HINT.ai : LOTS_HINT.natural}
						</Typography>
						{isLoading ? (
							<Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
								<CircularProgress size={28} />
							</Box>
						) : plansSemen ? (
							<LotFemalesWithSemen
								{...lotsProps}
								lots={flow.lots}
								details={details}
								maxHeight={lotsHeight}
							/>
						) : (
							<LotFemalesSelector
								{...lotsProps}
								maxHeight={lotsHeight}
							/>
						)}
					</Paper>

					{hasBullsSection && (
						<Paper
							variant="outlined"
							sx={{ p: 2, borderRadius: '8px' }}
						>
							<Typography sx={{ ...sectionTitleSx, mb: 1.5 }}>
								{registering ? '4. Recorrido de los toros' : '4. Toros por lote'}
							</Typography>
							{registering ? (
								<BullStaysPanel
									lots={flow.lots}
									batches={batches}
									allCaravans={allCaravans}
									details={details}
								/>
							) : (
								<LotBullsPanel
									lots={flow.lots}
									allCaravans={allCaravans}
									femalesByBatch={femalesByBatch}
									details={details}
								/>
							)}
						</Paper>
					)}
				</Stack>
			</Box>

			<ServiceOrderConfirmDialog
				open={flow.confirming}
				mode={mode}
				type={type}
				lots={flow.lots}
				batches={batches}
				allCaravans={allCaravans}
				femalesByBatch={femalesByBatch}
				details={details}
				submitLabel={flow.submitLabel}
				busy={flow.busy}
				onClose={flow.cancelConfirm}
				onConfirm={flow.submit}
			/>
		</Dialog>
	);
};

export default CreateServiceOrderFullScreenDialog;
