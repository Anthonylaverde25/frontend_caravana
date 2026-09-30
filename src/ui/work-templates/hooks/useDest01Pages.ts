import { useCallback, useMemo, useRef, useState } from 'react';
import axiosInstance from '@/utils/axios';
import type { Dest01BatchTarget, Dest01DestinationMode, Dest01Metadata, Dest01Page, Dest01Row } from '../components/scan/types';
import { normalizeDestinationKey } from './useCact01Pages';

export const DEST01_CODE = 'DEST-01';
const MANUAL_PAGE_KEY = 'manual';

const today = (): string => new Date().toISOString().slice(0, 10);

export const emptyDest01Metadata = (): Dest01Metadata => ({
  orden_destete: '',
  lote_destete: '',
  sistema_manejo: '',
  fecha_destete: today(),
  tipo_destete: '',
  lote_origen: '',
  responsable: '',
  observaciones: '',
});

export const emptyDest01Target = (): Dest01BatchTarget => ({ mode: 'new', batchId: null, name: '', isConfined: null, touched: false });

/** The header box printed on a per-animal sheet: it names no batch. */
const PER_ANIMAL_BOX = /por\s*animal/i;

/**
 * Whether the sheet names one weaning batch for all its calves or one per calf. The box of the
 * header says "— por animal —" on a per-animal sheet; a blank box with batches written on the rows
 * means the same.
 */
export const destinationModeOfPage = (page: Dest01Page): Dest01DestinationMode =>
  PER_ANIMAL_BOX.test(page.metadata.lote_destete) ||
  (page.metadata.lote_destete.trim() === '' && page.rows.some((r) => r.lote_destino.trim() !== ''))
    ? 'per_animal'
    : 'single';

/** Accepts the DD/MM/YYYY written on the sheet or an ISO date; anything else falls back to today. */
const normalizeDate = (raw?: string | null): string => {
  const clean = String(raw ?? '').replace(/\s*([/\-.])\s*/g, '$1').trim();
  const ymd = clean.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (ymd) return `${ymd[1]}-${ymd[2].padStart(2, '0')}-${ymd[3].padStart(2, '0')}`;
  const dmy = clean.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
  return today();
};

const toNumberOrNull = (raw: unknown): number | null => {
  const value = Number(String(raw ?? '').trim());
  return String(raw ?? '').trim() !== '' && Number.isFinite(value) ? value : null;
};

/** Handwritten weights may come with a comma decimal separator or a trailing unit. */
const cleanWeight = (raw: unknown): string =>
  String(raw ?? '')
    .replace(/kg/i, '')
    .replace(',', '.')
    .trim();

const sameText = (a: string, b: string): boolean => a.trim().toLowerCase() === b.trim().toLowerCase();

interface ExtractedCell {
  value?: unknown;
  confidence?: number;
}

/** Shape of POST /work-templates/identify used by DEST-01. */
export interface Dest01IdentifyResponse {
  identified_template?: { code?: string; title?: string } | null;
  context?: Record<string, unknown>;
  data?: { mapped_rows?: Record<string, ExtractedCell | undefined>[] }[];
}

interface RequestError {
  response?: { data?: { message?: string } };
  message?: string;
}

let pageSequence = 0;

/** Turns a POST /work-templates/identify response of a DEST-01 page into a page of the sheet. */
export const pageFromIdentifyResponse = (
  response: Dest01IdentifyResponse,
  fileName: string,
  previewUrl: string | null
): Dest01Page => {
  const context = response?.context ?? {};
  const mappedRows = response?.data?.[0]?.mapped_rows ?? [];
  pageSequence += 1;
  const key = `page-${Date.now()}-${pageSequence}`;

  return {
    key,
    fileName,
    previewUrl,
    hojaNumero: toNumberOrNull(context.hoja_numero),
    hojaTotal: toNumberOrNull(context.hoja_total),
    metadata: {
      orden_destete: String(context.orden_destete ?? '').trim(),
      lote_destete: String(context.lote_destete ?? '').trim(),
      sistema_manejo: String(context.sistema_manejo ?? '').trim().toUpperCase(),
      fecha_destete: normalizeDate(String(context.fecha_destete ?? '')),
      tipo_destete: String(context.tipo_destete ?? '').trim().toUpperCase(),
      lote_origen: String(context.lote_origen ?? '').trim(),
      responsable: String(context.responsable ?? '').trim(),
      observaciones: String(context.observaciones ?? '').trim(),
    },
    rows: mappedRows
      .map((r, idx) => ({
        id: `${key}-${idx}`,
        pageKey: key,
        caravana: String(r.caravana?.value ?? '').trim(),
        caravana_madre: String(r.caravana_madre?.value ?? '').trim(),
        peso: cleanWeight(r.peso?.value),
        observations: String(r.observations?.value ?? '').trim(),
        cs_nueva: String(r.cs_nueva?.value ?? '').trim().replace(/^[-–—]$/, ''),
        lote_destino: String(r.lote_destino?.value ?? '').trim(),
        manejo: String(r.manejo?.value ?? '').trim().toUpperCase().slice(0, 1),
      }))
      .filter((r) => r.caravana !== ''),
  };
};

export type AddPageOutcome = 'added' | 'pending_mismatch' | 'wrong_template';

/**
 * What a page declares differently from the first one. The one list both decides the mismatch
 * and explains it, so the warning never names a field that agrees.
 */
export const headerDifferences = (page: Dest01Page, first: Dest01Page): string[] => {
  const differences: string[] = [];
  const show = (value: string) => (value ? `"${value}"` : 'nada');

  if (!sameText(page.metadata.lote_destete, first.metadata.lote_destete)) {
    differences.push(`lote ${show(page.metadata.lote_destete)} (hoja 1: ${show(first.metadata.lote_destete)})`);
  }

  if (page.metadata.fecha_destete !== first.metadata.fecha_destete) {
    differences.push(`fecha ${show(page.metadata.fecha_destete)} (hoja 1: ${show(first.metadata.fecha_destete)})`);
  }

  if (!sameText(page.metadata.orden_destete, first.metadata.orden_destete)) {
    differences.push(`orden ${show(page.metadata.orden_destete)} (hoja 1: ${show(first.metadata.orden_destete)})`);
  }

  return differences;
};

/**
 * State of a DEST-01 load: one weaning spread across several scanned pages that are confirmed
 * together, so a single weaning batch is used and the all-or-nothing rule covers every page.
 */
export function useDest01Pages() {
  const [pages, setPagesState] = useState<Dest01Page[]>([]);
  const pagesRef = useRef<Dest01Page[]>([]);
  const [manualRows, setManualRows] = useState<Dest01Row[]>([]);
  const [metadata, setMetadata] = useState<Dest01Metadata>(emptyDest01Metadata);
  const [target, setTarget] = useState<Dest01BatchTarget>(emptyDest01Target);
  const [destinationMode, setDestinationMode] = useState<Dest01DestinationMode>('single');
  /** Per animal: how each batch name written on the rows was resolved, by its normalised key. */
  const [perAnimalTargets, setPerAnimalTargets] = useState<Record<string, Dest01BatchTarget>>({});
  const [pendingPage, setPendingPage] = useState<Dest01Page | null>(null);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  /** Pages are mirrored in a ref so a page added right after a reset compares against the new state. */
  const setPages = useCallback((update: (prev: Dest01Page[]) => Dest01Page[]) => {
    pagesRef.current = update(pagesRef.current);
    setPagesState(pagesRef.current);
  }, []);

  const appendPage = useCallback(
    (page: Dest01Page) => {
      if (pagesRef.current.length === 0) {
        setMetadata(page.metadata);
        setDestinationMode(destinationModeOfPage(page));
      }
      setPages((prev) => [...prev, page]);
    },
    [setPages]
  );

  /** First page sets the header; later pages must belong to the same weaning. */
  const addPage = useCallback(
    (page: Dest01Page): AddPageOutcome => {
      setPageError(null);
      const first = pagesRef.current[0];
      if (first && headerDifferences(page, first).length > 0) {
        setPendingPage(page);
        return 'pending_mismatch';
      }
      appendPage(page);
      return 'added';
    },
    [appendPage]
  );

  const addPageFromFile = useCallback(
    async (file: File): Promise<AddPageOutcome | null> => {
      setIsIdentifying(true);
      setPageError(null);
      const formData = new FormData();
      formData.append('document', file);

      try {
        const response = await axiosInstance.post<Dest01IdentifyResponse>('/work-templates/identify', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 210000,
        });
        const code = response.data?.identified_template?.code;
        if (code !== DEST01_CODE) {
          setPageError(`La hoja "${file.name}" no es una planilla DEST-01${code ? ` (se detectó ${code})` : ''}.`);
          return 'wrong_template';
        }
        return addPage(pageFromIdentifyResponse(response.data, file.name, URL.createObjectURL(file)));
      } catch (err) {
        const error = err as RequestError;
        setPageError(error.response?.data?.message || error.message || 'No se pudo analizar la hoja.');
        return null;
      } finally {
        setIsIdentifying(false);
      }
    },
    [addPage]
  );

  const acceptPendingPage = useCallback(() => {
    if (pendingPage) appendPage(pendingPage);
    setPendingPage(null);
  }, [pendingPage, appendPage]);

  const discardPendingPage = useCallback(() => setPendingPage(null), []);

  const removePage = useCallback(
    (key: string) => {
      setPages((prev) => prev.filter((p) => p.key !== key));
    },
    [setPages]
  );

  /** Rows of every page, in sheet order (page number when written, load order otherwise). */
  const rows = useMemo<Dest01Row[]>(() => {
    const ordered = pages
      .map((page, loadIndex) => ({ page, loadIndex }))
      .sort((a, b) => (a.page.hojaNumero ?? 1000 + a.loadIndex) - (b.page.hojaNumero ?? 1000 + b.loadIndex));
    return [...ordered.flatMap(({ page }) => page.rows), ...manualRows];
  }, [pages, manualRows]);

  const pageLabelByKey = useMemo<Record<string, string>>(() => {
    const labels: Record<string, string> = { [MANUAL_PAGE_KEY]: '—' };
    pages.forEach((page, idx) => {
      labels[page.key] = String(page.hojaNumero ?? idx + 1);
    });
    return labels;
  }, [pages]);

  const missingPages = useMemo<number[]>(() => {
    const total = Math.max(0, ...pages.map((p) => p.hojaTotal ?? 0));
    const present = new Set(pages.map((p) => p.hojaNumero).filter((n): n is number => n !== null));
    return Array.from({ length: total }, (_, i) => i + 1).filter((n) => !present.has(n));
  }, [pages]);

  const updateRow = useCallback(
    (id: string, field: keyof Dest01Row, value: string) => {
      const patch = (list: Dest01Row[]) => list.map((r) => (r.id === id ? { ...r, [field]: value } : r));
      setManualRows(patch);
      setPages((prev) => prev.map((page) => ({ ...page, rows: patch(page.rows) })));
    },
    [setPages]
  );

  const deleteRow = useCallback(
    (id: string) => {
      setManualRows((prev) => prev.filter((r) => r.id !== id));
      setPages((prev) => prev.map((page) => ({ ...page, rows: page.rows.filter((r) => r.id !== id) })));
    },
    [setPages]
  );

  const addRow = useCallback(() => {
    setManualRows((prev) => [
      ...prev,
      {
        id: `manual-${Date.now()}`,
        pageKey: MANUAL_PAGE_KEY,
        caravana: '',
        caravana_madre: '',
        peso: '',
        observations: '',
        cs_nueva: '',
        lote_destino: '',
        manejo: '',
      },
    ]);
  }, []);

  /** Per animal: every distinct batch name written on the rows, with the name as first written. */
  const perAnimalNames = useMemo<{ key: string; name: string; count: number; letters: string[] }[]>(() => {
    const byKey = new Map<string, { key: string; name: string; count: number; letters: string[] }>();

    rows.forEach((row) => {
      const key = normalizeDestinationKey(row.lote_destino);

      if (!key || row.caravana.trim() === '') return;

      const entry = byKey.get(key) ?? { key, name: row.lote_destino.trim(), count: 0, letters: [] };
      entry.count += 1;

      if (row.manejo && !entry.letters.includes(row.manejo)) entry.letters.push(row.manejo);

      byKey.set(key, entry);
    });

    return [...byKey.values()];
  }, [rows]);

  const setPerAnimalTarget = useCallback((key: string, next: Dest01BatchTarget) => {
    setPerAnimalTargets((prev) => ({ ...prev, [key]: next }));
  }, []);

  const setMetadataField = useCallback(<K extends keyof Dest01Metadata>(field: K, value: Dest01Metadata[K]) => {
    setMetadata((prev) => ({ ...prev, [field]: value }));
  }, []);

  const reset = useCallback(() => {
    setPages(() => []);
    setManualRows([]);
    setMetadata(emptyDest01Metadata());
    setTarget(emptyDest01Target());
    setDestinationMode('single');
    setPerAnimalTargets({});
    setPendingPage(null);
    setPageError(null);
  }, [setPages]);

  /** Starts a new load with its first page (the file dropped on the scanner). */
  const startWith = useCallback(
    (page: Dest01Page) => {
      reset();
      appendPage(page);
    },
    [reset, appendPage]
  );

  return {
    pages,
    rows,
    metadata,
    target,
    destinationMode,
    setDestinationMode,
    perAnimalNames,
    perAnimalTargets,
    setPerAnimalTarget,
    pendingPage,
    isIdentifying,
    pageError,
    missingPages,
    pageLabelByKey,
    addPage,
    addPageFromFile,
    acceptPendingPage,
    discardPendingPage,
    removePage,
    updateRow,
    deleteRow,
    addRow,
    setMetadataField,
    setTarget,
    setPageError,
    reset,
    startWith,
  };
}

export type Dest01PagesState = ReturnType<typeof useDest01Pages>;
