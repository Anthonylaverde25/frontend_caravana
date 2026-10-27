import { WidgetRenderProps } from '../../types/dashboard.types';
import PendingLabProtocolsWidget from '../pending-lab-protocols/PendingLabProtocolsWidget';

/** Adapter so the existing, API-backed worklist can be placed on any board. */
export function LabWorklistWidget(_props: WidgetRenderProps) {
	return <PendingLabProtocolsWidget />;
}
