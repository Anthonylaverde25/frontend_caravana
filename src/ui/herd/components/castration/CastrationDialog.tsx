import { useEffect, useMemo, useState } from 'react';
import type { AxiosError } from 'axios';
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
import { useCastrationCandidates, useRegisterCastration } from '@/features/caravans/hooks/useCastration';
import type { CastrationMethod } from '@/core/caravans/domain/entities/Castration';
import type { CaravanSummary } from '@/core/caravans/domain/entities/CaravanSummary';
import { CastrationFields } from './CastrationFields';
import { CastrationAnimalsTable } from './CastrationAnimalsTable';
import {
	buildCastrationPayload,
	buildRowsFromCandidates,
	buildRowsFromSelectedCaravans,
	mapCastrationErrors,
	today,
	type CastrationRow
} from './castration';

interface CastrationDialogProps {
	open: boolean;
	onClose: () => void;
	batch?: { id: number; name: string } | null;
	selectedCaravans?: CaravanSummary[];
}

export function CastrationDialog({ open, onClose, batch, selectedCaravans }: CastrationDialogProps) {
	const batchId = batch?.id ?? null;
	const { data: candidatesData, isLoading } = useCastrationCandidates(open && batchId ? batchId : null);
	const registerCastration = useRegisterCastration();

	const [castratedOn, setCastratedOn] = useState(today());
	const [method, setMethod] = useState<CastrationMethod | null>(null);
	const [notes, setNotes] = useState('');
	const [rows, setRows] = useState<CastrationRow[]>([]);
	const [errors, setErrors] = useState<Record<number, string[]>>({});
	const [generalError, setGeneralError] = useState<string | null>(null);

	// Synchronize rows when candidate data or selection arrives
	useEffect(() => {
		if (!open) return;

		if (selectedCaravans && selectedCaravans.length > 0) {
			const candidateMap = new Map((candidatesData?.candidates ?? []).map((c) => [c.id, c]));
			setRows(buildRowsFromSelectedCaravans(selectedCaravans, candidateMap));
		} else if (candidatesData?.candidates) {
			setRows(buildRowsFromCandidates(candidatesData.candidates));
		}
	}, [open, selectedCaravans, candidatesData]);

	const { checkedCalves, checkedToritos, checkedTotal } = useMemo(() => {
		const checked = rows.filter((r) => r.checked && !r.disabled);
		const calves = checked.filter((r) => r.targetCategoryOptions.length === 0).length;
		const toritos = checked.filter((r) => r.targetCategoryOptions.length > 0).length;
		return { checkedCalves: calves, checkedToritos: toritos, checkedTotal: checked.length };
	}, [rows]);

	const handleToggleRow = (caravanId: number) => {
		setRows((prev) => prev.map((r) => (r.caravanId === caravanId ? { ...r, checked: !r.checked } : r)));
		setErrors((prev) => {
			const copy = { ...prev };
			delete copy[caravanId];
			return copy;
		});
	};

	const handleToggleAll = (checked: boolean) => {
		setRows((prev) => prev.map((r) => (r.disabled ? r : { ...r, checked })));
		setErrors({});
	};

	const handleChangeTargetCategory = (caravanId: number, targetCategoryId: number | null) => {
		setRows((prev) =>
			prev.map((r) =>
				r.caravanId === caravanId
					? {
							...r,
							targetCategoryId,
							checked: targetCategoryId ? true : r.checked
						}
					: r
			)
		);
		setErrors((prev) => {
			const copy = { ...prev };
			delete copy[caravanId];
			return copy;
		});
	};

	const handleSubmit = () => {
		setGeneralError(null);

		if (!castratedOn) {
			setGeneralError('La fecha de castración es obligatoria.');
			return;
		}

		const checkedRows = rows.filter((r) => r.checked && !r.disabled);

		if (checkedRows.length === 0) {
			setGeneralError('Seleccioná al menos un animal para castrar.');
			return;
		}

		// Validate that all checked toritos have a target category
		const rowErrors: Record<number, string[]> = {};
		for (const row of checkedRows) {
			if (row.targetCategoryOptions.length > 0 && !row.targetCategoryId) {
				rowErrors[row.caravanId] = ['Elegí la categoría de destino'];
			}
		}

		if (Object.keys(rowErrors).length > 0) {
			setErrors(rowErrors);
			setGeneralError('Hay toritos sin categoría de destino seleccionada.');
			return;
		}

		const payload = buildCastrationPayload(rows, castratedOn, method, notes);
		registerCastration.mutate(payload, {
			onSuccess: onClose,
			onError: (error) => {
				const body = (error as AxiosError<{ message?: string; errors?: Record<string, string[]> }>).response
					?.data;
				const mapped = mapCastrationErrors(body?.errors, payload);
				setErrors(mapped.byCaravan);
				setGeneralError(
					mapped.general.length > 0
						? mapped.general.join(' ')
						: (body?.message ?? 'Error al registrar castración.')
				);
			}
		});
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			fullWidth
			maxWidth="md"
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
					Castrar machos {batch?.name ? `· Lote ${batch.name}` : ''}
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
				{isLoading ? (
					<Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
						<CircularProgress size={28} />
					</Box>
				) : rows.length === 0 ? (
					<Alert
						severity="info"
						sx={{ borderRadius: '6px' }}
					>
						No hay machos enteros candidatos en este lote.
					</Alert>
				) : (
					<Stack spacing={2.5}>
						<CastrationFields
							castratedOn={castratedOn}
							method={method}
							notes={notes}
							onCastratedOnChange={setCastratedOn}
							onMethodChange={setMethod}
							onNotesChange={setNotes}
						/>
						{generalError && (
							<Alert
								severity="error"
								sx={{ borderRadius: '6px' }}
							>
								{generalError}
							</Alert>
						)}
						<CastrationAnimalsTable
							rows={rows}
							errors={errors}
							onToggleRow={handleToggleRow}
							onToggleAll={handleToggleAll}
							onChangeTargetCategory={handleChangeTargetCategory}
						/>
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
				<Typography
					variant="body2"
					sx={{ color: 'text.secondary', fontSize: '0.82rem' }}
				>
					{checkedTotal > 0
						? `${checkedCalves} terneros siguen Ternero · ${checkedToritos} toritos cambian de categoría`
						: 'Ningún animal seleccionado'}
				</Typography>
				<Box sx={{ display: 'flex', gap: 1.5 }}>
					<Button
						onClick={onClose}
						variant="text"
						sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}
					>
						Cancelar
					</Button>
					{rows.length > 0 && (
						<Button
							onClick={handleSubmit}
							disabled={registerCastration.isPending || checkedTotal === 0}
							variant="contained"
							sx={{
								bgcolor: 'primary.main',
								color: 'primary.contrastText',
								px: 3,
								fontWeight: 700,
								borderRadius: '6px',
								textTransform: 'none',
								boxShadow: 'none',
								'&:hover': { bgcolor: 'primary.dark' }
							}}
						>
							{registerCastration.isPending ? 'Guardando...' : `Castrar ${checkedTotal}`}
						</Button>
					)}
				</Box>
			</DialogActions>
		</Dialog>
	);
}

export default CastrationDialog;
