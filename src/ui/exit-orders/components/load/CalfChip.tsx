import React, { useState } from 'react';
import { Chip, Menu, MenuItem } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { CALF_DECISION_LABELS, CalfAtFoot, CalfAtFootDecision } from '@/features/exit-orders/types';

interface CalfChipProps {
	calves: CalfAtFoot[];
	decision: CalfAtFootDecision | undefined;
	onChange: (decision: CalfAtFootDecision) => void;
	disabled?: boolean;
	error?: boolean;
}

/**
 * A cow with her calf still at foot says what happens to it (P1), right on her row: "Sale con
 * ella" by default, "Se queda" weans it on the exit date. Only the rows it applies to show it.
 */
export const CalfChip: React.FC<CalfChipProps> = ({ calves, decision, onChange, disabled, error }) => {
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);
	const value = decision ?? 'WITH_MOTHER';
	const names = calves.map((calf) => calf.calf_label).join(', ');

	return (
		<>
			<Chip
				size="small"
				variant="outlined"
				color={error ? 'error' : value === 'WITH_MOTHER' ? 'primary' : 'default'}
				disabled={disabled}
				onClick={(e) => setAnchor(e.currentTarget)}
				label={`Cría ${names} · ${CALF_DECISION_LABELS[value].toLowerCase()}`}
				onDelete={(e) => setAnchor((e.currentTarget as HTMLElement).parentElement)}
				deleteIcon={<FuseSvgIcon size={14}>heroicons-outline:chevron-down</FuseSvgIcon>}
				sx={{ height: 20, fontSize: '0.66rem', fontWeight: 700, ml: 0.5, maxWidth: 220 }}
			/>
			<Menu
				anchorEl={anchor}
				open={anchor != null}
				onClose={() => setAnchor(null)}
			>
				{(Object.keys(CALF_DECISION_LABELS) as CalfAtFootDecision[]).map((option) => (
					<MenuItem
						key={option}
						selected={option === value}
						onClick={() => {
							onChange(option);
							setAnchor(null);
						}}
					>
						{option === 'WITH_MOTHER'
							? `Sale con ella (${calves.length} cab. más)`
							: 'Se queda: se desteta en la fecha del egreso'}
					</MenuItem>
				))}
			</Menu>
		</>
	);
};

export default CalfChip;
