import { useState, type MouseEvent } from 'react';
import { Button, ListItemText, Menu, MenuItem } from '@mui/material';
import { useServiceOrders } from '@/features/gestation/hooks/useServiceOrders';
import { REP01_SHEET_CASES } from '@/ui/work-templates/components/scan/simulation/rep01SheetCasePresets';
import type { SimulationPreset } from '@/ui/work-templates/components/scan/simulation/types';
import type { UploadResponse } from './types';

interface Rep01SimulationMenuProps {
  onLoad: (response: UploadResponse, fileName: string) => void;
}

const FIELDS: Record<string, string> = {
  caravana: 'identification',
  category: 'category',
  diagnosis: 'diagnosis',
  gestational_stage: 'gestational_stage',
  gestation_months: 'gestation_months',
  observations: 'observations',
};

/** A REP-01 test sheet as the OCR service would return it: same review, same import. */
function toUploadResponse(preset: SimulationPreset, serviceOrderId: number | null): UploadResponse {
  const cell = (value: unknown) => ({ value: value === undefined || value === null ? '' : String(value), confidence: 0.99 });
  const mappedRows = preset.rows.map((row) =>
    Object.fromEntries(Object.entries(FIELDS).map(([source, target]) => [target, cell(row[source])]))
  );

  return {
    status: 'success',
    suggested_workday_code: 'REP-01-SIM',
    document_info: { pages: 1, model_id: 'simulation' },
    identified_template: { code: 'REP-01', title: preset.templateTitle },
    context: {
      cuit: null,
      renspa: null,
      lote: preset.context.lote ?? null,
      establecimiento: null,
      fecha: preset.context.fecha ?? null,
      provider_id: null,
      farm_id: null,
      batch_id: null,
      service_order_code: preset.context.service_order_code ?? null,
      service_order_id: serviceOrderId,
    },
    data: [
      {
        table_id: 0,
        row_count: mappedRows.length,
        column_count: Object.keys(FIELDS).length,
        headers: Object.keys(FIELDS),
        rows: mappedRows,
        field_mapping: FIELDS,
        unresolved_headers: [],
        mapped_rows: mappedRows,
      },
    ],
  } as UploadResponse;
}

/**
 * Development aid: loads one of the REP-01 test sheets (ServiceOnOperationalBatchTestSeeder)
 * without calling the AI service, resolving its order by the code printed on the sheet.
 */
export default function Rep01SimulationMenu({ onLoad }: Rep01SimulationMenuProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const { data: orders = [] } = useServiceOrders();

  const load = (preset: SimulationPreset) => {
    setAnchor(null);
    const order = orders.find((o) => o.code === preset.context.service_order_code) ?? null;
    onLoad(toUploadResponse(preset, order?.id ?? null), `${preset.scenarioLabel}.sim`);
  };

  return (
    <>
      <Button
        variant="outlined"
        color="secondary"
        onClick={(e: MouseEvent<HTMLButtonElement>) => {
          e.stopPropagation();
          setAnchor(e.currentTarget);
        }}
        sx={{ textTransform: 'none' }}
      >
        Simular planilla REP-01 (tacto)
      </Button>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)} onClick={(e) => e.stopPropagation()}>
        {REP01_SHEET_CASES.map((preset) => (
          <MenuItem key={preset.scenarioLabel} onClick={() => load(preset)} sx={{ maxWidth: 520, whiteSpace: 'normal' }}>
            <ListItemText primary={preset.scenarioLabel} secondary={preset.scenarioDescription} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
