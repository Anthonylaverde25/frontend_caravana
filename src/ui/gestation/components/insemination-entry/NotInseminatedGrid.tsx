import { MenuItem, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';
import SheetGrid from '@/components/sheet-grid/SheetGrid';
import SheetGridTagCell from '@/components/sheet-grid/SheetGridTagCell';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import type { NotInseminatedReason } from '@/features/gestation/hooks/useServiceOrders';
import { NOT_INSEMINATED_REASON_LABELS } from '@/features/gestation/types/insemination';

interface NotInseminatedGridProps {
  females: { id: number; identification: string }[];
  reasons: Record<number, NotInseminatedReason | null>;
  onChange: (femaleId: number, reason: NotInseminatedReason | null) => void;
}

/**
 * The females of an AI order never inseminated (IA12). Nothing to declare: they are not
 * inseminated; the reason is an optional note.
 */
export default function NotInseminatedGrid({ females, reasons, onChange }: NotInseminatedGridProps) {
  const { headSx, cellSx, inputSx, indexSx } = useGridCellStyles();

  return (
    <SheetGrid minWidth={420} maxHeight={260}>
      <TableHead>
        <TableRow>
          <TableCell sx={{ ...headSx, width: 44, textAlign: 'center' }}>#</TableCell>
          <TableCell sx={{ ...headSx, minWidth: 150 }}>Caravana</TableCell>
          <TableCell sx={{ ...headSx, minWidth: 220, borderRight: 0 }}>Motivo (opcional)</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {females.map((female, index) => (
          <TableRow key={female.id}>
            <TableCell sx={indexSx}>{index + 1}</TableCell>
            <SheetGridTagCell tag={female.identification} caption="Sin inseminar" />
            <TableCell sx={{ ...cellSx, borderRight: 0 }}>
              <TextField
                select
                fullWidth
                size="small"
                value={reasons[female.id] ?? ''}
                onChange={(e) => onChange(female.id, (e.target.value || null) as NotInseminatedReason | null)}
                SelectProps={{ displayEmpty: true }}
                sx={inputSx}
              >
                <MenuItem value="" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>Sin especificar</MenuItem>
                {(Object.keys(NOT_INSEMINATED_REASON_LABELS) as NotInseminatedReason[]).map((reason) => (
                  <MenuItem key={reason} value={reason} sx={{ fontSize: '0.8rem' }}>
                    {NOT_INSEMINATED_REASON_LABELS[reason]}
                  </MenuItem>
                ))}
              </TextField>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </SheetGrid>
  );
}
