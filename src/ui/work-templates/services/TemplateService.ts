import axiosInstance from 'src/utils/axios';
import { WorkTemplate } from '../types/TemplateModels';

const MOCK_REP_02: WorkTemplate = {
	id: 9999,
	title: 'Planilla de Parición',
	description: 'Registro de partos en campo, caravanas de terneros nacidos, sexo, peso y observaciones.',
	code: 'REP-02',
	category: 'REPRODUCTIVE',
	status: 'active',
	schema_definition: [
		{ name: 'caravana', label: 'Caravana Madre', type: 'string', required: true },
		{ name: 'category', label: 'Categoría', type: 'string', required: true },
		{ name: 'calving_date', label: 'Fecha Parición', type: 'date', required: true },
		{ name: 'calf_caravan', label: 'Caravana Ternero', type: 'string', required: false },
		{ name: 'calf_sex', label: 'Sexo Ternero', type: 'select', required: false, options: [{ value: 'M', label: 'M' }, { value: 'H', label: 'H' }] },
		{ name: 'calf_weight', label: 'Peso Nacer (kg)', type: 'number', required: false },
		{ name: 'observations', label: 'Observaciones', type: 'text', required: false }
	],
	created_at: new Date().toISOString()
};

class TemplateService {
	async getWorkTemplates(): Promise<WorkTemplate[]> {
		try {
			const response = await axiosInstance.get<WorkTemplate[]>('/work-templates');
			const templates = response.data;
			
			// Append mock REP-02 if it doesn't already exist in backend list
			if (!templates.some((t) => t.code === 'REP-02')) {
				templates.push(MOCK_REP_02);
			}
			return templates;
		} catch (error) {
			// If backend request fails entirely, still return at least the mock REP-02 to keep UI usable
			console.error('Failed fetching templates from backend, falling back to mock.', error);
			return [MOCK_REP_02];
		}
	}

	async getWorkTemplateByCode(code: string): Promise<WorkTemplate> {
		if (code === 'REP-02') {
			return MOCK_REP_02;
		}
		const response = await axiosInstance.get<WorkTemplate>(`/work-templates/${code}`);
		return response.data;
	}
}

const templateService = new TemplateService();
export default templateService;

