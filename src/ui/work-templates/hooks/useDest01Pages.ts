import { useCallback, useMemo, useRef, useState } from 'react';
import axiosInstance from '@/utils/axios';
import type { Dest01BatchTarget, Dest01Metadata, Dest01Page, Dest01Row } from '../components/scan/types';

export const DEST01_CODE = 'DEST-01';
const MANUAL_PAGE_KEY = 'manual';

const today = (): string => new Date().toISOString().slice(0, 10);

export const emptyDest01Metadata = (): Dest01Metadata => ({
  lote_destete: '',
  fecha_destete: today(),
  tipo_destete: '',
  lote_origen: '',
  responsable: '',
  observaciones: '',
});

export const emptyDest01Target = (): Dest01BatchTarget => ({ mode: 'new', batchId: null, name: '', touched: false });

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
      lote_destete: String(context.lote_destete ?? '').trim(),
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
      }))
      .filter((r) => r.caravana !== ''),
  };
};

export type AddPageOutcome = 'added' | 'pending_mismatch' | 'wrong_template';

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
      if (
        first &&
        (!sameText(page.metadata.lote_destete, first.metadata.lote_destete) ||
          page.metadata.fecha_destete !== first.metadata.fecha_destete)
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
      { id: `manual-${Date.now()}`, pageKey: MANUAL_PAGE_KEY, caravana: '', caravana_madre: '', peso: '', observations: '' },
    ]);
  }, []);

  const setMetadataField = useCallback(<K extends keyof Dest01Metadata>(field: K, value: Dest01Metadata[K]) => {
    setMetadata((prev) => ({ ...prev, [field]: value }));
  }, []);

  const reset = useCallback(() => {
    setPages(() => []);
    setManualRows([]);
    setMetadata(emptyDest01Metadata());
    setTarget(emptyDest01Target());
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
