import { useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { Box, Stack, Typography, Divider } from '@mui/material';
import ViewHeader from 'src/components/ViewHeader';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useCompany } from '@/contexts/CompanyContext';
import { useBreeds } from '@/features/breeds/hooks/useBreeds';
import { useActivities } from '@/features/activities/hooks/useActivities';
import { useAnimalCategories } from '@/features/categories/hooks/useAnimalCategories';
import { useWeighingTypes } from '@/features/weighing/hooks/useWeighingTypes';
import CompanyCuitInfo from '@/ui/settings/CompanyCuitInfo';

import SettingsNav from '@/ui/settings/components/navigation/SettingsNav';
import { SettingsSectionId } from '@/ui/settings/config/settingsNavigation';

// Sections
import CompanyGeneralSection from '@/ui/settings/components/sections/CompanyGeneralSection';
import ActivitiesWorkflowSection from '@/ui/settings/components/sections/ActivitiesWorkflowSection';
import DentitionScaleSection from '@/ui/settings/components/sections/DentitionScaleSection';
import BreedsCatalogSection from '@/ui/settings/components/sections/BreedsCatalogSection';
import WeighingTypesSection from '@/ui/settings/components/sections/WeighingTypesSection';
import AnimalCategoriesSection from '@/ui/settings/components/sections/AnimalCategoriesSection';
import AppearanceSection from '@/ui/settings/components/sections/AppearanceSection';

const VALID_SECTIONS: SettingsSectionId[] = [
  'company',
  'activities',
  'dentition',
  'breeds',
  'weighing-types',
  'animal-categories',
  'appearance',
];

/**
 * GeneralConfig Component
 * Master-Detail Settings Shell with Full-Height Aside Navigation (No Tabs).
 * Synchronized with URL ?section= query parameter.
 */
export default function GeneralConfig() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawSection = searchParams.get('section') as SettingsSectionId | null;
  const activeSection: SettingsSectionId =
    rawSection && VALID_SECTIONS.includes(rawSection) ? rawSection : 'company';

  const handleSelectSection = (sectionId: SettingsSectionId) => {
    setSearchParams({ section: sectionId }, { replace: true });
  };

  // Domain queries for reactive badges
  const { activeCompanyId, companies } = useCompany();
  const activeCompany = companies.find((c) => c.id === activeCompanyId);
  const { data: breeds = [] } = useBreeds();
  const { data: activities = [] } = useActivities(activeCompanyId);
  const { data: categories = [] } = useAnimalCategories();
  const { data: weighingTypes = [] } = useWeighingTypes(true);

  const activeActivitiesCount = activities.filter((a) => a.isEnabled).length;

  const badges = useMemo<Partial<Record<SettingsSectionId, React.ReactNode>>>(() => {
    return {
      company: activeCompany?.cuit ? 'CUIT OK' : 'Sin CUIT',
      activities: `${activeActivitiesCount} act.`,
      dentition: '5 niv.',
      breeds: breeds.length > 0 ? breeds.length : undefined,
      'weighing-types': weighingTypes.length > 0 ? weighingTypes.length : undefined,
      'animal-categories': categories.length > 0 ? categories.length : undefined,
    };
  }, [activeCompany?.cuit, activeActivitiesCount, breeds.length, weighingTypes.length, categories.length]);

  const CompanyHeaderInfo = (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      divider={<Divider orientation="vertical" flexItem sx={{ height: 16, my: 'auto', borderColor: '#e2e8f0' }} />}
      sx={{
        bgcolor: '#f8fafc',
        px: 2,
        py: 0.75,
        borderRadius: '6px',
        border: '1px solid #e2e8f0',
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>EMPRESA:</Typography>
        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
          {activeCompany?.name || 'Cargando...'}
        </Typography>
      </Stack>

      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>RENSPA:</Typography>
        <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>
          {activeCompany?.renspa || 'N/D'}
        </Typography>
      </Stack>

      <CompanyCuitInfo company={activeCompany} />

      <Stack direction="row" spacing={1} alignItems="center" sx={{ display: { xs: 'none', xl: 'flex' } }}>
        <FuseSvgIcon size={14} className="text-slate-400">heroicons-outline:location-marker</FuseSvgIcon>
        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
          {activeCompany?.location || 'Sede Central'}
        </Typography>
      </Stack>
    </Stack>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: '#ffffff',
      }}
    >
      {/* 1. Header with integrated company strip */}
      <Box sx={{ borderBottom: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
        <ViewHeader
          title="Configuración General"
          subtitle="Parámetros globales, zootecnia y perfil de la empresa."
          actions={CompanyHeaderInfo}
          backUrl="/batches"
          backTitle="Volver"
        />
      </Box>

      {/* 2. Full-height Master-Detail Split Shell */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          flex: 1,
          minHeight: 'calc(100vh - 110px)',
        }}
      >
        {/* Left Aside Navigation (Full Height) */}
        <Box
          component="aside"
          sx={{
            width: { xs: '100%', md: 260, lg: 280 },
            flexShrink: 0,
            borderRight: { xs: 0, md: '1px solid #e2e8f0' },
            bgcolor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <SettingsNav
            activeSection={activeSection}
            onSelectSection={handleSelectSection}
            badges={badges}
          />
        </Box>

        {/* Right Main Content Outlet (Scrollable) */}
        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            bgcolor: '#f8fafc',
            p: { xs: 2, sm: 3, lg: 4 },
          }}
        >
          <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
            {activeSection === 'company' && <CompanyGeneralSection />}
            {activeSection === 'activities' && <ActivitiesWorkflowSection />}
            {activeSection === 'dentition' && <DentitionScaleSection />}
            {activeSection === 'breeds' && <BreedsCatalogSection />}
            {activeSection === 'weighing-types' && <WeighingTypesSection />}
            {activeSection === 'animal-categories' && <AnimalCategoriesSection />}
            {activeSection === 'appearance' && <AppearanceSection />}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}