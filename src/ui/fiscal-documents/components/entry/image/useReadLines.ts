import { useState } from 'react';
import { Item } from '@/core/items/domain/entities/Item';
import { ResolvedFiscalLine } from '@/core/fiscal/domain/entities/ProviderRecognition';
import { FiscalLineState, isBlankLine } from '../fiscalEntryState';
import { linesFromRead } from './linesFromRead';

interface Options {
	lines: FiscalLineState[];
	items: Item[];
	discriminates: boolean;
	unpriced: boolean;
	load: (read: FiscalLineState[], how: 'replace' | 'append') => void;
}

/**
 * Puts the lines read from an image on the sheet (Delivery G). Blank rows are simply replaced; when
 * the operator already typed rows, they choose: replace them, add after them, or keep them (Q1).
 */
export function useReadLines({ lines, items, discriminates, unpriced, load }: Options) {
	const [pending, setPending] = useState<FiscalLineState[] | null>(null);
	const typed = lines.filter((l) => !isBlankLine(l) && !l.removed).length;

	const onLinesRead = (read: ResolvedFiscalLine[]) => {
		if (read.length === 0) return;

		const rows = linesFromRead(read, { items, discriminates, unpriced });

		if (typed === 0) {
			load(rows, 'replace');
			return;
		}

		setPending(rows);
	};

	return {
		onLinesRead,
		prompt: {
			open: pending !== null,
			typed,
			incoming: pending?.length ?? 0,
			onChoose: (how: 'replace' | 'append' | 'keep') => {
				if (pending && how !== 'keep') load(pending, how);

				setPending(null);
			}
		}
	};
}

export type ReadLinesPrompt = ReturnType<typeof useReadLines>['prompt'];
