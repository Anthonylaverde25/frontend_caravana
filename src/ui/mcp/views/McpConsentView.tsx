import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Alert, Box, CircularProgress, Paper } from '@mui/material';
import { setSessionRedirectUrl } from '@fuse/core/FuseAuthorization/sessionRedirectUrl';
import useUser from '@auth/useUser';
import { useCompany } from '@/contexts/CompanyContext';
import type { McpAuthorizationParams } from '@/core/mcp/domain/McpConnection';
import { useAnswerMcpAuthorization, useMcpAuthorizationRequest } from '@/features/mcp/hooks/useMcpConsent';
import McpConsentCard from '../components/McpConsentCard';

const OAUTH_PARAMS = ['response_type', 'client_id', 'redirect_uri', 'code_challenge', 'code_challenge_method', 'scope', 'state', 'resource', 'mcp_host'];

/**
 * `/oauth/consent`: where an AI client (Claude, Gemini) sends the user to approve access.
 *
 * Public route on purpose: Fuse keeps only the pathname when it sends a guest to sign in, which
 * would lose the OAuth query. This view stores the full URL itself and sends the guest to sign in.
 */
export default function McpConsentView() {
	const navigate = useNavigate();
	const [search] = useSearchParams();
	const { data: user, isGuest } = useUser();
	const { companies, activeCompanyId } = useCompany();
	const [companyId, setCompanyId] = useState<number | ''>('');
	const params = useMemo<McpAuthorizationParams>(
		() => Object.fromEntries(OAUTH_PARAMS.filter((k) => search.get(k)).map((k) => [k, search.get(k) as string])),
		[search]
	);
	const loggedIn = !!user && !isGuest;
	const request = useMcpAuthorizationRequest(params, loggedIn);
	const answer = useAnswerMcpAuthorization();

	useEffect(() => {
		if (!loggedIn) {
			setSessionRedirectUrl(`/oauth/consent?${search.toString()}`);
			navigate('/sign-in', { replace: true });
		}
	}, [loggedIn, navigate, search]);

	useEffect(() => {
		if (companyId === '' && activeCompanyId) setCompanyId(activeCompanyId);
	}, [activeCompanyId, companyId]);

	const respond = async (approve: boolean) => {
		if (approve && companyId === '') return;
		try {
			const redirectUrl = await answer.mutateAsync({ params, companyId: Number(companyId || activeCompanyId), approve });
			window.location.assign(redirectUrl);
		} catch {
			// Shown by the card through answer.isError.
		}
	};

	const apiError = (e: unknown) =>
		(e as { response?: { data?: { error_description?: string; message?: string } } })?.response?.data?.error_description ??
		'No se pudo procesar la solicitud del cliente de IA.';

	return (
		<Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, bgcolor: 'background.default' }}>
			<Paper sx={{ width: '100%', maxWidth: 480, p: 3, borderRadius: '8px', boxShadow: 1 }}>
				{(!loggedIn || request.isLoading) && <CircularProgress size={28} />}
				{request.isError && <Alert severity="error">{apiError(request.error)}</Alert>}
				{request.data && (
					<McpConsentCard
						request={request.data}
						companies={companies}
						companyId={companyId}
						onCompanyChange={setCompanyId}
						onApprove={() => respond(true)}
						onDeny={() => respond(false)}
						pending={answer.isPending}
						error={answer.isError ? apiError(answer.error) : null}
					/>
				)}
			</Paper>
		</Box>
	);
}
