import { Box, Typography, Divider, Stack, Button, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import {
  SETTINGS_NAVIGATION_GROUPS,
  SettingsSectionId,
} from '../../config/settingsNavigation';
import SettingsNavItem from './SettingsNavItem';

interface SettingsNavProps {
  activeSection: SettingsSectionId;
  onSelectSection: (id: SettingsSectionId) => void;
  badges?: Partial<Record<SettingsSectionId, React.ReactNode>>;
}

export default function SettingsNav({
  activeSection,
  onSelectSection,
  badges = {},
}: SettingsNavProps) {
  // Mobile dropdown state
  const [mobileAnchorEl, setMobileAnchorEl] = useState<null | HTMLElement>(null);
  const isMobileMenuOpen = Boolean(mobileAnchorEl);

  const allItems = SETTINGS_NAVIGATION_GROUPS.flatMap((g) => g.items);
  const activeItem = allItems.find((item) => item.id === activeSection) || allItems[0];

  const handleMobileSelect = (id: SettingsSectionId) => {
    onSelectSection(id);
    setMobileAnchorEl(null);
  };

  return (
    <Box
      component="nav"
      aria-label="Navegación de configuración"
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ─── Mobile Selector (< md) ─── */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, p: 2, borderBottom: '1px solid #e2e8f0' }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={(e) => setMobileAnchorEl(e.currentTarget)}
          startIcon={<FuseSvgIcon size={18} sx={{ color: 'primary.main' }}>{activeItem.icon}</FuseSvgIcon>}
          endIcon={<FuseSvgIcon size={16} sx={{ color: 'text.secondary' }}>heroicons-outline:chevron-down</FuseSvgIcon>}
          sx={{
            justifyContent: 'space-between',
            textAlign: 'left',
            py: 1,
            px: 1.5,
            borderRadius: '6px',
            borderColor: '#cbd5e1',
            color: '#1e293b',
            fontWeight: 600,
            textTransform: 'none',
            bgcolor: '#ffffff',
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              {activeItem.title}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>
              {activeItem.subtitle}
            </Typography>
          </Box>
        </Button>

        <Menu
          anchorEl={mobileAnchorEl}
          open={isMobileMenuOpen}
          onClose={() => setMobileAnchorEl(null)}
          PaperProps={{
            sx: {
              width: 'min(90vw, 340px)',
              maxHeight: '70vh',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              p: 0.5,
            },
          }}
        >
          {SETTINGS_NAVIGATION_GROUPS.map((group, groupIdx) => (
            <Box key={group.groupId}>
              {groupIdx > 0 && <Divider sx={{ my: 0.75, borderColor: '#f1f5f9' }} />}
              <Typography
                variant="overline"
                sx={{
                  px: 1.5,
                  pt: 0.5,
                  color: '#94a3b8',
                  fontWeight: 700,
                  fontSize: '0.65rem',
                  letterSpacing: '0.05em',
                  display: 'block',
                }}
              >
                {group.groupTitle}
              </Typography>
              {group.items.map((item) => (
                <MenuItem
                  key={item.id}
                  selected={item.id === activeSection}
                  onClick={() => handleMobileSelect(item.id)}
                  sx={{
                    borderRadius: '4px',
                    py: 0.85,
                    px: 1.5,
                    gap: 1.25,
                    '&.Mui-selected': {
                      bgcolor: '#f1f5f9',
                      fontWeight: 600,
                    },
                  }}
                >
                  <FuseSvgIcon
                    size={16}
                    sx={{ color: item.id === activeSection ? 'primary.main' : '#64748b' }}
                  >
                    {item.icon}
                  </FuseSvgIcon>
                  <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: item.id === activeSection ? 600 : 500 }}>
                    {item.title}
                  </Typography>
                </MenuItem>
              ))}
            </Box>
          ))}
        </Menu>
      </Box>

      {/* ─── Desktop Aside Navigation (>= md) ─── */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          height: '100%',
          py: 2.5,
          px: 1.5,
        }}
      >
        <Stack spacing={2.5} sx={{ flex: 1 }}>
          {SETTINGS_NAVIGATION_GROUPS.map((group, groupIdx) => (
            <Box key={group.groupId}>
              {groupIdx > 0 && <Divider sx={{ mb: 2, borderColor: '#f1f5f9' }} />}
              <Typography
                variant="overline"
                sx={{
                  px: 1,
                  mb: 0.75,
                  display: 'block',
                  color: '#64748b',
                  fontWeight: 700,
                  fontSize: '0.68rem',
                  letterSpacing: '0.06em',
                  lineHeight: 1.2,
                }}
              >
                {group.groupTitle}
              </Typography>

              <Stack spacing={0.25}>
                {group.items.map((item) => (
                  <SettingsNavItem
                    key={item.id}
                    item={item}
                    isActive={item.id === activeSection}
                    onSelect={onSelectSection}
                    badgeContent={badges[item.id]}
                  />
                ))}
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
