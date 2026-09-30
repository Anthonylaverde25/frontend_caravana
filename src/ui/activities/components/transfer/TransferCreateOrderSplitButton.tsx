import React, { useRef, useState } from 'react';
import { Button, ButtonGroup, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

interface TransferCreateOrderSplitButtonProps {
  onSaveDraft: () => void;
  onCreateIssued: () => void;
  /** Why the order cannot be created yet; null when it can. */
  blockedReason: string | null;
  isBusy: boolean;
}

const buttonSx = { fontWeight: 600, textTransform: 'none', borderRadius: '6px' } as const;

/**
 * "Guardar borrador | ▾ Crear y emitir orden": one control, two ways for the order to be born.
 *
 * The draft is the default because it is the one that commits nothing: it can be previewed,
 * changed and issued later. Issuing straight away is one click further, on purpose.
 */
export const TransferCreateOrderSplitButton: React.FC<TransferCreateOrderSplitButtonProps> = ({
  onSaveDraft,
  onCreateIssued,
  blockedReason,
  isBusy
}) => {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const disabled = blockedReason !== null || isBusy;

  return (
    <>
      <Tooltip title={blockedReason ?? 'Guarda la orden sin emitirla: no compromete animales y se puede seguir editando'}>
        <ButtonGroup ref={anchorRef} variant="outlined" color="inherit" disabled={disabled} sx={{ borderRadius: '6px' }}>
          <Button
            onClick={onSaveDraft}
            startIcon={<FuseSvgIcon size={18}>heroicons-outline:document-plus</FuseSvgIcon>}
            sx={{ ...buttonSx, px: 2 }}
          >
            Guardar borrador
          </Button>
          <Button
            size="small"
            aria-label="Más formas de crear la orden"
            onClick={() => setOpen(true)}
            sx={{ ...buttonSx, px: 0.5, minWidth: 34 }}
          >
            <FuseSvgIcon size={16}>heroicons-outline:chevron-down</FuseSvgIcon>
          </Button>
        </ButtonGroup>
      </Tooltip>
      <Menu
        anchorEl={anchorRef.current}
        open={open}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { borderRadius: '8px', mt: 0.5 } }}
      >
        <MenuItem
          onClick={() => {
            setOpen(false);
            onCreateIssued();
          }}
        >
          <ListItemIcon>
            <FuseSvgIcon size={18}>heroicons-outline:clipboard-document-check</FuseSvgIcon>
          </ListItemIcon>
          <ListItemText
            primary="Crear y emitir orden"
            secondary="Compromete los animales ya; se puede imprimir y ejecutar"
            primaryTypographyProps={{ fontWeight: 600, fontSize: '0.85rem' }}
            secondaryTypographyProps={{ fontSize: '0.72rem' }}
          />
        </MenuItem>
      </Menu>
    </>
  );
};

export default TransferCreateOrderSplitButton;
