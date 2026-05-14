import { useState, useEffect, useCallback } from 'react';
import templateService from '../services/TemplateService';
import { TemplateType, WorkTemplate } from '../types/TemplateModels';

export function useTemplateData() {
	const [types, setTypes] = useState<TemplateType[]>([]);
	const [templates, setTemplates] = useState<WorkTemplate[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchData = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const [typesData, templatesData] = await Promise.all([
				templateService.getTemplateTypes(),
				templateService.getWorkTemplates(),
			]);
			setTypes(typesData);
			setTemplates(templatesData);
		} catch (err: any) {
			setError(err.message || 'Error fetching template data');
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	return {
		types,
		templates,
		isLoading,
		error,
		refresh: fetchData,
	};
}
