/**
 * Batch types an animal never comes back from (mirrors App\Core\ValueObjects\TerminalBatchTypes):
 * the dead and the animals that left. Nothing is consumed, weaned, transferred or sold from them.
 */
export const TERMINAL_BATCH_TYPES = ['INTERNAL_DEATH', 'INTERNAL_EXIT'] as const;

export const isTerminalBatchType = (code: string | null | undefined): boolean =>
	code != null && (TERMINAL_BATCH_TYPES as readonly string[]).includes(code);
