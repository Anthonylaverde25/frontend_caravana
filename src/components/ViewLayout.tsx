import React, { ReactNode } from 'react';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';
import clsx from 'clsx';
import ViewHeader from './ViewHeader';
import type { BreadcrumbItem } from './PageBreadcrumb';

const Root = styled(FusePageSimple)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.palette.divider,
    '& > .container': {
      maxWidth: 'none !important',
      width: '100% !important',
      padding: '0 !important',
      margin: '0 !important',
    },
  },
  '& .FusePageSimple-content': {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto',
    padding: 0,
    backgroundColor: theme.palette.background.default,
    '& > .container': {
      maxWidth: 'none !important',
      width: '100% !important',
      padding: '0 !important',
      margin: '0 !important',
      display: 'flex',
      flexDirection: 'column',
      flex: '1 1 auto',
    },
  },
  '&.FusePageSimple-scroll-content .FusePageSimple-content': {
    height: '100%',
    minHeight: 0,
    overflow: 'hidden',
    '& > .container': {
      height: '100%',
      minHeight: 0,
    },
  },
}));

interface ViewLayoutProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  backUrl?: string;
  showBackButton?: boolean;
  backTitle?: string;
  scroll?: 'page' | 'content';
  showHeader?: boolean;
  /** The trail when the path alone does not tell it (a tab in the query). */
  breadcrumbs?: BreadcrumbItem[];
  subHeader?: ReactNode;
}

/**
 * ViewLayout Component
 * A clean, minimalist layout wrapper for consistent full-width views with a standardized header.
 */
export function ViewLayout({
  title = '',
  subtitle,
  actions,
  children,
  className = 'p-4 sm:p-6',
  headerClassName = '',
  backUrl,
  showBackButton,
  backTitle,
  scroll = 'page',
  showHeader = true,
  breadcrumbs,
  subHeader,
}: ViewLayoutProps) {
  return (
    <Root
      scroll={scroll}
      header={
        showHeader ? (
          <ViewHeader
            title={title}
            subtitle={subtitle}
            actions={actions}
            className={headerClassName}
            backUrl={backUrl}
            showBackButton={showBackButton}
            backTitle={backTitle}
            breadcrumbs={breadcrumbs}
            subHeader={subHeader}
          />
        ) : undefined
      }
      content={<Box className={clsx('flex flex-col flex-1 min-h-0', className)}>{children}</Box>}
    />
  );
}

export default ViewLayout;
