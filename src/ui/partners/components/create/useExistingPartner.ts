import { useState } from 'react';
import { Partner } from '@/core/partners/domain/entities/Partner';
import { PartnerRole } from '@/core/partners/domain/entities/PartnerRole';
import { cuitDigits } from '@/core/shared/domain/cuit';
import { usePartners } from '@/features/partners/hooks/usePartners';
import { useUpdatePartnerRoles } from '@/features/partners/hooks/useUpdatePartnerRoles';

export interface ExistingPartnerMatch {
	partner: Partner;
	/** The roles the form asked for that the partner does not hold yet. */
	missingRoles: PartnerRole[];
}

/**
 * C4: a quick create whose CUIT already exists does not make a second partner. It offers the one
 * already loaded, adding the roles the form asked for that it lacks.
 */
export function useExistingPartner() {
	const { data: partners = [] } = usePartners();
	const { mutate: updateRoles, isPending: adopting } = useUpdatePartnerRoles();
	const [match, setMatch] = useState<ExistingPartnerMatch | null>(null);

	/** True when the CUIT is taken: the match is kept for the notice and nothing is created. */
	const check = (cuit: string, roles: PartnerRole[]): boolean => {
		const partner = partners.find((p) => p.cuit === cuitDigits(cuit));

		setMatch(partner ? { partner, missingRoles: roles.filter((role) => !partner.hasRole(role)) } : null);

		return partner !== undefined;
	};

	/** Uses the existing partner, granting the missing roles first when there are any. */
	const adopt = (onDone: (partner: Partner) => void, onError: (error: unknown) => void) => {
		if (!match) return;

		if (match.missingRoles.length === 0) {
			onDone(match.partner);
			return;
		}

		updateRoles(
			{ id: match.partner.id, roles: [...match.partner.roles, ...match.missingRoles] },
			{ onSuccess: onDone, onError }
		);
	};

	return { match, check, adopt, adopting, clear: () => setMatch(null) };
}
