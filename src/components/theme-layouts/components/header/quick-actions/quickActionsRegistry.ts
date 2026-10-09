import { HeaderQuickAction } from './types';

export const QUICK_ACTIONS_REGISTRY: HeaderQuickAction[] = [
  // ── Hacienda & Identificación ─────────────────────────
  {
    id: 'qa-caravan',
    category: 'Hacienda',
    title: 'Nueva Caravana',
    subtitle: 'Registrar animal o caravana RFID',
    icon: 'heroicons-outline:tag',
    route: '/caravans',
    color: '#6366f1',
    shortcut: 'C',
  },
  {
    id: 'qa-batch',
    category: 'Hacienda',
    title: 'Nuevo Lote / Tropa',
    subtitle: 'Crear lote o rodeo operativo',
    icon: 'heroicons-outline:view-columns',
    route: '/batches',
    color: '#0ea5e9',
    shortcut: 'L',
  },
  {
    id: 'qa-entry',
    category: 'Hacienda',
    title: 'Orden de Ingreso',
    subtitle: 'Recepción con DTe / Guía de traslado',
    icon: 'heroicons-outline:arrow-down-tray',
    route: '/entry-orders',
    color: '#10b981',
    shortcut: 'I',
  },

  // ── Digitalización & Campo (OCR) ──────────────────────
  {
    id: 'qa-scan-ocr',
    category: 'Digitalización',
    title: 'Escanear Planilla (OCR)',
    subtitle: 'Digitalizar con IA (CACT, LSER, DEST...)',
    icon: 'heroicons-outline:camera',
    route: '/work-templates/scan',
    color: '#8b5cf6',
    shortcut: 'O',
  },
  {
    id: 'qa-templates',
    category: 'Digitalización',
    title: 'Plantillas de Manga',
    subtitle: 'Imprimir o descargar planillas en blanco',
    icon: 'heroicons-outline:document-text',
    route: '/work-templates',
    color: '#a855f7',
  },

  // ── Reproducción & Sanidad ────────────────────────────
  {
    id: 'qa-birth',
    category: 'Reproducción',
    title: 'Registrar Parto',
    subtitle: 'Alta de cría y vinculación de vientre',
    icon: 'heroicons-outline:sparkles',
    route: '/birth-orders/new',
    color: '#f43f5e',
    shortcut: 'P',
  },
  {
    id: 'qa-tacto',
    category: 'Reproducción',
    title: 'Control de Tacto',
    subtitle: 'Diagnóstico de preñez / vacía',
    icon: 'heroicons-outline:clipboard-document-check',
    route: '/gestation/tacto',
    color: '#ec4899',
    shortcut: 'T',
  },

  // ── Movimientos & Logística ───────────────────────────
  {
    id: 'qa-transfer',
    category: 'Movimientos',
    title: 'Traslado de Potrero',
    subtitle: 'Movimiento de hacienda entre potreros',
    icon: 'heroicons-outline:arrows-right-left',
    route: '/transfer-orders',
    color: '#f59e0b',
    shortcut: 'M',
  },
];
