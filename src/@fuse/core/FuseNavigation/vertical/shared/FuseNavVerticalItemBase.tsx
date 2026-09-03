import NavLinkAdapter from "@fuse/core/NavLinkAdapter";
import clsx from "clsx";
import { useMemo, ReactNode, useState, useEffect } from "react";
import {
  Button,
  Collapse,
  IconButton,
  SxProps,
  Typography,
  TypographyProps,
  Tooltip,
  Divider,
} from "@mui/material";
import FuseNavBadge from "../../FuseNavBadge";
import FuseSvgIcon from "../../../FuseSvgIcon";
import { FuseNavItemType } from "../../types/FuseNavItemType";
import isUrlInChildren from "../../isUrlInChildren";
import usePathname from "@fuse/hooks/usePathname";
import Link from "@fuse/core/Link";
import { useNavbarContext } from "@/components/theme-layouts/components/navbar/contexts/NavbarContext/useNavbarContext";
import useThemeMediaQuery from "@fuse/hooks/useThemeMediaQuery";

export type FuseNavVerticalBaseProps = {
  item: FuseNavItemType;
  nestedLevel?: number;
  onItemClick?: (item: FuseNavItemType) => void;
  className?: string;
  component?: React.ElementType;
  children?: ReactNode;
  showIcon?: boolean;
  primaryTitleProps?: TypographyProps;
  subtitleProps?: TypographyProps;
  sx?: SxProps;
  checkPermission?: boolean;
  dense?: boolean;
};

function needsToBeOpened(pathname: string, item: FuseNavItemType) {
  return pathname && isUrlInChildren(item, pathname);
}

/**
 * FuseNavVerticalItemBase is a shared base component for all vertical navigation items
 */
function FuseNavVerticalItemBase(props: FuseNavVerticalBaseProps) {
  const {
    item,
    nestedLevel = 0,
    onItemClick,
    className,
    component,
    showIcon = true,
    primaryTitleProps = {},
    subtitleProps = {},
    sx,
    checkPermission,
    dense = false,
  } = props;

  const pathname = usePathname();

  const isGroup = useMemo(() => item.type === "group", [item.type]);
  const isCollapsable = useMemo(() => item.type === "collapse", [item.type]);

  const buttonComponent = useMemo(() => {
    if (component) {
      return component;
    }

    if (item.url) {
      if (
        item.url.startsWith("http") ||
        item.url.startsWith("mailto") ||
        item.url.startsWith("https")
      ) {
        return Link;
      }

      return NavLinkAdapter;
    }

    return "div";
  }, [component, item.url]);
  const [open, setOpen] = useState(() => needsToBeOpened(pathname, item));

  useEffect(() => {
    if (isCollapsable && item.url) {
      setOpen((prev) => prev || needsToBeOpened(pathname, item));
    }
  }, [pathname, item, isCollapsable]);

  const itemProps = useMemo(
    () => ({
      ...(buttonComponent === NavLinkAdapter && {
        disabled: item.disabled,
        to: item.url || "",
        end: item.end,
        role: "button",
        exact: item?.exact,
      }),
      ...(buttonComponent === Link && {
        disabled: item.disabled,
        to: item.url,
        role: "button",
        target: item.target ? item.target : "_blank",
        exact: item?.exact,
      }),
    }),
    [item, buttonComponent],
  );

  const { isOpen, openNavbar } = useNavbarContext();
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down("lg"));
  const isContracted = !isOpen && !isMobile;

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();

    const hasChildren =
      isCollapsable || Boolean(item.children && item.children.length > 0);

    if (isContracted && hasChildren) {
      openNavbar();
      setOpen(true);
    } else if (isCollapsable) {
      setOpen((prev) => !prev);
    }

    if (onItemClick) {
      onItemClick(item);
    }
  }

  if (checkPermission && !item?.hasPermission) {
    return null;
  }

  if (isGroup && isContracted) {
    return (
      <>
        <Divider className="my-2 mx-auto w-8 opacity-40" />
        {item?.children?.map((_item) => (
          <FuseNavVerticalItemBase
            key={_item.id}
            item={_item}
            nestedLevel={0}
            onItemClick={onItemClick}
            checkPermission={checkPermission}
          />
        ))}
      </>
    );
  }

  return (
    <>
      <Tooltip
        title={item.title || ""}
        placement="right"
        arrow
        disableHoverListener={!isContracted || isGroup || !item.title}
      >
        <Button
          component={buttonComponent}
          className={clsx(
            "mb-1 flex w-full items-center rounded-md p-2",
            isContracted ? "justify-center" : "justify-start gap-2",
            item.active && "active",
            !isContracted && item.subtitle && "items-start",
            className,
            isGroup && "my-4",
            dense && "p-1",
          )}
          sx={{
            ...sx,
            ...(isContracted && {
              width: "44px !important",
              minWidth: "44px !important",
              maxWidth: "44px !important",
              height: "44px !important",
              minHeight: "44px !important",
              padding: "0 !important",
              margin: "4px auto !important",
              justifyContent: "center !important",
              alignItems: "center !important",
            }),
            "&.active": {
              backgroundColor: (theme) =>
                theme.palette.mode === "light"
                  ? "rgba(0, 0, 0, .05)!important"
                  : "rgba(255, 255, 255, .1)!important",
            },
          }}
          color="inherit"
          onClick={handleClick}
          aria-label={item.title}
          aria-expanded={open}
          {...itemProps}
        >
          {!isGroup && showIcon && item.icon && (
            <FuseSvgIcon
              className={clsx(
                "fuse-list-item-icon",
                "shrink-0",
                item.iconClass,
              )}
            >
              {item.icon}
            </FuseSvgIcon>
          )}

          {!isContracted && (
            <>
              <div className="flex min-w-0 flex-auto flex-col items-start gap-1">
                {item.title && (
                  <Typography
                    {...{
                      ...primaryTitleProps,
                      className: clsx(
                        "fuse-list-item-title",
                        "leading-none truncate max-w-full",
                        isGroup && "font-medium",
                        primaryTitleProps?.className,
                      ),
                      ...(isGroup && {
                        color: "secondary",
                      }),
                    }}
                  >
                    {item.title}
                  </Typography>
                )}
                {item.subtitle && (
                  <Typography
                    {...{
                      color: "text.secondary",
                      ...subtitleProps,
                      className: clsx(
                        "fuse-list-item-subtitle",
                        "text-sm leading-none truncate max-w-full",
                        subtitleProps?.className,
                      ),
                    }}
                  >
                    {item.subtitle}
                  </Typography>
                )}
              </div>
              {item.badge && <FuseNavBadge badge={item.badge} />}

              {isCollapsable && (
                <IconButton
                  disableRipple
                  className="h-5 w-5 p-0 hover:bg-transparent focus:bg-transparent"
                  onClick={(ev) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    setOpen(!open);
                  }}
                >
                  <FuseSvgIcon size={13} className="arrow-icon" color="inherit">
                    {open ? "lucide:chevron-down" : "lucide:chevron-right"}
                  </FuseSvgIcon>
                </IconButton>
              )}
            </>
          )}
        </Button>
      </Tooltip>

      {isCollapsable && (
        <Collapse
          in={open}
          className="collapse-children"
          sx={{
            ...(nestedLevel < 4 && {
              paddingLeft: "16px",
              "& > .MuiCollapse-wrapper": {
                borderLeft: "1px solid",
                borderColor: "divider",
                "& > .MuiCollapse-wrapperInner": {
                  paddingLeft: "8px",
                },
              },
            }),
          }}
        >
          {item?.children?.map((_item) => (
            <FuseNavVerticalItemBase
              key={_item.id}
              item={_item}
              nestedLevel={isGroup ? nestedLevel : nestedLevel + 1}
              onItemClick={onItemClick}
              checkPermission={checkPermission}
            />
          ))}
        </Collapse>
      )}

      {isGroup &&
        item?.children?.map((_item) => (
          <FuseNavVerticalItemBase
            key={_item.id}
            item={_item}
            nestedLevel={isGroup ? nestedLevel : nestedLevel + 1}
            onItemClick={onItemClick}
            checkPermission={checkPermission}
          />
        ))}
    </>
  );
}

export default FuseNavVerticalItemBase;
