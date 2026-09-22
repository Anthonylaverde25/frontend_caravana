import { useMemo } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { WeightRecord } from '../BatchWeightChart';

interface BatchWeightLogTableProps {
    history: WeightRecord[];
}

const COLUMNS = ['FECHA', 'ETAPA / ACTIVIDAD', 'TIPO', 'CABEZAS', 'PESO KG', 'DIF. (+/-)'];
const GRID = '1fr 1.4fr 1fr 1fr 1fr 1.2fr';

const TYPE_STYLE: Record<string, { bg: string; color: string; border: string }> = {
    MOVEMENT_IN: { bg: '#e8f5e9', color: '#1b5e20', border: '#c8e6c9' },
    MOVEMENT_OUT: { bg: '#fff1e6', color: '#9a3412', border: '#fed7aa' },
    TRANSFER: { bg: '#e3f2fd', color: '#0d47a1', border: '#bbdefb' },
    INITIAL: { bg: '#f3e8ff', color: '#6d28d9', border: '#e9d5ff' },
};

const DEFAULT_TYPE_STYLE = { bg: '#f5f5f5', color: '#616161', border: '#e0e0e0' };

const formatNumber = (value: number, digits = 1) =>
    value.toLocaleString('es-AR', { minimumFractionDigits: digits, maximumFractionDigits: digits });

/**
 * Weight log of a batch.
 *
 * The kg/cab difference between two rows only means something when both were computed
 * over the SAME set of animals. When the composition changed, the row reports the
 * transfer — head and kilos that moved — instead of a gain or a loss that never happened.
 */
export default function BatchWeightLogTable({ history }: BatchWeightLogTableProps) {
    const sortedHistory = useMemo(() => {
        if (!history || history.length === 0) return [];
        return [...history].sort((a, b) => {
            const byDate = new Date(b.weighing_date).getTime() - new Date(a.weighing_date).getTime();
            return byDate !== 0 ? byDate : b.id - a.id;
        });
    }, [history]);

    return (
        <Box sx={{ border: '1px solid #c6c6c6', borderRadius: '4px', overflow: 'hidden' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: GRID, bgcolor: '#f3f3f3', borderBottom: '2px solid #c6c6c6' }}>
                {COLUMNS.map((col) => (
                    <Box
                        key={col}
                        sx={{
                            p: 1,
                            borderRight: '1px solid #c6c6c6',
                            '&:last-child': { borderRight: 0 },
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Typography variant="caption" sx={{ fontWeight: 900, color: '#444', fontSize: '0.65rem', letterSpacing: 0.5 }}>
                            {col}
                        </Typography>
                    </Box>
                ))}
            </Box>

            {sortedHistory.length === 0 && (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                        No hay registros de peso disponibles.
                    </Typography>
                </Box>
            )}

            {sortedHistory.map((record, index) => {
                // The list arrives newest first, so the previous point in time is the next row.
                const previous = index < sortedHistory.length - 1 ? sortedHistory[index + 1] : null;
                const typeStyle = TYPE_STYLE[record.type] ?? DEFAULT_TYPE_STYLE;

                const sameComposition =
                    previous != null &&
                    record.caravans_count != null &&
                    previous.caravans_count != null &&
                    record.weighed_count === previous.weighed_count &&
                    record.caravans_count === previous.caravans_count;

                const gain =
                    sameComposition && record.weight != null && previous?.weight != null
                        ? record.weight - previous.weight
                        : null;

                const headDelta =
                    previous != null && record.caravans_count != null && previous.caravans_count != null
                        ? record.caravans_count - previous.caravans_count
                        : null;

                const massDelta =
                    previous != null && record.total_weight != null && previous.total_weight != null
                        ? record.total_weight - previous.total_weight
                        : null;

                const isBase = previous === null;

                return (
                    <Box
                        key={record.id}
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: GRID,
                            borderBottom: '1px solid #e0e0e0',
                            '&:last-child': { borderBottom: 0 },
                            bgcolor: isBase ? '#e8f5e9' : 'transparent',
                            '&:hover': { bgcolor: isBase ? '#dcedc8' : '#f8f9fa' },
                        }}
                    >
                        <Cell>
                            <Typography variant="body2" sx={{ fontWeight: 900, fontSize: '0.75rem', color: isBase ? '#2e7d32' : '#555' }}>
                                {record.weighing_date}
                            </Typography>
                        </Cell>

                        <Cell align="flex-start">
                            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.7rem', color: '#333' }}>
                                {(record as any).activity_name || '-'}
                            </Typography>
                        </Cell>

                        <Cell>
                            <Typography
                                variant="caption"
                                sx={{
                                    fontWeight: 900,
                                    fontSize: '0.58rem',
                                    px: 1,
                                    py: 0.2,
                                    borderRadius: '2px',
                                    bgcolor: typeStyle.bg,
                                    color: typeStyle.color,
                                    border: '1px solid',
                                    borderColor: typeStyle.border,
                                }}
                            >
                                {record.type}
                            </Typography>
                        </Cell>

                        <Cell>
                            {record.caravans_count == null ? (
                                <Typography variant="caption" sx={{ color: '#b45309', fontSize: '0.62rem', fontWeight: 700 }}>
                                    sin registrar
                                </Typography>
                            ) : (
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.75rem', color: '#333' }}>
                                        {record.caravans_count}
                                    </Typography>
                                    {record.weighed_count != null && record.weighed_count !== record.caravans_count && (
                                        <Typography variant="caption" sx={{ display: 'block', fontSize: '0.58rem', color: '#b45309' }}>
                                            {record.weighed_count} pesadas
                                        </Typography>
                                    )}
                                </Box>
                            )}
                        </Cell>

                        <Cell>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="body2" sx={{ fontWeight: 900, fontSize: '0.8rem', color: record.weight == null ? '#999' : 'primary.main' }}>
                                    {record.weight != null ? formatNumber(record.weight) : '—'}
                                </Typography>
                                {record.total_weight != null && (
                                    <Typography variant="caption" sx={{ display: 'block', fontSize: '0.58rem', color: '#7b61ff', fontWeight: 700 }}>
                                        {formatNumber(record.total_weight, 0)} kg tot.
                                    </Typography>
                                )}
                            </Box>
                        </Cell>

                        <Cell>
                            {isBase && (
                                <Typography variant="caption" sx={{ color: '#2e7d32', fontWeight: 900, letterSpacing: 0.5, fontSize: '0.62rem' }}>
                                    BASE
                                </Typography>
                            )}

                            {/* A change of composition is reported as the transfer it was, never
                                as kilos gained or lost by the animals. */}
                            {!isBase && headDelta != null && headDelta !== 0 && (
                                <Stack alignItems="center">
                                    <Typography
                                        variant="caption"
                                        sx={{ fontWeight: 900, fontSize: '0.66rem', color: headDelta > 0 ? '#1b5e20' : '#9a3412' }}
                                    >
                                        {headDelta > 0 ? `+${headDelta}` : headDelta} cab.
                                    </Typography>
                                    {massDelta != null && (
                                        <Typography variant="caption" sx={{ fontSize: '0.58rem', color: '#7b61ff', fontWeight: 700 }}>
                                            {massDelta > 0 ? '+' : '−'}
                                            {formatNumber(Math.abs(massDelta), 0)} kg
                                        </Typography>
                                    )}
                                </Stack>
                            )}

                            {!isBase && gain != null && (headDelta === 0 || headDelta == null) && (
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                    <FuseSvgIcon size={12} sx={{ color: gain >= 0 ? '#4caf50' : '#f44336' }}>
                                        {gain >= 0 ? 'heroicons-outline:arrow-trending-up' : 'heroicons-outline:arrow-trending-down'}
                                    </FuseSvgIcon>
                                    <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.7rem', color: gain >= 0 ? '#2e7d32' : '#d32f2f' }}>
                                        {gain > 0 ? `+${formatNumber(gain)}` : formatNumber(gain)}
                                    </Typography>
                                </Stack>
                            )}

                            {!isBase && gain == null && (headDelta === 0 || headDelta == null) && (
                                <Typography variant="caption" sx={{ color: '#999', fontSize: '0.62rem' }}>
                                    —
                                </Typography>
                            )}
                        </Cell>
                    </Box>
                );
            })}
        </Box>
    );
}

function Cell({ children, align = 'center' }: { children: React.ReactNode; align?: 'center' | 'flex-start' }) {
    return (
        <Box
            sx={{
                p: 1,
                borderRight: '1px solid #e0e0e0',
                '&:last-child': { borderRight: 0 },
                display: 'flex',
                justifyContent: align,
                alignItems: 'center',
            }}
        >
            {children}
        </Box>
    );
}
