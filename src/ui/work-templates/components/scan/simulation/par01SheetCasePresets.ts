import { SimulationPreset } from "./types";

/**
 * One preset per test sheet in `ai-agent/image_test/par001/`, carrying the same data as the image
 * (built from the cases of `generate_par01_images.py`, the ones written to `casos.json`), so each
 * case can be driven through the screen without calling the AI agent.
 *
 * The result is four boxes: V (parió) · NM (nació muerto) · M (murió al pie) · N (no parió, alerta
 * de parto vencido); several are read as "N, V". The abortion is not on the sheet.
 *
 * They run against BirthOrderTestSeeder (PAR-V-01..36 pregnant, PAR-V-37 open, PAR-C-USADA in use,
 * the issued order PA-20260929-0001 with PAR-V-01..20 and 31..33, and PA-20260929-0002 halfway
 * through with PAR-V-41 overdue). 03 → 10, 14, 18 and 19 load one after the other on one fresh seed;
 * 01 + 02 (the whole order, two pages) on another; 15 → 16 → 17 (the same sheet reloaded over three
 * days) on a third:
 *     php artisan tenants:seed --class=BirthOrderTestSeeder
 *
 * Sheets 11 and 12 have no preset on purpose: they only degrade the photo, and a simulation skips
 * the reading that is being tested. Sheet 13 is the blank print.
 */

const REQUIRES = " Requiere BirthOrderTestSeeder.";

const sheetCase = (
  label: string,
  description: string,
  context: Record<string, unknown>,
  rows: Record<string, string>[],
): SimulationPreset => ({
  templateCode: "PAR-01",
  scenario: "SHEET_CASES",
  scenarioLabel: label,
  scenarioDescription: description + REQUIRES,
  templateTitle: "Planilla de Parición",
  category: "REPRODUCTIVE",
  context,
  rows,
});

/** 01 + 02: the order fulfilled whole over two pages. */
export const PAR01_WHOLE_ORDER: SimulationPreset = {
  ...sheetCase(
    "🟢 01 + 02 · Orden completa en dos hojas",
    "PA-20260929-0001 entera: 20 partos, un nacido muerto y dos muertos al pie. Cargar sobre un seeder recién corrido.",
    {
      "orden_paricion": "PA-20260929-0001",
      "fecha_recorrida": "28/09/2026",
      "lote": "Varios",
      "responsable": "Recorredor de prueba",
      "hoja_numero": 1,
      "hoja_total": 2
    },
    [
      {
        "id": "1",
        "caravana_madre": "PAR-V-01",
        "resultado": "V",
        "caravana_cria": "PAR-C-01",
        "sexo": "M",
        "peso": "29",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "21/09/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "2",
        "caravana_madre": "PAR-V-02",
        "resultado": "V",
        "caravana_cria": "PAR-C-02",
        "sexo": "H",
        "peso": "30",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "22/09/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "3",
        "caravana_madre": "PAR-V-03",
        "resultado": "V",
        "caravana_cria": "PAR-C-03",
        "sexo": "M",
        "peso": "31",
        "raza": "",
        "pelaje": "Colorado",
        "fecha_nacimiento": "23/09/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "4",
        "caravana_madre": "PAR-V-04",
        "resultado": "V",
        "caravana_cria": "PAR-C-04",
        "sexo": "H",
        "peso": "32",
        "raza": "Angus",
        "pelaje": "Negro",
        "fecha_nacimiento": "24/09/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "5",
        "caravana_madre": "PAR-V-05",
        "resultado": "NM",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "26/09/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "6",
        "caravana_madre": "PAR-V-06",
        "resultado": "V",
        "caravana_cria": "PAR-C-06",
        "sexo": "H",
        "peso": "34",
        "raza": "",
        "pelaje": "Colorado",
        "fecha_nacimiento": "26/09/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "7",
        "caravana_madre": "PAR-V-07",
        "resultado": "V",
        "caravana_cria": "PAR-C-07",
        "sexo": "M",
        "peso": "35",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "27/09/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "8",
        "caravana_madre": "PAR-V-08",
        "resultado": "V",
        "caravana_cria": "PAR-C-08",
        "sexo": "H",
        "peso": "36",
        "raza": "Angus",
        "pelaje": "Negro",
        "fecha_nacimiento": "28/09/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "9",
        "caravana_madre": "PAR-V-09",
        "resultado": "V",
        "caravana_cria": "PAR-C-09",
        "sexo": "M",
        "peso": "28",
        "raza": "",
        "pelaje": "Colorado",
        "fecha_nacimiento": "20/09/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "10",
        "caravana_madre": "PAR-V-10",
        "resultado": "V",
        "caravana_cria": "PAR-C-10",
        "sexo": "H",
        "peso": "29",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "21/09/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "11",
        "caravana_madre": "PAR-V-11",
        "resultado": "V",
        "caravana_cria": "PAR-C-11",
        "sexo": "M",
        "peso": "30",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "22/09/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "12",
        "caravana_madre": "PAR-V-12",
        "resultado": "M",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "25/09/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "13",
        "caravana_madre": "PAR-V-13",
        "resultado": "V",
        "caravana_cria": "PAR-C-13",
        "sexo": "M",
        "peso": "32",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "24/09/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "14",
        "caravana_madre": "PAR-V-14",
        "resultado": "V",
        "caravana_cria": "PAR-C-14",
        "sexo": "H",
        "peso": "33",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "25/09/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "15",
        "caravana_madre": "PAR-V-15",
        "resultado": "V",
        "caravana_cria": "PAR-C-15",
        "sexo": "M",
        "peso": "34",
        "raza": "",
        "pelaje": "Colorado",
        "fecha_nacimiento": "26/09/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "16",
        "caravana_madre": "PAR-V-16",
        "resultado": "V",
        "caravana_cria": "PAR-C-16",
        "sexo": "H",
        "peso": "35",
        "raza": "Angus",
        "pelaje": "Negro",
        "fecha_nacimiento": "27/09/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "17",
        "caravana_madre": "PAR-V-17",
        "resultado": "V",
        "caravana_cria": "PAR-C-17",
        "sexo": "M",
        "peso": "36",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "28/09/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "18",
        "caravana_madre": "PAR-V-18",
        "resultado": "V",
        "caravana_cria": "PAR-C-18",
        "sexo": "H",
        "peso": "28",
        "raza": "",
        "pelaje": "Colorado",
        "fecha_nacimiento": "20/09/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "19",
        "caravana_madre": "PAR-V-19",
        "resultado": "V",
        "caravana_cria": "PAR-C-19",
        "sexo": "M",
        "peso": "29",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "21/09/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "20",
        "caravana_madre": "PAR-V-20",
        "resultado": "V",
        "caravana_cria": "PAR-C-20",
        "sexo": "H",
        "peso": "30",
        "raza": "Angus",
        "pelaje": "Negro",
        "fecha_nacimiento": "22/09/2026",
        "fuera_de_orden": ""
      }
    ],
  ),
  scenario: "MULTI_PAGE",
  pages: [
    {
      "fileName": "par01_01_orden_completa_hoja_1_de_2.png",
      "metadata": {
        "orden_paricion": "PA-20260929-0001",
        "fecha_recorrida": "28/09/2026",
        "lote": "Varios",
        "responsable": "Recorredor de prueba",
        "hoja_numero": 1,
        "hoja_total": 2
      },
      "rows": [
        {
          "id": "1",
          "caravana_madre": "PAR-V-01",
          "resultado": "V",
          "caravana_cria": "PAR-C-01",
          "sexo": "M",
          "peso": "29",
          "raza": "",
          "pelaje": "",
          "fecha_nacimiento": "21/09/2026",
          "fuera_de_orden": ""
        },
        {
          "id": "2",
          "caravana_madre": "PAR-V-02",
          "resultado": "V",
          "caravana_cria": "PAR-C-02",
          "sexo": "H",
          "peso": "30",
          "raza": "",
          "pelaje": "",
          "fecha_nacimiento": "22/09/2026",
          "fuera_de_orden": ""
        },
        {
          "id": "3",
          "caravana_madre": "PAR-V-03",
          "resultado": "V",
          "caravana_cria": "PAR-C-03",
          "sexo": "M",
          "peso": "31",
          "raza": "",
          "pelaje": "Colorado",
          "fecha_nacimiento": "23/09/2026",
          "fuera_de_orden": ""
        },
        {
          "id": "4",
          "caravana_madre": "PAR-V-04",
          "resultado": "V",
          "caravana_cria": "PAR-C-04",
          "sexo": "H",
          "peso": "32",
          "raza": "Angus",
          "pelaje": "Negro",
          "fecha_nacimiento": "24/09/2026",
          "fuera_de_orden": ""
        },
        {
          "id": "5",
          "caravana_madre": "PAR-V-05",
          "resultado": "NM",
          "caravana_cria": "",
          "sexo": "",
          "peso": "",
          "raza": "",
          "pelaje": "",
          "fecha_nacimiento": "26/09/2026",
          "fuera_de_orden": ""
        },
        {
          "id": "6",
          "caravana_madre": "PAR-V-06",
          "resultado": "V",
          "caravana_cria": "PAR-C-06",
          "sexo": "H",
          "peso": "34",
          "raza": "",
          "pelaje": "Colorado",
          "fecha_nacimiento": "26/09/2026",
          "fuera_de_orden": ""
        },
        {
          "id": "7",
          "caravana_madre": "PAR-V-07",
          "resultado": "V",
          "caravana_cria": "PAR-C-07",
          "sexo": "M",
          "peso": "35",
          "raza": "",
          "pelaje": "",
          "fecha_nacimiento": "27/09/2026",
          "fuera_de_orden": ""
        },
        {
          "id": "8",
          "caravana_madre": "PAR-V-08",
          "resultado": "V",
          "caravana_cria": "PAR-C-08",
          "sexo": "H",
          "peso": "36",
          "raza": "Angus",
          "pelaje": "Negro",
          "fecha_nacimiento": "28/09/2026",
          "fuera_de_orden": ""
        },
        {
          "id": "9",
          "caravana_madre": "PAR-V-09",
          "resultado": "V",
          "caravana_cria": "PAR-C-09",
          "sexo": "M",
          "peso": "28",
          "raza": "",
          "pelaje": "Colorado",
          "fecha_nacimiento": "20/09/2026",
          "fuera_de_orden": ""
        },
        {
          "id": "10",
          "caravana_madre": "PAR-V-10",
          "resultado": "V",
          "caravana_cria": "PAR-C-10",
          "sexo": "H",
          "peso": "29",
          "raza": "",
          "pelaje": "",
          "fecha_nacimiento": "21/09/2026",
          "fuera_de_orden": ""
        },
        {
          "id": "11",
          "caravana_madre": "PAR-V-11",
          "resultado": "V",
          "caravana_cria": "PAR-C-11",
          "sexo": "M",
          "peso": "30",
          "raza": "",
          "pelaje": "",
          "fecha_nacimiento": "22/09/2026",
          "fuera_de_orden": ""
        },
        {
          "id": "12",
          "caravana_madre": "PAR-V-12",
          "resultado": "M",
          "caravana_cria": "",
          "sexo": "",
          "peso": "",
          "raza": "",
          "pelaje": "",
          "fecha_nacimiento": "25/09/2026",
          "fuera_de_orden": ""
        },
        {
          "id": "13",
          "caravana_madre": "PAR-V-13",
          "resultado": "V",
          "caravana_cria": "PAR-C-13",
          "sexo": "M",
          "peso": "32",
          "raza": "",
          "pelaje": "",
          "fecha_nacimiento": "24/09/2026",
          "fuera_de_orden": ""
        },
        {
          "id": "14",
          "caravana_madre": "PAR-V-14",
          "resultado": "V",
          "caravana_cria": "PAR-C-14",
          "sexo": "H",
          "peso": "33",
          "raza": "",
          "pelaje": "",
          "fecha_nacimiento": "25/09/2026",
          "fuera_de_orden": ""
        },
        {
          "id": "15",
          "caravana_madre": "PAR-V-15",
          "resultado": "V",
          "caravana_cria": "PAR-C-15",
          "sexo": "M",
          "peso": "34",
          "raza": "",
          "pelaje": "Colorado",
          "fecha_nacimiento": "26/09/2026",
          "fuera_de_orden": ""
        },
        {
          "id": "16",
          "caravana_madre": "PAR-V-16",
          "resultado": "V",
          "caravana_cria": "PAR-C-16",
          "sexo": "H",
          "peso": "35",
          "raza": "Angus",
          "pelaje": "Negro",
          "fecha_nacimiento": "27/09/2026",
          "fuera_de_orden": ""
        },
        {
          "id": "17",
          "caravana_madre": "PAR-V-17",
          "resultado": "V",
          "caravana_cria": "PAR-C-17",
          "sexo": "M",
          "peso": "36",
          "raza": "",
          "pelaje": "",
          "fecha_nacimiento": "28/09/2026",
          "fuera_de_orden": ""
        },
        {
          "id": "18",
          "caravana_madre": "PAR-V-18",
          "resultado": "V",
          "caravana_cria": "PAR-C-18",
          "sexo": "H",
          "peso": "28",
          "raza": "",
          "pelaje": "Colorado",
          "fecha_nacimiento": "20/09/2026",
          "fuera_de_orden": ""
        },
        {
          "id": "19",
          "caravana_madre": "PAR-V-19",
          "resultado": "V",
          "caravana_cria": "PAR-C-19",
          "sexo": "M",
          "peso": "29",
          "raza": "",
          "pelaje": "",
          "fecha_nacimiento": "21/09/2026",
          "fuera_de_orden": ""
        },
        {
          "id": "20",
          "caravana_madre": "PAR-V-20",
          "resultado": "V",
          "caravana_cria": "PAR-C-20",
          "sexo": "H",
          "peso": "30",
          "raza": "Angus",
          "pelaje": "Negro",
          "fecha_nacimiento": "22/09/2026",
          "fuera_de_orden": ""
        }
      ]
    },
    {
      "fileName": "par01_02_orden_completa_hoja_2_de_2.png",
      "metadata": {
        "orden_paricion": "PA-20260929-0001",
        "fecha_recorrida": "28/09/2026",
        "lote": "Varios",
        "responsable": "Recorredor de prueba",
        "hoja_numero": 2,
        "hoja_total": 2
      },
      "rows": [
        {
          "id": "1",
          "caravana_madre": "PAR-V-31",
          "resultado": "V",
          "caravana_cria": "PAR-C-31",
          "sexo": "H",
          "peso": "29",
          "raza": "Brangus",
          "pelaje": "Colorado",
          "fecha_nacimiento": "28/09/2026",
          "fuera_de_orden": ""
        },
        {
          "id": "2",
          "caravana_madre": "PAR-V-32",
          "resultado": "V",
          "caravana_cria": "PAR-C-32",
          "sexo": "M",
          "peso": "33",
          "raza": "",
          "pelaje": "",
          "fecha_nacimiento": "28/09/2026",
          "fuera_de_orden": ""
        },
        {
          "id": "3",
          "caravana_madre": "PAR-V-33",
          "resultado": "M",
          "caravana_cria": "",
          "sexo": "",
          "peso": "",
          "raza": "",
          "pelaje": "",
          "fecha_nacimiento": "27/09/2026",
          "fuera_de_orden": ""
        }
      ]
    }
  ],
};

export const PAR01_SHEET_CASES: SimulationPreset[] = [
  PAR01_WHOLE_ORDER,
  sheetCase(
    "🟢 03 · Orden parcial (6 de 23)",
    "Primera recorrida de PA-20260929-0001: seis vientres parieron.",
    {
      "orden_paricion": "PA-20260929-0001",
      "fecha_recorrida": "28/09/2026",
      "lote": "Varios",
      "responsable": "Recorredor de prueba",
      "hoja_numero": 1,
      "hoja_total": 2
    },
    [
      {
        "id": "1",
        "caravana_madre": "PAR-V-01",
        "resultado": "V",
        "caravana_cria": "PAR-C-01",
        "sexo": "M",
        "peso": "31",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "21/09/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "2",
        "caravana_madre": "PAR-V-02",
        "resultado": "V",
        "caravana_cria": "PAR-C-02",
        "sexo": "H",
        "peso": "32",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "22/09/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "3",
        "caravana_madre": "PAR-V-03",
        "resultado": "V",
        "caravana_cria": "PAR-C-03",
        "sexo": "M",
        "peso": "33",
        "raza": "",
        "pelaje": "Colorado",
        "fecha_nacimiento": "23/09/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "4",
        "caravana_madre": "PAR-V-04",
        "resultado": "V",
        "caravana_cria": "PAR-C-04",
        "sexo": "H",
        "peso": "34",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "24/09/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "5",
        "caravana_madre": "PAR-V-05",
        "resultado": "V",
        "caravana_cria": "PAR-C-05",
        "sexo": "M",
        "peso": "35",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "25/09/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "6",
        "caravana_madre": "PAR-V-06",
        "resultado": "V",
        "caravana_cria": "PAR-C-06",
        "sexo": "H",
        "peso": "36",
        "raza": "",
        "pelaje": "Colorado",
        "fecha_nacimiento": "26/09/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "7",
        "caravana_madre": "PAR-V-07",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "8",
        "caravana_madre": "PAR-V-08",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "9",
        "caravana_madre": "PAR-V-09",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "10",
        "caravana_madre": "PAR-V-10",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "11",
        "caravana_madre": "PAR-V-11",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "12",
        "caravana_madre": "PAR-V-12",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "13",
        "caravana_madre": "PAR-V-13",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "14",
        "caravana_madre": "PAR-V-14",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "15",
        "caravana_madre": "PAR-V-15",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "16",
        "caravana_madre": "PAR-V-16",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "17",
        "caravana_madre": "PAR-V-17",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "18",
        "caravana_madre": "PAR-V-18",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "19",
        "caravana_madre": "PAR-V-19",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "20",
        "caravana_madre": "PAR-V-20",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      }
    ],
  ),
  sheetCase(
    "04 · Resultados mixtos (V · NM · M)",
    "Reimpresión de pendientes: partos, un nacido muerto, un muerto al pie y una cría sin peso.",
    {
      "orden_paricion": "PA-20260929-0001",
      "fecha_recorrida": "28/09/2026",
      "lote": "Varios",
      "responsable": "Recorredor de prueba",
      "hoja_numero": 1,
      "hoja_total": 1
    },
    [
      {
        "id": "1",
        "caravana_madre": "PAR-V-07",
        "resultado": "V",
        "caravana_cria": "PAR-C-07",
        "sexo": "M",
        "peso": "34",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "28/09/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "2",
        "caravana_madre": "PAR-V-08",
        "resultado": "NM",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "28/09/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "3",
        "caravana_madre": "PAR-V-09",
        "resultado": "M",
        "caravana_cria": "",
        "sexo": "H",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "27/09/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "4",
        "caravana_madre": "PAR-V-10",
        "resultado": "V",
        "caravana_cria": "PAR-C-10",
        "sexo": "H",
        "peso": "31",
        "raza": "Hereford",
        "pelaje": "Pampa",
        "fecha_nacimiento": "28/09/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "5",
        "caravana_madre": "PAR-V-11",
        "resultado": "V",
        "caravana_cria": "PAR-C-11",
        "sexo": "M",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "28/09/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "6",
        "caravana_madre": "PAR-V-12",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "7",
        "caravana_madre": "PAR-V-13",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "8",
        "caravana_madre": "PAR-V-14",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "9",
        "caravana_madre": "PAR-V-15",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "10",
        "caravana_madre": "PAR-V-16",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "11",
        "caravana_madre": "PAR-V-17",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "12",
        "caravana_madre": "PAR-V-18",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "13",
        "caravana_madre": "PAR-V-19",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "14",
        "caravana_madre": "PAR-V-20",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "15",
        "caravana_madre": "PAR-V-31",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "16",
        "caravana_madre": "PAR-V-32",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "17",
        "caravana_madre": "PAR-V-33",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      }
    ],
  ),
  sheetCase(
    "05 · Parto fuera de la orden",
    "PAR-V-37 en una fila libre con «Fuera de orden» marcada: se agrega a la orden.",
    {
      "orden_paricion": "PA-20260929-0001",
      "fecha_recorrida": "28/09/2026",
      "lote": "Varios",
      "responsable": "Recorredor de prueba",
      "hoja_numero": 1,
      "hoja_total": 1
    },
    [
      {
        "id": "1",
        "caravana_madre": "PAR-V-12",
        "resultado": "V",
        "caravana_cria": "PAR-C-12",
        "sexo": "H",
        "peso": "30",
        "raza": "",
        "pelaje": "Colorado",
        "fecha_nacimiento": "28/09/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "2",
        "caravana_madre": "PAR-V-13",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "3",
        "caravana_madre": "PAR-V-14",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "4",
        "caravana_madre": "PAR-V-15",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "5",
        "caravana_madre": "PAR-V-16",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "6",
        "caravana_madre": "PAR-V-17",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "7",
        "caravana_madre": "PAR-V-18",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "8",
        "caravana_madre": "PAR-V-19",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "9",
        "caravana_madre": "PAR-V-20",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "10",
        "caravana_madre": "PAR-V-31",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "11",
        "caravana_madre": "PAR-V-32",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "12",
        "caravana_madre": "PAR-V-33",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "13",
        "caravana_madre": "PAR-V-37",
        "resultado": "V",
        "caravana_cria": "PAR-C-37",
        "sexo": "H",
        "peso": "32",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "27/09/2026",
        "fuera_de_orden": "X"
      }
    ],
  ),
  sheetCase(
    "06 · Código con letra O",
    "El código se lee PA-2O26O929-OOO1 y se resuelve a PA-20260929-0001.",
    {
      "orden_paricion": "PA-2O26O929-OOO1",
      "fecha_recorrida": "28/09/2026",
      "lote": "Varios",
      "responsable": "Recorredor de prueba",
      "hoja_numero": 1,
      "hoja_total": 1
    },
    [
      {
        "id": "1",
        "caravana_madre": "PAR-V-13",
        "resultado": "V",
        "caravana_cria": "PAR-C-13",
        "sexo": "M",
        "peso": "33",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "28/09/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "2",
        "caravana_madre": "PAR-V-14",
        "resultado": "V",
        "caravana_cria": "PAR-C-14",
        "sexo": "H",
        "peso": "33",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "28/09/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "3",
        "caravana_madre": "PAR-V-15",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "4",
        "caravana_madre": "PAR-V-16",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "5",
        "caravana_madre": "PAR-V-17",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "6",
        "caravana_madre": "PAR-V-18",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "7",
        "caravana_madre": "PAR-V-19",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "8",
        "caravana_madre": "PAR-V-20",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "9",
        "caravana_madre": "PAR-V-31",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "10",
        "caravana_madre": "PAR-V-32",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "11",
        "caravana_madre": "PAR-V-33",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      }
    ],
  ),
  sheetCase(
    "07 · Orden inexistente",
    "PA-20260929-0099: nadie la emitió → BIRTH_ORDER_NOT_FOUND.",
    {
      "orden_paricion": "PA-20260929-0099",
      "fecha_recorrida": "28/09/2026",
      "lote": "Varios",
      "responsable": "Recorredor de prueba",
      "hoja_numero": 1,
      "hoja_total": 1
    },
    [
      {
        "id": "1",
        "caravana_madre": "PAR-V-15",
        "resultado": "V",
        "caravana_cria": "PAR-C-15",
        "sexo": "H",
        "peso": "30",
        "raza": "",
        "pelaje": "Colorado",
        "fecha_nacimiento": "28/09/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "2",
        "caravana_madre": "PAR-V-16",
        "resultado": "V",
        "caravana_cria": "PAR-C-16",
        "sexo": "H",
        "peso": "30",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "28/09/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "3",
        "caravana_madre": "PAR-V-17",
        "resultado": "V",
        "caravana_cria": "PAR-C-17",
        "sexo": "H",
        "peso": "30",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "28/09/2026",
        "fuera_de_orden": ""
      }
    ],
  ),
  sheetCase(
    "08 · En blanco, sin orden",
    "Llenada a mano sin código: al confirmar se crea una orden registrada.",
    {
      "orden_paricion": "",
      "fecha_recorrida": "28/09/2026",
      "lote": "Lote Testing Parición",
      "responsable": "Anthony Laverde",
      "hoja_numero": 1,
      "hoja_total": 1
    },
    [
      {
        "id": "1",
        "caravana_madre": "PAR-V-21",
        "resultado": "V",
        "caravana_cria": "PAR-C-21",
        "sexo": "M",
        "peso": "35",
        "raza": "Angus",
        "pelaje": "Negro",
        "fecha_nacimiento": "26/09/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "2",
        "caravana_madre": "PAR-V-22",
        "resultado": "V",
        "caravana_cria": "PAR-C-22",
        "sexo": "H",
        "peso": "30",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "27/09/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "3",
        "caravana_madre": "PAR-V-23",
        "resultado": "V",
        "caravana_cria": "PAR-C-23",
        "sexo": "M",
        "peso": "",
        "raza": "Braford",
        "pelaje": "Colorado",
        "fecha_nacimiento": "27/09/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "4",
        "caravana_madre": "PAR-V-24",
        "resultado": "NM",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "28/09/2026",
        "fuera_de_orden": ""
      }
    ],
  ),
  sheetCase(
    "🔴 09 · Un error por fila",
    "Resultado sin marcar, dos casillas, sin fecha, fecha futura, caravana usada, sexo ilegible, raza nueva y madre inexistente.",
    {
      "orden_paricion": "",
      "fecha_recorrida": "28/09/2026",
      "lote": "Lote Testing Parición",
      "responsable": "Anthony Laverde",
      "hoja_numero": 1,
      "hoja_total": 1
    },
    [
      {
        "id": "1",
        "caravana_madre": "PAR-V-25",
        "resultado": "",
        "caravana_cria": "PAR-C-25",
        "sexo": "M",
        "peso": "31",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "27/09/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "2",
        "caravana_madre": "PAR-V-26",
        "resultado": "V, M",
        "caravana_cria": "PAR-C-26",
        "sexo": "H",
        "peso": "30",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "27/09/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "3",
        "caravana_madre": "PAR-V-27",
        "resultado": "V",
        "caravana_cria": "PAR-C-27",
        "sexo": "M",
        "peso": "32",
        "raza": "",
        "pelaje": "Colorado",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "4",
        "caravana_madre": "PAR-V-28",
        "resultado": "V",
        "caravana_cria": "PAR-C-28",
        "sexo": "H",
        "peso": "29",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "15/12/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "5",
        "caravana_madre": "PAR-V-29",
        "resultado": "V",
        "caravana_cria": "PAR-C-USADA",
        "sexo": "M",
        "peso": "34",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "27/09/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "6",
        "caravana_madre": "PAR-V-30",
        "resultado": "V",
        "caravana_cria": "PAR-C-30",
        "sexo": "MH",
        "peso": "33",
        "raza": "",
        "pelaje": "Colorado",
        "fecha_nacimiento": "27/09/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "7",
        "caravana_madre": "PAR-V-34",
        "resultado": "V",
        "caravana_cria": "PAR-C-34",
        "sexo": "H",
        "peso": "30",
        "raza": "Wagyu",
        "pelaje": "",
        "fecha_nacimiento": "27/09/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "8",
        "caravana_madre": "PAR-V-35",
        "resultado": "V",
        "caravana_cria": "PAR-C-35",
        "sexo": "H",
        "peso": "30",
        "raza": "Angus",
        "pelaje": "Pampa",
        "fecha_nacimiento": "27/09/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "9",
        "caravana_madre": "PAR-V-99",
        "resultado": "V",
        "caravana_cria": "PAR-C-99",
        "sexo": "M",
        "peso": "31",
        "raza": "",
        "pelaje": "Colorado",
        "fecha_nacimiento": "27/09/2026",
        "fuera_de_orden": ""
      }
    ],
  ),
  sheetCase(
    "🟡 10 · Nacido muerto con caravana",
    "La caravana escrita en un nacido muerto (NM) se ignora con aviso.",
    {
      "orden_paricion": "",
      "fecha_recorrida": "28/09/2026",
      "lote": "Lote Testing Parición",
      "responsable": "Anthony Laverde",
      "hoja_numero": 1,
      "hoja_total": 1
    },
    [
      {
        "id": "1",
        "caravana_madre": "PAR-V-35",
        "resultado": "NM",
        "caravana_cria": "PAR-C-35",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "28/09/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "2",
        "caravana_madre": "PAR-V-36",
        "resultado": "V",
        "caravana_cria": "PAR-C-36",
        "sexo": "H",
        "peso": "30",
        "raza": "",
        "pelaje": "Colorado",
        "fecha_nacimiento": "28/09/2026",
        "fuera_de_orden": ""
      }
    ],
  ),
  sheetCase(
    "🔴 14 · Fuera de orden sin marcar",
    "PAR-V-30 en una fila libre sin la casilla → OUTSIDE_ORDER_NOT_DECLARED.",
    {
      "orden_paricion": "PA-20260929-0001",
      "fecha_recorrida": "28/09/2026",
      "lote": "Varios",
      "responsable": "Recorredor de prueba",
      "hoja_numero": 1,
      "hoja_total": 1
    },
    [
      {
        "id": "1",
        "caravana_madre": "PAR-V-13",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "2",
        "caravana_madre": "PAR-V-14",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "3",
        "caravana_madre": "PAR-V-15",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "4",
        "caravana_madre": "PAR-V-16",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "5",
        "caravana_madre": "PAR-V-17",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "6",
        "caravana_madre": "PAR-V-18",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "7",
        "caravana_madre": "PAR-V-19",
        "resultado": "V",
        "caravana_cria": "PAR-C-19",
        "sexo": "M",
        "peso": "33",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "28/09/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "8",
        "caravana_madre": "PAR-V-20",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "9",
        "caravana_madre": "PAR-V-31",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "10",
        "caravana_madre": "PAR-V-32",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "11",
        "caravana_madre": "PAR-V-33",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "12",
        "caravana_madre": "PAR-V-30",
        "resultado": "V",
        "caravana_cria": "PAR-C-30",
        "sexo": "H",
        "peso": "31",
        "raza": "",
        "pelaje": "Colorado",
        "fecha_nacimiento": "27/09/2026",
        "fuera_de_orden": ""
      }
    ],
  ),
  sheetCase(
    "18 · NM y M en filas vecinas",
    "Planilla en blanco: nacido muerto (se imputa a la madre) y muerto al pie (al ternero) uno debajo del otro, más un parto.",
    {
      "orden_paricion": "",
      "fecha_recorrida": "05/10/2026",
      "lote": "Lote Testing Parición",
      "responsable": "Anthony Laverde",
      "hoja_numero": 1,
      "hoja_total": 1
    },
    [
      {
        "id": "1",
        "caravana_madre": "PAR-V-25",
        "resultado": "NM",
        "caravana_cria": "",
        "sexo": "H",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "04/10/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "2",
        "caravana_madre": "PAR-V-26",
        "resultado": "M",
        "caravana_cria": "",
        "sexo": "M",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "04/10/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "3",
        "caravana_madre": "PAR-V-27",
        "resultado": "V",
        "caravana_cria": "PAR-C-27",
        "sexo": "H",
        "peso": "31",
        "raza": "",
        "pelaje": "Colorado",
        "fecha_nacimiento": "04/10/2026",
        "fuera_de_orden": ""
      }
    ],
  ),
  sheetCase(
    "🟡 19 · N con FPP futura",
    "PAR-V-20 marcada «No parió» antes de su fecha probable: se guarda con el aviso OVERDUE_BEFORE_DUE.",
    {
      "orden_paricion": "PA-20260929-0001",
      "fecha_recorrida": "05/10/2026",
      "lote": "Varios",
      "responsable": "Recorredor de prueba",
      "hoja_numero": 1,
      "hoja_total": 1
    },
    [
      {
        "id": "1",
        "caravana_madre": "PAR-V-15",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "2",
        "caravana_madre": "PAR-V-16",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "3",
        "caravana_madre": "PAR-V-17",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "4",
        "caravana_madre": "PAR-V-18",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "5",
        "caravana_madre": "PAR-V-19",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "6",
        "caravana_madre": "PAR-V-20",
        "resultado": "N",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "05/10/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "7",
        "caravana_madre": "PAR-V-31",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "8",
        "caravana_madre": "PAR-V-32",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "9",
        "caravana_madre": "PAR-V-33",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      }
    ],
  ),
  sheetCase(
    "🔁 15 · Recarga · día 1",
    "PA-20260929-0002 reimpresa (PAR-V-41 con «N 02/10» gris): PAR-V-43 parió. Cargar 15 → 16 → 17 sobre un seeder recién corrido.",
    {
      "orden_paricion": "PA-20260929-0002",
      "fecha_recorrida": "03/10/2026",
      "lote": "Lote Testing Parición",
      "responsable": "Recorredor de prueba",
      "hoja_numero": 1,
      "hoja_total": 1
    },
    [
      {
        "id": "1",
        "caravana_madre": "PAR-V-41",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "2",
        "caravana_madre": "PAR-V-42",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "3",
        "caravana_madre": "PAR-V-43",
        "resultado": "V",
        "caravana_cria": "PAR-C-43",
        "sexo": "H",
        "peso": "30",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "03/10/2026",
        "fuera_de_orden": ""
      }
    ],
  ),
  sheetCase(
    "🔁 16 · Recarga · día 2 con N",
    "La misma hoja: PAR-V-43 ya registrada se saltea; PAR-V-42 marcada N queda con parto vencido.",
    {
      "orden_paricion": "PA-20260929-0002",
      "fecha_recorrida": "04/10/2026",
      "lote": "Lote Testing Parición",
      "responsable": "Recorredor de prueba",
      "hoja_numero": 1,
      "hoja_total": 1
    },
    [
      {
        "id": "1",
        "caravana_madre": "PAR-V-41",
        "resultado": "",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "",
        "fuera_de_orden": ""
      },
      {
        "id": "2",
        "caravana_madre": "PAR-V-42",
        "resultado": "N",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "04/10/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "3",
        "caravana_madre": "PAR-V-43",
        "resultado": "V",
        "caravana_cria": "PAR-C-43",
        "sexo": "H",
        "peso": "30",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "03/10/2026",
        "fuera_de_orden": ""
      }
    ],
  ),
  sheetCase(
    "🔁 17 · Recarga · día 3 N y V",
    "La misma hoja: PAR-V-42 (N, V) y PAR-V-41 (NM) cierran sus alertas; la orden queda ejecutada.",
    {
      "orden_paricion": "PA-20260929-0002",
      "fecha_recorrida": "05/10/2026",
      "lote": "Lote Testing Parición",
      "responsable": "Recorredor de prueba",
      "hoja_numero": 1,
      "hoja_total": 1
    },
    [
      {
        "id": "1",
        "caravana_madre": "PAR-V-41",
        "resultado": "NM",
        "caravana_cria": "",
        "sexo": "",
        "peso": "",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "05/10/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "2",
        "caravana_madre": "PAR-V-42",
        "resultado": "N, V",
        "caravana_cria": "PAR-C-42",
        "sexo": "M",
        "peso": "34",
        "raza": "",
        "pelaje": "Colorado",
        "fecha_nacimiento": "05/10/2026",
        "fuera_de_orden": ""
      },
      {
        "id": "3",
        "caravana_madre": "PAR-V-43",
        "resultado": "V",
        "caravana_cria": "PAR-C-43",
        "sexo": "H",
        "peso": "30",
        "raza": "",
        "pelaje": "",
        "fecha_nacimiento": "03/10/2026",
        "fuera_de_orden": ""
      }
    ],
  ),
];
