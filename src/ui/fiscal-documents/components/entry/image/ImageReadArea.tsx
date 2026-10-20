import CreateSupplierDialog from '@/ui/suppliers/components/CreateSupplierDialog';
import { Supplier } from '@/core/suppliers/domain/entities/Supplier';
import ImageReadPanel from './ImageReadPanel';
import { ImageRecognition } from './useImageRecognition';

const ITEMS_ROLE = { supplies_livestock: false, supplies_items: true };

/** The panel above the sheet plus the provider form it may open, prefilled with what was read. */
export default function ImageReadArea({ image }: { image: ImageRecognition }) {
	return (
		<>
			<ImageReadPanel image={image} />
			<CreateSupplierDialog
				open={image.draft !== null}
				onClose={image.closeDraft}
				defaultRoles={ITEMS_ROLE}
				initialValues={image.draft ?? undefined}
				onSuccess={(created?: Supplier) => {
					if (created?.id) image.providerCreated(created);
				}}
			/>
		</>
	);
}
