import React, { useMemo, useState } from 'react';
import {
	Alert,
	Button,
	Chip,
	FormControlLabel,
	InputAdornment,
	Stack,
	Switch,
	TextField,
	Typography
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import { isBreedingCandidate } from '@/core/caravans/domain/rules/isBreedingCandidate';
import { isSelectable, resolveSireAdmission } from '@/core/caravans/domain/rules/resolveSireAdmission';
import { usePreServiceBulls } from '@/features/gestation/hooks/usePreServiceBulls';
import BreedingEligibilityDialog from '@/ui/herd/components/shared/breeding-eligibility/BreedingEligibilityDialog';
import { isMale, LotFemales } from '../lotFemales';
import { lotFemaleCount } from '../orderSheetPayload';
import { OrderSheetDetails } from '../useOrderSheetDetails';
import { SelectedBatchState } from '../types';
import LotBullsGrid from './LotBullsGrid';
import LotTabs from './LotTabs';

interface LotBullsPanelProps {
	lots: SelectedBatchState[];
	allCaravans: Caravan[];
	femalesByBatch: Map<number, LotFemales>;
	details: OrderSheetDetails;
}

/** The bulls of each batch: a bull goes to one batch, and each batch shows its own ratio. */
export const LotBullsPanel: React.FC<LotBullsPanelProps> = ({ lots, allCaravans, femalesByBatch, details }) => {
	const { data: preServiceBulls = [] } = usePreServiceBulls();
	const [activeId, setActiveId] = useState(lots[0]?.batchId ?? 0);
	const [search, setSearch] = useState('');
	const [enabling, setEnabling] = useState<Caravan | null>(null);
	const active = lots.find((lot) => lot.batchId === activeId) ?? lots[0];
	const activeBatchId = active?.batchId;

	const healthById = useMemo(() => new Map(preServiceBulls.map((b) => [b.caravan_id, b])), [preServiceBulls]);
	const males = useMemo(() => allCaravans.filter((c) => isMale(c) && isBreedingCandidate(c)), [allCaravans]);
	const elsewhere = useMemo(
		() =>
			new Set(
				lots
					.filter((lot) => lot.batchId !== activeBatchId)
					.flatMap((lot) => details.bullsByBatch[lot.batchId] ?? [])
			),
		[lots, activeBatchId, details.bullsByBatch]
	);
	const shown = useMemo(() => {
		const q = search.trim().toLowerCase();

		return males.filter(
			(male) =>
				!elsewhere.has(male.id!) &&
				(q === '' ||
					male.identification?.toLowerCase().includes(q) ||
					male.batch_name?.toLowerCase().includes(q) ||
					male.breed?.toLowerCase().includes(q))
		);
	}, [males, elsewhere, search]);

	if (!active) {
		return (
			<Alert
				severity="info"
				sx={{ fontSize: '0.8rem', py: 0.5 }}
			>
				Marcá un lote de cría para elegir sus toros.
			</Alert>
		);
	}

	const selected = details.bullsByBatch[active.batchId] ?? [];
	const femaleCount = lotFemaleCount(active, femalesByBatch.get(active.batchId));
	const ratio = femaleCount === 0 ? 0 : Number(((selected.length / femaleCount) * 100).toFixed(1));
	const aptIds = shown.filter((m) => isSelectable(resolveSireAdmission(m, healthById.get(m.id!)))).map((m) => m.id!);
	const allApt = aptIds.length > 0 && aptIds.every((id) => selected.includes(id));
	const someApt = aptIds.some((id) => selected.includes(id)) && !allApt;

	const toggleAllApt = () =>
		details.setBullsOf(active.batchId, (prev) =>
			allApt ? prev.filter((id) => !aptIds.includes(id)) : [...new Set([...prev, ...aptIds])]
		);

	const toggleBull = (id: number) =>
		details.setBullsOf(active.batchId, (prev) =>
			prev.includes(id) ? prev.filter((bullId) => bullId !== id) : [...prev, id]
		);

	return (
		<Stack spacing={1.5}>
			{lots.length > 1 && (
				<LotTabs
					lots={lots}
					value={active.batchId}
					onChange={setActiveId}
					flagged={(id) => (details.bullsByBatch[id] ?? []).length === 0}
				/>
			)}

			<Stack
				direction={{ xs: 'column', lg: 'row' }}
				spacing={1.5}
				alignItems={{ lg: 'center' }}
				justifyContent="space-between"
			>
				<TextField
					size="small"
					placeholder="Buscar toro por caravana, raza o lote actual…"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					sx={{ minWidth: { sm: 220 }, flex: { sm: 1 } }}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<FuseSvgIcon
									size={16}
									color="action"
								>
									heroicons-outline:magnifying-glass
								</FuseSvgIcon>
							</InputAdornment>
						)
					}}
				/>
				<Button
					size="small"
					variant="outlined"
					onClick={toggleAllApt}
					disabled={aptIds.length === 0}
					sx={{ textTransform: 'none', fontSize: '0.78rem', fontWeight: 600, height: 34 }}
				>
					{allApt ? 'Desmarcar aptos' : `Marcar aptos (${aptIds.length})`}
				</Button>
			</Stack>

			<Stack
				direction="row"
				spacing={1}
				alignItems="center"
				justifyContent="space-between"
				flexWrap="wrap"
				useFlexGap
				sx={{
					px: 1.5,
					py: 0.5,
					minHeight: 42,
					borderRadius: '6px',
					bgcolor: 'action.hover',
					border: '1px solid',
					borderColor: 'divider'
				}}
			>
				<Stack
					direction="row"
					spacing={1}
					alignItems="center"
				>
					<Chip
						size="small"
						color="primary"
						label={`${selected.length} toro(s)`}
						sx={{ fontWeight: 700, fontSize: '0.8rem' }}
					/>
					<Chip
						size="small"
						variant="outlined"
						color={ratio === 0 ? 'default' : ratio >= 2.5 && ratio <= 4.5 ? 'success' : 'warning'}
						label={`Ratio ${ratio}% sobre ${femaleCount} vientre(s)`}
						sx={{ fontWeight: 600, fontSize: '0.78rem' }}
					/>
				</Stack>
				{selected.length > 1 && (
					<FormControlLabel
						control={
							<Switch
								size="small"
								checked={details.rotationBatches.includes(active.batchId)}
								onChange={(e) => details.toggleRotation(active.batchId, e.target.checked)}
							/>
						}
						label={
							<Typography
								variant="caption"
								sx={{ fontWeight: 700 }}
							>
								Rotación de toros
							</Typography>
						}
						sx={{ mr: 0 }}
					/>
				)}
			</Stack>

			{ratio > 0 && (ratio < 2.5 || ratio > 4.5) && (
				<Alert
					severity="warning"
					sx={{ fontSize: '0.8rem', py: 0.5, borderRadius: '6px' }}
				>
					{ratio < 2.5
						? 'Ratio bajo: según Carrillo (PDF Pág. 20, 166), se recomienda entre 3% y 4% para monta natural a campo.'
						: 'Ratio elevado: dotación de toros superior al 4.5%, puede provocar peleas excesivas entre reproductores.'}
				</Alert>
			)}

			<LotBullsGrid
				males={shown}
				healthById={healthById}
				selectedIds={selected}
				allApt={allApt}
				someApt={someApt}
				onToggle={toggleBull}
				onToggleAllApt={toggleAllApt}
				onEnable={setEnabling}
			/>

			<BreedingEligibilityDialog
				open={enabling !== null}
				onClose={() => setEnabling(null)}
				caravans={
					enabling
						? [
								{
									id: enabling.id,
									identification: enabling.identification,
									sex: enabling.sex,
									is_breeding_eligible: false
								}
							]
						: []
				}
			/>
		</Stack>
	);
};

export default LotBullsPanel;
