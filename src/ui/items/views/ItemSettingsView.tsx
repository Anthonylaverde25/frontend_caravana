import { useSearchParams } from 'react-router';
import { Box, Tab, Tabs } from '@mui/material';
import ViewLayout from 'src/components/ViewLayout';
import UnitsTab from '../components/settings/UnitsTab';
import CategoriesTab from '../components/settings/CategoriesTab';

type SettingsTab = 'units' | 'categories';

/** What the catalog is built on. The active tab lives in the URL (?tab=), so a link opens it. */
export default function ItemSettingsView() {
	const [searchParams, setSearchParams] = useSearchParams();
	const tab: SettingsTab = searchParams.get('tab') === 'categories' ? 'categories' : 'units';

	return (
		<ViewLayout
			title="Unidades y categorías"
			subtitle="En qué se mide y cómo se agrupa lo que la empresa compra o usa."
			backUrl="/items"
			showBackButton
			backTitle="Artículos y servicios"
		>
			<Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
				<Tabs value={tab} onChange={(_, value: SettingsTab) => setSearchParams({ tab: value }, { replace: true })}>
					<Tab value="units" label="Unidades" sx={{ textTransform: 'none', fontWeight: 600 }} />
					<Tab value="categories" label="Categorías" sx={{ textTransform: 'none', fontWeight: 600 }} />
				</Tabs>
			</Box>
			{tab === 'units' ? <UnitsTab /> : <CategoriesTab />}
		</ViewLayout>
	);
}
