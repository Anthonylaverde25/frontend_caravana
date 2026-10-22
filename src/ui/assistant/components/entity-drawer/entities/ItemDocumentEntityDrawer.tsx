import { Stack, Typography } from '@mui/material';
import { transferRoute } from '@/core/stock/domain/entities/ItemDocument';
import { formatDate } from '@/core/stock/domain/rules/quantityFormat';
import { useItemDocument } from '@/features/stock/hooks/useItemDocuments';
import ItemDocumentLinesGrid from '@/ui/item-documents/components/detail/ItemDocumentLinesGrid';
import EntityCellLink from '../../blocks/EntityCellLink';
import { useEntityDrawer } from '../EntityDrawerContext';
import EntityDrawerShell from '../EntityDrawerShell';
import type { EntityDrawerProps } from './entityDrawerProps';

/** A stock movement with its lines; its warehouse, batch and invoice open on top. Reversing stays on its screen. */
export function ItemDocumentEntityDrawer({ id, label, open, onClose, onNavigate }: EntityDrawerProps) {
	const { data: document, isLoading, isError } = useItemDocument(id);
	const drawer = useEntityDrawer();

	const link = (text: string, onOpen: () => void) =>
		drawer ? (
			<EntityCellLink
				text={text}
				onOpen={onOpen}
			/>
		) : (
			text
		);

	return (
		<EntityDrawerShell
			open={open}
			onClose={onClose}
			icon="heroicons-outline:arrows-right-left"
			title={document ? `${document.typeLabel} N.º ${document.number}` : (label ?? 'Movimiento de stock')}
			subtitle={
				document
					? `${formatDate(document.occurredAt)} · ${transferRoute(document) ?? [document.warehouse.code, document.warehouse.name].filter(Boolean).join(' · ')}`
					: undefined
			}
			isLoading={isLoading}
			isError={isError}
			screen={{ route: `/item-documents/${id}`, label: 'Abrir movimiento' }}
			onNavigate={onNavigate}
		>
			{document && (
				<Stack spacing={2}>
					<Typography
						variant="body2"
						color="text.secondary"
						component="div"
					>
						<Stack
							direction="row"
							spacing={2}
							flexWrap="wrap"
							useFlexGap
						>
							<span>
								Depósito:{' '}
								{link(document.warehouse.name ?? document.warehouse.code ?? '—', () =>
									drawer?.openEntity({ kind: 'warehouse', id: document.warehouse.id })
								)}
							</span>
							{document.batch && (
								<span>
									Lote:{' '}
									{link(document.batch.name ?? `${document.batch.id}`, () =>
										drawer?.openEntity({ kind: 'batch', id: document.batch!.id })
									)}{' '}
									· {document.headsTreated} cabezas
								</span>
							)}
							{document.fiscalDocument && (
								<span>
									Comprobante:{' '}
									{link(document.fiscalDocument.label ?? '', () =>
										drawer?.openEntity({ kind: 'fiscal_document', id: document.fiscalDocument!.id })
									)}
								</span>
							)}
							{document.reversedBy && <span>Anulado por el N.º {document.reversedBy.number}</span>}
							{document.reason && <span>Motivo: {document.reason}</span>}
						</Stack>
					</Typography>
					<ItemDocumentLinesGrid lines={document.lines} />
				</Stack>
			)}
		</EntityDrawerShell>
	);
}

export default ItemDocumentEntityDrawer;
