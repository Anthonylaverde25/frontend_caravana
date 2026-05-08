import { User } from '@auth/user';
import UserModel from '@auth/user/models/UserModel';
import { PartialDeep } from 'type-fest';
import axiosInstance from '@/utils/axios';
import { Company } from '@auth/user';

type AuthResponse = {
	user: User;
	access_token: string;
	companies: Company[];
};

/**
 * Refreshes the access token
 */
export async function authRefreshToken(): Promise<any> {
	const response = await axiosInstance.post('refresh');
	return response.data;
}

/**
 * Sign in with token
 */
export async function authSignInWithToken(accessToken: string): Promise<User> {
	const response = await axiosInstance.get('me', {
		headers: { Authorization: `Bearer ${accessToken}` }
	});
	const { user, companies } = response.data as { user: User; companies: Company[] };
	return { ...user, companies } as User;
}

/**
 * Sign in
 */
export async function authSignIn(credentials: { email: string; password: string }): Promise<AuthResponse> {
	const response = await axiosInstance.post('login', credentials);
	const { user, access_token, companies } = response.data as AuthResponse;
	return {
		user: { ...user, companies },
		access_token,
		companies
	} as AuthResponse;
}

/**
 * Sign up
 */
export async function authSignUp(data: {
	displayName: string;
	email: string;
	password: string;
}): Promise<AuthResponse> {
	const response = await axiosInstance.post('register', data);
	return response.data as AuthResponse;
}

/**
 * Get user by id
 */
export async function authGetDbUser(userId: string): Promise<User> {
	const response = await axiosInstance.get(`user/${userId}`);
    return response.data as User;
}

/**
 * Get user by email
 */
export async function authGetDbUserByEmail(email: string): Promise<User> {
	const response = await axiosInstance.get(`user-by-email/${email}`);
    return response.data as User;
}

/**
 * Update user
 */
export async function authUpdateDbUser(user: PartialDeep<User>): Promise<any> {
	const response = await axiosInstance.put(`user/${user.id}`, UserModel(user));
    return response.data;
}

/**
 * Create user
 */
export async function authCreateDbUser(user: PartialDeep<User>): Promise<User> {
	const response = await axiosInstance.post('users', UserModel(user));
    return response.data as User;
}
