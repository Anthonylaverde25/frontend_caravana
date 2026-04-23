# VIERNES Protocol: Frontend Architecture (Fuse React + SAP Fiori)

## 1. Frontend Layers (Clean Architecture / DDD-Lite)
The frontend follows a strictly decoupled architecture to ensure business logic is frame-independent and testable.

### **Structure Overview**
```plaintext
src/
├── core/               # DOMAIN LAYER
│   ├── entities/       # Pure TS classes for business objects.
│   ├── interfaces/     # Repository and Service contracts.
│   └── value-objects/  # Immutable types (UUID, Email, etc).
├── application/        # APPLICATION LAYER
│   ├── use-cases/      # Single-responsibility logic classes (e.g., CreateSupplier).
│   └── dtos/           # Readonly Data Transfer Objects.
├── infrastructure/     # INFRASTRUCTURE LAYER
│   ├── services/       # API implementations (Axios instances).
│   └── persistence/    # Repositories implementing core interfaces.
├── ui/                 # PRESENTATION LAYER (Features)
│   ├── [feature]/      # e.g., suppliers, farms, livestock.
│   │   ├── components/ # Local components.
│   │   ├── views/      # Full-page components (Entry points).
│   │   └── hooks/      # Feature-specific logic (useSuppliers, useSupplierForm).
└── app/                # ROUTING & CONFIG
    └── (control-panel)/# Route groups following Next.js/Vite conventions.
```

---

## 2. The SAP Fiori Design Pattern
All control panel views must adhere to the **SAP Fiori refined aesthetic** to ensure an enterprise-grade, clean, and consistent look.

### **Visual Standards (Theming)**
All components must support **Dark/Light Mode** by using MUI Theme Tokens instead of hardcoded hex values.

- **Page Layout**:
  - Background color: `theme.palette.background.default`.
  - Main Container: `maxWidth="xl"`.
- **Main Cards & Papers**:
  - Background: `theme.palette.background.paper`.
  - Border: `1px solid {theme.palette.divider}`.
  - Border Radius: `8px`.
- **Section Headers**:
  - Variant: `Typography variant="overline"`.
  - Color: `theme.palette.text.secondary`.
  - Left Accent: `border-left: 3px solid {theme.palette.primary.main}`.
- **Inputs & Fields**:
  - Mandatory: `variant="filled"`.
  - Background: `theme.palette.action.hover` or `theme.palette.background.default`.
- **Action Toolbar / Dialog Actions**:
  - Background: `theme.palette.background.default`.
  - Border Top: `1px solid {theme.palette.divider}`.
  - Primary Action: `theme.palette.primary.main` (SAP Blue), border radius `6px`.
- **Icons**:
  - Use `FuseSvgIcon` with appropriate color from `text.secondary` or `primary.main`.

---

## 3. UI Implementation Protocol
1. **Normalization**: Every view must start with the `Container` + `ViewHeader` pattern.
2. **Decoupling**: Views (`src/ui/*/views/`) should NOT contain fetch logic. They must use **Hooks** located in `src/ui/*/hooks/`.
3. **Hooks Responsibilities**:
   - Hooks act as orchestrators between the UI and the **Application Layer** (Use Cases).
   - They handle local state (loading, errors) and validation.
4. **Routing**: The `src/app/` directory contains ONLY the route definitions and layouts. The actual view logic resides in `src/ui/`.

---

## 4. Coding Standards (Technical Constraints)
- **Strict Typing**: All components and objects must have explicit TypeScript interfaces/types.
- **Component Granularity**: If a component exceeds 200 lines, it must be subdivided into `components/` within the same feature.
- **Semantic HTML**: Use proper tags (`main`, `section`, `header`, `footer`) for accessibility.
- **Naming**: 
  - Views: `[Entity]View.tsx` (e.g., `SuppliersView.tsx`).
  - Dialogs: `[Action][Entity]Dialog.tsx` (e.g., `CreateSupplierDialog.tsx`).
