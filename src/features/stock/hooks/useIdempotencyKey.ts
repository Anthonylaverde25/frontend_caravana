import { useCallback, useState } from 'react';

const newKey = (): string =>
	typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

/**
 * One key per load (DS8): kept across retries of the same submit, so a lost response never records
 * twice; renewed only once the load was registered and the screen starts another one.
 */
export function useIdempotencyKey(): [string, () => void] {
	const [key, setKey] = useState(newKey);
	const renew = useCallback(() => setKey(newKey()), []);

	return [key, renew];
}
