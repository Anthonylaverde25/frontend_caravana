export interface FieldMapping {
  [alias: string]: string;
}

export interface DataValue {
  value: string;
  confidence: number;
}

export interface TableResult {
  table_id: number;
  row_count: number;
  column_count: number;
  headers: string[];
  rows: Record<string, DataValue>[];
  field_mapping: FieldMapping;
  unresolved_headers: string[];
  mapped_rows: Record<string, DataValue>[];
}

export interface DocumentContext {
  cuit: string | null;
  renspa: string | null;
  lote: string | null;
  provider_id: number | null;
  farm_id: number | null;
  batch_id: number | null;
}

export interface UploadResponse {
  status: string;
  suggested_workday_code?: string;
  document_info: {
    pages: number;
    model_id: string;
  };
  context?: DocumentContext;
  data: TableResult[];
}

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: { row: number; reason: string }[];
}
