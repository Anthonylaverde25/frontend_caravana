import { DragEvent, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { ProviderRecognition } from '@/core/fiscal/domain/entities/ProviderRecognition';
import { Supplier } from '@/core/suppliers/domain/entities/Supplier';
import { formatCuit } from '@/core/shared/domain/cuit';
import { useReadFiscalImage } from '@/features/fiscal/hooks/useReadFiscalImage';
import { useSuppliers } from '@/features/suppliers/hooks/useSuppliers';
import { useUpdateSupplierRoles } from '@/features/suppliers/hooks/useUpdateSupplierRoles';

const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'application/pdf'];
const MAX_BYTES = 20 * 1024 * 1024;
const BY_EXTENSION: Record<string, string> = {
	png: 'image/png',
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
	webp: 'image/webp',
	avif: 'image/avif',
	pdf: 'application/pdf'
};

/**
 * Some browsers report AVIF with an empty or generic type (application/octet-stream): the extension
 * decides then. The server checks the real content anyway.
 */
const typeOf = (file: File): string =>
	file.type && file.type !== 'application/octet-stream'
		? file.type
		: (BY_EXTENSION[file.name.split('.').pop()?.toLowerCase() ?? ''] ?? '');

/** What the provider form opens with when the issuer is not in the portfolio. */
export interface ProviderDraft {
	name: string;
	commercial_name: string;
	cuit: string;
	location: string;
}

type ApiError = { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };

/**
 * Reading a document image and acting on what was recognized (Delivery F, part 05). Nothing is
 * created by itself: a known provider is preselected; a new one, or a missing role, waits for a click.
 */
export function useImageRecognition(
	selectedProviderId: number | null,
	onPickProvider: (providerId: number | null) => void
) {
	const { enqueueSnackbar } = useSnackbar();
	const read = useReadFiscalImage();
	const { mutate: updateRoles, isPending: enablingRole } = useUpdateSupplierRoles();
	const { data: allProviders = [] } = useSuppliers();
	const [file, setFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [recognition, setRecognition] = useState<ProviderRecognition | null>(null);
	const [draft, setDraft] = useState<ProviderDraft | null>(null);
	// The provider a reading selected: a new reading takes it back, never one chosen by hand.
	const picked = useRef<number | null>(null);

	const pick = (providerId: number) => {
		picked.current = providerId;
		onPickProvider(providerId);
	};

	useEffect(() => () => (previewUrl ? URL.revokeObjectURL(previewUrl) : undefined), [previewUrl]);

	const matched = (provider: Supplier) => {
		pick(provider.id);
		setRecognition((r) => (r ? { ...r, status: 'MATCHED', reason: null, provider } : r));
	};

	const start = (paper: File) => {
		const type = typeOf(paper);

		if (!ACCEPTED.includes(type)) {
			enqueueSnackbar('El comprobante tiene que ser una imagen (PNG, JPG, WEBP, AVIF) o un PDF.', {
				variant: 'warning'
			});
			return;
		}

		if (paper.size > MAX_BYTES) {
			enqueueSnackbar('El archivo no puede pesar más de 20 MB.', { variant: 'warning' });
			return;
		}

		if (picked.current !== null && picked.current === selectedProviderId) onPickProvider(null);

		picked.current = null;
		setFile(paper);
		setRecognition(null);
		setPreviewUrl(type.startsWith('image/') ? URL.createObjectURL(paper) : null);
		read.mutate(paper, {
			onSuccess: (result) => {
				setRecognition(result);

				if (result.status === 'MATCHED' && result.provider) pick(result.provider.id);
			},
			onError: (error) => {
				if (axios.isCancel(error)) return;

				const body = (error as ApiError).response?.data;
				enqueueSnackbar(body?.errors?.document?.[0] ?? body?.message ?? 'No se pudo leer la imagen.', {
					variant: 'error'
				});
			}
		});
	};

	const enableRole = () => {
		const provider = recognition?.provider;

		if (!provider) return;

		updateRoles(
			{ id: provider.id, roles: { supplies_livestock: provider.supplies_livestock, supplies_items: true } },
			{ onSuccess: () => matched(provider) }
		);
	};

	const createProvider = (cuit?: string) => {
		const issuer = recognition?.issuer;
		const fromRead = !cuit;
		setDraft({
			name: fromRead ? (issuer?.legalName ?? issuer?.name ?? '') : '',
			commercial_name:
				fromRead && issuer?.legalName && issuer.name !== issuer.legalName ? (issuer?.name ?? '') : '',
			cuit: formatCuit(cuit ?? issuer?.cuit ?? ''),
			location: fromRead ? (issuer?.address ?? '') : ''
		});
	};

	/** ISSUER_IS_OWN_COMPANY: the person accepts the other CUIT on the paper as the issuer's. */
	const useSuggested = () => {
		const cuit = recognition?.suggestedCuit;

		if (!cuit) return;

		const known = allProviders.find((p) => p.cuit === cuit);

		if (!known) return createProvider(cuit);

		if (known.supplies_items) return matched(known);

		setRecognition((r) => (r ? { ...r, status: 'ROLE_MISSING', reason: null, provider: known } : r));
	};

	const clear = () => {
		read.cancel();
		setFile(null);
		setPreviewUrl(null);
		setRecognition(null);
	};

	return {
		/** Spread on the sheet so the paper can be dropped on it. */
		dropZone: {
			onDragOver: (e: DragEvent) => e.preventDefault(),
			onDrop: (e: DragEvent) => {
				e.preventDefault();
				const dropped = e.dataTransfer.files?.[0];

				if (dropped && !read.isPending) start(dropped);
			}
		},
		file,
		previewUrl,
		recognition,
		reading: read.isPending,
		enablingRole,
		draft,
		start,
		cancel: clear,
		dismiss: clear,
		enableRole,
		createProvider: () => createProvider(),
		useSuggested,
		closeDraft: () => setDraft(null),
		providerCreated: (created: Supplier) => {
			setDraft(null);
			matched(created);
		}
	};
}

export type ImageRecognition = ReturnType<typeof useImageRecognition>;
