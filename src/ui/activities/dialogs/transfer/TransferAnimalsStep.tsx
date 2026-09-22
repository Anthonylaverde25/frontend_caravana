import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { useMemo, useState } from 'react';

export interface TransferableCaravan {
  id: number;
  identification: string;
  sex?: 'M' | 'H' | null;
  current_weight?: number | null;
}

interface TransferAnimalsStepProps {
  caravans: TransferableCaravan[];
  isLoading?: boolean;
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
}

/**
 * Selection of the animals to transfer: the whole batch or a subset.
 *
 * The subset is what makes the classification by sex, weight and destination
 * possible: a weaning batch is opened into several specialised batches through
 * successive partial transfers.
 */
export default function TransferAnimalsStep({
  caravans,
  isLoading = false,
  selectedIds,
  onSelectionChange
}: TransferAnimalsStepProps) {
  const [search, setSearch] = useState('');

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return caravans;

    return caravans.filter((c) => c.identification.toLowerCase().includes(term));
  }, [caravans, search]);

  const toggle = (id: number) => {
    onSelectionChange(
      selectedIds.includes(id) ? selectedIds.filter((v) => v !== id) : [...selectedIds, id]
    );
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (caravans.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
        Este lote no tiene animales para transferir.
      </Typography>
    );
  }

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1} alignItems="center">
        <TextField
          size="small"
          variant="filled"
          placeholder="Buscar caravana..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1, bgcolor: 'action.hover' }}
        />
        <Button
          size="small"
          onClick={() => onSelectionChange(caravans.map((c) => c.id))}
          sx={{ textTransform: 'none', fontWeight: 700, whiteSpace: 'nowrap' }}
        >
          Todo el lote
        </Button>
        <Button
          size="small"
          onClick={() => onSelectionChange([])}
          sx={{ textTransform: 'none', fontWeight: 700, whiteSpace: 'nowrap' }}
        >
          Ninguno
        </Button>
      </Stack>

      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
        {selectedIds.length} de {caravans.length} animales seleccionados
      </Typography>

      <Box
        sx={{
          maxHeight: 260,
          overflowY: 'auto',
          border: 1,
          borderColor: 'divider',
          borderRadius: '8px'
        }}
      >
        {visible.map((caravan) => (
          <Box
            key={caravan.id}
            onClick={() => toggle(caravan.id)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1,
              py: 0.5,
              cursor: 'pointer',
              borderBottom: 1,
              borderColor: 'divider',
              '&:last-of-type': { borderBottom: 0 },
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            <Checkbox
              size="small"
              checked={selectedIds.includes(caravan.id)}
              onChange={() => toggle(caravan.id)}
              onClick={(e) => e.stopPropagation()}
            />
            <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }}>
              {caravan.identification}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ width: 28 }}>
              {caravan.sex === 'M' ? 'M' : caravan.sex === 'H' ? 'H' : '-'}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ width: 64, textAlign: 'right' }}>
              {caravan.current_weight ? `${caravan.current_weight} kg` : '-'}
            </Typography>
          </Box>
        ))}
      </Box>
    </Stack>
  );
}
