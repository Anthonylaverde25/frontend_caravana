import { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { ASSISTANT_SIMULATION_PRESETS, type AssistantSimulationPreset } from './assistantSimulationPresets';

const FLOW_LABELS: Record<AssistantSimulationPreset['flow'], string> = {
	happy: 'Happy path',
	warning: 'Advertencia',
	error: 'Dato faltante',
	refusal: 'Tema prohibido'
};

/** Development-only menu that plays a canned answer, decoupled from ai-agent and the model. */
export function AssistantSimulationMenu({ onPick }: { onPick: (preset: AssistantSimulationPreset) => void }) {
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);

	return (
		<>
			<Tooltip title="Simulación (desarrollo)">
				<IconButton
					size="small"
					onClick={(event) => setAnchor(event.currentTarget)}
					sx={{ color: 'primary.main' }}
					aria-label="Simulación"
				>
					<FuseSvgIcon size={20}>heroicons-outline:beaker</FuseSvgIcon>
				</IconButton>
			</Tooltip>
			<Menu
				anchorEl={anchor}
				open={Boolean(anchor)}
				onClose={() => setAnchor(null)}
			>
				{ASSISTANT_SIMULATION_PRESETS.map((preset) => (
					<MenuItem
						key={preset.key}
						onClick={() => {
							setAnchor(null);
							onPick(preset);
						}}
					>
						<ListItemText
							primary={preset.label}
							secondary={FLOW_LABELS[preset.flow]}
						/>
					</MenuItem>
				))}
			</Menu>
		</>
	);
}

export default AssistantSimulationMenu;
