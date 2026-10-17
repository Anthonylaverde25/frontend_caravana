import Button from '@mui/material/Button';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useNavigate } from 'react-router';
import type { ActionBlock } from '@/core/assistant/domain/AssistantTypes';

/** Only in-app paths: the backend builds them from a whitelist, and the client checks again. */
const isInternalRoute = (route: string) => route.startsWith('/') && !route.startsWith('//');

interface ActionBlockViewProps {
	block: ActionBlock;
	onNavigate?: () => void;
}

/** A shortcut to the screen where the full data lives. */
export function ActionBlockView({ block, onNavigate }: ActionBlockViewProps) {
	const navigate = useNavigate();

	if (!isInternalRoute(block.route)) return null;

	return (
		<Button
			variant="outlined"
			size="small"
			onClick={() => {
				navigate(block.route);
				onNavigate?.();
			}}
			endIcon={<FuseSvgIcon size={16}>heroicons-outline:arrow-right</FuseSvgIcon>}
			sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px', alignSelf: 'flex-start' }}
		>
			{block.label}
		</Button>
	);
}

export default ActionBlockView;
