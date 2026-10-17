import { SimulationPreset } from "./types";

/**
 * LSER-01 cases of the breeding eligibility (the veterinary module is optional). They run against
 * ServiceOnOperationalBatchTestSeeder:
 *  - "Srv Rodeo Aptitud": SRV-AP-01..05, all eligible.
 *  - "Srv Rodeo Descarte": SRV-DS-01..04 eligible, SRV-DS-05 excluded by the owner (CUT).
 *  - Bulls in "Srv Torada Descanso": SRV-TR-06 never evaluated, SRV-TR-07 APT but excluded
 *    (RESTING), SRV-TR-08 UNFIT, SRV-TR-09 APT.
 * A clean sheet leaves the batch in service: rerun the seeder before repeating it.
 *     php artisan tenants:seed --class=ServiceOnOperationalBatchTestSeeder
 */

const REQUIRES = " Requiere ServiceOnOperationalBatchTestSeeder.";

const today = () => new Date().toISOString().slice(0, 10);

const rowsOf = (tags: string[]) =>
  tags.map((caravana, index) => ({ id: index + 1, caravana, observations: "", confidence: 0.98 }));

const sheetCase = (
  label: string,
  description: string,
  lote: string,
  toro: string,
  tags: string[],
  mockErrors?: SimulationPreset["mockErrors"],
): SimulationPreset => ({
  templateCode: "LSER-01",
  scenario: "SHEET_CASES",
  scenarioLabel: label,
  scenarioDescription: description + REQUIRES,
  templateTitle: "Acta de Inicio de Servicio — Toro Único",
  category: "REPRODUCTIVE",
  context: {
    lote_id: null,
    lote,
    toro_caravana: toro,
    planned_start_date: today(),
    responsable: "Encargado de manga",
    observaciones: "Caso de aptitud reproductiva.",
  },
  rows: rowsOf(tags),
  mockErrors,
});

const APTITUD = ["SRV-AP-01", "SRV-AP-02", "SRV-AP-03", "SRV-AP-04", "SRV-AP-05"];

export const LSER01_SHEET_CASES: SimulationPreset[] = [
  sheetCase(
    "🟢 Toro sin evaluación veterinaria (SRV-TR-06)",
    "El toro nunca fue evaluado: entra por decisión del ganadero y la orden lo registra sin certificación.",
    "Srv Rodeo Aptitud",
    "SRV-TR-06",
    APTITUD,
  ),
  sheetCase(
    "🟡 Vaca excluida que sigue en el lote (SRV-DS-05)",
    "SRV-DS-05 está excluida (CUT) pero no se apartó: en servicio natural queda expuesta. Avisos IN_BATCH_NOT_LISTED y BREEDING_EXCLUDED_EXPOSED.",
    "Srv Rodeo Descarte",
    "SRV-TR-09",
    ["SRV-DS-01", "SRV-DS-02", "SRV-DS-03", "SRV-DS-04"],
  ),
  sheetCase(
    "🔴 Toro excluido por el ganadero (SRV-TR-07, descanso)",
    "El toro está apto sanitariamente, pero el ganadero lo dejó en descanso: la hoja se bloquea hasta habilitarlo o cambiar de toro.",
    "Srv Rodeo Aptitud",
    "SRV-TR-07",
    APTITUD,
    {
      headerErrors: [
        { field: "toro_caravana", code: "BULL_NOT_FIT", message: "El reproductor SRV-TR-07 está excluido de reproducción (Descanso). Habilítelo para incluirlo." },
      ],
    },
  ),
  sheetCase(
    "🔴 Toro con rechazo sanitario (SRV-TR-08)",
    "El veterinario dictaminó NO APTO: el ganadero no puede saltear el bloqueo.",
    "Srv Rodeo Aptitud",
    "SRV-TR-08",
    APTITUD,
    {
      headerErrors: [
        { field: "toro_caravana", code: "BULL_NOT_FIT", message: "El reproductor SRV-TR-08 no está apto para servicio. Estado: UNFIT." },
      ],
    },
  ),
];
