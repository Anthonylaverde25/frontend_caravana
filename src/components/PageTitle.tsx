import React, { ReactNode } from 'react';
import Typography from '@mui/material/Typography';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Chip, IconButton, Tooltip, Box, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useLocation, useNavigate } from 'react-router';
import clsx from 'clsx';

export type PageTitleProps = {
  className?: string;
  title?: string;
  subtitle?: string;
  backUrl?: string;
  showBackButton?: boolean;
  backTitle?: string;
  badgeTitle?: string | ReactNode;
};

/**
 * PageTitle Component
 *
 * Minimalist page title header with smart automatic back navigation.
 */
export function PageTitle(props: PageTitleProps) {
  const {
    className = '',
    title,
    subtitle,
    backUrl,
    showBackButton,
    backTitle,
    badgeTitle,
  } = props;

  const location = useLocation();
  const navigate = useNavigate();

  const segments = location.pathname.split('/').filter(Boolean);
  const isSubRoute = segments.length > 1;
  const parentPath = isSubRoute ? `/${segments.slice(0, segments.length - 1).join('/')}` : null;

  // Determine if back button should be visible (explicit backUrl OR automatic sub-route depth)
  const isBackVisible =
    showBackButton !== false &&
    (Boolean(backUrl) || (showBackButton === true && isSubRoute) || (showBackButton === undefined && Boolean(backUrl)));

  const handleBack = () => {
    if (backUrl) {
      navigate(backUrl);
    } else if (parentPath) {
      navigate(parentPath);
    } else {
      navigate(-1);
    }
  };

  return (
    <Stack direction="row" spacing={1.5} alignItems="center" className={clsx('min-w-0', className)}>
      {isBackVisible && (
        <Tooltip title={backTitle || 'Volver'} arrow>
          <IconButton
            onClick={handleBack}
            size="small"
            aria-label="Volver atrás"
            sx={{
              width: 34,
              height: 34,
              borderRadius: '8px',
              color: 'text.secondary',
              bgcolor: 'transparent',
              border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.7)}`,
              '&:hover': {
                bgcolor: 'action.hover',
                color: 'text.primary',
                borderColor: 'divider',
                transform: 'translateX(-1px)',
              },
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}
          >
            <FuseSvgIcon size={18}>heroicons-outline:arrow-left</FuseSvgIcon>
          </IconButton>
        </Tooltip>
      )}

      <Box sx={{ minWidth: 0 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          {title && (
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
                lineHeight: 1.25,
                color: 'text.primary',
              }}
              className="truncate"
            >
              {title}
            </Typography>
          )}

          {badgeTitle && badgeTitle !== '' && (
            <Chip
              label={badgeTitle}
              color="secondary"
              size="small"
              sx={{ fontWeight: 600, fontSize: '0.72rem', height: 22, borderRadius: '6px' }}
            />
          )}
        </Stack>

        {subtitle && (
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontSize: '0.82rem',
              mt: 0.25,
              lineHeight: 1.3,
            }}
            className="truncate"
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

export default PageTitle;
