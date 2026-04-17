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

### **Visual Standards**
- **Page Layout**:
  - Background color: `#f2f2f2` (Light grey).
  - Main cards: White background, `8px` border radius, and `1px solid #d8dde6` border.
- **Section Headers**:
  - Use `Typography variant="overline"`.
  - Color: `#6a6d70`.
  - Left Accent: `border-left: 3px solid #0a6ed1` (SAP Blue).
- **Inputs & Fields**:
  - Mandatory: `variant="filled"`.
  - Background: `#f7f7f7`.
- **Action Toolbar (Sticky Footer)**:
  - Background: `#eff4f9` (Pale blue toolbar).
  - Border: `1px solid #d8dde6`.
  - Primary Action: SAP Blue (`#0a6ed1`), border radius `6px`, no heavy shadows.

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
