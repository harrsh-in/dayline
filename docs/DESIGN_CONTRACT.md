# Dayline Design Contract & Engineering Standards

This document serves as the technical and visual "contract" for Dayline. All implementation must adhere to these standards.

## 🎨 Design Philosophy: Modern Monochrome
Dayline follows a high-contrast, minimalist architectural aesthetic. The UI is intentionally neutral to ensure the user's content remains the focal point.

### Core Principles
- **Content-First:** The interface stays out of the way.
- **Surgical Color:** Use color only for functional status or critical alerts.
- **High Contrast:** Rely on typography and spacing for hierarchy instead of color.
- **Architectural:** Sharp edges (low radius) and precise lines.

### Tailwind 4 Semantic Tokens
Tokens are defined in `admin-panel/src/styles.css`.
- **`brand-primary`**: Black (#000000)
- **`ui-surface`**: White (#ffffff)
- **`ui-text`**: Deep Zinc-950 (#09090b)
- **`ui-text-muted`**: Zinc-500 (#71717a)
- **`ui-border`**: Zinc-200 (#e4e4e7)
- **`status-success`**: Emerald-500
- **`status-error`**: Red-500

---

## 🛠️ Engineering Standards

### Tech Stack
- **Frontend:** React 19, Vite, TypeScript, TanStack Router, Tailwind CSS 4.
- **Backend:** NestJS.

### Development Conventions
- **Functional & Hooks:** Pure functional components with React Hooks.
- **Routing:** TanStack Router for all file-based navigation.
- **Icons:** Lucide React (standardized).
- **Type Safety:** Strict TypeScript usage is non-negotiable.
- **Formatting:** Prettier/ESLint must pass (`npm run format` before commit).

### Architectural Patterns
- **Layered CSS:** 
  - `@layer base` for global resets.
  - `@layer components` for repeated UI patterns (buttons, inputs).
- **Utility-First:** 95% of styling should happen via Tailwind utility classes.
- **Semantic Classes:** Prefer role-based names (`.btn-primary`, `.task-row`).

---

## 📂 Project Structure
- `admin-panel/`: The main frontend application.
- `server/`: The NestJS backend.
- `docs/`: Documentation and contracts.
