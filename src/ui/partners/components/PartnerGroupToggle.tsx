import { ToggleButton, ToggleButtonGroup } from '@mui/material';

export type PartnerGroupFilter = 'ALL' | 'supplier' | 'customer';

interface PartnerGroupToggleProps {
	value: PartnerGroupFilter;
	onChange: (value: PartnerGroupFilter) => void;
	counts: Record<PartnerGroupFilter, number>;
}

const OPTIONS: { value: PartnerGroupFilter; label: string }[] = [
	{ value: 'ALL', label: 'Todos' },
	{ value: 'supplier', label: 'Proveedores' },
	{ value: 'customer', label: 'Clientes' }
];

/** Todos · Proveedores · Clientes, with their counts. A partner with both roles counts in both. */
export default function PartnerGroupToggle({ value, onChange, counts }: PartnerGroupToggleProps) {
	return (
		<ToggleButtonGroup
			size="small"
			exclusive
			value={value}
			onChange={(_, next: PartnerGroupFilter | null) => next && onChange(next)}
			sx={{
				'& .MuiToggleButton-root': {
					textTransform: 'none',
					fontSize: '0.8rem',
					px: 1.5,
					height: 30
				}
			}}
		>
			{OPTIONS.map((option) => (
				<ToggleButton
					key={option.value}
					value={option.value}
				>
					{option.label} ({counts[option.value]})
				</ToggleButton>
			))}
		</ToggleButtonGroup>
	);
}
