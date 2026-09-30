import React, { useState } from 'react';
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

export interface TransferOrderMenuItem {
  label: string;
  icon: string;
  onClick: () => void;
  /** Destructive actions (discard, cancel, close) are painted as such. */
  danger?: boolean;
  disabled?: boolean;
}

/**
 * "⋯ Más acciones": everything that is not the next step of the order. Keeps the header to at
 * most one secondary button and one primary.
 */
export const TransferOrderMoreMenu: React.FC<{ items: TransferOrderMenuItem[] }> = ({ items }) => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  if (items.length === 0) return null;

  return (
    <>
      <Tooltip title="Más acciones">
        <IconButton
          onClick={(e) => setAnchor(e.currentTarget)}
          sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '6px', width: 36, height: 36 }}
        >
          <FuseSvgIcon size={18}>heroicons-outline:ellipsis-horizontal</FuseSvgIcon>
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchor}
        open={anchor !== null}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { borderRadius: '8px', mt: 0.5, minWidth: 230 } }}
      >
        {items.map((item) => (
          <MenuItem
            key={item.label}
            disabled={item.disabled}
            onClick={() => {
              setAnchor(null);
              item.onClick();
            }}
            sx={{ color: item.danger ? 'error.main' : undefined }}
          >
            <ListItemIcon sx={{ color: item.danger ? 'error.main' : undefined }}>
              <FuseSvgIcon size={18}>{item.icon}</FuseSvgIcon>
            </ListItemIcon>
            <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 500 }} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default TransferOrderMoreMenu;
