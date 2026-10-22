import { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { settingsSection, SettingsSectionId } from '../config/settingsNavigation';

interface SettingsSectionProps {
  id: SettingsSectionId;
  /** The section's own buttons, at the right of its title. */
  actions?: ReactNode;
  children: ReactNode;
}

/** The frame of a /settings section: its title and description over a hairline, then its content. */
export default function SettingsSection({ id, actions, children }: SettingsSectionProps) {
  const section = settingsSection(id);

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'flex-end' }}
        spacing={1.5}
        sx={{ pb: 1.75, borderBottom: 1, borderColor: 'divider' }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography component="h2" sx={{ fontSize: '1rem', fontWeight: 800, lineHeight: 1.3 }}>
            {section.title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
            {section.description}
          </Typography>
        </Box>
        {actions}
      </Stack>
      {children}
    </Stack>
  );
}
