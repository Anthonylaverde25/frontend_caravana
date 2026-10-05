import { SimulationPreset } from "./types";

/**
 * One preset per test sheet in `ai-agent/image_test/ing003/`, carrying the same data as the image
 * (generated from its `casos.json`), so each case can be driven through the screen without calling
 * the AI.
 *
 * They run against EntryOrderTestSeeder, which issues R1 for the orders in transit
 * (EN-20260928-0004 with ING-T-14..23, EN-20260928-0005 with ING-T-31..40, EN-20260928-0006 with
 * ING-T-41..48, weighed with one average). 01, 02, 03 and 05 load one after the other on one fresh
 * seed:
 *     php artisan tenants:seed --class=EntryOrderTestSeeder
 */

const REQUIRES = " Requiere EntryOrderTestSeeder.";

const sheetCase = (label: string, description: string, context: Record<string, unknown>, rows: Record<string, string>[]): SimulationPreset => ({
  templateCode: "ING-03",
  scenario: "SHEET_CASES",
  scenarioLabel: label,
  scenarioDescription: description + REQUIRES,
  templateTitle: "Recepción de DTE",
  category: "ENTRY",
  context,
  rows,
});

export const ING03_SHEET_CASES: SimulationPreset[] = [
  sheetCase(
    "🟢 01 · Parcial, una que no llega y una sin DTE",
    "EN-20260928-0004 R1: 6 llegan con peso y EC, ING-T-20 no llega (con motivo), 3 sin marcar quedan en tránsito y ING-X-01 llega sin figurar en el DTE.",
    {"orden_ingreso": "EN-20260928-0004", "hoja_recepcion": "R1", "dte": "DTE-TEST-ING-002", "fecha_recepcion": "03/10/2026", "motivo_no_llegan": "Quedó en el campo de origen", "hoja_numero": 1, "hoja_total": 1},
    [{"id": "1", "caravana": "ING-T-14", "sexo": "M", "raza": "Braford", "pelaje": "Colorado", "llego": "X", "no_llega": "", "ec": "3", "peso": "180"}, {"id": "2", "caravana": "ING-T-15", "sexo": "M", "raza": "Braford", "pelaje": "Colorado", "llego": "X", "no_llega": "", "ec": "3,5", "peso": "176"}, {"id": "3", "caravana": "ING-T-16", "sexo": "M", "raza": "Braford", "pelaje": "Colorado", "llego": "X", "no_llega": "", "ec": "2,5", "peso": "190"}, {"id": "4", "caravana": "ING-T-17", "sexo": "M", "raza": "Braford", "pelaje": "Colorado", "llego": "X", "no_llega": "", "ec": "3", "peso": "185"}, {"id": "5", "caravana": "ING-T-18", "sexo": "M", "raza": "Braford", "pelaje": "Colorado", "llego": "X", "no_llega": "", "ec": "3,5", "peso": "172"}, {"id": "6", "caravana": "ING-T-19", "sexo": "M", "raza": "Braford", "pelaje": "Colorado", "llego": "X", "no_llega": "", "ec": "4", "peso": "198"}, {"id": "7", "caravana": "ING-T-20", "sexo": "M", "raza": "Braford", "pelaje": "Colorado", "llego": "", "no_llega": "X", "ec": "", "peso": ""}, {"id": "8", "caravana": "ING-T-21", "sexo": "M", "raza": "Braford", "pelaje": "Colorado", "llego": "", "no_llega": "", "ec": "", "peso": ""}, {"id": "9", "caravana": "ING-T-22", "sexo": "M", "raza": "Braford", "pelaje": "Colorado", "llego": "", "no_llega": "", "ec": "", "peso": ""}, {"id": "10", "caravana": "ING-T-23", "sexo": "M", "raza": "Braford", "pelaje": "Colorado", "llego": "", "no_llega": "", "ec": "", "peso": ""}, {"id": "11", "caravana": "ING-X-01", "sexo": "M", "raza": "Angus", "pelaje": "Colorado", "llego": "X", "no_llega": "", "ec": "3", "peso": "188"}],
  ),
  sheetCase(
    "🔴 02 · Inválida para reparar",
    "EN-20260928-0005 R1: sin fecha, dos casillas en ING-T-31, \"No llega\" sin motivo, EC 6 en ING-T-33 (fuera de la escala 1 a 5) e ING-T-35 escrita dos veces. La revisión bloquea; corregí y registrá.",
    {"orden_ingreso": "EN-20260928-0005", "hoja_recepcion": "R1", "dte": "DTE-TEST-ING-003", "fecha_recepcion": "", "motivo_no_llegan": "", "hoja_numero": 1, "hoja_total": 1},
    [{"id": "1", "caravana": "ING-T-31", "sexo": "H", "raza": "Brangus", "pelaje": "Negro", "llego": "X", "no_llega": "X", "ec": "", "peso": "160"}, {"id": "2", "caravana": "ING-T-32", "sexo": "H", "raza": "Brangus", "pelaje": "Negro", "llego": "", "no_llega": "X", "ec": "", "peso": ""}, {"id": "3", "caravana": "ING-T-33", "sexo": "H", "raza": "Brangus", "pelaje": "Negro", "llego": "X", "no_llega": "", "ec": "6", "peso": "168"}, {"id": "4", "caravana": "ING-T-34", "sexo": "H", "raza": "Brangus", "pelaje": "Negro", "llego": "X", "no_llega": "", "ec": "", "peso": "171"}, {"id": "5", "caravana": "ING-T-35", "sexo": "H", "raza": "Brangus", "pelaje": "Negro", "llego": "X", "no_llega": "", "ec": "", "peso": "174"}, {"id": "6", "caravana": "ING-T-36", "sexo": "H", "raza": "Brangus", "pelaje": "Negro", "llego": "X", "no_llega": "", "ec": "", "peso": "177"}, {"id": "7", "caravana": "ING-T-37", "sexo": "H", "raza": "Brangus", "pelaje": "Negro", "llego": "X", "no_llega": "", "ec": "", "peso": "180"}, {"id": "8", "caravana": "ING-T-38", "sexo": "H", "raza": "Brangus", "pelaje": "Negro", "llego": "X", "no_llega": "", "ec": "", "peso": "183"}, {"id": "9", "caravana": "ING-T-39", "sexo": "H", "raza": "Brangus", "pelaje": "Negro", "llego": "X", "no_llega": "", "ec": "", "peso": "186"}, {"id": "10", "caravana": "ING-T-40", "sexo": "H", "raza": "Brangus", "pelaje": "Negro", "llego": "X", "no_llega": "", "ec": "", "peso": "189"}, {"id": "11", "caravana": "ING-T-35", "sexo": "H", "raza": "Brangus", "pelaje": "Negro", "llego": "X", "no_llega": "", "ec": "", "peso": "170"}],
  ),
  sheetCase(
    "🟢 03 · Recepción completa",
    "EN-20260928-0005 R1: las diez llegan con peso y EC. La orden queda completa.",
    {"orden_ingreso": "EN-20260928-0005", "hoja_recepcion": "R1", "dte": "DTE-TEST-ING-003", "fecha_recepcion": "03/10/2026", "motivo_no_llegan": "", "hoja_numero": 1, "hoja_total": 1},
    [{"id": "1", "caravana": "ING-T-31", "sexo": "H", "raza": "Brangus", "pelaje": "Negro", "llego": "X", "no_llega": "", "ec": "3", "peso": "162"}, {"id": "2", "caravana": "ING-T-32", "sexo": "H", "raza": "Brangus", "pelaje": "Negro", "llego": "X", "no_llega": "", "ec": "3,5", "peso": "165"}, {"id": "3", "caravana": "ING-T-33", "sexo": "H", "raza": "Brangus", "pelaje": "Negro", "llego": "X", "no_llega": "", "ec": "3", "peso": "168"}, {"id": "4", "caravana": "ING-T-34", "sexo": "H", "raza": "Brangus", "pelaje": "Negro", "llego": "X", "no_llega": "", "ec": "3,5", "peso": "171"}, {"id": "5", "caravana": "ING-T-35", "sexo": "H", "raza": "Brangus", "pelaje": "Negro", "llego": "X", "no_llega": "", "ec": "3", "peso": "174"}, {"id": "6", "caravana": "ING-T-36", "sexo": "H", "raza": "Brangus", "pelaje": "Negro", "llego": "X", "no_llega": "", "ec": "3,5", "peso": "177"}, {"id": "7", "caravana": "ING-T-37", "sexo": "H", "raza": "Brangus", "pelaje": "Negro", "llego": "X", "no_llega": "", "ec": "3", "peso": "180"}, {"id": "8", "caravana": "ING-T-38", "sexo": "H", "raza": "Brangus", "pelaje": "Negro", "llego": "X", "no_llega": "", "ec": "3,5", "peso": "183"}, {"id": "9", "caravana": "ING-T-39", "sexo": "H", "raza": "Brangus", "pelaje": "Negro", "llego": "X", "no_llega": "", "ec": "3", "peso": "186"}, {"id": "10", "caravana": "ING-T-40", "sexo": "H", "raza": "Brangus", "pelaje": "Negro", "llego": "X", "no_llega": "", "ec": "3,5", "peso": "189"}],
  ),
  sheetCase(
    "🟢 05 · Peso promedio (hoja horizontal)",
    "EN-20260928-0006 R1, pesada con un promedio: PESO PROMEDIO 182 kg en el encabezado, ING-T-41..47 llegan con su EC e ING-T-48 queda en tránsito. Cada caravana recibida queda con 182 kg, registrado como promedio.",
    {"orden_ingreso": "EN-20260928-0006", "hoja_recepcion": "R1", "dte": "DTE-TEST-ING-004", "fecha_recepcion": "04/10/2026", "motivo_no_llegan": "", "peso_promedio": "182", "hoja_numero": 1, "hoja_total": 1},
    [{"id": "1", "caravana": "ING-T-41", "sexo": "M", "raza": "Hereford", "pelaje": "Pampa", "llego": "X", "no_llega": "", "ec": "3", "peso": ""}, {"id": "2", "caravana": "ING-T-42", "sexo": "M", "raza": "Hereford", "pelaje": "Pampa", "llego": "X", "no_llega": "", "ec": "3,5", "peso": ""}, {"id": "3", "caravana": "ING-T-43", "sexo": "M", "raza": "Hereford", "pelaje": "Pampa", "llego": "X", "no_llega": "", "ec": "3", "peso": ""}, {"id": "4", "caravana": "ING-T-44", "sexo": "M", "raza": "Hereford", "pelaje": "Pampa", "llego": "X", "no_llega": "", "ec": "2,5", "peso": ""}, {"id": "5", "caravana": "ING-T-45", "sexo": "M", "raza": "Hereford", "pelaje": "Pampa", "llego": "X", "no_llega": "", "ec": "3", "peso": ""}, {"id": "6", "caravana": "ING-T-46", "sexo": "M", "raza": "Hereford", "pelaje": "Pampa", "llego": "X", "no_llega": "", "ec": "3,5", "peso": ""}, {"id": "7", "caravana": "ING-T-47", "sexo": "M", "raza": "Hereford", "pelaje": "Pampa", "llego": "X", "no_llega": "", "ec": "4", "peso": ""}, {"id": "8", "caravana": "ING-T-48", "sexo": "M", "raza": "Hereford", "pelaje": "Pampa", "llego": "", "no_llega": "", "ec": "", "peso": ""}],
  ),
];
