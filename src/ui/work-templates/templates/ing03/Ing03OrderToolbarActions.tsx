import React from 'react';
import { useNavigate } from 'react-router';
import { Box, Button, Chip, Stack, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useContrastTheme } from '@/contexts/ContrastThemeContext';
import { useWorkTemplatePrint } from '@/contexts/WorkTemplatePrintContext';
import { useChangeReceiptSheetWeighing, useIssueReceiptSheet } from '@/features/entry-orders/hooks/useEntryOrderMutations';
import type { WeighingMode } from '@/features/entry-orders/types';
import { ing03Url, useIng03Sheet } from './useIng03Sheet';

interface ToolbarToggleProps<T extends string> {
  value: T;
  options: { value: T; label: string; icon: string; title: string }[];
  onChange: (value: T) => void;
  disabled?: boolean;
}

/** Two options in one click, the chosen one in the app's brand color, like its main buttons. */
const ToolbarToggle = <T extends string>({ value, options, onChange, disabled = false }: ToolbarToggleProps<T>) => {
  const { settings } = useContrastTheme();
  const selectedBg = (settings.enabled && settings.primaryButtonBg) || 'primary.main';

  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={value}
      disabled={disabled}
      onChange={(_, next: T | null) => next && onChange(next)}
      sx={{
        height: 36,
        '& .MuiToggleButton-root': { px: 1.25, gap: 0.5, textTransform: 'none', fontSize: '0.75rem', fontWeight: 700, borderColor: 'divider' },
        '& .MuiToggleButton-root.Mui-selected': {
          bgcolor: selectedBg,
          color: 'common.white',
          '&:hover': { bgcolor: selectedBg, opacity: 0.9 }
        }
      }}
    >
      {options.map((option) => (
        <ToggleButton key={option.value} value={option.value} aria-label={option.title} title={option.title}>
          <FuseSvgIcon size={16}>{option.icon}</FuseSvgIcon>
          {option.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

/**
 * The sheet behind the ING-03, in the toolbar: order, DTE and R-number with its status, how it is
 * weighed and how it is printed. The weighing — a weight per animal or one average in the header —
 * is part of the sheet and can change until it is printed; afterwards, "Nueva hoja" issues another
 * one. The orientation is only how it is printed: portrait or landscape, same lines per page. When
 * the DTE changed since it was issued (some caravans were received), "Nueva hoja" issues another
 * one with what is in transit now and replaces this one.
 */
export const Ing03OrderToolbarActions: React.FC = () => {
  const navigate = useNavigate();
  const { order, sheet } = useIng03Sheet();
  const { pageOrientation, setPageOrientation } = useWorkTemplatePrint();
  const issue = useIssueReceiptSheet();
  const changeWeighing = useChangeReceiptSheetWeighing();

  if (!order || !sheet) return null;

  const dte = order.dtes.find((d) => d.id === sheet.dte_id);
  const outdated = dte != null && dte.in_transit_count > 0 && dte.in_transit_count !== sheet.caravan_ids.length;
  const canIssue = dte != null && dte.in_transit_count > 0 && order.accepts_reception;
  const weighingLocked = !sheet.is_active || sheet.printed_at != null;
  const weighingTitle = !sheet.is_active
    ? `La hoja ${sheet.label} está ${sheet.status_label.toLowerCase()}: se pesa como se emitió.`
    : sheet.printed_at != null
      ? `La hoja ${sheet.label} ya se imprimió: para pesar de otra forma, emití una hoja nueva.`
      : 'Cómo se pesa en la manga. Se puede cambiar hasta imprimir la hoja.';

  return (
    <>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mr: 0.5 }}>
        <Box sx={{ textAlign: 'right', lineHeight: 1 }}>
          <Typography sx={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.8rem', lineHeight: 1.2 }}>
            {order.code} · {sheet.label}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>
            DTE {sheet.dte_number} · {sheet.caravan_ids.length === 1 ? '1 caravana' : `${sheet.caravan_ids.length} caravanas`}
          </Typography>
        </Box>
        <Chip size="small" label={sheet.status_label} color={sheet.is_active ? 'info' : 'default'} sx={{ fontWeight: 700, borderRadius: '6px' }} />
      </Stack>

      <Tooltip title={weighingTitle} disableInteractive>
        <span>
          <ToolbarToggle<WeighingMode>
            value={sheet.weighing_mode}
            disabled={weighingLocked || changeWeighing.isPending}
            onChange={(weighingMode) => changeWeighing.mutate({ id: order.id, sheetId: sheet.id, weighingMode })}
            options={[
              { value: 'INDIVIDUAL', label: 'Peso por animal', icon: 'heroicons-outline:scale', title: 'Una columna de peso en cada renglón' },
              { value: 'AVERAGE', label: 'Peso promedio', icon: 'heroicons-outline:calculator', title: 'Un único peso promedio en el encabezado' }
            ]}
          />
        </span>
      </Tooltip>

      <ToolbarToggle
        value={pageOrientation}
        onChange={setPageOrientation}
        options={[
          { value: 'portrait', label: 'Vertical', icon: 'heroicons-outline:document-text', title: 'Hoja tradicional, A4 vertical' },
          { value: 'landscape', label: 'Horizontal', icon: 'heroicons-outline:table-cells', title: 'La misma grilla en A4 horizontal, como una hoja de cálculo' }
        ]}
      />

      {canIssue && (outdated || !sheet.is_active) && (
        <Button
          variant="outlined"
          disabled={issue.isPending}
          onClick={() =>
            issue.mutate(
              { id: order.id, dteId: sheet.dte_id },
              {
                onSuccess: (result) => {
                  const created = result.order.receipt_sheets.find((s) => s.number === result.sheet_number);

                  if (created) navigate(ing03Url(order.id, created.id), { replace: true });
                }
              }
            )
          }
          startIcon={<FuseSvgIcon size={16}>heroicons-outline:arrow-path</FuseSvgIcon>}
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '6px', height: 36 }}
        >
          {sheet.is_active ? `Nueva hoja (reemplaza ${sheet.label})` : 'Nueva hoja'}
        </Button>
      )}
    </>
  );
};

export default Ing03OrderToolbarActions;
