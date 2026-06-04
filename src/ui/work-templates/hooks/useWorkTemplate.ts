import { useState, useEffect, useCallback } from 'react';
import templateService from '../services/TemplateService';
import { WorkTemplate } from '../types/TemplateModels';

export function useWorkTemplate(code: string | undefined) {
	const [template, setTemplate] = useState<WorkTemplate | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchData = useCallback(async () => {
		if (!code) {
			setIsLoading(false);
			return;
		}
		setIsLoading(true);
		setError(null);
		try {
			const data = await templateService.getWorkTemplateByCode(code);
			setTemplate(data);
		} catch (err: any) {
			setError(err.message || 'Error fetching template data');
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	}, [code]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	return {
		template,
		isLoading,
		error,
		refresh: fetchData,
	};
}
