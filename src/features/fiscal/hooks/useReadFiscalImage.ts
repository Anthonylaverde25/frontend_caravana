import { useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ApiFiscalImageReader } from '@/core/fiscal/infrastructure/repositories/ApiFiscalImageReader';

/** Reads who issued a document image. `cancel` aborts the request in flight. */
export const useReadFiscalImage = () => {
	const controller = useRef<AbortController | null>(null);
	const reader = new ApiFiscalImageReader();

	const mutation = useMutation({
		mutationFn: (file: File) => {
			controller.current = new AbortController();

			return reader.read(file, controller.current.signal);
		}
	});

	return { ...mutation, cancel: () => controller.current?.abort() };
};
