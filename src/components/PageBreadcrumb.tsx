'use client';

import React from 'react';
import Breadcrumbs, { BreadcrumbsProps } from '@mui/material/Breadcrumbs';
import { FuseNavItemType } from '@fuse/core/FuseNavigation/types/FuseNavItemType';
import usePathname from '@fuse/hooks/usePathname';
import Typography from '@mui/material/Typography';
import Link from '@fuse/core/Link';
import clsx from 'clsx';
import useNavigationItems from './theme-layouts/components/navigation/hooks/useNavigationItems';

type PageBreadcrumbProps = BreadcrumbsProps & {
  className?: string;
  skipHome?: boolean;
};

// Function to get the navigation item based on URL
function getNavigationItem(url: string, navigationItems: FuseNavItemType[]): FuseNavItemType | null {
  for (const item of navigationItems) {
    if (item.url === url) {
      return item;
    }

    if (item.children) {
      const childItem = getNavigationItem(url, item.children);
      if (childItem) {
        return childItem;
      }
    }
  }
  return null;
}

export function PageBreadcrumb(props: PageBreadcrumbProps) {
  const {
    className,
    skipHome = false,
    maxItems = 4,
    ...rest
  } = props;

  const pathname = usePathname();
  const { data: navigation = [] } = useNavigationItems();

  const crumbs = pathname
    .split('/')
    .filter(Boolean)
    .reduce(
      (acc: { title: string; url: string }[], part, index, array) => {
        const url = `/${array.slice(0, index + 1).join('/')}`;
        const navItem = getNavigationItem(url, navigation);
        const title = navItem?.title || part.replace(/-/g, ' ');

        acc.push({ title, url });
        return acc;
      },
      skipHome ? [] : [{ title: 'Inicio', url: '/' }]
    );

  return (
    <Breadcrumbs
      classes={{ ol: 'list-none m-0 p-0 flex items-center' }}
      className={clsx('flex items-center w-fit', className)}
      aria-label="breadcrumb"
      maxItems={maxItems}
      separator={
        <Typography sx={{ color: 'text.disabled', fontSize: '0.75rem', mx: 0.25, userSelect: 'none' }}>
          /
        </Typography>
      }
      {...rest}
    >
      {crumbs.map((item, index) => {
        const isLast = index === crumbs.length - 1;

        if (isLast) {
          return (
            <Typography
              key={index}
              variant="caption"
              sx={{
                fontSize: '0.76rem',
                fontWeight: 600,
                color: 'text.primary',
                textTransform: 'capitalize',
                display: 'block',
                maxWidth: 160,
              }}
              className="truncate"
            >
              {item.title}
            </Typography>
          );
        }

        return (
          <Typography
            component={Link}
            to={item.url}
            key={index}
            variant="caption"
            sx={{
              fontSize: '0.76rem',
              fontWeight: 500,
              color: 'text.secondary',
              textTransform: 'capitalize',
              textDecoration: 'none',
              display: 'block',
              maxWidth: 140,
              '&:hover': {
                color: 'primary.main',
                textDecoration: 'underline',
              },
              transition: 'color 0.15s ease',
            }}
            className="truncate"
          >
            {item.title}
          </Typography>
        );
      })}
    </Breadcrumbs>
  );
}

export default PageBreadcrumb;
