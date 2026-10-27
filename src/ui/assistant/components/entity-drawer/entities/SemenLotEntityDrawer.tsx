import SemenLotDrawer from '@/ui/semen/components/lot/SemenLotDrawer';
import type { EntityDrawerProps } from './entityDrawerProps';

/** A semen lot opened from an assistant table: the read-only drawer of /items/semen. */
export default function SemenLotEntityDrawer({ id, open, onClose }: EntityDrawerProps) {
	return <SemenLotDrawer lotId={open ? id : null} onClose={onClose} />;
}
