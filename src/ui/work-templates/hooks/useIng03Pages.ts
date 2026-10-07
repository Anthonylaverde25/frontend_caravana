import { useCallback, useMemo, useRef, useState } from 'react';
import axiosInstance from '@/utils/axios';
import { normalizeSheetDate } from './usePar01Pages';

export const ING03_CODE = 'ING-03';

/** The header of a scanned ING-03 page, as read. */
export interface Ing03Metadata {
  orden_ingreso: string;
  /** "R1". */
  hoja_recepcion: string;
  dte: string;
  fecha_recepcion: string;
  /** The OBSERVACIONES box of the last page. */
  observaciones: string;
  /** Only on a sheet weighed with one average: the PESO PROMEDIO cell of the header. */
  peso_promedio: string;
}

/**
 * One line of the sheet as read, then supervised: an animal that arrived, its caravan written by
 * the chute. Sex only on a troop of both sexes; category only when a sex admits several of the
 * order's; breed (and coat) only on an order of several. Category and breed are kept as written —
 * a number and a letter on a sheet by code, words on a sheet written in words — and read by the
 * sheet's mode when the review resolves them. The three boxes are "X" when marked.
 */
export interface Ing03Row {
  id: string;
  pageKey: string;
  pageNumber: number | null;
  caravana: string;
  sexo: string;
  /** The category as written: its number (1, 2…) or its name. */
  cat: string;
  /** The breed as written: its letter (A, B…) or its name. */
  raza: string;
  /** The coat, on a sheet written in words. */
  pelaje: string;
  /** Body condition, official scale 1 to 5 (as written: "3.5"). */
  ec: string;
  peso: string;
  /** What the animal came off the truck with: "X" when the box is marked. */
  ojo: string;
  oreja: string;
  aplomo: string;
}

/** The boxes of the arrival findings, by the field that holds each one. */
export const ING03_FINDING_FIELDS = [
  ['ojo', 'EYE'],
  ['oreja', 'EAR'],
  ['aplomo', 'LIMB']
] as const;

export interface Ing03Page {
  key: string;
  fileName: string;
  previewUrl: string | null;
  hojaNumero: number | null;
  hojaTotal: number | null;
  metadata: Ing03Metadata;
  rows: Ing03Row[];
}

interface ExtractedCell {
  value?: unknown;
}

export interface Ing03IdentifyResponse {
  identified_template?: { code?: string; title?: string } | null;
  context?: Record<string, unknown>;
  data?: { mapped_rows?: Record<string, ExtractedCell | undefined>[] }[];
}

const MANUAL_PAGE_KEY = 'manual';

const text = (raw: unknown): string => String(raw ?? '').trim();

const cellText = (raw: unknown): string => text(raw && typeof raw === 'object' && 'value' in (raw as object) ? (raw as ExtractedCell).value : raw);

const toNumberOrNull = (raw: unknown): number | null => {
  const value = Number(text(raw));

  return text(raw) !== '' && Number.isFinite(value) ? value : null;
};

/** "r 1", "R-1", "1" → "R1". */
export const normalizeSheetLabel = (raw: unknown): string => {
  const digits = text(raw).replace(/[^0-9]/g, '');

  return digits ? `R${Number(digits)}` : '';
};

/** A word as written, without the dots and spaces around it: "Braford.", " col " → "BRAFORD", "COL". */
const cleanWord = (raw: unknown): string =>
  text(raw)
    .toUpperCase()
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}.]+$/gu, '')
    .replace(/\s+/g, ' ');

/** A box: anything inked on it is a mark ("X", "✓", "/"); "no" or a dash is not. */
const cleanMark = (raw: unknown): string => {
  const value = text(raw).toUpperCase();

  return value === '' || value === 'NO' || value === '-' || value === 'FALSE' ? '' : 'X';
};

/** Handwritten weights may come with a comma decimal separator or a trailing unit. */
const cleanWeight = (raw: unknown): string => text(raw).replace(/kg/i, '').replace(',', '.').trim();

/** "3,5" or "3 .5" → "3.5". */
const cleanBodyCondition = (raw: unknown): string => text(raw).replace(',', '.').replace(/\s+/g, '');

let pageSequence = 0;

export const emptyIng03Row = (pageKey: string, id: string, pageNumber: number | null = null): Ing03Row => ({
  id,
  pageKey,
  pageNumber,
  caravana: '',
  sexo: '',
  cat: '',
  raza: '',
  pelaje: '',
  ec: '',
  peso: '',
  ojo: '',
  oreja: '',
  aplomo: ''
});

/** Turns a POST /work-templates/identify response of an ING-03 page into a page of the sheet. */
export const ing03PageFromIdentifyResponse = (response: Ing03IdentifyResponse, fileName: string, previewUrl: string | null): Ing03Page => {
  const context = response?.context ?? {};
  const mappedRows = response?.data?.[0]?.mapped_rows ?? [];
  pageSequence += 1;
  const key = `ing03-page-${Date.now()}-${pageSequence}`;
  const hojaNumero = toNumberOrNull(cellText(context.hoja_numero));

  return {
    key,
    fileName,
    previewUrl,
    hojaNumero,
    hojaTotal: toNumberOrNull(cellText(context.hoja_total)),
    metadata: {
      orden_ingreso: cellText(context.orden_ingreso).toUpperCase(),
      hoja_recepcion: normalizeSheetLabel(cellText(context.hoja_recepcion)),
      dte: cellText(context.dte),
      fecha_recepcion: normalizeSheetDate(cellText(context.fecha_recepcion)),
      observaciones: cellText(context.observaciones),
      peso_promedio: cleanWeight(cellText(context.peso_promedio))
    },
    rows: mappedRows
      .map((r, idx) => ({
        ...emptyIng03Row(key, `${key}-${idx}`, hojaNumero),
        caravana: text(r.caravana?.value).toUpperCase(),
        sexo: text(r.sexo?.value).toUpperCase(),
        cat: cleanWord(r.cat?.value),
        raza: cleanWord(r.raza?.value),
        pelaje: cleanWord(r.pelaje?.value),
        ec: cleanBodyCondition(r.ec?.value),
        peso: cleanWeight(r.peso?.value),
        ojo: cleanMark(r.lesion_ojo?.value),
        oreja: cleanMark(r.lesion_oreja?.value),
        aplomo: cleanMark(r.lesion_aplomo?.value)
      }))
      // A line nobody wrote on is a head that has not arrived, not a row.
      .filter((r) => (['caravana', 'sexo', 'cat', 'raza', 'pelaje', 'ec', 'peso', 'ojo', 'oreja', 'aplomo'] as const).some((field) => r[field] !== ''))
  };
};

const EMPTY_METADATA: Ing03Metadata = { orden_ingreso: '', hoja_recepcion: '', dte: '', fecha_recepcion: '', observaciones: '', peso_promedio: '' };

/**
 * State of an ING-03 load: the pages of one receipt sheet, scanned and confirmed together. A page
 * of another order or another sheet (R-number) is refused: each sheet is received on its own.
 */
export function useIng03Pages() {
  const [pages, setPagesState] = useState<Ing03Page[]>([]);
  const pagesRef = useRef<Ing03Page[]>([]);
  const [manualRows, setManualRows] = useState<Ing03Row[]>([]);
  const [metadata, setMetadata] = useState<Ing03Metadata>(EMPTY_METADATA);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  const setPages = useCallback((update: (prev: Ing03Page[]) => Ing03Page[]) => {
    pagesRef.current = update(pagesRef.current);
    setPagesState(pagesRef.current);
  }, []);

  const appendPage = useCallback(
    (page: Ing03Page) => {
      const first = pagesRef.current[0];

      if (!first) {
        setMetadata(page.metadata);
      } else {
        // The date, the observations and the average may be written on any page: the first one written counts.
        setMetadata((prev) => ({
          ...prev,
          fecha_recepcion: prev.fecha_recepcion || page.metadata.fecha_recepcion,
          observaciones: prev.observaciones || page.metadata.observaciones,
          peso_promedio: prev.peso_promedio || page.metadata.peso_promedio
        }));
      }

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
        const response = await axiosInstance.post<Ing03IdentifyResponse>('/work-templates/identify', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 210000
        });
        const code = response.data?.identified_template?.code;

        if (code !== ING03_CODE) {
          setPageError(`La hoja "${file.name}" no es una planilla ING-03${code ? ` (se detectó ${code})` : ''}.`);
          return false;
        }

        const page = ing03PageFromIdentifyResponse(response.data, file.name, URL.createObjectURL(file));
        const first = pagesRef.current[0];

        if (
          first &&
          (page.metadata.orden_ingreso !== first.metadata.orden_ingreso || page.metadata.hoja_recepcion !== first.metadata.hoja_recepcion)
        ) {
          setPageError(
            `La hoja "${file.name}" es de ${page.metadata.orden_ingreso || '(sin orden)'} ${page.metadata.hoja_recepcion || '(sin R)'} y la primera de ${first.metadata.orden_ingreso} ${first.metadata.hoja_recepcion}: cada hoja de recepción se carga por separado.`
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
  const rows = useMemo<Ing03Row[]>(() => {
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
    (patch: (list: Ing03Row[]) => Ing03Row[]) => {
      setManualRows(patch);
      setPages((prev) => prev.map((page) => ({ ...page, rows: patch(page.rows) })));
    },
    [setPages]
  );

  const updateRow = useCallback(
    (id: string, field: keyof Ing03Row, value: string) => patchRows((list) => list.map((r) => (r.id === id ? { ...r, [field]: value } : r))),
    [patchRows]
  );

  const deleteRow = useCallback((id: string) => patchRows((list) => list.filter((r) => r.id !== id)), [patchRows]);

  const addRow = useCallback(() => setManualRows((prev) => [...prev, emptyIng03Row(MANUAL_PAGE_KEY, `manual-${Date.now()}`)]), []);

  const setMetadataField = useCallback(<K extends keyof Ing03Metadata>(field: K, value: Ing03Metadata[K]) => {
    setMetadata((prev) => ({ ...prev, [field]: value }));
  }, []);

  const reset = useCallback(() => {
    setPages(() => []);
    setManualRows([]);
    setMetadata(EMPTY_METADATA);
    setPageError(null);
  }, [setPages]);

  /** Starts a new load with its first page (the file dropped on the scanner). */
  const startWith = useCallback(
    (page: Ing03Page) => {
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
    setMetadataField,
    setPageError,
    reset,
    startWith
  };
}

export type Ing03PagesState = ReturnType<typeof useIng03Pages>;
