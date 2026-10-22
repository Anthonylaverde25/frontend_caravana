import React, { ReactNode } from 'react';
import { Box, Stack } from '@mui/material';
import PageBreadcrumb, { BreadcrumbItem } from './PageBreadcrumb';
import PageTitle from './PageTitle';
import clsx from 'clsx';

export type ViewHeaderProps = {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  showBreadcrumb?: boolean;
  backUrl?: string;
  showBackButton?: boolean;
  backTitle?: string;
  className?: string;
  /** The trail when the path alone does not tell it (a tab in the query). */
  breadcrumbs?: BreadcrumbItem[];
  subHeader?: ReactNode;
};

/**
 * ViewHeader Component
 * Standardized, clean minimalist header without encasing box borders.
 */
export function ViewHeader(props: ViewHeaderProps) {
  const {
    title,
    subtitle,
    actions,
    showBreadcrumb = true,
    backUrl,
    showBackButton,
    backTitle,
    className = '',
    breadcrumbs,
    subHeader,
  } = props;

  return (
    <Box
      component="header"
      className={clsx('flex flex-col w-full', className)}
      sx={{
        pt: { xs: 2, sm: 2.5 },
        pb: subHeader ? 0 : { xs: 2, sm: 2.5 },
        px: { xs: 2.5, sm: 3.5 },
      }}
    >
      {showBreadcrumb && (
        <Box sx={{ mb: 1.25 }}>
          <PageBreadcrumb items={breadcrumbs} />
        </Box>
      )}

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        className="w-full"
      >
        <PageTitle
          title={title}
          subtitle={subtitle}
          backUrl={backUrl}
          showBackButton={showBackButton}
          backTitle={backTitle}
        />

        {actions && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
            {actions}
          </Box>
        )}
      </Stack>

      {subHeader && (
        <Box sx={{ mt: 1.5, width: '100%' }}>
          {subHeader}
        </Box>
      )}
    </Box>
  );
}

export default ViewHeader;
