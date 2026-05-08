import { useMemo } from 'react';
import useUser from '@auth/useUser';
import { useCompany } from '@/contexts/CompanyContext';

/**
 * useSession hook
 * Provides a unified interface for the current user session and company context.
 */
function useSession() {
	const { data: user, isGuest, signOut, updateUser, updateUserSettings } = useUser();
	const { activeCompanyId, setActiveCompanyId, companies, loading: companiesLoading } = useCompany();

	const activeCompany = useMemo(() => {
		if (!companies || !activeCompanyId) {
			return null;
		}
		return companies.find((c) => c.id === activeCompanyId) || null;
	}, [companies, activeCompanyId]);

	const selectCompany = (id: number) => {
		setActiveCompanyId(id);
	};

	return {
		user,
		isGuest,
		companies,
		activeCompany,
		activeCompanyId,
		selectCompany,
		signOut,
		updateUser,
		updateUserSettings,
		isLoading: companiesLoading
	};
}

export default useSession;
