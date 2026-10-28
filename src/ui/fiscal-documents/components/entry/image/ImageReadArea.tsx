import CreatePartnerDialog from '@/ui/partners/components/CreatePartnerDialog';
import { Partner } from '@/core/partners/domain/entities/Partner';
import ImageReadPanel from './ImageReadPanel';
import { ImageRecognition } from './useImageRecognition';
import { PartnerRole } from '@/core/partners/domain/entities/PartnerRole';

const ITEMS_ROLE: PartnerRole[] = ['SUPPLIER_ITEMS'];

/** The panel above the sheet plus the provider form it may open, prefilled with what was read. */
export default function ImageReadArea({ image }: { image: ImageRecognition }) {
	return (
		<>
			<ImageReadPanel image={image} />
			<CreatePartnerDialog
				open={image.draft !== null}
				onClose={image.closeDraft}
				defaultRoles={ITEMS_ROLE}
				initialValues={image.draft ?? undefined}
				onSuccess={(created?: Partner) => {
					if (created?.id) image.providerCreated(created);
				}}
			/>
		</>
	);
}
