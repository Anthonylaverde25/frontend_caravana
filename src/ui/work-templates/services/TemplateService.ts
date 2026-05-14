import axiosInstance from 'src/utils/axios';
import { TemplateType, WorkTemplate } from '../types/TemplateModels';

class TemplateService {
	async getTemplateTypes(): Promise<TemplateType[]> {
		const response = await axiosInstance.get<TemplateType[]>('/template-types');
		return response.data;
	}

	async getWorkTemplates(): Promise<WorkTemplate[]> {
		const response = await axiosInstance.get<WorkTemplate[]>('/work-templates');
		return response.data;
	}
}

const templateService = new TemplateService();
export default templateService;
