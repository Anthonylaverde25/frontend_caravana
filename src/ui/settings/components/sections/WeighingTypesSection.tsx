import { Alert, Box, CircularProgress, Switch, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import SheetGrid from '@/components/sheet-grid/SheetGrid';
import SheetGridTagCell from '@/components/sheet-grid/SheetGridTagCell';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import { ApiWeighingTypeRepository } from '@/core/weighing/infrastructure/repositories/ApiWeighingTypeRepository';
import { SHRUNK_CONDITION_LABELS, WeighingType } from '@/core/weighing/domain/entities/Weighing';
import { useWeighingTypes } from '@/features/weighing/hooks/useWeighingTypes';
import SettingsSection from '../SettingsSection';

const repository = new ApiWeighingTypeRepository();

const modality = (type: WeighingType): string =>
  type.allows_individual && type.allows_group ? 'Individual y tropa' : type.allows_individual ? 'Individual' : 'Tropa';

/** The weighing purposes, active and inactive: what each one is for and whether it is offered. */
export default function WeighingTypesSection() {
  const queryClient = useQueryClient();
  const { data: weighingTypes = [], isLoading, isError } = useWeighingTypes(false);
  const { headSx, indexSx, textCellSx, zebraBg } = useGridCellStyles();

  const { mutate: toggleActive, isPending } = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => repository.setActive(id, isActive),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['weighing-types'] });
      toast.success(`Tipo de pesaje "${updated.name}" actualizado`);
    },
    onError: () => toast.error('No se pudo actualizar el tipo de pesaje'),
  });

  return (
    <SettingsSection id="weighing-types">
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={28} />
        </Box>
      ) : isError ? (
        <Alert severity="error" sx={{ fontSize: '0.8rem', py: 0.5 }}>
          No se pudieron cargar los tipos de pesaje.
        </Alert>
      ) : (
        <SheetGrid minWidth={1000}>
          <TableHead>
            <TableRow>
              <TableCell sx={indexSx}>#</TableCell>
              <TableCell sx={{ ...headSx, width: 170 }}>Código</TableCell>
              <TableCell sx={headSx}>Tipo de pesaje</TableCell>
              <TableCell sx={{ ...headSx, width: 140 }}>Modalidad</TableCell>
              <TableCell sx={{ ...headSx, width: 150 }}>Condición</TableCell>
              <TableCell sx={{ ...headSx, width: 130 }}>Curva de ganancia</TableCell>
              <TableCell sx={{ ...headSx, width: 96 }}>Habilitado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {weighingTypes.map((type, index) => (
              <TableRow key={type.id} sx={{ bgcolor: index % 2 === 1 ? zebraBg : 'inherit' }}>
                <TableCell sx={indexSx}>{index + 1}</TableCell>
                <SheetGridTagCell tag={type.code} />
                <TableCell sx={{ ...textCellSx, height: 'auto', py: 0.75, color: type.is_active ? 'text.primary' : 'text.disabled' }}>
                  <Typography component="span" sx={{ display: 'block', fontWeight: 600, fontSize: '0.85rem' }}>
                    {type.name}
                  </Typography>
                  {type.description && (
                    <Typography component="span" sx={{ display: 'block', fontSize: '0.72rem', color: 'text.secondary' }}>
                      {type.description}
                    </Typography>
                  )}
                </TableCell>
                <TableCell sx={textCellSx}>{modality(type)}</TableCell>
                <TableCell sx={textCellSx}>{SHRUNK_CONDITION_LABELS[type.default_shrunk_condition]}</TableCell>
                <TableCell sx={textCellSx}>{type.affects_adpv ? 'Sí' : 'No'}</TableCell>
                <TableCell sx={{ ...textCellSx, px: 0.5 }}>
                  <Switch
                    size="small"
                    checked={type.is_active}
                    disabled={isPending}
                    onChange={(e) => toggleActive({ id: type.id, isActive: e.target.checked })}
                    inputProps={{ 'aria-label': `Habilitar ${type.name}` }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </SheetGrid>
      )}
    </SettingsSection>
  );
}
