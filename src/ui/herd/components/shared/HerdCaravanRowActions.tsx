import { useState } from 'react';
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { CaravanSummary } from '@/core/caravans/domain/entities/CaravanSummary';

type CaravanAction = (caravan: CaravanSummary) => void;

interface HerdCaravanRowActionsProps {
	caravan: CaravanSummary;
	onView: CaravanAction;
	onEdit?: CaravanAction;
	onWeigh?: CaravanAction;
	onBreeding?: CaravanAction;
	onDeath?: CaravanAction;
	onSell?: CaravanAction;
	onAbort?: CaravanAction;
}

/**
 * The actions of one caravan row: "view" at hand, everything else in a menu. A dead or sold
 * animal is looked at, never operated on, so its menu does not show.
 */
export function HerdCaravanRowActions({
	caravan,
	onView,
	onEdit,
	onWeigh,
	onBreeding,
	onDeath,
	onSell,
	onAbort
}: HerdCaravanRowActionsProps) {
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);
	const gone = caravan.is_dead || caravan.exit != null;
	const breedable = caravan.reproductive_status !== 'NOT_APPLICABLE';
	const isPregnant = caravan.gestation_status === 'PREGNANT';

	const items = gone
		? []
		: ([
				onEdit && { label: 'Editar', icon: 'heroicons-outline:pencil-square', run: onEdit },
				onWeigh && { label: 'Pesar', icon: 'heroicons-outline:scale', run: onWeigh },
				onBreeding &&
					breedable && { label: 'Aptitud reproductiva', icon: 'heroicons-outline:heart', run: onBreeding },
				onAbort &&
					isPregnant && {
						label: 'Registrar aborto',
						icon: 'heroicons-outline:exclamation-triangle',
						run: onAbort
					},
				onSell && { label: 'Vender', icon: 'heroicons-outline:banknotes', run: onSell },
				onDeath && { label: 'Registrar muerte', icon: 'heroicons-outline:x-circle', run: onDeath }
			].filter(Boolean) as { label: string; icon: string; run: CaravanAction }[]);

	return (
		<>
			<Tooltip title="Ver detalle">
				<IconButton
					size="small"
					onClick={() => onView(caravan)}
					aria-label={`Ver ${caravan.label}`}
					sx={{ height: 28, width: 28 }}
				>
					<FuseSvgIcon size={18}>heroicons-outline:eye</FuseSvgIcon>
				</IconButton>
			</Tooltip>
			{items.length > 0 && (
				<>
					<IconButton
						size="small"
						onClick={(event) => setAnchor(event.currentTarget)}
						aria-label="Más acciones"
						aria-haspopup="menu"
						sx={{ height: 28, width: 28 }}
					>
						<FuseSvgIcon size={18}>heroicons-outline:ellipsis-vertical</FuseSvgIcon>
					</IconButton>
					<Menu
						anchorEl={anchor}
						open={Boolean(anchor)}
						onClose={() => setAnchor(null)}
						anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
						transformOrigin={{ vertical: 'top', horizontal: 'right' }}
					>
						{items.map((item) => (
							<MenuItem
								key={item.label}
								onClick={() => {
									setAnchor(null);
									item.run(caravan);
								}}
							>
								<ListItemIcon>
									<FuseSvgIcon size={18}>{item.icon}</FuseSvgIcon>
								</ListItemIcon>
								<ListItemText>{item.label}</ListItemText>
							</MenuItem>
						))}
					</Menu>
				</>
			)}
		</>
	);
}

export default HerdCaravanRowActions;
