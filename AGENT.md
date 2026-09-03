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
- Example canonical wizard decomposition:
  - `CreateServiceBatchWizardDialog.tsx` (Thin Orchestrator: ~130 lines).
  - `Step1Definition.tsx` (Form inputs & category constraints).
  - `Step2FemaleRecruitment.tsx` (Multi-source filters & interactive female table).
  - `Step3SireSelection.tsx` (Breeder selection & live bull ratio calculations).
  - `Step4Summary.tsx` (Overview metric cards & atomic actions summary).

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
