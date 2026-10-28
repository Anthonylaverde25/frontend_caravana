import { Partner } from '@/core/partners/domain/entities/Partner';
import { PARTNER_ROLE_LABELS } from '@/core/partners/domain/entities/PartnerRole';

/** Downloads the partners as CSV, with their roles and their default contact. */
export function downloadPartnersCsv(partners: Partner[]): void {
	let content = 'Razón Social,Nombre Comercial,CUIT,Roles,Contacto,Teléfono,Email,Granjas,Estado\r\n';
	partners.forEach((s) => {
		const contact = s.default_contact;
		const roles = s.roles.map((role) => PARTNER_ROLE_LABELS[role]).join(' / ');
		content += `"${s.name || ''}","${s.commercial_name || ''}","${s.cuit || ''}","${roles}","${contact?.name ?? ''}","${contact?.phone ?? ''}","${contact?.email ?? ''}",${s.farms?.length || 0},"${s.is_active ? 'Activo' : 'Inactivo'}"\r\n`;
	});

	const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = `clientes_y_proveedores_${new Date().toISOString().split('T')[0]}.csv`;
	link.click();
	URL.revokeObjectURL(url);
}
