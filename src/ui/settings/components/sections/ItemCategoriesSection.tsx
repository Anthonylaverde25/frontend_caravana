import CategoriesTab from '@/ui/items/components/settings/CategoriesTab';
import SettingsSection from '../SettingsSection';

/** The tree of categories the company groups its articles and services in. */
export default function ItemCategoriesSection() {
	return (
		<SettingsSection id="item-categories">
			<CategoriesTab />
		</SettingsSection>
	);
}
