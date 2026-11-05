import type { BatchReproductiveState } from '@/core/batches/domain/entities/BatchOverview';
import HerdBatchSection, { HerdBatchSectionAction } from './HerdBatchSection';
import { HerdBatchFigure, HerdBatchFigureRow } from './HerdBatchFigures';
import { formatPercent } from '../../../utils/herdFormat';

interface HerdBatchReproductionPanelProps {
	reproductive: BatchReproductiveState;
	/** The running service, when there is one: the action opens it instead of starting another. */
	activeServiceCode: string | null;
	onOpenService: () => void;
	onStartService: (() => void) | null;
}

/** The females of a Cría batch: pregnant, without a pregnancy on record, and overdue births. */
export function HerdBatchReproductionPanel({
	reproductive,
	activeServiceCode,
	onOpenService,
	onStartService
}: HerdBatchReproductionPanelProps) {
	return (
		<HerdBatchSection
			title="Reproducción"
			actions={
				activeServiceCode ? (
					<HerdBatchSectionAction
						label={`Servicio ${activeServiceCode}`}
						onClick={onOpenService}
						icon={null}
					/>
				) : (
					onStartService && (
						<HerdBatchSectionAction
							label="Iniciar servicio"
							onClick={onStartService}
						/>
					)
				)
			}
		>
			<HerdBatchFigureRow>
				<HerdBatchFigure
					label="Preñadas"
					value={reproductive.pregnant}
					hint={`${formatPercent(reproductive.pregnant, reproductive.females)} de ${reproductive.females} hembras`}
					tone={reproductive.pregnant > 0 ? 'success' : 'default'}
				/>
				<HerdBatchFigure
					label="Sin preñez registrada"
					value={reproductive.without_gestation}
					hint="Vacías o sin diagnóstico"
				/>
				<HerdBatchFigure
					label="Partos vencidos"
					value={reproductive.overdue}
					hint="Riesgo para la hembra"
					tone={reproductive.overdue > 0 ? 'error' : 'default'}
				/>
			</HerdBatchFigureRow>
		</HerdBatchSection>
	);
}

export default HerdBatchReproductionPanel;
