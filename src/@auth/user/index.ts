import { FuseSettingsConfigType } from '@fuse/core/FuseSettings/FuseSettings';
import { FuseAuthUser } from '@fuse/core/FuseAuthProvider/types/FuseAuthUser';
import { PartialDeep } from 'type-fest';

export type Company = {
	id: number;
	name: string;
	renspa?: string;
	location?: string;
	is_active: boolean;
	role: string;
};

/**
 * The type definition for a user object.
 */
export type User = FuseAuthUser & {
	id: string;
	role: string[] | string | null;
	displayName: string;
	photoURL?: string;
	email?: string;
	shortcuts?: string[];
	settings?: PartialDeep<FuseSettingsConfigType>;
	loginRedirectUrl?: string; // The URL to redirect to after login.
	companies?: Company[];
};
