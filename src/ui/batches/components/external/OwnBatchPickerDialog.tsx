import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
  alpha
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { Batch } from '@/core/batches/domain/entities/Batch';
import { useTransferPalette } from '@/ui/activities/components/transfer/transferPalette';

interface OwnBatchPickerDialogProps {
  open: boolean;
  /** Own active batches, the only valid destinations. */
  batches: Batch[];
  selectedId: number | '';
  /** How many caravans are about to go, for the subtitle. */
  caravanCount: number;
  onClose: () => void;
  onPick: (batch: Batch) => void;
  /** "Crear lote nuevo": the quick-create dialog takes over. */
  onCreate: () => void;
}

const normalize = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

const managementOf = (batch: Batch): string | null => (batch.is_confined === true ? 'Corral' : batch.is_confined === false ? 'Pastura' : null);

/**
 * The own batch that receives the external caravans. Each batch shows what decides the choice —
 * its type, its management system, how many animals it has and its farm — grouped by activity,
 * since moving animals declares the activity they go to. A batch that does not exist yet is
 * created from here ("Crear lote nuevo").
 *
 * Follows the app's dialog tokens (Dest01BatchPickerDialog): 8px paper, header with icon tile and
 * x-mark, filled search on action.hover, and a tinted action bar.
 */
export const OwnBatchPickerDialog: React.FC<OwnBatchPickerDialogProps> = ({ open, batches, selectedId, caravanCount, onClose, onPick, onCreate }) => {
  const palette = useTransferPalette();
  const [search, setSearch] = useState('');
  const [pickedId, setPickedId] = useState<number | ''>(selectedId);
  const [showMissing, setShowMissing] = useState(false);

  useEffect(() => {
    if (open) {
      setSearch('');
      setPickedId(selectedId);
      setShowMissing(false);
    }
  }, [open, selectedId]);

  const groups = useMemo(() => {
    const term = normalize(search.trim());
    const visible = batches.filter(
      (b) => !term || [b.name, b.activity_name, b.batch_type_name, b.farm_name].some((value) => value && normalize(value).includes(term))
    );
    const byActivity = new Map<string, Batch[]>();

    visible.forEach((b) => {
      const key = b.activity_name ?? 'Sin actividad';

      byActivity.set(key, [...(byActivity.get(key) ?? []), b]);
    });

    return [...byActivity.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [batches, search]);

  const picked = batches.find((b) => b.id === pickedId);

  // Told on click, not by a disabled button: the theme paints a disabled button like an active one.
  const submit = () => {
    if (picked) onPick(picked);
    else setShowMissing(true);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      scroll="paper"
      PaperProps={{ sx: { borderRadius: '8px', boxShadow: 3, bgcolor: 'background.paper', m: { xs: 1.5, sm: 2 }, height: 'min(640px, 90vh)' } }}
    >
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          px: { xs: 2, sm: 3 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: palette.cardBorder
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(palette.sapEmerald, palette.isDark ? 0.2 : 0.1),
              color: palette.sapEmerald,
              flexShrink: 0
            }}
          >
            <FuseSvgIcon size={20}>heroicons-outline:rectangle-stack</FuseSvgIcon>
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontSize: '1.05rem', fontWeight: 600, lineHeight: 1.25 }}>
              Lote propio destino
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {caravanCount === 1 ? '1 caravana' : `${caravanCount} caravanas`} · elegí un lote o creá uno nuevo
            </Typography>
          </Box>
        </Stack>
        <IconButton aria-label="close" onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: { xs: 2, sm: 3 }, borderColor: palette.cardBorder }}>
        <Stack spacing={2} sx={{ height: '100%' }}>
          <TextField
            autoFocus
            variant="filled"
            size="small"
            fullWidth
            hiddenLabel
            placeholder="Buscar por lote, actividad, tipo o finca"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ '& .MuiFilledInput-root': { bgcolor: 'action.hover', borderRadius: '6px' } }}
            InputProps={{
              disableUnderline: true,
              startAdornment: (
                <InputAdornment position="start">
                  <FuseSvgIcon size={18}>heroicons-outline:magnifying-glass</FuseSvgIcon>
                </InputAdornment>
              )
            }}
          />

          <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', border: '1px solid', borderColor: palette.cardBorder, borderRadius: '6px' }}>
            {groups.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                {batches.length === 0 ? 'No hay lotes propios activos: creá uno nuevo.' : 'Ningún lote coincide con la búsqueda.'}
              </Typography>
            ) : (
              <List dense disablePadding>
                {groups.map(([activity, items]) => (
                  <React.Fragment key={activity}>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        px: 2,
                        py: 0.75,
                        fontWeight: 700,
                        letterSpacing: 0.5,
                        textTransform: 'uppercase',
                        color: 'text.secondary',
                        bgcolor: palette.softBg,
                        borderBottom: '1px solid',
                        borderColor: palette.cardBorder
                      }}
                    >
                      {activity} ({items.length})
                    </Typography>
                    {items.map((b) => {
                      const isSelected = b.id === pickedId;

                      return (
                        <ListItem key={b.id} disablePadding sx={{ borderBottom: '1px solid', borderColor: palette.cardBorder }}>
                          <ListItemButton
                            selected={isSelected}
                            onClick={() => setPickedId(b.id)}
                            onDoubleClick={() => onPick(b)}
                            sx={{ py: 1, '&.Mui-selected': { bgcolor: alpha(palette.sapEmerald, 0.08) } }}
                          >
                            <ListItemText
                              primary={b.name}
                              primaryTypographyProps={{ fontWeight: 700, fontSize: '0.85rem' }}
                              secondary={[b.batch_type_name, managementOf(b), b.caravans_count != null ? `${b.caravans_count} animales` : null, b.farm_name]
                                .filter(Boolean)
                                .join(' · ')}
                              secondaryTypographyProps={{ fontSize: '0.72rem' }}
                            />
                            <Box sx={{ width: 20, display: 'flex', color: palette.sapEmerald }}>
                              {isSelected && <FuseSvgIcon size={20}>heroicons-solid:check-circle</FuseSvgIcon>}
                            </Box>
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Box>
          {showMissing && !picked && (
            <Typography variant="caption" color="error" sx={{ fontWeight: 600 }}>
              Elegí un lote de la lista, o creá uno nuevo.
            </Typography>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, px: { xs: 2, sm: 3 }, bgcolor: palette.softBg, borderTop: '1px solid', borderColor: palette.cardBorder }}>
        <Button
          onClick={onCreate}
          startIcon={<FuseSvgIcon size={16}>heroicons-outline:folder-plus</FuseSvgIcon>}
          sx={{ textTransform: 'none', fontWeight: 600, mr: 'auto' }}
        >
          Crear lote nuevo
        </Button>
        <Button onClick={onClose} sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disableElevation
          onClick={submit}
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '6px', px: 3 }}
        >
          Elegir lote
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OwnBatchPickerDialog;
