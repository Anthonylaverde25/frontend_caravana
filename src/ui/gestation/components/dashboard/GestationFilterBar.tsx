import {
  Paper,
  Typography,
  Box,
  Stack,
  Chip,
  Collapse,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

interface GestationFilterBarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedStage: string;
  setSelectedStage: (val: string) => void;
  selectedBatch: string;
  setSelectedBatch: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  batches: string[];
  categories: string[];
  filterBarExpanded: boolean;
  handleResetFilters: () => void;
  isDark: boolean;
}

export default function GestationFilterBar({
  searchQuery,
  setSearchQuery,
  selectedStage,
  setSelectedStage,
  selectedBatch,
  setSelectedBatch,
  selectedCategory,
  setSelectedCategory,
  batches,
  categories,
  filterBarExpanded,
  handleResetFilters,
  isDark
}: GestationFilterBarProps) {
  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    (selectedStage !== 'all' ? 1 : 0) +
    (selectedBatch !== 'all' ? 1 : 0) +
    (selectedCategory !== 'all' ? 1 : 0);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        border: 1,
        borderColor: 'divider',
        borderRadius: '4px',
        bgcolor: isDark ? 'background.paper' : '#f8f9fa'
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: filterBarExpanded ? 2 : 0 }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <FuseSvgIcon size={18} sx={{ color: 'text.secondary' }}>
            heroicons-outline:funnel
          </FuseSvgIcon>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Barra de Filtros Inteligente
          </Typography>
          <Chip
            label={`${activeFiltersCount} activos`}
            size="small"
            sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
          />
        </Stack>
      </Stack>

      <Collapse in={filterBarExpanded}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '2fr 1.5fr 1.5fr 1.5fr 1fr' },
            gap: 2,
            alignItems: 'center',
            mt: 1
          }}
        >
          <TextField
            fullWidth
            size="small"
            label="Buscar Caravana"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ej: AR-1988"
            variant="outlined"
            sx={{ bgcolor: isDark ? 'background.default' : '#fff' }}
          />
          <FormControl fullWidth size="small">
            <InputLabel id="stage-filter-label">Estadio Preñez</InputLabel>
            <Select
              labelId="stage-filter-label"
              value={selectedStage}
              label="Estadio Preñez"
              onChange={(e) => setSelectedStage(e.target.value as string)}
              sx={{ bgcolor: isDark ? 'background.default' : '#fff' }}
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="head">Cabeza</MenuItem>
              <MenuItem value="body">Cuerpo</MenuItem>
              <MenuItem value="tail">Cola</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel id="batch-filter-label">Lote</InputLabel>
            <Select
              labelId="batch-filter-label"
              value={selectedBatch}
              label="Lote"
              onChange={(e) => setSelectedBatch(e.target.value as string)}
              sx={{ bgcolor: isDark ? 'background.default' : '#fff' }}
            >
              <MenuItem value="all">Todos</MenuItem>
              {batches.map((batchName) => (
                <MenuItem key={batchName} value={batchName}>
                  {batchName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel id="category-filter-label">Categoría</InputLabel>
            <Select
              labelId="category-filter-label"
              value={selectedCategory}
              label="Categoría"
              onChange={(e) => setSelectedCategory(e.target.value as string)}
              sx={{ bgcolor: isDark ? 'background.default' : '#fff' }}
            >
              <MenuItem value="all">Todos</MenuItem>
              {categories.map((categoryName) => (
                <MenuItem key={categoryName} value={categoryName}>
                  {categoryName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="text"
              color="secondary"
              size="small"
              onClick={handleResetFilters}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Limpiar
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
}
