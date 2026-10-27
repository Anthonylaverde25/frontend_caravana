import { ComponentType, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { Box } from '@mui/material';
import ViewHeader from 'src/components/ViewHeader';
import { useCompany } from '@/contexts/CompanyContext';
import { formatCuit } from '@/core/shared/domain/cuit';
import { useBreeds } from '@/features/breeds/hooks/useBreeds';
import { useActivities } from '@/features/activities/hooks/useActivities';
import { useAnimalCategories } from '@/features/categories/hooks/useAnimalCategories';
import { useWeighingTypes } from '@/features/weighing/hooks/useWeighingTypes';
import { useWarehouses } from '@/features/stock/hooks/useWarehouses';
import { useUnitsOfMeasure } from '@/features/items/hooks/useUnitsOfMeasure';
import { useItemCategories } from '@/features/items/hooks/useItemCategories';
import SettingsNav from '@/ui/settings/components/navigation/SettingsNav';
import {
  isSettingsSection,
  settingsSection,
  settingsSectionPath,
  SettingsSectionId,
} from '@/ui/settings/config/settingsNavigation';
import { DENTITION_SCALE } from '@/ui/settings/components/sections/dentitionScale';
import CompanyGeneralSection from '@/ui/settings/components/sections/CompanyGeneralSection';
import ActivitiesWorkflowSection from '@/ui/settings/components/sections/ActivitiesWorkflowSection';
import AnimalCategoriesSection from '@/ui/settings/components/sections/AnimalCategoriesSection';
import BreedsCatalogSection from '@/ui/settings/components/sections/BreedsCatalogSection';
import DentitionScaleSection from '@/ui/settings/components/sections/DentitionScaleSection';
import WeighingTypesSection from '@/ui/settings/components/sections/WeighingTypesSection';
import WarehousesSection from '@/ui/settings/components/sections/WarehousesSection';
import ItemUnitsSection from '@/ui/settings/components/sections/ItemUnitsSection';
import ItemCategoriesSection from '@/ui/settings/components/sections/ItemCategoriesSection';
import AppearanceSection from '@/ui/settings/components/sections/AppearanceSection';
import AiConnectionsSection from '@/ui/settings/components/sections/AiConnectionsSection';
import WorkTemplatesSection from '@/ui/settings/components/sections/WorkTemplatesSection';
import { useTemplateData } from '@/ui/work-templates/hooks/useTemplateData';

const SECTIONS: Record<SettingsSectionId, ComponentType> = {
  company: CompanyGeneralSection,
  activities: ActivitiesWorkflowSection,
  'animal-categories': AnimalCategoriesSection,
  breeds: BreedsCatalogSection,
  dentition: DentitionScaleSection,
  'weighing-types': WeighingTypesSection,
  warehouses: WarehousesSection,
  'item-units': ItemUnitsSection,
  'item-categories': ItemCategoriesSection,
  appearance: AppearanceSection,
  'ai-connections': AiConnectionsSection,
  'work-templates': WorkTemplatesSection,
};

/**
 * `/settings`: everything the active company is configured with, one section at a time. The
 * section lives in `?section=`, so a link (or the old /warehouses and /items/settings) opens it.
 */
export default function GeneralConfig() {
  const [searchParams, setSearchParams] = useSearchParams();
  const raw = searchParams.get('section');
  const active: SettingsSectionId = isSettingsSection(raw) ? raw : 'company';
  const section = settingsSection(active);
  const Section = SECTIONS[active];

  const { activeCompanyId, companies } = useCompany();
  const company = companies.find((c) => c.id === activeCompanyId);
  const { data: activities = [] } = useActivities(activeCompanyId);
  const { data: categories = [] } = useAnimalCategories();
  const { data: breeds = [] } = useBreeds();
  const { data: weighingTypes = [] } = useWeighingTypes(false);
  const { data: warehouses = [] } = useWarehouses();
  const { data: units = [] } = useUnitsOfMeasure();
  const { data: itemCategories = [] } = useItemCategories();
  const { templates = [] } = useTemplateData();

  const counts = useMemo<Partial<Record<SettingsSectionId, number>>>(
    () => ({
      activities: activities.filter((a) => a.isEnabled).length,
      'animal-categories': categories.length,
      breeds: breeds.length,
      dentition: DENTITION_SCALE.length,
      'weighing-types': weighingTypes.length,
      warehouses: warehouses.filter((w) => w.isActive).length,
      'item-units': units.length,
      'item-categories': itemCategories.length,
      'work-templates': new Set(templates.map((t) => t.code)).size,
    }),
    [activities, categories.length, breeds.length, weighingTypes.length, warehouses, units.length, itemCategories.length, templates]
  );

  const subtitle = [
    company?.name,
    company?.cuit ? `CUIT ${formatCuit(company.cuit)}` : 'CUIT sin cargar',
    company?.renspa ? `RENSPA ${company.renspa}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%', bgcolor: 'background.paper' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <ViewHeader
          title="Configuración"
          subtitle={subtitle}
          breadcrumbs={[
            { title: 'Configuración', url: '/settings' },
            { title: section.title, url: settingsSectionPath(active) },
          ]}
        />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, flex: 1 }}>
        <Box
          component="aside"
          sx={{
            width: { xs: '100%', md: 232 },
            flexShrink: 0,
            borderRight: { xs: 0, md: 1 },
            borderBottom: { xs: 1, md: 0 },
            borderColor: 'divider',
          }}
        >
          <SettingsNav activeSection={active} onSelectSection={(id) => setSearchParams({ section: id }, { replace: true })} counts={counts} />
        </Box>

        <Box component="main" sx={{ flex: 1, minWidth: 0, px: { xs: 2, sm: 4 }, py: 3, pb: 6 }}>
          <Box sx={{ maxWidth: 1120 }}>
            <Section />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
