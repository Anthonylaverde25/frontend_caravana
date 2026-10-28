import { Navigate, useLocation } from 'react-router';

/**
 * /providers and /suppliers became /partners ("Clientes y proveedores"): old links and bookmarks
 * land there, keeping their query (`?action=create` still opens the creation modal).
 */
export default function LegacyProvidersRedirect() {
	const { pathname, search } = useLocation();
	const creates = /\/create\/?$/.test(pathname);

	return (
		<Navigate
			to={{
				pathname: '/partners',
				search: creates ? '?action=create' : search
			}}
			replace
		/>
	);
}
