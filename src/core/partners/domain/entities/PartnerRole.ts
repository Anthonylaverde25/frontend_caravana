/**
 * What a partner does with the company (egreso plan v5, 02 §2). Mirrors App\Core\Enums\PartnerRole.
 */
export type PartnerRole = 'SUPPLIER_LIVESTOCK' | 'SUPPLIER_ITEMS' | 'CUSTOMER_LIVESTOCK' | 'CUSTOMER_ITEMS';

export type PartnerGroup = 'supplier' | 'customer';

export const SUPPLIER_ROLES: PartnerRole[] = ['SUPPLIER_LIVESTOCK', 'SUPPLIER_ITEMS'];
export const CUSTOMER_ROLES: PartnerRole[] = ['CUSTOMER_LIVESTOCK', 'CUSTOMER_ITEMS'];

/** The enum's order, so chips and checkboxes always read the same. */
export const PARTNER_ROLES: PartnerRole[] = [...SUPPLIER_ROLES, ...CUSTOMER_ROLES];

export const PARTNER_ROLE_LABELS: Record<PartnerRole, string> = {
	SUPPLIER_LIVESTOCK: 'Vende hacienda',
	SUPPLIER_ITEMS: 'Vende artículos',
	CUSTOMER_LIVESTOCK: 'Compra hacienda',
	CUSTOMER_ITEMS: 'Compra artículos'
};

/** A list filter (C3): partners holding any of the roles, or any role of the group. */
export interface PartnerFilter {
	role?: PartnerRole | PartnerRole[];
	group?: PartnerGroup;
}

export const sortRoles = (roles: PartnerRole[]): PartnerRole[] => PARTNER_ROLES.filter((role) => roles.includes(role));

/** Filters of the selectors (C3): who sold us the livestock, who sells us articles, any supplier. */
export const LIVESTOCK_SELLERS: PartnerFilter = { role: 'SUPPLIER_LIVESTOCK' };
export const ITEM_SELLERS: PartnerFilter = { role: 'SUPPLIER_ITEMS' };
export const ANY_SUPPLIER: PartnerFilter = { group: 'supplier' };
