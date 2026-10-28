import { Checkbox, FormControlLabel, Stack, Typography } from '@mui/material';
import { PartnerRole } from '@/core/partners/domain/entities/PartnerRole';

interface PartnerRoleCheckboxesProps {
	value: PartnerRole[];
	onChange: (roles: PartnerRole[]) => void;
}

const GROUPS: {
	title: string;
	roles: { role: PartnerRole; label: string }[];
}[] = [
	{
		title: 'Nos vende',
		roles: [
			{ role: 'SUPPLIER_LIVESTOCK', label: 'Hacienda' },
			{ role: 'SUPPLIER_ITEMS', label: 'Artículos o servicios' }
		]
	},
	{
		title: 'Nos compra',
		roles: [
			{ role: 'CUSTOMER_LIVESTOCK', label: 'Hacienda' },
			{ role: 'CUSTOMER_ITEMS', label: 'Artículos' }
		]
	}
];

/** The four roles in two groups: what the partner sells to us and what it buys from us. */
export default function PartnerRoleCheckboxes({ value, onChange }: PartnerRoleCheckboxesProps) {
	const toggle = (role: PartnerRole, checked: boolean) =>
		onChange(checked ? [...value.filter((r) => r !== role), role] : value.filter((r) => r !== role));

	return (
		<Stack
			direction={{ xs: 'column', sm: 'row' }}
			spacing={{ xs: 1, sm: 4 }}
		>
			{GROUPS.map((group) => (
				<Stack key={group.title}>
					<Typography
						sx={{
							fontSize: '0.8rem',
							fontWeight: 700,
							color: 'text.secondary'
						}}
					>
						{group.title}
					</Typography>
					{group.roles.map(({ role, label }) => (
						<FormControlLabel
							key={role}
							control={
								<Checkbox
									checked={value.includes(role)}
									onChange={(e) => toggle(role, e.target.checked)}
								/>
							}
							label={label}
						/>
					))}
				</Stack>
			))}
		</Stack>
	);
}
