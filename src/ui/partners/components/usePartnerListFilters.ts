import { useMemo, useState } from 'react';
import { Partner } from '@/core/partners/domain/entities/Partner';
import { cuitDigits } from '@/core/shared/domain/cuit';
import { PartnerGroupFilter } from './PartnerGroupToggle';

export type PartnerStatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

/**
 * Search, group (Todos · Proveedores · Clientes) and status filters of the partners list, with the
 * count of each group. A partner with both roles counts in both groups.
 */
export function usePartnerListFilters(partners: Partner[]) {
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedGroup, setSelectedGroup] = useState<PartnerGroupFilter>('ALL');
	const [selectedStatus, setSelectedStatus] = useState<PartnerStatusFilter>('ALL');

	const groupCounts = useMemo(
		() => ({
			ALL: partners.length,
			supplier: partners.filter((p) => p.isSupplier()).length,
			customer: partners.filter((p) => p.isCustomer()).length
		}),
		[partners]
	);

	const filteredPartners = useMemo(() => {
		const term = searchTerm.trim().toLowerCase();

		return partners.filter((s) => {
			if (selectedGroup === 'supplier' && !s.isSupplier()) return false;

			if (selectedGroup === 'customer' && !s.isCustomer()) return false;

			if (selectedStatus === 'ACTIVE' && !s.is_active) return false;

			if (selectedStatus === 'INACTIVE' && s.is_active) return false;

			if (term === '') return true;

			const nameMatch = s.name?.toLowerCase().includes(term);
			const commMatch = s.commercial_name?.toLowerCase().includes(term);
			const contactMatch = s.contacts.some((c) => c.name.toLowerCase().includes(term) || c.phone.includes(term));
			// Stored as digits: "30-7084" and "307084" find the same partner.
			const cuitMatch = /^[\d\s-]+$/.test(term) && s.cuit?.includes(cuitDigits(term));
			const farmMatch = (s.farms || []).some(
				(f: { name?: string; renspa?: string | null }) =>
					f.name?.toLowerCase().includes(term) || f.renspa?.toLowerCase().includes(term)
			);

			return nameMatch || commMatch || contactMatch || cuitMatch || farmMatch;
		});
	}, [partners, searchTerm, selectedStatus, selectedGroup]);

	return {
		searchTerm,
		setSearchTerm,
		selectedGroup,
		setSelectedGroup,
		selectedStatus,
		setSelectedStatus,
		groupCounts,
		filteredPartners
	};
}
