import React from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { dueLabel, stageLabel, useBirthOrderTableStyles } from '../birthOrderFormat';
import { suggestedSire, type BirthRollFemale } from '../grid/birthRollTypes';

/**
 * The females of an order, read-only: an order declares nothing per female — what happened to each
 * one is learned at the rounds. Soonest due first, the order the sheet prints them in.
 */
export const BirthOrderFemalesList: React.FC<{ females: BirthRollFemale[] }> = ({ females }) => {
  const { headerCell, bodyCell, headBg } = useBirthOrderTableStyles();
  const sorted = [...females].sort((a, b) => (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999'));

  return (
    <Paper variant="outlined" sx={{ borderRadius: '8px', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 'calc(100vh - 380px)' }}>
        <Table size="small" stickyHeader>
          <TableHead sx={{ bgcolor: headBg }}>
            <TableRow>
              <TableCell sx={{ ...headerCell, width: 44, textAlign: 'center' }}>#</TableCell>
              <TableCell sx={headerCell}>Vientre</TableCell>
              <TableCell sx={headerCell}>Lote</TableCell>
              <TableCell sx={headerCell}>FPP</TableCell>
              <TableCell sx={headerCell}>Estadio</TableCell>
              <TableCell sx={{ ...headerCell, borderRight: 0 }}>Padre (se confirma después)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sorted.map((female, index) => {
              const sire = suggestedSire(female.sires);

              return (
                <TableRow key={female.caravanId}>
                  <TableCell sx={{ ...bodyCell, textAlign: 'center', color: 'text.secondary' }}>{index + 1}</TableCell>
                  <TableCell sx={{ ...bodyCell, fontFamily: 'monospace', fontWeight: 700 }}>
                    {female.identification}
                    <Typography component="span" variant="caption" color="text.secondary" sx={{ fontFamily: 'inherit' }}>
                      {' '}
                      · {female.categoryLabel ?? 'Vientre'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={bodyCell}>{female.batchName ?? 'Sin lote'}</TableCell>
                  <TableCell sx={{ ...bodyCell, whiteSpace: 'nowrap' }}>{dueLabel(female.dueDate)}</TableCell>
                  <TableCell sx={bodyCell}>{stageLabel(female.stage)}</TableCell>
                  <TableCell sx={{ ...bodyCell, borderRight: 0, color: 'text.secondary' }}>
                    {sire ? sire.identification : female.sires.length > 1 ? `${female.sires.length} candidatos` : '—'}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default BirthOrderFemalesList;
