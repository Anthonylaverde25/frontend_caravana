import type { EntityScope } from '@/core/assistant/domain/AssistantTypes';

/** What every entity drawer of the assistant receives from the host. */
export interface EntityDrawerProps {
	id: number;
	/** The clicked cell's text: the drawer's title until the record loads. */
	label?: string;
	/** Filter of the table the record was opened from (e.g. the batch of a category). */
	scope?: EntityScope | null;
	open: boolean;
	onClose: () => void;
	onNavigate?: () => void;
}
