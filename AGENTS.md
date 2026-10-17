# PROTOCOLO XIMON | GANADERO v1 — Frontend Architecture (React + TypeScript)

## 1. Identity & Scope
- **Role:** Senior Frontend Architect & Lead React/TypeScript Engineer.
- **Protocol:** XIMON | GANADERO v1 (Frontend Module).
- **Core Standard:** Clean Architecture / DDD-Lite + Atomic Componentization.
- **Language Policy:** Code, interfaces, comments, and commit messages strictly in **ENGLISH**. Reasoning, plans, and chat in **SPANISH**.

---

## 2. Directory Structure & Layer Responsibilities

```plaintext
src/
├── core/                              # DOMAIN LAYER (Pure TypeScript, Framework Independent)
│   ├── [domain]/entities/             # Rich Domain Entities with business rules & validation.
│   ├── [domain]/interfaces/           # Repository and Service contracts (ICaravanRepository, etc.).
│   └── [domain]/value-objects/        # Immutable Value Objects.
├── application/                       # APPLICATION LAYER
│   ├── [domain]/use-cases/            # Pure Use Cases executing single business actions.
│   └── [domain]/dtos/                 # Readonly Data Transfer Objects.
├── infrastructure/                    # INFRASTRUCTURE LAYER
│   ├── [domain]/repositories/         # ApiRepositories communicating via Axios adapters.
│   └── [domain]/mappers/              # Domain Mappers (Raw JSON <-> Rich Domain Entities).
├── features/                          # REACT QUERY HOOKS & BRIDGES
│   └── [domain]/hooks/                # e.g., useCaravans.ts, useBatches.ts, useCreateBatch.ts
├── ui/                                # PRESENTATION LAYER (Feature-driven Domain Modules)
│   ├── [feature]/views/               # Page-level route views (Thin ViewLayout wrappers).
│   ├── [feature]/components/          # Feature components, tables, widgets.
│   └── [feature]/components/dialogs/  # Modal dialogs and multi-step wizards.
│       └── [feature-wizard]/          # Step subcomponents (Step1, Step2, Step3, Step4).
└── app/                               # ROUTING & SHELL
    └── (control-panel)/               # Route definitions and layout orchestration.
```

---

## 3. Frontend Architecture & Componentization Standards

### A. Atomic & Modular Components (SRP)
- **Monolithic components (> 200-250 lines) are strictly prohibited.**
- Complex views, multi-step wizards, large tables, and dialogs must be decomposed into dedicated subcomponents under `src/ui/{domain}/components/{subfeature}/`.
- Example canonical wizard decomposition (`src/ui/batches/components/dialogs/`):
  - `StartBatchServiceDialog.tsx` (Orchestrator: step index, selections, mutation, validation on click).
  - `start-service/StartBatchFemalesStep.tsx` (Females of the batch; read-only under natural service).
  - `start-service/StartBatchSiresStep.tsx` (Bull selection & live bull ratio calculations).
  - `start-service/StartBatchParametersStep.tsx` (Service type, window and notes).

### B. Container / Presenter Pattern
- **Parent Components (Orchestrators):** Manage open/close dialog state, active step index, centralized form state, TanStack Query mutations, and notification triggers.
- **Child Components (Presenters):** Pure, focused, and strongly-typed presentation and interactive components receiving props and event callbacks.

---

## 4. UI & Design System Tokens (Canonical `CreateBatchDialog.tsx` Standard)

All dialogs, forms, and control panels must strictly adhere to the unified visual token rules:

1. **Dialogs & Modals:**
   - Container: `PaperProps: { sx: { borderRadius: '8px', boxShadow: 1, bgcolor: 'background.paper' } }`.
   - Header: `p: 2, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider'`.
   - Title: `Typography variant="h6"` (`fontSize: '1.1rem', fontWeight: 600, color: 'text.primary'`).
   - Close Button: `IconButton` with `FuseSvgIcon size={20}>heroicons-outline:x-mark` (`color: 'primary.main'`).
2. **Form Inputs:**
   - Mandatory: `variant="filled"`, `fullWidth`, with background `sx={{ bgcolor: 'action.hover' }}`.
   - Informative Alerts: Compact `Alert severity="info"` (`fontSize: '0.8rem'`, `py: 0.5`).
3. **Dialog Actions (Footer):**
   - Container: `p: 2, px: 3, bgcolor: 'background.default', borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center'`.
   - Secondary Button (Left): `variant="text"`, `sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}` (`Cancelar` / `Atrás`).
   - Primary Button (Right): `variant="contained"`, `sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', px: 3.5, fontWeight: 700, borderRadius: '6px', textTransform: 'none', boxShadow: 'none', '&:hover': { bgcolor: 'primary.dark' } }}` (`Siguiente` / `Crear` / `Confirmar`).
4. **Notifications:**
   - Use `useSnackbar` from `notistack` (`enqueueSnackbar(msg, { variant: 'success' | 'warning' | 'error' })`).
5. **Data Tables (Spreadsheet Grid — canonical "Recibir y registrar caravanas", `FullReceptionGrid.tsx`):**
   Every table that loads, selects or reviews records (bulk entry, animal selection, scanned-sheet review), above all inside the full-screen entries, uses this pattern; a plain MUI table is not acceptable. Live references: `FullReceptionGrid`, `BirthRollGrid`, `TactoEntrySheet`, `PregnantFemalesByBatchSelector`, `WeaningCalvesGrid`.
   - Building blocks: always `src/components/sheet-grid/`; never copy its tokens.
     - `useGridCellStyles()`: `cellSx` on every cell (right + bottom border), `inputSx` on inputs inside cells (borderless, 40px, focus and error drawn as an inset ring, disabled in grey), `headSx` for header cells, `indexSx` for the `#` / checkbox column, `textCellSx` for read-only values, `zebraBg` on even rows, `selectedBg` on selected rows, `errorRing` on a cell the server objected to.
     - `SheetGrid` (frame: 1px divider border, `4px` radius, sticky header, `maxHeight` and `minWidth` so horizontal scroll stays inside), `SheetGridTagCell`, `SheetGridGroupRow`, `SheetGridStatusCell`, `SheetGridEmptyRow`.
   - Header: a single row, sentence case (`Caravana`, `Peso (kg)`; never uppercase, never a two-level band). First column `#` (or the select-all checkbox), one column per field with its width, an empty last column (48px) for the row status.
   - One value per cell; never stack several inputs in one cell. Cells that do not apply to the row (or that the order fixes) stay visible, disabled, in grey.
   - Identification cell (`SheetGridTagCell`): ear tag in `monospace`, bold, `primary.main`; at most one `0.66rem` caption line below. Extra context goes in a small icon with tooltip, not in more lines.
   - Grouping (e.g. by batch): `SheetGridGroupRow` — background `#eef2ef` (dark: `rgba(255, 255, 255, 0.06)`), its own checkbox, optional fold chevron, bold name and count.
   - Row status (`SheetGridStatusCell`, last column): error (from the backend, on click, never live) → `exclamation-circle` red; warning → `exclamation-triangle` amber; info → `information-circle` grey; the message in the tooltip. With nothing to tell, it holds the row action (e.g. "Quitar fila"). The offending cell also gets the inset error ring.
   - Above the grid: search field, `ToggleButtonGroup` filters showing their counts, and a selection bar (count chips + "Marcar visibles").

---

## 5. Work Templates & Scanning Standards
- **Mandatory Simulation Test Components:** Every time a new Work Template is created or modified in the system (backend seeder, frontend printable template, or OCR extraction pipeline), the developer MUST simultaneously create or update the corresponding simulation test fixtures, presets, and dynamic vector preview generator in `src/ui/work-templates/components/scan/simulation/`.
- **Flow Coverage:** The simulation test suite for any work template must provide at least:
  1. **Happy Path:** Valid standard flow ready to persist.
  2. **Warning Flow:** Edge cases, alerts, and thresholds (e.g. low scrotal circumference, duplicate ear tags, zero weights).
  3. **Repair / Error Flow:** Validation blockers, schema mismatches, and repair dialog activations.
This guarantees rapid UI testing, robust regression verification, and complete decoupling from external AI microservices during day-to-day development.

