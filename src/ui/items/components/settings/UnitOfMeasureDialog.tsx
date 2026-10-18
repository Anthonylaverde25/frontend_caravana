import { useEffect, useState } from 'react';
import { Alert, FormControlLabel, InputAdornment, MenuItem, Radio, RadioGroup, Stack, TextField, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { UNIT_DIMENSIONS, UnitDimension, UnitOfMeasure } from '@/core/items/domain/entities/UnitOfMeasure';
import { baseOf } from '@/core/items/domain/rules/unitConversion';
import { UnitOfMeasurePayload } from '@/core/items/domain/repositories/IUnitOfMeasureRepository';
import { useSaveUnitOfMeasure, useUnitsOfMeasure } from '@/features/items/hooks/useUnitsOfMeasure';
import CatalogDialogFrame from '../CatalogDialogFrame';
import { readApiErrors } from '../apiErrors';

interface UnitOfMeasureDialogProps {
	open: boolean;
	onClose: () => void;
	/** Edit mode when given. */
	unit?: UnitOfMeasure;
	onSaved?: (unit: UnitOfMeasure) => void;
}

interface Draft {
	code: string;
	name: string;
	symbol: string;
	dimension: UnitDimension;
	convertible: boolean;
	factor: string;
}

const EMPTY: Draft = { code: '', name: '', symbol: '', dimension: 'MASS', convertible: true, factor: '' };
const inputSx = { bgcolor: 'action.hover' };

/**
 * A unit is "N of its dimension's base" or not convertible; never a new base (DB1). Dimension and
 * factor are locked while items use the unit (U4).
 */
export default function UnitOfMeasureDialog({ open, onClose, unit, onSaved }: UnitOfMeasureDialogProps) {
	const { enqueueSnackbar } = useSnackbar();
	const { data: units = [] } = useUnitsOfMeasure(true);
	const { mutate, isPending } = useSaveUnitOfMeasure();
	const [draft, setDraft] = useState<Draft>(EMPTY);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [domainError, setDomainError] = useState<string | null>(null);
	const locked = !!unit && (unit.itemsCount > 0 || unit.isBase);
	const base = baseOf(units, draft.dimension);

	useEffect(() => {
		if (!open) return;
		setDraft(
			unit
				? { code: unit.code, name: unit.name, symbol: unit.symbol, dimension: unit.dimension, convertible: unit.factorToBase !== null, factor: unit.factorToBase?.toString() ?? '' }
				: EMPTY
		);
		setErrors({});
		setDomainError(null);
	}, [open, unit]);

	const FIELD_OF: Partial<Record<keyof Draft, string>> = { factor: 'factor_to_base', convertible: 'factor_to_base' };
	const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
		setDraft((d) => ({ ...d, [key]: value }));
		// A corrected field drops its own error.
		setErrors(({ [FIELD_OF[key] ?? key]: _cleared, ...rest }) => rest);
	};

	const submit = () => {
		const local: Record<string, string> = {};
		if (!unit && !/^[A-Za-z0-9_]{1,16}$/.test(draft.code.trim())) local.code = 'Hasta 16 letras, números o guion bajo.';
		if (!draft.name.trim()) local.name = 'El nombre es obligatorio.';
		if (!draft.symbol.trim()) local.symbol = 'El símbolo es obligatorio.';
		const factor = Number(draft.factor.replace(',', '.'));
		if (draft.convertible && !(factor > 0)) local.factor_to_base = 'Tiene que ser mayor que cero.';
		setErrors(local);
		setDomainError(null);
		if (Object.keys(local).length > 0) return;

		const payload: Partial<UnitOfMeasurePayload> = {
			code: draft.code,
			name: draft.name.trim(),
			symbol: draft.symbol.trim(),
			...(locked ? {} : { dimension: draft.dimension, factor_to_base: draft.convertible ? factor : null })
		};
		mutate(
			{ id: unit?.id, payload },
			{
				onSuccess: (saved) => {
					enqueueSnackbar(unit ? `${saved.name} actualizada` : `Unidad ${saved.name} creada`, { variant: 'success' });
					onSaved?.(saved);
					onClose();
				},
				onError: (error) => {
					const { fields, domain } = readApiErrors(error);
					setErrors(fields);
					setDomainError(domain);
				}
			}
		);
	};

	return (
		<CatalogDialogFrame
			open={open}
			title={unit ? `Editar ${unit.name}` : 'Nueva unidad de medida'}
			onClose={onClose}
			onSubmit={submit}
			submitLabel={unit ? 'Guardar' : 'Crear'}
			pending={isPending}
			error={domainError}
		>
			<Stack spacing={2}>
				<Stack direction="row" spacing={2}>
					<TextField label="Código *" variant="filled" fullWidth value={draft.code} disabled={!!unit}
						onChange={(e) => set('code', e.target.value.toUpperCase())} error={!!errors.code} helperText={errors.code ?? (unit ? 'No se cambia.' : 'Ej.: QQ')}
						inputProps={{ style: { fontFamily: 'monospace' } }} sx={inputSx} />
					<TextField label="Símbolo *" variant="filled" fullWidth value={draft.symbol}
						onChange={(e) => set('symbol', e.target.value)} error={!!errors.symbol} helperText={errors.symbol ?? 'Ej.: qq'} sx={inputSx} />
				</Stack>
				<TextField label="Nombre *" variant="filled" fullWidth value={draft.name}
					onChange={(e) => set('name', e.target.value)} error={!!errors.name} helperText={errors.name} sx={inputSx} />
				<TextField select label="Dimensión" variant="filled" fullWidth value={draft.dimension} disabled={locked}
					onChange={(e) => set('dimension', e.target.value as UnitDimension)} sx={inputSx}>
					{UNIT_DIMENSIONS.map((d) => <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>)}
				</TextField>
				<Stack spacing={1}>
					<Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '1px' }}>Cómo se convierte</Typography>
					<RadioGroup value={draft.convertible ? 'yes' : 'no'} onChange={(e) => set('convertible', e.target.value === 'yes')}>
						<Stack direction="row" alignItems="center" spacing={1}>
							<FormControlLabel value="yes" control={<Radio size="small" disabled={locked} />} label={`1 ${draft.symbol || 'unidad'} equivale a`} />
							<TextField size="small" variant="filled" value={draft.factor} disabled={locked || !draft.convertible}
								onChange={(e) => set('factor', e.target.value)} error={!!errors.factor_to_base} helperText={errors.factor_to_base}
								InputProps={{ endAdornment: <InputAdornment position="end">{base?.symbol ?? ''}</InputAdornment> }} sx={{ ...inputSx, width: 180 }} />
						</Stack>
						<FormControlLabel value="no" control={<Radio size="small" disabled={locked} />} label="No convertible" />
					</RadioGroup>
					{!draft.convertible && (
						<Alert severity="info" sx={{ fontSize: '0.8rem', py: 0.5 }}>
							Una dosis, una cabeza o una jornada no tienen equivalencia fija: el paso a otra unidad lo da la presentación del ítem.
						</Alert>
					)}
					{locked && (
						<Alert severity="warning" sx={{ fontSize: '0.8rem', py: 0.5 }}>
							{unit?.isBase
								? 'Es la base de su dimensión: su dimensión y su factor no cambian.'
								: `Es la unidad de ${unit?.itemsCount} ítem(s): su dimensión y su factor no se pueden cambiar. Si está mal, desactivala y creá otra.`}
						</Alert>
					)}
				</Stack>
			</Stack>
		</CatalogDialogFrame>
	);
}
