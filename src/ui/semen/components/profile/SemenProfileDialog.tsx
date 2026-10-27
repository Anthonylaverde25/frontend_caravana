import { useEffect, useState } from 'react';
import { MenuItem, Stack, TextField } from '@mui/material';
import { useSnackbar } from 'notistack';
import { SemenPreservation, SemenProfile, StrawColor, StrawSize } from '@/core/semen/domain/entities/Semen';
import { PRESERVATION_LABEL, STRAW_COLOR_LABEL, STRAW_SIZE_LABEL } from '@/core/semen/domain/rules/semenLabels';
import { useUpdateSemenProfile } from '@/features/semen/hooks/useSemen';
import CatalogDialogFrame from '@/ui/items/components/CatalogDialogFrame';
import { readApiErrors } from '@/ui/items/components/apiErrors';

interface SemenProfileDialogProps {
	open: boolean;
	itemId: number;
	profile: SemenProfile;
	onClose: () => void;
}

const inputSx = { bgcolor: 'action.hover' };

/** The straw data of a semen item, completed after the entry (P12). */
export default function SemenProfileDialog({ open, itemId, profile, onClose }: SemenProfileDialogProps) {
	const { enqueueSnackbar } = useSnackbar();
	const { mutateAsync, isPending } = useUpdateSemenProfile();
	const [draft, setDraft] = useState({ preservation: 'FROZEN' as SemenPreservation, size: '' as StrawSize | '', color: '' as StrawColor | '', cap: '' as StrawColor | '' });
	const [domain, setDomain] = useState<string | null>(null);

	useEffect(() => {
		if (!open) return;
		setDraft({ preservation: profile.preservation.value, size: profile.strawSize?.value ?? '', color: profile.strawColor?.value ?? '', cap: profile.capColor?.value ?? '' });
		setDomain(null);
	}, [open, profile]);

	const submit = async () => {
		try {
			await mutateAsync({ itemId, payload: { preservation: draft.preservation, straw_size: draft.size || null, straw_color: draft.color || null, cap_color: draft.cap || null } });
			enqueueSnackbar('Ficha del semen actualizada.', { variant: 'success' });
			onClose();
		} catch (error) {
			setDomain(readApiErrors(error, 'No se pudo guardar la ficha.').domain ?? 'Revisá los datos.');
		}
	};

	const colorField = (label: string, value: StrawColor | '', onChange: (v: StrawColor | '') => void) => (
		<TextField select label={label} variant="filled" fullWidth value={value} InputProps={{ sx: inputSx }} onChange={(e) => onChange(e.target.value as StrawColor | '')}>
			<MenuItem value="">Sin indicar</MenuItem>
			{(Object.keys(STRAW_COLOR_LABEL) as StrawColor[]).map((c) => (
				<MenuItem key={c} value={c}>{STRAW_COLOR_LABEL[c]}</MenuItem>
			))}
		</TextField>
	);

	return (
		<CatalogDialogFrame open={open} title="Ficha del semen" onClose={onClose} onSubmit={submit} submitLabel="Guardar" pending={isPending} error={domain}>
			<Stack spacing={2}>
				<TextField select label="Conservación" variant="filled" fullWidth value={draft.preservation} InputProps={{ sx: inputSx }}
					onChange={(e) => setDraft((d) => ({ ...d, preservation: e.target.value as SemenPreservation }))}>
					{(Object.keys(PRESERVATION_LABEL) as SemenPreservation[]).map((p) => (
						<MenuItem key={p} value={p}>{PRESERVATION_LABEL[p]}</MenuItem>
					))}
				</TextField>
				<TextField select label="Tamaño de la pajuela" variant="filled" fullWidth value={draft.size} InputProps={{ sx: inputSx }}
					onChange={(e) => setDraft((d) => ({ ...d, size: e.target.value as StrawSize | '' }))}>
					<MenuItem value="">Sin indicar</MenuItem>
					{(Object.keys(STRAW_SIZE_LABEL) as StrawSize[]).map((z) => (
						<MenuItem key={z} value={z}>{STRAW_SIZE_LABEL[z]}</MenuItem>
					))}
				</TextField>
				{colorField('Color de la pajuela', draft.color, (color) => setDraft((d) => ({ ...d, color })))}
				{colorField('Color del tapón', draft.cap, (cap) => setDraft((d) => ({ ...d, cap })))}
			</Stack>
		</CatalogDialogFrame>
	);
}
