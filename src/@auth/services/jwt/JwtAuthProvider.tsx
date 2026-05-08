import { useState, useEffect, useCallback, useMemo, useImperativeHandle } from 'react';
import { FuseAuthProviderComponentProps, FuseAuthProviderState } from '@fuse/core/FuseAuthProvider/types/FuseAuthTypes';
import useLocalStorage from '@fuse/hooks/useLocalStorage';
import { authRefreshToken, authSignIn, authSignInWithToken, authSignUp, authUpdateDbUser } from '@auth/authApi';
import { User } from '../../user';
import { removeGlobalHeaders, setGlobalHeaders } from '@/utils/axios';
import { isTokenValid } from './utils/jwtUtils';
import JwtAuthContext from '@auth/services/jwt/JwtAuthContext';
import { JwtAuthContextType } from '@auth/services/jwt/JwtAuthContext';
import axios from 'axios';
import axiosInstance from '@/utils/axios';

export type JwtSignInPayload = {
	email: string;
	password: string;
};

export type JwtSignUpPayload = {
	displayName: string;
	email: string;
	password: string;
};

function JwtAuthProvider(props: FuseAuthProviderComponentProps) {
	const { ref, children, onAuthStateChanged } = props;

	const {
		value: tokenStorageValue,
		setValue: setTokenStorageValue,
		removeValue: removeTokenStorageValue
	} = useLocalStorage<string>('jwt_access_token');

	/**
	 * Fuse Auth Provider State
	 */
	const [authState, setAuthState] = useState<FuseAuthProviderState<User>>({
		authStatus: 'configuring',
		isAuthenticated: false,
		user: null
	});

	/**
	 * Watch for changes in the auth state
	 * and pass them to the FuseAuthProvider
	 */
	useEffect(() => {
		if (onAuthStateChanged) {
			onAuthStateChanged(authState);
		}
	}, [authState, onAuthStateChanged]);

	/**
	 * Attempt to auto login with the stored token
	 */
	useEffect(() => {
		const attemptAutoLogin = async () => {
			const accessToken = tokenStorageValue;

			if (isTokenValid(accessToken)) {
				try {
					const userData = await authSignInWithToken(accessToken);
					return userData;
				} catch (error) {
					if (axios.isAxiosError(error)) {
						console.error('Auto login failed:', error.response?.status);
					}

					return false;
				}
			}

			return false;
		};

		if (!authState.isAuthenticated) {
			attemptAutoLogin().then((userData) => {
				if (userData) {
					setAuthState({
						authStatus: 'authenticated',
						isAuthenticated: true,
						user: userData
					});
				} else {
					removeTokenStorageValue();
					removeGlobalHeaders(['Authorization']);
					setAuthState({
						authStatus: 'unauthenticated',
						isAuthenticated: false,
						user: null
					});
				}
			});
		}
		// eslint-disable-next-line
	}, [authState.isAuthenticated]);

	/**
	 * Sign in
	 */
	const signIn: JwtAuthContextType['signIn'] = useCallback(
		async (credentials) => {
			try {
				const session = await authSignIn(credentials);
				setAuthState({
					authStatus: 'authenticated',
					isAuthenticated: true,
					user: session.user
				});
				setTokenStorageValue(session.access_token);
				setGlobalHeaders({ Authorization: `Bearer ${session.access_token}` });
				return session;
			} catch (error) {
				if (axios.isAxiosError(error)) {
					console.error('Sign in failed:', error.response?.status);
				}

				throw error;
			}
		},
		[setTokenStorageValue]
	);

	/**
	 * Sign up
	 */
	const signUp: JwtAuthContextType['signUp'] = useCallback(
		async (data) => {
			try {
				const session = await authSignUp(data);
				setAuthState({
					authStatus: 'authenticated',
					isAuthenticated: true,
					user: session.user
				});
				setTokenStorageValue(session.access_token);
				setGlobalHeaders({ Authorization: `Bearer ${session.access_token}` });
				return session;
			} catch (error) {
				if (axios.isAxiosError(error)) {
					console.error('Sign up failed:', error.response?.status);
				}

				throw error;
			}
		},
		[setTokenStorageValue]
	);

	/**
	 * Sign out
	 */
	const signOut: JwtAuthContextType['signOut'] = useCallback(() => {
		removeTokenStorageValue();
		removeGlobalHeaders(['Authorization']);
		setAuthState({
			authStatus: 'unauthenticated',
			isAuthenticated: false,
			user: null
		});
	}, [removeTokenStorageValue]);

	/**
	 * Update user
	 */
	const updateUser: JwtAuthContextType['updateUser'] = useCallback(async (_user) => {
		try {
			const response = await authUpdateDbUser(_user);
			return response;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				console.error('Update user failed:', error.response?.status);
			}

			throw error;
		}
	}, []);

	/**
	 * Refresh access token
	 */
	const refreshToken: JwtAuthContextType['refreshToken'] = useCallback(async () => {
		try {
			const response = await authRefreshToken();
			return response;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				console.error('Token refresh failed:', error.response?.status);
			}

			throw error;
		}
	}, []);

	/**
	 * Auth Context Value
	 */
	const authContextValue = useMemo(
		() =>
			({
				...authState,
				signIn,
				signUp,
				signOut,
				updateUser,
				refreshToken
			}) as JwtAuthContextType,
		[authState, signIn, signUp, signOut, updateUser, refreshToken]
	);

	/**
	 * Expose methods to the FuseAuthProvider
	 */
	useImperativeHandle(ref, () => ({
		signOut,
		updateUser
	}));

	/**
	 * Intercept axios requests to refresh the access token
	 */
	const setupAxiosInterceptors = useCallback(() => {
		const interceptor = axiosInstance.interceptors.response.use(
			(response) => {
				const newAccessToken = response.headers['new-access-token'];

				if (newAccessToken) {
					setGlobalHeaders({ Authorization: `Bearer ${newAccessToken}` });
					setTokenStorageValue(newAccessToken);
				}

				return response;
			},
			(error) => {
				if (axios.isAxiosError(error) && error.response?.status === 401) {
					signOut();
					console.error('Unauthorized request. User was signed out.');
				}
				return Promise.reject(error);
			}
		);

		return () => {
			axiosInstance.interceptors.response.eject(interceptor);
		};
	}, [setTokenStorageValue, signOut]);

	useEffect(() => {
		if (authState.isAuthenticated) {
			const cleanup = setupAxiosInterceptors();
			return cleanup;
		}
	}, [authState.isAuthenticated, setupAxiosInterceptors]);

	return <JwtAuthContext value={authContextValue}>{children}</JwtAuthContext>;
}

export default JwtAuthProvider;
