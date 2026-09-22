import { useCallback, useMemo, useRef, useState } from 'react';
import axiosInstance from '@/utils/axios';
import type { Cact01Metadata, Cact01Page, Cact01Row } from '../components/scan/types';

export const CACT01_CODE = 'CACT-01';
const MANUAL_PAGE_KEY = 'manual';

const today = (): string => new Date().toISOString().slice(0, 10);

export const emptyCact01Metadata = (): Cact01Metadata => ({
  actividad_origen: '',
  actividad_destino: '',
  lote_origen: '',
  lote_destino: '',
  fecha_movimiento: today(),
  sistema_manejo: '',
  total_cabezas: '',
  peso_total: '',
  responsable: '',
  observaciones: '',
});

/**
 * Batch names come off paper, so the comparison has to survive the ways a scan mangles
 * them: casing, stray spaces and — the one that actually bites — accents. A sheet read
 * as "RECRIA NORTE" has to meet a batch stored as "Recría Norte", or every destination
 * comes back as "create a new batch" and the source is never found at all.
 *
 * Used both as the key that joins rows to destinations and as the yardstick for matching
 * a name against the batches of the company, so the two can never drift apart.
 */
export const normalizeDestinationKey = (raw: unknown): string =>
  String(raw ?? '')
    .normalize('NFD')
    // Strip combining marks: á → a, ñ → n.
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();

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

/** The box is marked, not written, so the reading comes back as prose more often than not. */
const normalizeManagement = (raw: unknown): string => {
  const value = String(raw ?? '').trim().toUpperCase();

  if (value.includes('CORRAL')) return 'CORRAL';
  if (value.includes('PASTURA') || value.includes('CAMPO') || value.includes('EXTENSIV')) return 'PASTURA';

  return '';
};

const sameText = (a: string, b: string): boolean => a.trim().toLowerCase() === b.trim().toLowerCase();

interface ExtractedCell {
  value?: unknown;
  confidence?: number;
}

/** Shape of POST /work-templates/identify used by CACT-01. */
export interface Cact01IdentifyResponse {
  identified_template?: { code?: string; title?: string } | null;
  context?: Record<string, unknown>;
  data?: { mapped_rows?: Record<string, ExtractedCell | undefined>[] }[];
}

interface RequestError {
  response?: { data?: { message?: string } };
  message?: string;
}

let pageSequence = 0;

/** Turns a POST /work-templates/identify response of a CACT-01 page into a page of the sheet. */
export const pageFromIdentifyResponse = (
  response: Cact01IdentifyResponse,
  fileName: string,
  previewUrl: string | null
): Cact01Page => {
  const context = response?.context ?? {};
  const mappedRows = response?.data?.[0]?.mapped_rows ?? [];
  pageSequence += 1;
  const key = `page-${Date.now()}-${pageSequence}`;

  const headerDestination = normalizeDestinationKey(context.lote_destino);

  return {
    key,
    fileName,
    previewUrl,
    hojaNumero: toNumberOrNull(context.hoja_numero),
    hojaTotal: toNumberOrNull(context.hoja_total),
    metadata: {
      actividad_origen: String(context.actividad_origen ?? '').trim(),
      actividad_destino: String(context.actividad_destino ?? '').trim(),
      lote_origen: String(context.lote_origen ?? '').trim(),
      lote_destino: String(context.lote_destino ?? '').trim(),
      fecha_movimiento: normalizeDate(String(context.fecha_movimiento ?? '')),
      sistema_manejo: normalizeManagement(context.sistema_manejo),
      total_cabezas: String(context.total_cabezas ?? '').trim(),
      peso_total: cleanWeight(context.peso_total),
      responsable: String(context.responsable ?? '').trim(),
      observaciones: String(context.observaciones ?? '').trim(),
    },
    rows: mappedRows
      .map((r, idx) => {
        // The rule that makes one template cover both ways of working: the row cell
        // wins, the header is the default.
        const rowDestination = normalizeDestinationKey(r.lote_destino?.value);

        return {
          id: `${key}-${idx}`,
          pageKey: key,
          caravana: String(r.caravana?.value ?? '').trim(),
          peso_actual: cleanWeight(r.peso_actual?.value),
          sexo: String(r.sexo?.value ?? '').trim().toUpperCase(),
          categoria: String(r.categoria?.value ?? '').trim(),
          dientes: String(r.dientes?.value ?? '').trim(),
          destination_key: rowDestination || headerDestination,
          observations: String(r.observations?.value ?? '').trim(),
        };
      })
      .filter((r) => r.caravana !== ''),
  };
};

export type AddPageOutcome = 'added' | 'pending_mismatch' | 'wrong_template';

/**
 * State of a CACT-01 load: one change of activity spread across several scanned pages
 * that are confirmed together, so a single source batch is used and the all-or-nothing
 * rule covers every page.
 */
export function useCact01Pages() {
  const [pages, setPagesState] = useState<Cact01Page[]>([]);
  const pagesRef = useRef<Cact01Page[]>([]);
  const [manualRows, setManualRows] = useState<Cact01Row[]>([]);
  const [metadata, setMetadata] = useState<Cact01Metadata>(emptyCact01Metadata);
  const [sourceBatchId, setSourceBatchId] = useState<number | null>(null);
  const [pendingPage, setPendingPage] = useState<Cact01Page | null>(null);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  /** Pages are mirrored in a ref so a page added right after a reset compares against the new state. */
  const setPages = useCallback((update: (prev: Cact01Page[]) => Cact01Page[]) => {
    pagesRef.current = update(pagesRef.current);
    setPagesState(pagesRef.current);
  }, []);

  const appendPage = useCallback(
    (page: Cact01Page) => {
      if (pagesRef.current.length === 0) {
        setMetadata(page.metadata);
      }
      setPages((prev) => [...prev, page]);
    },
    [setPages]
  );

  /** First page sets the header; later pages must belong to the same movement. */
  const addPage = useCallback(
    (page: Cact01Page): AddPageOutcome => {
      setPageError(null);
      const first = pagesRef.current[0];

      if (
        first &&
        (!sameText(page.metadata.lote_origen, first.metadata.lote_origen) ||
          page.metadata.fecha_movimiento !== first.metadata.fecha_movimiento)
      ) {
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
        const response = await axiosInstance.post<Cact01IdentifyResponse>('/work-templates/identify', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 210000,
        });
        const code = response.data?.identified_template?.code;

        if (code !== CACT01_CODE) {
          setPageError(`La hoja "${file.name}" no es una planilla CACT-01${code ? ` (se detectó ${code})` : ''}.`);
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
  const rows = useMemo<Cact01Row[]>(() => {
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
    (id: string, field: keyof Cact01Row, value: string) => {
      const patch = (list: Cact01Row[]) => list.map((r) => (r.id === id ? { ...r, [field]: value } : r));
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
        peso_actual: '',
        sexo: '',
        categoria: '',
        dientes: '',
        destination_key: '',
        observations: '',
      },
    ]);
  }, []);

  const setMetadataField = useCallback(<K extends keyof Cact01Metadata>(field: K, value: Cact01Metadata[K]) => {
    setMetadata((prev) => ({ ...prev, [field]: value }));
  }, []);

  const reset = useCallback(() => {
    setPages(() => []);
    setManualRows([]);
    setMetadata(emptyCact01Metadata());
    setSourceBatchId(null);
    setPendingPage(null);
    setPageError(null);
  }, [setPages]);

  /** Starts a new load with its first page (the file dropped on the scanner). */
  const startWith = useCallback(
    (page: Cact01Page) => {
      reset();
      appendPage(page);
    },
    [reset, appendPage]
  );

  return {
    pages,
    rows,
    metadata,
    sourceBatchId,
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
    setSourceBatchId,
    setPageError,
    reset,
    startWith,
  };
}

export type Cact01PagesState = ReturnType<typeof useCact01Pages>;
