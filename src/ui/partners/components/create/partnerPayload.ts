import { CreatePartnerInput } from '@/core/partners/domain/repositories/IPartnerRepository';
import { PartnerFormValues } from '../PartnerSchema';

/** The form as the API expects it; the first contact goes only when something was typed in it. */
export function toCreatePartnerInput(data: PartnerFormValues): CreatePartnerInput {
	const contactName = data.contact.name?.trim();

	return {
		name: data.name.trim(),
		commercial_name: data.commercial_name?.trim() || null,
		cuit: data.cuit.trim(),
		location: data.location?.trim() || null,
		roles: data.roles,
		contact: contactName
			? { name: contactName, phone: data.contact.phone?.trim() ?? '', email: data.contact.email?.trim() || null }
			: undefined,
		farms: (data.farms || []).map((farm) => ({
			name: farm.name.trim(),
			renspa: farm.renspa?.trim() || null,
			location: [farm.city, farm.province, farm.country].filter(Boolean).join(', ')
		}))
	};
}
