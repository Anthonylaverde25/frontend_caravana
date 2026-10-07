/**
 * Brings a row of the review into view and flashes it. The same row may be rendered twice — on the
 * page and in a repair dialog above it — so the last visible one wins: dialogs are mounted last.
 */
export function scrollToScanRow(rowId: string): boolean {
  const candidates = Array.from(document.querySelectorAll<HTMLElement>(`[data-scan-row-id="${CSS.escape(rowId)}"]`));
  const target = candidates.reverse().find((el) => el.offsetParent !== null);

  if (!target) return false;

  target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  // A table row paints through its cells: flash those, and they go back to their own colour.
  const painted = target.tagName === 'TR' ? Array.from(target.querySelectorAll<HTMLElement>(':scope > td')) : [target];
  painted.forEach((el) =>
    el.animate([{ backgroundColor: 'rgba(245, 158, 11, 0.35)' }, { backgroundColor: 'rgba(245, 158, 11, 0)' }], { duration: 1800, easing: 'ease-out' })
  );

  return true;
}
