import React, { ReactNode } from 'react';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';
import ViewHeader from './ViewHeader';

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
}));

interface ViewLayoutProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  backUrl?: string;
  showBackButton?: boolean;
  backTitle?: string;
}

/**
 * ViewLayout Component
 * A clean, minimalist layout wrapper for consistent full-width views with a standardized header.
 */
export function ViewLayout({
  title,
  subtitle,
  actions,
  children,
  className = 'p-4 sm:p-6',
  headerClassName = '',
  backUrl,
  showBackButton,
  backTitle,
}: ViewLayoutProps) {
  return (
    <Root
      header={
        <ViewHeader
          title={title}
          subtitle={subtitle}
          actions={actions}
          className={headerClassName}
          backUrl={backUrl}
          showBackButton={showBackButton}
          backTitle={backTitle}
        />
      }
      content={<Box className={className}>{children}</Box>}
    />
  );
}

export default ViewLayout;
