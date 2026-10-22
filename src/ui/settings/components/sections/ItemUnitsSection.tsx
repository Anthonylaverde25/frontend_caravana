import UnitsTab from '@/ui/items/components/settings/UnitsTab';
import SettingsSection from '../SettingsSection';

/** The units the company measures its items in, grouped by dimension. */
export default function ItemUnitsSection() {
	return (
		<SettingsSection id="item-units">
			<UnitsTab />
		</SettingsSection>
	);
}
