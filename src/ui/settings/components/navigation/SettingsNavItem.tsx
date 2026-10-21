import { Box, Typography, Stack } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { SettingsNavItemConfig } from '../../config/settingsNavigation';

interface SettingsNavItemProps {
  item: SettingsNavItemConfig;
  isActive: boolean;
  onSelect: (id: SettingsNavItemConfig['id']) => void;
  badgeContent?: React.ReactNode;
}

export default function SettingsNavItem({
  item,
  isActive,
  onSelect,
  badgeContent,
}: SettingsNavItemProps) {
  return (
    <Box
      component="button"
      type="button"
      onClick={() => onSelect(item.id)}
      sx={{
        width: '100%',
        textAlign: 'left',
        py: 1,
        px: 1.5,
        borderRadius: '6px',
        border: 'none',
        bgcolor: isActive ? '#f1f5f9' : 'transparent',
        borderLeft: '3px solid',
        borderLeftColor: isActive ? 'primary.main' : 'transparent',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1.25,
        transition: 'background-color 0.15s ease',
        '&:hover': {
          bgcolor: isActive ? '#f1f5f9' : '#f8fafc',
        },
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: 'primary.main',
        },
      }}
    >
      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
        <FuseSvgIcon
          size={18}
          sx={{
            color: isActive ? 'primary.main' : '#64748b',
            flexShrink: 0,
          }}
        >
          {item.icon}
        </FuseSvgIcon>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: isActive ? 600 : 500,
              color: isActive ? '#0f172a' : '#334155',
              fontSize: '0.84rem',
              lineHeight: 1.25,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {item.title}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              color: '#64748b',
              fontSize: '0.72rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              mt: 0.25,
            }}
          >
            {item.subtitle}
          </Typography>
        </Box>
      </Stack>

      {badgeContent && (
        <Box
          sx={{
            flexShrink: 0,
            fontSize: '0.7rem',
            fontWeight: 600,
            fontVariantNumeric: 'tabular-nums',
            color: isActive ? '#0f172a' : '#64748b',
            bgcolor: isActive ? '#ffffff' : '#f8fafc',
            border: '1px solid',
            borderColor: isActive ? '#cbd5e1' : '#e2e8f0',
            borderRadius: '4px',
            px: 0.75,
            py: 0.15,
            lineHeight: 1.4,
          }}
        >
          {badgeContent}
        </Box>
      )}
    </Box>
  );
}
