import { WidgetSize } from '../../types/dashboard.types';

/** Grid span per size and breakpoint: 1 column on phones, 2 on tablets, 4 on desktop. */
export function gridSpan(size: WidgetSize) {
	return {
		xs: 'span 1',
		sm: size === 'S' ? 'span 1' : 'span 2',
		lg: size === 'S' ? 'span 1' : size === 'M' ? 'span 2' : 'span 4'
	};
}
