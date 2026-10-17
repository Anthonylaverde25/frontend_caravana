/**
 * Helper to determine the scroll container of an element.
 */
function getScrollParent(element: HTMLElement | null): Element | Window {
	let parent = element?.parentElement;

	while (parent && parent !== document.body && parent !== document.documentElement) {
		const { overflowY } = window.getComputedStyle(parent);

		if ((overflowY === 'auto' || overflowY === 'scroll') && parent.scrollHeight > parent.clientHeight) {
			return parent;
		}

		parent = parent.parentElement;
	}

	return window;
}

/**
 * Smoothly scrolls the viewport so that the batch row header aligns with the top edge
 * of the visible area, perfectly compensating for the sticky toolbar and any top badges
 * (such as "EN SERVICIO" which floats 11px above the paper card).
 *
 * @param element The Paper element of the batch row.
 * @param topSpacing Additional breathing room between the bottom of the sticky toolbar and the card header.
 */
export function scrollToBatchElement(element: HTMLElement | null, topSpacing = 14): void {
	if (!element) return;

	const toolbar = document.getElementById('fuse-toolbar');
	const toolbarHeight = toolbar ? toolbar.getBoundingClientRect().height : 64;
	const scrollParent = getScrollParent(element);

	if (scrollParent instanceof HTMLElement) {
		const parentRect = scrollParent.getBoundingClientRect();
		const elementRect = element.getBoundingClientRect();
		const currentScroll = scrollParent.scrollTop;
		const targetScroll = currentScroll + (elementRect.top - parentRect.top) - topSpacing;

		scrollParent.scrollTo({
			top: Math.max(0, targetScroll),
			behavior: 'smooth'
		});
	} else {
		const elementRect = element.getBoundingClientRect();
		const absoluteTop = window.scrollY + elementRect.top;
		const targetY = absoluteTop - toolbarHeight - topSpacing;

		window.scrollTo({
			top: Math.max(0, targetY),
			behavior: 'smooth'
		});
	}
}
