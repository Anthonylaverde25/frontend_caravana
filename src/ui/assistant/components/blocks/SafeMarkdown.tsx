import { Fragment, type ReactNode } from 'react';
import Box from '@mui/material/Box';

/**
 * The small markdown subset the assistant writes — paragraphs, bullet and numbered lists, bold,
 * italic and inline code — rendered as React elements. No HTML string is ever injected, so
 * whatever the model writes cannot become markup or script.
 */

const INLINE = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*)/g;

function renderInline(text: string): ReactNode[] {
	return text.split(INLINE).map((part, index) => {
		if (part.startsWith('**') && part.endsWith('**') && part.length > 4)
			return <strong key={index}>{part.slice(2, -2)}</strong>;

		if (part.startsWith('`') && part.endsWith('`') && part.length > 2)
			return <code key={index}>{part.slice(1, -1)}</code>;

		if (part.startsWith('*') && part.endsWith('*') && part.length > 2)
			return <em key={index}>{part.slice(1, -1)}</em>;

		return <Fragment key={index}>{part}</Fragment>;
	});
}

type Chunk = { kind: 'p'; lines: string[] } | { kind: 'ul' | 'ol'; items: string[] };

const BULLET = /^\s*[-*•]\s+(.*)$/;
const NUMBERED = /^\s*\d+[.)]\s+(.*)$/;

function toChunks(markdown: string): Chunk[] {
	const chunks: Chunk[] = [];

	for (const rawLine of markdown.replace(/\r\n/g, '\n').split('\n')) {
		const line = rawLine.replace(/^#{1,6}\s+/, '');
		const bullet = BULLET.exec(line);
		const numbered = bullet ? null : NUMBERED.exec(line);
		const last = chunks[chunks.length - 1];

		if (bullet || numbered) {
			const kind = bullet ? 'ul' : 'ol';
			const item = (bullet ?? numbered)![1];

			if (last && last.kind === kind) last.items.push(item);
			else chunks.push({ kind, items: [item] });
		} else if (line.trim() === '') {
			chunks.push({ kind: 'p', lines: [] });
		} else if (last && last.kind === 'p') {
			last.lines.push(line);
		} else {
			chunks.push({ kind: 'p', lines: [line] });
		}
	}

	return chunks.filter((chunk) => (chunk.kind === 'p' ? chunk.lines.length > 0 : chunk.items.length > 0));
}

export function SafeMarkdown({ markdown }: { markdown: string }) {
	return (
		<Box
			sx={{
				fontSize: '0.875rem',
				lineHeight: 1.55,
				color: 'text.primary',
				'& p': { m: 0, mb: 1, '&:last-child': { mb: 0 } },
				'& ul, & ol': { m: 0, mb: 1, pl: 2.5, '&:last-child': { mb: 0 } },
				'& li': { mb: 0.25 },
				'& code': {
					fontFamily: 'monospace',
					fontSize: '0.8rem',
					px: 0.5,
					borderRadius: '4px',
					bgcolor: 'action.hover'
				}
			}}
		>
			{toChunks(markdown).map((chunk, index) => {
				if (chunk.kind === 'p') {
					return (
						<p key={index}>
							{chunk.lines.map((line, lineIndex) => (
								<Fragment key={lineIndex}>
									{lineIndex > 0 && <br />}
									{renderInline(line)}
								</Fragment>
							))}
						</p>
					);
				}

				const List = chunk.kind;

				return (
					<List key={index}>
						{chunk.items.map((item, itemIndex) => (
							<li key={itemIndex}>{renderInline(item)}</li>
						))}
					</List>
				);
			})}
		</Box>
	);
}

export default SafeMarkdown;
