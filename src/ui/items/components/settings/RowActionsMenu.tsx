import { useState } from 'react';
import { IconButton, Menu, MenuItem } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

export interface RowAction {
	label: string;
	onClick: () => void;
	/** Shown but not clickable, with the reason as its label. */
	disabled?: boolean;
}

/** The "⋯" of a grid row. */
export default function RowActionsMenu({ actions }: { actions: RowAction[] }) {
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);

	return (
		<>
			<IconButton
				size="small"
				onClick={(e) => {
					e.stopPropagation();
					setAnchor(e.currentTarget);
				}}
			>
				<FuseSvgIcon size={18}>heroicons-outline:ellipsis-horizontal</FuseSvgIcon>
			</IconButton>
			<Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)} onClick={(e) => e.stopPropagation()}>
				{actions.map((a) => (
					<MenuItem
						key={a.label}
						disabled={a.disabled}
						onClick={() => {
							setAnchor(null);
							a.onClick();
						}}
						sx={{ fontSize: '0.85rem' }}
					>
						{a.label}
					</MenuItem>
				))}
			</Menu>
		</>
	);
}
