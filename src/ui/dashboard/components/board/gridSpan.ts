import { WidgetColSpan, WidgetRowSpan, WidgetSize, getEffectiveDimensions } from '../../types/dashboard.types';

export interface WidgetSpanInput {
	size?: WidgetSize;
	colSpan?: WidgetColSpan;
	rowSpan?: WidgetRowSpan;
}

/** Grid column span per size/colSpan and breakpoint: 1 column on phones, up to 2 on tablets, up to 4 on desktop. */
export function gridSpan(input: WidgetSize | WidgetSpanInput) {
	const dims = typeof input === 'string' ? getEffectiveDimensions({ size: input }) : getEffectiveDimensions(input);

	return {
		xs: 'span 1',
		sm: dims.colSpan === 1 ? 'span 1' : 'span 2',
		lg: `span ${dims.colSpan}`
	};
}

/** Grid row span for taller widgets (e.g. 2 rows for detailed charts or tables). */
export function gridRowSpan(input: WidgetSize | WidgetSpanInput) {
	const dims = typeof input === 'string' ? getEffectiveDimensions({ size: input }) : getEffectiveDimensions(input);

	return `span ${dims.rowSpan}`;
}
