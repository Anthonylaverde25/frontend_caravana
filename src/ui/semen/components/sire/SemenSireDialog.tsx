import { useEffect, useMemo, useState } from 'react';
import { Alert, Autocomplete, MenuItem, Stack, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useCompany } from '@/contexts/CompanyContext';
import { useBreeds } from '@/features/breeds/hooks/useBreeds';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import { useSaveSemenSire } from '@/features/semen/hooks/useSemen';
import { SemenSire } from '@/core/semen/domain/entities/Semen';
import CatalogDialogFrame from '@/ui/items/components/CatalogDialogFrame';
import { readApiErrors } from '@/ui/items/components/apiErrors';

interface SemenSireDialogProps {
	open: boolean;
	onClose: () => void;
	onSaved: (sire: SemenSire) => void;
}

const inputSx = { bgcolor: 'action.hover' };
type Mode = 'external' | 'own';

/**
 * "Nuevo padre" (plan 3.6): an external bull (AI centre, stud) or an own bull, which is never a new
 * caravan but a male of the company in any state (DA6); its name and breed come from it (SS2).
 */
export default function SemenSireDialog({ open, onClose, onSaved }: SemenSireDialogProps) {
	const { enqueueSnackbar } = useSnackbar();
	const { activeCompanyId } = useCompany();
	const { data: breeds = [] } = useBreeds();
	const { data: caravans = [] } = useCaravans(open ? activeCompanyId : null, 'own');
	const { mutateAsync, isPending } = useSaveSemenSire();
	const [mode, setMode] = useState<Mode>('external');
	const [draft, setDraft] = useState({ name: '', registry: '', breedId: '' as number | '', stud: '', caravanId: null as number | null });
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [domain, setDomain] = useState<string | null>(null);
	const males = useMemo(() => caravans.filter((c) => c.sex === 'M' && c.identification), [caravans]);
	const bull = males.find((c) => c.id === draft.caravanId) ?? null;

	useEffect(() => {
		if (!open) return;
		setMode('external');
		setDraft({ name: '', registry: '', breedId: '', stud: '', caravanId: null });
		setErrors({});
		setDomain(null);
	}, [open]);

	const set = (patch: Partial<typeof draft>, field: string) => {
		setDraft((d) => ({ ...d, ...patch }));
		setErrors(({ [field]: _cleared, ...rest }) => rest);
	};

	const submit = async () => {
		const payload =
			mode === 'own'
				? { caravan_id: draft.caravanId, registry_code: draft.registry || null, stud_name: draft.stud || null }
				: { name: draft.name, registry_code: draft.registry || null, breed_id: draft.breedId === '' ? null : draft.breedId, stud_name: draft.stud || null };
		try {
			const sire = await mutateAsync({ id: null, payload });
			enqueueSnackbar(`Padre ${sire.label} cargado.`, { variant: 'success' });
			onSaved(sire);
			onClose();
		} catch (error) {
			const { fields, domain: message } = readApiErrors(error, 'No se pudo cargar el padre.');
			setErrors(fields);
			setDomain(message);
		}
	};

	return (
		<CatalogDialogFrame open={open} title="Nuevo padre" onClose={onClose} onSubmit={submit} submitLabel="Cargar padre" pending={isPending} error={domain}>
			<Stack spacing={2}>
				<ToggleButtonGroup exclusive size="small" value={mode} onChange={(_, v: Mode | null) => v && setMode(v)} fullWidth>
					<ToggleButton value="external" sx={{ textTransform: 'none', fontWeight: 600 }}>Toro externo</ToggleButton>
					<ToggleButton value="own" sx={{ textTransform: 'none', fontWeight: 600 }}>Toro propio</ToggleButton>
				</ToggleButtonGroup>
				{mode === 'external' ? (
					<>
						<TextField label="Nombre" variant="filled" fullWidth autoFocus value={draft.name} onChange={(e) => set({ name: e.target.value }, 'name')}
							InputProps={{ sx: inputSx }} error={!!errors.name} helperText={errors.name ?? 'Por ejemplo: Don Cirilo.'} />
						<TextField select label="Raza" variant="filled" fullWidth value={draft.breedId} onChange={(e) => set({ breedId: e.target.value === '' ? '' : Number(e.target.value) }, 'breed_id')}
							InputProps={{ sx: inputSx }} error={!!errors.breed_id} helperText={errors.breed_id}>
							<MenuItem value="">Sin indicar</MenuItem>
							{breeds.map((b: { id: number; name: string }) => (
								<MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
							))}
						</TextField>
					</>
				) : (
					<>
						<Autocomplete options={males} value={bull} getOptionLabel={(c) => `${c.identification}${c.breed ? ` · ${c.breed}` : ''}`}
							onChange={(_, c) => set({ caravanId: c?.id ?? null }, 'caravan_id')}
							renderInput={(params) => (
								<TextField {...params} label="Caravana del toro" variant="filled" InputProps={{ ...params.InputProps, sx: inputSx }}
									error={!!errors.caravan_id} helperText={errors.caravan_id ?? 'Un macho de la empresa, aunque ya no esté en el campo.'} />
							)} />
						<Alert severity="info" sx={{ fontSize: '0.8rem', py: 0.5 }}>El nombre y la raza se toman de la caravana. No se crea un animal nuevo.</Alert>
					</>
				)}
				<TextField label="Registro" variant="filled" fullWidth value={draft.registry} onChange={(e) => set({ registry: e.target.value }, 'registry_code')}
					InputProps={{ sx: inputSx }} error={!!errors.registry_code} helperText={errors.registry_code ?? 'HBA o código del centro (opcional).'} />
				<TextField label="Cabaña" variant="filled" fullWidth value={draft.stud} onChange={(e) => set({ stud: e.target.value }, 'stud_name')}
					InputProps={{ sx: inputSx }} helperText="Cabaña de origen del toro (opcional)." />
			</Stack>
		</CatalogDialogFrame>
	);
}
