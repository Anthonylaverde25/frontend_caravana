import jwtDecode, { JwtPayload } from 'jwt-decode';

export const isTokenValid = (accessToken: string): boolean => {
	if (!accessToken || typeof accessToken !== 'string' || accessToken.trim() === '') {
		return false;
	}

	// If the token is a standard JWT with 3 parts (header.payload.signature)
	if (accessToken.includes('.') && accessToken.split('.').length === 3) {
		try {
			const decoded = jwtDecode<JwtPayload>(accessToken);
			const currentTime = Date.now() / 1000;
			return decoded.exp ? decoded.exp > currentTime : true;
		} catch (error) {
			console.warn('JWT decode warning:', error);
			return false;
		}
	}

	// For Laravel Sanctum or opaque Bearer tokens (e.g. "1|abcdef..."),
	// format is valid as long as it's a non-empty string.
	// Server-side verification is performed via GET /api/me during auto-login.
	return true;
};

