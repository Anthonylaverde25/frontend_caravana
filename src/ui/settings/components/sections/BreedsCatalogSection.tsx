import { useMemo, useState } from 'react';
import { Alert, Box, CircularProgress, InputAdornment, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import SheetGrid from '@/components/sheet-grid/SheetGrid';
import SheetGridEmptyRow from '@/components/sheet-grid/SheetGridEmptyRow';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import { useBreeds } from '@/features/breeds/hooks/useBreeds';
import SettingsSection from '../SettingsSection';

/** The breeds the company loads its animals with, alphabetically, with a search. */
export default function BreedsCatalogSection() {
  const { data: breeds = [], isLoading, isError } = useBreeds();
  const { headSx, indexSx, textCellSx, zebraBg } = useGridCellStyles();
  const [search, setSearch] = useState('');

  const listed = useMemo(() => {
    const term = search.trim().toLowerCase();

    return [...breeds].filter((b) => !term || b.name.toLowerCase().includes(term)).sort((a, b) => a.name.localeCompare(b.name));
  }, [breeds, search]);

  return (
    <SettingsSection id="breeds">
      <TextField
        size="small"
        placeholder="Buscar raza"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ width: { xs: '100%', sm: 260 } }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <FuseSvgIcon size={18}>heroicons-outline:magnifying-glass</FuseSvgIcon>
            </InputAdornment>
          ),
        }}
      />
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={28} />
        </Box>
      ) : isError ? (
        <Alert severity="error" sx={{ fontSize: '0.8rem', py: 0.5 }}>
          No se pudieron cargar las razas.
        </Alert>
      ) : (
        <SheetGrid minWidth={360} sx={{ maxWidth: 560 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={indexSx}>#</TableCell>
              <TableCell sx={headSx}>Raza</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {listed.length === 0 ? (
              <SheetGridEmptyRow colSpan={2}>Ninguna raza coincide con la búsqueda.</SheetGridEmptyRow>
            ) : (
              listed.map((breed, index) => (
                <TableRow key={breed.id} sx={{ bgcolor: index % 2 === 1 ? zebraBg : 'inherit' }}>
                  <TableCell sx={indexSx}>{index + 1}</TableCell>
                  <TableCell sx={{ ...textCellSx, fontWeight: 600 }}>{breed.name}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </SheetGrid>
      )}
    </SettingsSection>
  );
}
