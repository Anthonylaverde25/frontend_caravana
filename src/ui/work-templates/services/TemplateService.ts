import axiosInstance from 'src/utils/axios';
import { WorkTemplate } from '../types/TemplateModels';

class TemplateService {
	async getWorkTemplates(): Promise<WorkTemplate[]> {
		const response = await axiosInstance.get<WorkTemplate[]>('/work-templates');
		return response.data;
	}

	async getWorkTemplateByCode(code: string): Promise<WorkTemplate> {
		const response = await axiosInstance.get<WorkTemplate>(`/work-templates/${code}`);
		return response.data;
	}
}

const templateService = new TemplateService();
export default templateService;
