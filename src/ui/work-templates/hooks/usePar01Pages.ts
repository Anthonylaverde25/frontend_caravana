import { useCallback, useMemo, useRef, useState } from 'react';
import axiosInstance from '@/utils/axios';

export const PAR01_CODE = 'PAR-01';

/** The header of a scanned PAR-01 sheet, as read. The round date is informative. */
export interface Par01Metadata {
  orden_paricion: string;
  lote: string;
  fecha_recorrida: string;
  responsable: string;
  observaciones: string;
}

/**
 * One row of the sheet as read, then supervised. `dientes` and `father_id` are not on the paper:
 * the review sets them (0 and the gestation's sire suggestion by default).
 */
export interface Par01Row {
  id: string;
  pageKey: string;
  caravana_madre: string;
  resultado: string;
  caravana_cria: string;
  sexo: string;
  peso: string;
  raza: string;
  fecha_nacimiento: string;
  observations: string;
  dientes: string;
  father_id: string;
  /** 'X' when the "Fuera de orden" box is crossed: a calving the order did not list, declared. */
  fuera_de_orden: string;
}

export interface Par01Page {
  key: string;
  fileName: string;
  previewUrl: string | null;
  hojaNumero: number | null;
  hojaTotal: number | null;
  metadata: Par01Metadata;
  rows: Par01Row[];
}

interface ExtractedCell {
  value?: unknown;
  confidence?: number;
}

export interface Par01IdentifyResponse {
  identified_template?: { code?: string; title?: string } | null;
  context?: Record<string, unknown>;
  data?: { mapped_rows?: Record<string, ExtractedCell | undefined>[] }[];
}

const MANUAL_PAGE_KEY = 'manual';

/** What the scan returns for a crossed box — the same list the backend accepts. */
const CROSSED = ['X', '✓', '✔', 'SI', 'SÍ', 'TRUE', '1'];

const text = (raw: unknown): string => String(raw ?? '').trim();

const toNumberOrNull = (raw: unknown): number | null => {
  const value = Number(text(raw));

  return text(raw) !== '' && Number.isFinite(value) ? value : null;
};

/** DD/MM/YYYY as written, or ISO; anything unreadable stays empty — a date is never invented. */
export const normalizeSheetDate = (raw: unknown): string => {
  const clean = text(raw).replace(/\s*([/\-.])\s*/g, '$1');
  const ymd = clean.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);

  if (ymd) return `${ymd[1]}-${ymd[2].padStart(2, '0')}-${ymd[3].padStart(2, '0')}`;

  const dmy = clean.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/);

  if (dmy) return `${dmy[3].length === 2 ? `20${dmy[3]}` : dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;

  return '';
};

/** Handwritten weights may come with a comma decimal separator or a trailing unit. */
const cleanWeight = (raw: unknown): string => text(raw).replace(/kg/i, '').replace(',', '.').trim();

let pageSequence = 0;

export const emptyPar01Row = (pageKey: string, id: string): Par01Row => ({
  id,
  pageKey,
  caravana_madre: '',
  resultado: '',
  caravana_cria: '',
  sexo: '',
  peso: '',
  raza: '',
  fecha_nacimiento: '',
  observations: '',
  dientes: '0',
  father_id: '',
  fuera_de_orden: ''
});

/** Turns a POST /work-templates/identify response of a PAR-01 page into a page of the sheet. */
export const par01PageFromIdentifyResponse = (response: Par01IdentifyResponse, fileName: string, previewUrl: string | null): Par01Page => {
  const context = response?.context ?? {};
  const mappedRows = response?.data?.[0]?.mapped_rows ?? [];
  pageSequence += 1;
  const key = `par-page-${Date.now()}-${pageSequence}`;

  return {
    key,
    fileName,
    previewUrl,
    hojaNumero: toNumberOrNull(context.hoja_numero),
    hojaTotal: toNumberOrNull(context.hoja_total),
    metadata: {
      orden_paricion: text(context.orden_paricion),
      lote: text(context.lote),
      fecha_recorrida: normalizeSheetDate(context.fecha_recorrida),
      responsable: text(context.responsable),
      observaciones: text(context.observaciones)
    },
    rows: mappedRows
      .map((r, idx) => ({
        ...emptyPar01Row(key, `${key}-${idx}`),
        caravana_madre: text(r.caravana_madre?.value),
        resultado: text(r.resultado?.value).toUpperCase(),
        caravana_cria: text(r.caravana_cria?.value),
        // As read: an illegible "MH" must reach the review as it is, never cut to its first letter.
        sexo: text(r.sexo?.value).toUpperCase(),
        peso: cleanWeight(r.peso?.value),
        raza: text(r.raza?.value),
        fecha_nacimiento: normalizeSheetDate(r.fecha_nacimiento?.value),
        observations: text(r.observations?.value),
        fuera_de_orden: CROSSED.includes(text(r.fuera_de_orden?.value).toUpperCase()) ? 'X' : ''
      }))
      // A printed line nobody wrote on still names its female: it stays, as pending.
      .filter((r) => r.caravana_madre !== '' || r.resultado !== '' || r.caravana_cria !== '')
  };
};

/**
 * State of a PAR-01 load: one round spread across several scanned pages that are confirmed together,
 * so the all-or-nothing rule covers every page. A page naming another order is refused.
 */
export function usePar01Pages() {
  const [pages, setPagesState] = useState<Par01Page[]>([]);
  const pagesRef = useRef<Par01Page[]>([]);
  const [manualRows, setManualRows] = useState<Par01Row[]>([]);
  const [metadata, setMetadata] = useState<Par01Metadata>({ orden_paricion: '', lote: '', fecha_recorrida: '', responsable: '', observaciones: '' });
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  const setPages = useCallback((update: (prev: Par01Page[]) => Par01Page[]) => {
    pagesRef.current = update(pagesRef.current);
    setPagesState(pagesRef.current);
  }, []);

  const appendPage = useCallback(
    (page: Par01Page) => {
      if (pagesRef.current.length === 0) setMetadata(page.metadata);

      setPages((prev) => [...prev, page]);
    },
    [setPages]
  );

  const addPageFromFile = useCallback(
    async (file: File): Promise<boolean> => {
      setIsIdentifying(true);
      setPageError(null);
      const formData = new FormData();
      formData.append('document', file);

      try {
        const response = await axiosInstance.post<Par01IdentifyResponse>('/work-templates/identify', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 210000
        });
        const code = response.data?.identified_template?.code;

        if (code !== PAR01_CODE) {
          setPageError(`La hoja "${file.name}" no es una planilla PAR-01${code ? ` (se detectó ${code})` : ''}.`);
          return false;
        }

        const page = par01PageFromIdentifyResponse(response.data, file.name, URL.createObjectURL(file));
        const first = pagesRef.current[0];

        if (first && page.metadata.orden_paricion.toUpperCase() !== first.metadata.orden_paricion.toUpperCase()) {
          setPageError(
            `La hoja "${file.name}" dice orden ${page.metadata.orden_paricion || '(sin código)'} y la hoja 1 ${first.metadata.orden_paricion || '(sin código)'}: cargala por separado.`
          );
          return false;
        }

        appendPage(page);

        return true;
      } catch (err) {
        const error = err as { response?: { data?: { message?: string } }; message?: string };
        setPageError(error.response?.data?.message || error.message || 'No se pudo analizar la hoja.');

        return false;
      } finally {
        setIsIdentifying(false);
      }
    },
    [appendPage]
  );

  const removePage = useCallback((key: string) => setPages((prev) => prev.filter((p) => p.key !== key)), [setPages]);

  /** Rows of every page, in sheet order (page number when written, load order otherwise). */
  const rows = useMemo<Par01Row[]>(() => {
    const ordered = pages
      .map((page, loadIndex) => ({ page, loadIndex }))
      .sort((a, b) => (a.page.hojaNumero ?? 1000 + a.loadIndex) - (b.page.hojaNumero ?? 1000 + b.loadIndex));

    return [...ordered.flatMap(({ page }) => page.rows), ...manualRows];
  }, [pages, manualRows]);

  const missingPages = useMemo<number[]>(() => {
    const total = Math.max(0, ...pages.map((p) => p.hojaTotal ?? 0));
    const present = new Set(pages.map((p) => p.hojaNumero).filter((n): n is number => n !== null));

    return Array.from({ length: total }, (_, i) => i + 1).filter((n) => !present.has(n));
  }, [pages]);

  const patchRows = useCallback(
    (patch: (list: Par01Row[]) => Par01Row[]) => {
      setManualRows(patch);
      setPages((prev) => prev.map((page) => ({ ...page, rows: patch(page.rows) })));
    },
    [setPages]
  );

  const updateRow = useCallback(
    (id: string, field: keyof Par01Row, value: string) => patchRows((list) => list.map((r) => (r.id === id ? { ...r, [field]: value } : r))),
    [patchRows]
  );

  const deleteRow = useCallback((id: string) => patchRows((list) => list.filter((r) => r.id !== id)), [patchRows]);

  const addRow = useCallback(() => setManualRows((prev) => [...prev, emptyPar01Row(MANUAL_PAGE_KEY, `manual-${Date.now()}`)]), []);

  /** An explicit act: the round date in every resolved row still without one. Never implicit. */
  const fillMissingDates = useCallback(
    (date: string) => patchRows((list) => list.map((r) => (r.resultado.trim() !== '' && !r.fecha_nacimiento ? { ...r, fecha_nacimiento: date } : r))),
    [patchRows]
  );

  const setMetadataField = useCallback(<K extends keyof Par01Metadata>(field: K, value: Par01Metadata[K]) => {
    setMetadata((prev) => ({ ...prev, [field]: value }));
  }, []);

  const reset = useCallback(() => {
    setPages(() => []);
    setManualRows([]);
    setMetadata({ orden_paricion: '', lote: '', fecha_recorrida: '', responsable: '', observaciones: '' });
    setPageError(null);
  }, [setPages]);

  /** Starts a new load with its first page (the file dropped on the scanner). */
  const startWith = useCallback(
    (page: Par01Page) => {
      reset();
      appendPage(page);
    },
    [reset, appendPage]
  );

  return {
    pages,
    rows,
    /** Appends an already read page, as a simulation does; a scanned file goes through addPageFromFile. */
    addPage: appendPage,
    metadata,
    isIdentifying,
    pageError,
    missingPages,
    addPageFromFile,
    removePage,
    updateRow,
    deleteRow,
    addRow,
    fillMissingDates,
    setMetadataField,
    setPageError,
    reset,
    startWith
  };
}

export type Par01PagesState = ReturnType<typeof usePar01Pages>;
