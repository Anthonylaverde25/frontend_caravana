import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
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
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  alpha,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useBatches } from '@/features/batches/hooks/useBatches';
import ManagementSystemSelector from '@/ui/batches/components/create/ManagementSystemSelector';
import { useTransferPalette } from '@/ui/activities/components/transfer/transferPalette';

/** What the picker writes on the row: the batch name and its M letter (blank keeps the batch's own). */
export interface Dest01BatchPick {
  name: string;
  manejo: string;
}

interface Dest01BatchPickerDialogProps {
  open: boolean;
  /** The calf whose batch is being chosen. */
  caravana: string;
  /** What the row has now, to start from it. */
  currentName: string;
  currentManejo: string;
  /** Batch names already written on other rows of the sheet that are not existing batches. */
  sheetNewNames: { name: string; manejo: string }[];
  onClose: () => void;
  onPick: (pick: Dest01BatchPick) => void;
}

/** One row of the list: an active weaning batch or a new one already written on the sheet. */
interface BatchOption {
  key: string;
  name: string;
  manejo: string;
  isNew: boolean;
  detail: string;
}

const normalize = (name: string): string => name.trim().replace(/\s+/g, ' ').toLowerCase();

const letterOf = (isConfined: boolean | null | undefined): string =>
  isConfined === true ? 'C' : isConfined === false ? 'P' : '';

const managementLabel = (letter: string): string | null =>
  letter === 'C' ? 'Corral' : letter === 'P' ? 'Pastura' : null;

/**
 * The weaning batch of one calf: an active weaning batch, a new batch already written on another
 * row of this sheet, or a new one. It only writes the name and the M letter on the row; the batch
 * itself is resolved, as for any name read on the sheet, in "Lotes de destete por cría".
 *
 * Follows the app's dialog tokens (CreateBatchDialog / ConfigureDestinationBatchDialog): 8px paper,
 * header with icon tile and x-mark, filled inputs on action.hover, and a tinted action bar.
 */
export const Dest01BatchPickerDialog: React.FC<Dest01BatchPickerDialogProps> = ({
  open,
  caravana,
  currentName,
  currentManejo,
  sheetNewNames,
  onClose,
  onPick,
}) => {
  const palette = useTransferPalette();
  const { data: batches = [], isLoading } = useBatches(undefined, 'WEANING');
  const weaningBatches = useMemo(
    () => batches.filter((b) => b.is_active && b.batch_type_code === 'WEANING'),
    [batches]
  );

  const options = useMemo<BatchOption[]>(
    () => [
      ...weaningBatches.map((b) => ({
        key: `batch-${b.id}`,
        name: b.name,
        manejo: letterOf(b.is_confined),
        isNew: false,
        detail: [
          b.caravans_count != null ? `${b.caravans_count} animales` : null,
          managementLabel(letterOf(b.is_confined)),
          b.farm_name,
        ]
          .filter(Boolean)
          .join(' · '),
      })),
      ...sheetNewNames.map((n) => ({
        key: `sheet-${normalize(n.name)}`,
        name: n.name,
        manejo: n.manejo,
        isNew: true,
        detail: ['Se crea al confirmar la planilla', managementLabel(n.manejo)].filter(Boolean).join(' · '),
      })),
    ],
    [weaningBatches, sheetNewNames]
  );

  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  const [search, setSearch] = useState('');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newManejo, setNewManejo] = useState('');

  useEffect(() => {
    if (!open) return;
    const current = currentName.trim() !== '' ? options.find((o) => normalize(o.name) === normalize(currentName)) : undefined;
    setMode(currentName.trim() !== '' && !current ? 'new' : 'existing');
    setSearch('');
    setSelectedKey(current?.key ?? null);
    setNewName(current ? '' : currentName.trim());
    setNewManejo(current ? '' : currentManejo);
    // Only when it opens: the list loading later must not reset what the operator chose.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const query = normalize(search);
  const visibleOptions = options.filter((o) => !query || normalize(o.name).includes(query));
  const selected = options.find((o) => o.key === selectedKey) ?? null;

  // A "new" name that is already an active weaning batch is that batch: offered instead of a duplicate.
  const existingWithNewName = weaningBatches.find((b) => newName.trim() !== '' && normalize(b.name) === normalize(newName));
  const canSubmit =
    mode === 'existing' ? selected !== null : newName.trim() !== '' && newManejo !== '' && !existingWithNewName;

  const pick = (name: string, manejo: string) => {
    onPick({ name, manejo });
    onClose();
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    if (mode === 'existing' && selected) pick(selected.name, selected.manejo);
    if (mode === 'new') pick(newName.trim().replace(/\s+/g, ' '), newManejo);
  };

  const renderOption = (option: BatchOption) => {
    const isSelected = option.key === selectedKey;

    return (
      <ListItem key={option.key} disablePadding divider>
        <ListItemButton
          selected={isSelected}
          onClick={() => setSelectedKey(option.key)}
          onDoubleClick={() => pick(option.name, option.manejo)}
          sx={{
            py: 1,
            borderLeft: '3px solid',
            borderLeftColor: isSelected ? palette.sapEmerald : 'transparent',
            '&.Mui-selected, &.Mui-selected:hover': { bgcolor: palette.sapHighlight },
          }}
        >
          <ListItemText
            primary={option.name}
            primaryTypographyProps={{ variant: 'body2', fontWeight: 700 }}
            secondary={option.detail || undefined}
            secondaryTypographyProps={{ variant: 'caption' }}
          />
          {option.isNew && (
            <Chip
              size="small"
              label="Nuevo"
              sx={{
                mr: 1,
                height: 20,
                fontSize: '0.65rem',
                fontWeight: 700,
                borderRadius: '4px',
                bgcolor: alpha(palette.sapEmerald, 0.15),
                color: palette.sapEmerald,
              }}
            />
          )}
          <Box sx={{ width: 20, display: 'flex', color: palette.sapEmerald }}>
            {isSelected && <FuseSvgIcon size={20}>heroicons-solid:check-circle</FuseSvgIcon>}
          </Box>
        </ListItemButton>
      </ListItem>
    );
  };

  const existingOptions = visibleOptions.filter((o) => !o.isNew);
  const sheetOptions = visibleOptions.filter((o) => o.isNew);

  const groupLabel = (text: string) => (
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
        borderColor: palette.cardBorder,
      }}
    >
      {text}
    </Typography>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: '8px',
          boxShadow: 3,
          bgcolor: 'background.paper',
          m: { xs: 1.5, sm: 2 },
          height: 'min(640px, 90vh)',
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          px: { xs: 2, sm: 3 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: palette.cardBorder,
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
              flexShrink: 0,
            }}
          >
            <FuseSvgIcon size={20}>heroicons-outline:rectangle-stack</FuseSvgIcon>
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontSize: '1.05rem', fontWeight: 600, lineHeight: 1.25 }}>
              Lote de destete
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Cría{' '}
              <Box component="span" sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'text.primary' }}>
                {caravana.trim() || 'sin caravana'}
              </Box>{' '}
              · elegí un lote o creá uno nuevo
            </Typography>
          </Box>
        </Stack>
        <IconButton aria-label="close" onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent dividers sx={{ p: { xs: 2, sm: 3 }, borderColor: palette.cardBorder }}>
        <Stack spacing={2.5} sx={{ height: '100%' }}>
          <ToggleButtonGroup
            exclusive
            fullWidth
            size="small"
            value={mode}
            onChange={(_, value) => value && setMode(value)}
          >
            <ToggleButton value="existing" sx={{ textTransform: 'none', fontWeight: 700 }}>
              Lote existente
            </ToggleButton>
            <ToggleButton value="new" sx={{ textTransform: 'none', fontWeight: 700 }}>
              Crear lote nuevo
            </ToggleButton>
          </ToggleButtonGroup>

          {mode === 'existing' ? (
            <>
              <TextField
                autoFocus
                variant="filled"
                size="small"
                fullWidth
                hiddenLabel
                placeholder="Buscar lote por nombre"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ '& .MuiFilledInput-root': { bgcolor: 'action.hover', borderRadius: '6px' } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FuseSvgIcon size={18}>heroicons-outline:magnifying-glass</FuseSvgIcon>
                    </InputAdornment>
                  ),
                }}
              />

              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  overflowY: 'auto',
                  border: '1px solid',
                  borderColor: palette.cardBorder,
                  borderRadius: '6px',
                }}
              >
                {isLoading ? (
                  <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : visibleOptions.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                    {options.length === 0
                      ? 'No hay lotes de destete activos: creá uno nuevo.'
                      : 'Ningún lote coincide con la búsqueda.'}
                  </Typography>
                ) : (
                  <List dense disablePadding>
                    {existingOptions.length > 0 && groupLabel(`Lotes de destete activos (${existingOptions.length})`)}
                    {existingOptions.map(renderOption)}
                    {sheetOptions.length > 0 && groupLabel('Lotes nuevos de esta planilla')}
                    {sheetOptions.map(renderOption)}
                  </List>
                )}
              </Box>
            </>
          ) : (
            <>
              <TextField
                autoFocus
                label="Nombre del lote nuevo"
                placeholder="Ej: Destete Machos Otoño 2026"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                variant="filled"
                size="small"
                fullWidth
                required
                helperText="Se crea al confirmar la planilla."
                sx={{ '& .MuiFilledInput-root': { bgcolor: 'action.hover', borderRadius: '6px' } }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Chip
                        size="small"
                        label="Tipo: Destete"
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          borderRadius: '4px',
                          bgcolor: alpha(palette.sapEmerald, 0.15),
                          color: palette.sapEmerald,
                        }}
                      />
                    </InputAdornment>
                  ),
                }}
              />

              <ManagementSystemSelector
                value={newManejo === 'C' ? true : newManejo === 'P' ? false : null}
                onChange={(isConfined) => setNewManejo(isConfined ? 'C' : 'P')}
              />

              {existingWithNewName && (
                <Alert
                  severity="info"
                  sx={{ borderRadius: '6px' }}
                  action={
                    <Button
                      color="inherit"
                      size="small"
                      sx={{ textTransform: 'none', fontWeight: 700 }}
                      onClick={() => pick(existingWithNewName.name, letterOf(existingWithNewName.is_confined))}
                    >
                      Usar ese lote
                    </Button>
                  }
                >
                  Ya existe el lote de destete <strong>{existingWithNewName.name}</strong>: la cría va a ese lote.
                </Alert>
              )}
            </>
          )}
        </Stack>
      </DialogContent>

      {/* Actions */}
      <DialogActions
        sx={{
          p: 2,
          px: { xs: 2, sm: 3 },
          bgcolor: palette.softBg,
          borderTop: '1px solid',
          borderColor: palette.cardBorder,
        }}
      >
        <Button onClick={onClose} sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!canSubmit}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: '6px',
            px: 3,
            bgcolor: palette.sapGreen,
            color: '#ffffff',
            '&:hover': { bgcolor: palette.sapGreenHover },
            // The app theme forces the colour of contained buttons, so disabled must show by itself.
            '&.Mui-disabled': { opacity: 0.4 },
          }}
        >
          {mode === 'new' ? 'Crear y asignar' : 'Asignar lote'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Dest01BatchPickerDialog;
