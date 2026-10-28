import { Chip, Stack } from '@mui/material';
import { PARTNER_ROLE_LABELS, PartnerRole, sortRoles } from '@/core/partners/domain/entities/PartnerRole';

interface PartnerRoleChipsProps {
	roles: PartnerRole[];
}

/** "Vende hacienda", "Vende artículos", "Compra hacienda", "Compra artículos": suppliers outlined, customers filled. */
export default function PartnerRoleChips({ roles }: PartnerRoleChipsProps) {
	return (
		<Stack
			direction="row"
			spacing={0.5}
			justifyContent="center"
			flexWrap="wrap"
			useFlexGap
		>
			{sortRoles(roles).map((role) => (
				<Chip
					key={role}
					label={PARTNER_ROLE_LABELS[role]}
					size="small"
					variant={role.startsWith('SUPPLIER') ? 'outlined' : 'filled'}
					color={role.endsWith('ITEMS') ? 'info' : 'default'}
					sx={{ fontWeight: 600, fontSize: '0.7rem', height: 22 }}
				/>
			))}
		</Stack>
	);
}
