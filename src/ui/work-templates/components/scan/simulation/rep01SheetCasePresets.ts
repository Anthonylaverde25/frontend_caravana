import { SimulationPreset } from "./types";

/**
 * REP-01 test sheets, run against ServiceOnOperationalBatchTestSeeder:
 *  - SO-YYYY-903 ("Srv Rodeo Espera Tacto"): bulls withdrawn on 2026-08-30, suggested diagnosis
 *    from 2026-10-14. ET-05 was reopened (empty scanned with the bulls in), ET-06 died (EXITED),
 *    ET-01..04 already have a verdict, ET-07..12 are pending.
 *  - SO-YYYY-902 ("Srv Rodeo Tacto"): service still running with SRV-TR-05; TC-04 is a provisional
 *    empty, TC-06..10 are pending.
 *     php artisan tenants:seed --class=ServiceOnOperationalBatchTestSeeder
 *
 * Rows say what the sheet says: P / V in the diagnosis box (blank = not checked in this round),
 * an optional stage, optional months.
 */

const YEAR = "2026";
const REQUIRES = " Requiere ServiceOnOperationalBatchTestSeeder.";
const today = () => new Date().toISOString().slice(0, 10);

type Rep01Row = {
  caravana: string;
  diagnosis: string;
  gestational_stage?: string;
  gestation_months?: string;
  observations?: string;
};

const sheetCase = (
  label: string,
  description: string,
  orderCode: string,
  fecha: string,
  rows: Rep01Row[],
  mockErrors?: SimulationPreset["mockErrors"],
): SimulationPreset => ({
  templateCode: "REP-01",
  scenario: "SHEET_CASES",
  scenarioLabel: label,
  scenarioDescription: description + REQUIRES,
  templateTitle: "Planilla de Tacto y Ecografía",
  category: "REPRODUCTIVE",
  context: { service_order_code: orderCode, fecha, lote: orderCode.endsWith("903") ? "Srv Rodeo Espera Tacto" : "Srv Rodeo Tacto" },
  rows: rows.map((row, index) => ({
    id: index + 1,
    category: "Vaca",
    gestational_stage: "",
    gestation_months: "",
    observations: "",
    ...row,
  })),
  mockErrors,
});

const WAITING = `SO-${YEAR}-903`;
const IN_SERVICE = `SO-${YEAR}-902`;

export const REP01_SHEET_CASES: SimulationPreset[] = [
  sheetCase(
    "🟢 Cierre completo · espera de tacto",
    "Planilla de pendientes impresa desde 'Cerrar orden': todos los pendientes con resultado (estadio y meses opcionales). Al guardar no falta nadie y se ofrece 'Cerrar orden ahora'.",
    WAITING,
    today(),
    [
      { caravana: "SRV-ET-05", diagnosis: "V", observations: "Re-tacto: vacía confirmada" },
      { caravana: "SRV-ET-07", diagnosis: "P", gestational_stage: "CABEZA" },
      { caravana: "SRV-ET-08", diagnosis: "P", gestation_months: "2.5" },
      { caravana: "SRV-ET-09", diagnosis: "P" },
      { caravana: "SRV-ET-10", diagnosis: "V" },
      { caravana: "SRV-ET-11", diagnosis: "P", gestational_stage: "COLA" },
      { caravana: "SRV-ET-12", diagnosis: "P" },
    ],
  ),
  sheetCase(
    "🟡 Ronda 2 con re-tactos y celdas en blanco",
    "Re-tacto de una vacía reabierta, vientres ya diagnosticados que se reemplazan y dos celdas en blanco que quedan pendientes.",
    WAITING,
    today(),
    [
      { caravana: "SRV-ET-04", diagnosis: "P", observations: "Re-tacto: antes vacía" },
      { caravana: "SRV-ET-05", diagnosis: "P", gestational_stage: "COLA" },
      { caravana: "SRV-ET-07", diagnosis: "" },
      { caravana: "SRV-ET-08", diagnosis: "V" },
      { caravana: "SRV-ET-09", diagnosis: "" },
    ],
  ),
  sheetCase(
    "🟡 Tacto temprano (antes de la fecha sugerida)",
    "Planilla fechada antes de los 45 días del retiro: las vacías se marcan como posible preñez temprana no detectable. Se guardan igual.",
    WAITING,
    "2026-10-01",
    [
      { caravana: "SRV-ET-10", diagnosis: "V" },
      { caravana: "SRV-ET-11", diagnosis: "V" },
      { caravana: "SRV-ET-12", diagnosis: "P", gestation_months: "1" },
    ],
  ),
  sheetCase(
    "🟡 Tacto con toros en el lote",
    "Orden todavía en servicio: re-tacto de la vacía provisoria y los pendientes. El cierre posterior pide decidir sobre el toro.",
    IN_SERVICE,
    today(),
    [
      { caravana: "SRV-TC-04", diagnosis: "V" },
      { caravana: "SRV-TC-06", diagnosis: "P", gestational_stage: "CUERPO" },
      { caravana: "SRV-TC-07", diagnosis: "P" },
      { caravana: "SRV-TC-08", diagnosis: "V" },
      { caravana: "SRV-TC-09", diagnosis: "P", gestation_months: "3" },
      { caravana: "SRV-TC-10", diagnosis: "V" },
    ],
  ),
  sheetCase(
    "🔴 Celdas ilegibles y vientre ajeno",
    "Un diagnóstico ilegible, un estadio ilegible y una caravana que no es de la orden: se marcan en la revisión y nada se guarda como vacía.",
    WAITING,
    today(),
    [
      { caravana: "SRV-ET-07", diagnosis: "?" },
      { caravana: "SRV-ET-08", diagnosis: "P", gestational_stage: "XYZ" },
      { caravana: "SRV-XX-99", diagnosis: "V" },
      { caravana: "SRV-ET-09", diagnosis: "P" },
    ],
    {
      rowErrors: [
        { row_index: 0, caravana: "SRV-ET-07", errors: [{ code: "unreadable_diagnosis", message: "Diagnóstico ilegible: '?'. Debe ser P (preñada) o V (vacía)." }] },
        { row_index: 1, caravana: "SRV-ET-08", errors: [{ code: "unreadable_stage", message: "Estadio ilegible: 'xyz'. Debe ser cabeza, cuerpo o cola (o quedar en blanco)." }] },
        { row_index: 2, caravana: "SRV-XX-99", errors: [{ code: "not_in_order", message: "This caravan does not belong to the selected service order." }] },
      ],
    },
  ),
];

export const REP01_PRESETS = {
  HAPPY_PATH: { ...REP01_SHEET_CASES[0], scenario: "HAPPY_PATH" as const },
  WARNINGS: { ...REP01_SHEET_CASES[1], scenario: "WARNINGS" as const },
  REPAIR_ERROR: { ...REP01_SHEET_CASES[4], scenario: "REPAIR_ERROR" as const },
};
