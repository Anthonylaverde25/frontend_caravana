import { WidgetRenderProps } from '../../types/dashboard.types';
import PendingSiresWidget from '../PendingSiresWidget';
import PendingLabProtocolsWidget from '../pending-lab-protocols/PendingLabProtocolsWidget';

/** Adapters so the existing, API-backed worklists can be placed on any board. */
export function SiresWorklistWidget(_props: WidgetRenderProps) {
	return <PendingSiresWidget />;
}

export function LabWorklistWidget(_props: WidgetRenderProps) {
	return <PendingLabProtocolsWidget />;
}
