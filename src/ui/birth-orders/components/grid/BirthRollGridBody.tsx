import React, { useMemo } from 'react';
import { TableBody } from '@mui/material';
import SheetGridGroupRow from '@/components/sheet-grid/SheetGridGroupRow';
import BirthRollGridRow from './BirthRollGridRow';
import type { BirthBreedOption } from './BirthBreedCoatCells';
import type { BirthCellError, BirthRollFemale } from './birthRollTypes';
import type { BirthRollState } from './useBirthRollState';

interface BirthRollGridBodyProps {
  females: BirthRollFemale[];
  state: BirthRollState;
  errors: Record<number, BirthCellError[]>;
  breeds: BirthBreedOption[];
  males: { id: number; identification: string }[];
  allowOverdue: boolean;
  /** Group rows by the female's current batch (several batches on one sheet). */
  grouped: boolean;
  /** Every column of the grid, for the group rows. */
  columnCount: number;
}

interface Group {
  name: string;
  females: BirthRollFemale[];
}

/** The rows of the calving grid, by batch when the sheet covers several. */
export const BirthRollGridBody: React.FC<BirthRollGridBodyProps> = ({ females, state, errors, breeds, males, allowOverdue, grouped, columnCount }) => {
  const groups = useMemo<Group[]>(() => {
    if (!grouped) return [{ name: '', females }];

    const byName = new Map<string, Group>();
    females.forEach((female) => {
      const name = female.batchName ?? 'Sin lote';
      const group = byName.get(name) ?? { name, females: [] };
      group.females.push(female);
      byName.set(name, group);
    });

    return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [females, grouped]);

  let index = 0;

  return (
    <TableBody>
      {groups.map((group) => (
        <React.Fragment key={group.name || 'all'}>
          {grouped && <SheetGridGroupRow colSpan={columnCount} name={group.name} caption={`${group.females.length} vientre(s)`} />}
          {group.females.map((female) => (
            <BirthRollGridRow
              key={female.caravanId}
              index={index++}
              female={female}
              value={state.valueOf(female.caravanId)}
              errors={errors[female.caravanId] ?? []}
              breeds={breeds}
              males={males}
              onChange={(change) => state.patch(female.caravanId, change)}
              allowOverdue={allowOverdue}
            />
          ))}
        </React.Fragment>
      ))}
    </TableBody>
  );
};

export default BirthRollGridBody;
