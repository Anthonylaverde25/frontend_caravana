import { Alert, Box, CircularProgress, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import SheetGrid from '@/components/sheet-grid/SheetGrid';
import SheetGridTagCell from '@/components/sheet-grid/SheetGridTagCell';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import { useAnimalCategories } from '@/features/categories/hooks/useAnimalCategories';
import SettingsSection from '../SettingsSection';

const SEX_LABELS: Record<string, string> = { H: 'Hembra', M: 'Macho' };

const ageRange = (min: number | null, max: number | null): string =>
  max == null ? `desde ${min ?? 0} m` : `${min ?? 0} a ${max} m`;

const weightRange = (min: number | null, max: number | null): string =>
  min == null && max == null ? '—' : `${min?.toLocaleString('es-AR') ?? '—'} – ${max?.toLocaleString('es-AR') ?? '—'} kg`;

/** The livestock categories: sex, age and reference weight, and their subcategories. */
export default function AnimalCategoriesSection() {
  const { data: categories = [], isLoading, isError } = useAnimalCategories();
  const { headSx, indexSx, textCellSx, zebraBg } = useGridCellStyles();

  return (
    <SettingsSection id="animal-categories">
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={28} />
        </Box>
      ) : isError ? (
        <Alert severity="error" sx={{ fontSize: '0.8rem', py: 0.5 }}>
          No se pudieron cargar las categorías.
        </Alert>
      ) : (
        <SheetGrid minWidth={1000}>
          <TableHead>
            <TableRow>
              <TableCell sx={indexSx}>#</TableCell>
              <TableCell sx={{ ...headSx, width: 130 }}>Código</TableCell>
              <TableCell sx={{ ...headSx, width: 170 }}>Categoría</TableCell>
              <TableCell sx={{ ...headSx, width: 80 }}>Sexo</TableCell>
              <TableCell sx={{ ...headSx, width: 100 }}>Edad</TableCell>
              <TableCell sx={{ ...headSx, width: 140, textAlign: 'right' }}>Peso de referencia</TableCell>
              <TableCell sx={{ ...headSx, width: 100 }}>Reproductiva</TableCell>
              <TableCell sx={headSx}>Subcategorías</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category, index) => (
              <TableRow key={category.id} sx={{ bgcolor: index % 2 === 1 ? zebraBg : 'inherit' }}>
                <TableCell sx={indexSx}>{index + 1}</TableCell>
                <SheetGridTagCell tag={category.code} />
                <TableCell sx={{ ...textCellSx, fontWeight: 600 }} title={category.description ?? undefined}>
                  {category.name}
                </TableCell>
                <TableCell sx={textCellSx}>{SEX_LABELS[category.sex ?? ''] ?? 'Ambos'}</TableCell>
                <TableCell sx={textCellSx}>{ageRange(category.min_age_months, category.max_age_months)}</TableCell>
                <TableCell sx={{ ...textCellSx, textAlign: 'right' }}>{weightRange(category.min_weight_kg, category.max_weight_kg)}</TableCell>
                <TableCell sx={textCellSx}>{category.is_reproductive ? 'Sí' : 'No'}</TableCell>
                <TableCell sx={{ ...textCellSx, height: 'auto', py: 0.75 }}>
                  {category.subcategories?.length ? (
                    <Typography component="span" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                      {category.subcategories.map((sub) => sub.name).join(' · ')}
                    </Typography>
                  ) : (
                    <Typography component="span" sx={{ color: 'text.disabled' }}>
                      —
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </SheetGrid>
      )}
    </SettingsSection>
  );
}
