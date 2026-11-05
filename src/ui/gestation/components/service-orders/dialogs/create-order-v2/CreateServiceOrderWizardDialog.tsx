import React, { useEffect, useMemo } from 'react';
import { useCompany } from '@/contexts/CompanyContext';
import { useBatches } from '@/features/batches/hooks/useBatches';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import { PendingTactoFemale, usePendingTactoFemales } from '@/features/gestation/hooks/useServiceOrderIssuance';
import { indexLotFemales } from './lotFemales';
import { useCreateOrderV2Wizard } from './useCreateOrderV2Wizard';
import { useOrderSheetDetails } from './useOrderSheetDetails';
import CreateServiceOrderFullScreenDialog from './CreateServiceOrderFullScreenDialog';
import { OrderSheetMode } from './types';

const NOBODY: ReadonlyMap<number, PendingTactoFemale> = new Map();

interface CreateServiceOrderWizardDialogProps {
	open: boolean;
	mode: OrderSheetMode;
	onClose: () => void;
}

/** "Nueva orden" and "Registrar orden": the data and the state of the full-screen sheet. */
export const CreateServiceOrderWizardDialog: React.FC<CreateServiceOrderWizardDialogProps> = ({
	open,
	mode,
	onClose
}) => {
	const { activeCompanyId } = useCompany();
	const { data: allCaravans = [], isLoading: isLoadingCaravans } = useCaravans(open ? activeCompanyId : null, 'all');
	const { data: batches = [], isLoading: isLoadingBatches } = useBatches(undefined, undefined, 'own');
	const { data: owingTacto = NOBODY, isLoading: isLoadingTacto } = usePendingTactoFemales(open);

	const selection = useCreateOrderV2Wizard();
	const details = useOrderSheetDetails();
	const { resetWizard } = selection;
	const { prepareFor } = details;

	useEffect(() => {
		if (open) {
			prepareFor(mode === 'register');
		} else {
			resetWizard();
		}
	}, [open, mode, prepareFor, resetWizard]);

	const femalesByBatch = useMemo(() => indexLotFemales(allCaravans, owingTacto), [allCaravans, owingTacto]);

	if (!open) return null;

	return (
		<CreateServiceOrderFullScreenDialog
			open={open}
			mode={mode}
			selection={selection}
			details={details}
			batches={batches}
			allCaravans={allCaravans}
			femalesByBatch={femalesByBatch}
			owingTacto={owingTacto}
			isLoading={isLoadingCaravans || isLoadingBatches || isLoadingTacto}
			onClose={onClose}
		/>
	);
};

export default CreateServiceOrderWizardDialog;
