import axiosInstance from '@/utils/axios';
import { ProviderRecognition } from '../../domain/entities/ProviderRecognition';
import { ProviderRecognitionMapper } from '../mappers/ProviderRecognitionMapper';

/** Sends the image of a provider document to be read; nothing is created on the server. */
export class ApiFiscalImageReader {
	async read(file: File, signal?: AbortSignal): Promise<ProviderRecognition> {
		const form = new FormData();
		form.append('document', file);

		const response = await axiosInstance.post('/fiscal-documents/read-image', form, {
			headers: { 'Content-Type': 'multipart/form-data' },
			// GPT may take a while on a photo; above the backend's own limit to the agent.
			timeout: 220_000,
			signal
		});

		return ProviderRecognitionMapper.toDomain(response.data);
	}
}
