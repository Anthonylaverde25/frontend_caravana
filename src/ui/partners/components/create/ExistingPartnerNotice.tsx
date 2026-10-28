import { Alert, Button } from '@mui/material';
import { PARTNER_ROLE_LABELS } from '@/core/partners/domain/entities/PartnerRole';
import { formatCuit } from '@/core/shared/domain/cuit';
import { ExistingPartnerMatch } from './useExistingPartner';

interface ExistingPartnerNoticeProps {
	match: ExistingPartnerMatch;
	adopting: boolean;
	onAdopt: () => void;
}

/** The CUIT is already loaded: use that partner (adding the missing roles) instead of a second one. */
export default function ExistingPartnerNotice({ match, adopting, onAdopt }: ExistingPartnerNoticeProps) {
	const { partner, missingRoles } = match;
	const missing = missingRoles.map((role) => `"${PARTNER_ROLE_LABELS[role]}"`).join(' y ');

	return (
		<Alert
			severity="info"
			sx={{ fontSize: '0.8rem', py: 0.5, alignItems: 'center' }}
			action={
				<Button
					size="small"
					onClick={onAdopt}
					disabled={adopting}
					sx={{ textTransform: 'none', fontWeight: 700, whiteSpace: 'nowrap' }}
				>
					{missingRoles.length > 0 ? 'Agregar el rol y usarlo' : 'Usarlo'}
				</Button>
			}
		>
			{partner.name} ya está cargado con el CUIT {formatCuit(partner.cuit)}.
			{missingRoles.length > 0 ? ` Le falta ${missing}: se lo agrego y queda elegido.` : ' Ya tiene ese rol: elegilo.'}
		</Alert>
	);
}
