import { useState } from 'react';
import { Alert, Box, Button, CircularProgress, IconButton, Radio, Stack, Switch, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import SheetGrid from '@/components/sheet-grid/SheetGrid';
import SheetGridTagCell from '@/components/sheet-grid/SheetGridTagCell';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import { useCompanyActivitiesDraft } from '@/ui/activities/components/useCompanyActivitiesDraft';
import SettingsSection from '../SettingsSection';

/** The company's activity flow as a grid: use, order, start and end of each activity, then Save. */
export default function ActivitiesWorkflowSection() {
  const { items, pipeline, isLoading, isPending, toggle, setInitial, setFinal, move, save } = useCompanyActivitiesDraft();
  const { headSx, indexSx, textCellSx, zebraBg } = useGridCellStyles();
  const [missing, setMissing] = useState(false);

  // Validated on click: the company needs at least one activity.
  const handleSave = () => {
    if (pipeline.length === 0) {
      setMissing(true);
      return;
    }

    setMissing(false);
    save();
  };

  return (
    <SettingsSection id="activities">
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <>
          <Typography variant="body2">
            Flujo resultante:{' '}
            <Box component="strong">{pipeline.length > 0 ? pipeline.map((a) => a.name).join(' → ') : '—'}</Box>
          </Typography>

          <SheetGrid minWidth={760}>
            <TableHead>
              <TableRow>
                <TableCell sx={indexSx}>#</TableCell>
                <TableCell sx={{ ...headSx, width: 72 }}>Orden</TableCell>
                <TableCell sx={{ ...headSx, width: 140 }}>Código</TableCell>
                <TableCell sx={headSx}>Actividad</TableCell>
                <TableCell sx={{ ...headSx, width: 96 }}>En uso</TableCell>
                <TableCell sx={{ ...headSx, width: 90 }}>Inicial</TableCell>
                <TableCell sx={{ ...headSx, width: 120 }}>Último destino</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={item.id} sx={{ bgcolor: index % 2 === 1 ? zebraBg : 'inherit' }}>
                  <TableCell sx={indexSx}>{index + 1}</TableCell>
                  <TableCell sx={{ ...textCellSx, px: 0.25 }}>
                    <Stack direction="row">
                      <IconButton size="small" disabled={index === 0} onClick={() => move(index, 'up')} aria-label={`Subir ${item.name}`}>
                        <FuseSvgIcon size={16}>heroicons-outline:chevron-up</FuseSvgIcon>
                      </IconButton>
                      <IconButton size="small" disabled={index === items.length - 1} onClick={() => move(index, 'down')} aria-label={`Bajar ${item.name}`}>
                        <FuseSvgIcon size={16}>heroicons-outline:chevron-down</FuseSvgIcon>
                      </IconButton>
                    </Stack>
                  </TableCell>
                  <SheetGridTagCell tag={item.code} />
                  <TableCell sx={{ ...textCellSx, fontWeight: 600, color: item.isEnabled ? 'text.primary' : 'text.disabled' }}>{item.name}</TableCell>
                  <TableCell sx={{ ...textCellSx, px: 0.5 }}>
                    <Switch size="small" checked={item.isEnabled} onChange={() => toggle(item.id)} inputProps={{ 'aria-label': `Usar ${item.name}` }} />
                  </TableCell>
                  <TableCell sx={{ ...textCellSx, px: 0.5 }}>
                    <Radio size="small" checked={item.isInitial} disabled={!item.isEnabled} onChange={() => setInitial(item.id)} inputProps={{ 'aria-label': `${item.name} es la inicial` }} />
                  </TableCell>
                  <TableCell sx={{ ...textCellSx, px: 0.5 }}>
                    <Radio size="small" checked={item.isFinal} disabled={!item.isEnabled} onChange={() => setFinal(item.id)} inputProps={{ 'aria-label': `${item.name} es el último destino` }} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </SheetGrid>

          {missing && (
            <Alert severity="warning" sx={{ fontSize: '0.8rem', py: 0.5 }}>
              La empresa tiene que usar al menos una actividad.
            </Alert>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={isPending}
              startIcon={isPending ? <CircularProgress size={14} color="inherit" /> : undefined}
              sx={{ px: 3.5, fontWeight: 700, borderRadius: '6px', textTransform: 'none', boxShadow: 'none', '&:hover': { bgcolor: 'primary.dark', boxShadow: 'none' } }}
            >
              Guardar
            </Button>
          </Box>
        </>
      )}
    </SettingsSection>
  );
}
