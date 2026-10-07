import React from 'react';
import { IconButton, InputBase, TableCell, TableRow, Tooltip, Typography, alpha, useTheme } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ArrivalFindingsCell from './ArrivalFindingsCell';
import TroopCells from './TroopCells';
import type { ReceptionRow, ReceptionRows, ReceptionTroopContext } from './useReceptionRows';

interface ReceptionRowCellsProps {
  row: ReceptionRow;
  index: number;
  /** The trailing blank row, where the next caravan is typed. */
  isNew: boolean;
  draft: ReceptionRows;
  troop: ReceptionTroopContext;
}

const cellSx = { py: 0.25, px: 0.5, borderBottomColor: 'divider' } as const;

/**
 * Moves the cursor to the caravan cell of another row, the way Enter does in a spreadsheet. The
 * next row is always there (the grid ends with a blank one), so it moves at once; only a row being
 * created waits for the render.
 */
const focusTagOf = (index: number) => {
  const next = document.querySelector<HTMLInputElement>(`[data-reception-tag="${index}"]`);

  if (next) next.focus();
  else window.setTimeout(() => document.querySelector<HTMLInputElement>(`[data-reception-tag="${index}"]`)?.focus(), 0);
};

/**
 * One caravan of the compact reception grid: its tag, the sex, category and breed line the order
 * leaves to it (TroopCells), weight, body condition and what it came off the truck with. A cell
 * the server rejected is marked red with its reason; a warning is amber and does not block.
 */
export const ReceptionRowCells: React.FC<ReceptionRowCellsProps> = ({ row, index, isNew, draft, troop }) => {
  const theme = useTheme();
  const sent = draft.sentIndexOf(row.key);
  const problemOf = (field: string) => (sent < 0 ? undefined : draft.rowErrors.find((e) => e.row === sent && e.field === field));
  const warning = sent < 0 ? undefined : draft.warnings.find((w) => w.row === sent);
  const outOfRange =
    row.weight !== '' && ((troop.minWeight != null && Number(row.weight) < troop.minWeight) || (troop.maxWeight != null && Number(row.weight) > troop.maxWeight));

  const tagError = problemOf('caravana');
  const sexError = problemOf('sex');
  const breedError = problemOf('breed_position');
  const categoryError = problemOf('category_position');
  const weightError = problemOf('weight');
  const ecError = problemOf('body_condition');
  const findingsError = problemOf('arrival_findings');
  const hasError = Boolean(tagError || sexError || categoryError || breedError || weightError || ecError || findingsError);
  const message =
    (tagError ?? sexError ?? categoryError ?? breedError ?? weightError ?? ecError ?? findingsError)?.message ??
    (warning?.code === 'BREED_UNDECLARED' ? 'Queda sin raza declarada' : undefined) ??
    (outOfRange ? 'Peso fuera del rango de la compra' : undefined);

  const inputSx = (error: boolean, warn = false) => ({
    width: '100%',
    px: 1,
    py: 0.25,
    fontSize: '0.85rem',
    borderRadius: '4px',
    border: '1px solid',
    borderColor: error ? 'error.main' : warn ? 'warning.main' : 'transparent',
    '&:hover': { bgcolor: 'action.hover' },
    '&.Mui-focused': { bgcolor: 'action.hover', borderColor: error ? 'error.main' : 'primary.main' }
  });

  return (
    <TableRow sx={{ bgcolor: hasError ? alpha(theme.palette.error.main, 0.05) : warning ? alpha(theme.palette.warning.main, 0.06) : undefined }}>
      <TableCell sx={{ ...cellSx, px: 1, color: 'text.disabled', fontSize: '0.75rem', fontWeight: 600 }}>{isNew ? '+' : index + 1}</TableCell>
      <TableCell sx={cellSx}>
        <InputBase
          value={row.caravana}
          placeholder={isNew ? 'Escribí o pegá caravanas…' : 'N° de caravana'}
          onChange={(e) => draft.updateRow(row.key, { caravana: e.target.value })}
          // A single-line input would drop the line breaks of a pasted list and glue the tags.
          onPaste={(e) => {
            const text = e.clipboardData.getData('text');

            if (/[\s,;]/.test(text.trim())) {
              e.preventDefault();
              draft.updateRow(row.key, { caravana: `${row.caravana} ${text}` });
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              focusTagOf(index + 1);
            }
          }}
          inputProps={{ 'data-reception-tag': index, style: { fontFamily: 'monospace', fontWeight: 700 } }}
          sx={inputSx(Boolean(tagError))}
        />
        {message && (
          <Typography variant="caption" sx={{ display: 'block', px: 1, color: hasError ? 'error.main' : 'warning.main', lineHeight: 1.3 }}>
            {message}
          </Typography>
        )}
      </TableCell>
      <TroopCells
        row={row}
        isNew={isNew}
        draft={draft}
        troop={troop}
        errors={{ sex: Boolean(sexError), category: Boolean(categoryError), breed: Boolean(breedError), breedWarn: warning?.code === 'BREED_UNDECLARED' }}
      />
      <TableCell sx={cellSx}>
        {!isNew && (
          <InputBase type="number" value={row.weight} placeholder="—" onChange={(e) => draft.updateRow(row.key, { weight: e.target.value })} sx={inputSx(Boolean(weightError), outOfRange)} />
        )}
      </TableCell>
      <TableCell sx={cellSx}>
        {!isNew && (
          <InputBase
            type="number"
            value={row.body_condition}
            placeholder="1–5"
            inputProps={{ min: 1, max: 5, step: 0.5 }}
            onChange={(e) => draft.updateRow(row.key, { body_condition: e.target.value })}
            sx={inputSx(Boolean(ecError))}
          />
        )}
      </TableCell>
      <TableCell sx={cellSx}>
        {!isNew && <ArrivalFindingsCell value={row.arrival_findings} onChange={(findings) => draft.updateRow(row.key, { arrival_findings: findings })} />}
      </TableCell>
      <TableCell sx={{ ...cellSx, textAlign: 'center' }}>
        {!isNew && (
          <Tooltip title="Quitar">
            <IconButton size="small" onClick={() => draft.removeRow(row.key)} sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}>
              <FuseSvgIcon size={15}>heroicons-outline:x-mark</FuseSvgIcon>
            </IconButton>
          </Tooltip>
        )}
      </TableCell>
    </TableRow>
  );
};

export default ReceptionRowCells;
