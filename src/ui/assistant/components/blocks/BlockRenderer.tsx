import type { AssistantBlock, BlockSize } from '@/core/assistant/domain/AssistantTypes';
import ActionBlockView from './ActionBlockView';
import ChartBlockView from './ChartBlockView';
import KpiBlockView from './KpiBlockView';
import SafeMarkdown from './SafeMarkdown';
import TableBlockView from './TableBlockView';
import TimelineBlockView from './TimelineBlockView';

interface BlockRendererProps {
	block: AssistantBlock;
	size?: BlockSize;
	onNavigate?: () => void;
}

/** One block of an answer, by type. An unknown type renders nothing instead of breaking the chat. */
export function BlockRenderer({ block, size = 'compact', onNavigate }: BlockRendererProps) {
	switch (block.type) {
		case 'text':
			return <SafeMarkdown markdown={block.markdown} />;
		case 'kpis':
			return <KpiBlockView block={block} />;
		case 'table':
			return (
				<TableBlockView
					block={block}
					size={size}
				/>
			);
		case 'chart':
			return (
				<ChartBlockView
					block={block}
					size={size}
				/>
			);
		case 'timeline':
			return (
				<TimelineBlockView
					block={block}
					size={size}
				/>
			);
		case 'action':
			return (
				<ActionBlockView
					block={block}
					onNavigate={onNavigate}
				/>
			);
		default:
			return null;
	}
}

export default BlockRenderer;
