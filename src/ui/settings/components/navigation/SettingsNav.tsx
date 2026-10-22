import { Box, ButtonBase, MenuItem, TextField, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { SETTINGS_NAVIGATION_GROUPS, SettingsSectionId } from '../../config/settingsNavigation';

interface SettingsNavProps {
  activeSection: SettingsSectionId;
  onSelectSection: (id: SettingsSectionId) => void;
  /** How many records a section holds, shown in grey after its name. */
  counts?: Partial<Record<SettingsSectionId, number>>;
}

/** The inner menu of /settings: plain text grouped by subject, the active section marked by a bar. */
export default function SettingsNav({ activeSection, onSelectSection, counts = {} }: SettingsNavProps) {
  return (
    <>
      <Box sx={{ display: { xs: 'block', md: 'none' }, p: 2 }}>
        <TextField
          select
          fullWidth
          variant="filled"
          label="Sección"
          value={activeSection}
          onChange={(e) => onSelectSection(e.target.value as SettingsSectionId)}
          InputProps={{ disableUnderline: true, sx: { borderRadius: '6px', bgcolor: 'action.hover' } }}
        >
          {SETTINGS_NAVIGATION_GROUPS.flatMap((group) =>
            group.items.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {group.groupTitle} · {item.title}
              </MenuItem>
            ))
          )}
        </TextField>
      </Box>

      <Box component="nav" aria-label="Secciones de configuración" sx={{ display: { xs: 'none', md: 'block' }, py: 0.5 }}>
        {SETTINGS_NAVIGATION_GROUPS.map((group) => (
          <Box key={group.groupId}>
            <Typography sx={{ px: 1.75, pt: 2, pb: 0.75, fontSize: '0.7rem', fontWeight: 600, color: 'text.secondary' }}>{group.groupTitle}</Typography>
            {group.items.map((item) => {
              const active = item.id === activeSection;

              return (
                <ButtonBase
                  key={item.id}
                  onClick={() => onSelectSection(item.id)}
                  aria-current={active ? 'page' : undefined}
                  sx={(theme) => ({
                    width: '100%',
                    height: 34,
                    justifyContent: 'flex-start',
                    gap: 1,
                    pl: 1.75,
                    pr: 1.5,
                    borderLeft: '2px solid',
                    borderLeftColor: active ? 'primary.main' : 'transparent',
                    bgcolor: active ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                    color: active ? 'primary.dark' : 'text.primary',
                    fontSize: '0.82rem',
                    fontWeight: active ? 700 : 500,
                    '&:hover': { bgcolor: active ? alpha(theme.palette.primary.main, 0.08) : 'action.hover' },
                    '&.Mui-focusVisible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: -2 },
                  })}
                >
                  <Box component="span" sx={{ flex: 1, textAlign: 'left' }}>
                    {item.title}
                  </Box>
                  {counts[item.id] != null && (
                    <Box component="span" sx={{ fontSize: '0.72rem', fontWeight: 500, color: 'text.disabled' }}>
                      {counts[item.id]}
                    </Box>
                  )}
                </ButtonBase>
              );
            })}
          </Box>
        ))}
      </Box>
    </>
  );
}
