/**
 * Someone we talk to at a partner (C6): name and phone always; one of them is the default.
 */
export interface PartnerContact {
	id: number;
	name: string;
	position: string | null;
	phone: string;
	email: string | null;
	notes: string | null;
	is_default: boolean;
}

/** What the forms send to add or correct a contact. */
export interface PartnerContactInput {
	name: string;
	phone: string;
	position?: string | null;
	email?: string | null;
	notes?: string | null;
}
