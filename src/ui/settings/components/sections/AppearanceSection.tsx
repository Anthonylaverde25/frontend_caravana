import { Box, ButtonBase, Radio, Typography } from '@mui/material';
import { ContrastPreset, useContrastTheme } from '@/contexts/ContrastThemeContext';
import { DEFAULT_PRESET_ITEM, PRESET_CATEGORIES } from '@/components/contrast/PresetSelector';
import type { PresetItemData } from '@/components/contrast/PresetCard';
import SettingsSection from '../SettingsSection';

const GROUP_TITLES: Record<string, string> = {
  agro: 'Campo',
  corporate: 'Oficina',
  field: 'Manga y alto contraste',
};

/** The colour themes as one list to pick from; the system default is the first option. */
export default function AppearanceSection() {
  const { settings, applyPreset } = useContrastTheme();
  const current: ContrastPreset = settings.enabled ? settings.preset : 'default';

  const groups = [
    { id: 'default', title: 'Sistema', items: [DEFAULT_PRESET_ITEM] },
    ...PRESET_CATEGORIES.map((cat) => ({ id: cat.id, title: GROUP_TITLES[cat.id] ?? cat.name, items: cat.items })),
  ];

  const row = (preset: PresetItemData) => {
    const selected = preset.id === current;

    return (
      <ButtonBase
        key={preset.id}
        onClick={() => applyPreset(preset.id)}
        aria-pressed={selected}
        sx={{ width: '100%', justifyContent: 'flex-start', gap: 1.5, py: 0.75, borderTop: 1, borderColor: 'divider', textAlign: 'left' }}
      >
        <Radio size="small" checked={selected} tabIndex={-1} sx={{ p: 0.5 }} />
        <Box sx={{ display: 'inline-flex', border: 1, borderColor: 'divider', borderRadius: '3px', overflow: 'hidden', flexShrink: 0 }}>
          {[preset.asideColor, preset.btnColor, preset.headerColor].map((color, i) => (
            <Box key={i} sx={{ width: 12, height: 14, bgcolor: color }} />
          ))}
        </Box>
        <Typography sx={{ width: { xs: 'auto', sm: 240 }, fontSize: '0.85rem', fontWeight: selected ? 700 : 600 }}>{preset.label}</Typography>
        <Typography sx={{ display: { xs: 'none', sm: 'block' }, fontSize: '0.8rem', color: 'text.secondary' }}>{preset.subtitle}</Typography>
      </ButtonBase>
    );
  };

  return (
    <SettingsSection id="appearance">
      {groups.map((group) => (
        <Box key={group.id}>
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: 'text.secondary', pb: 0.75 }}>{group.title}</Typography>
          {group.items.map(row)}
        </Box>
      ))}
    </SettingsSection>
  );
}
