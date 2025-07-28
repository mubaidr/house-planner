# Copilot Instructions for House Planner

These guidelines will help AI coding agents quickly understand and contribute to the House Planner codebase.

## 1. Architecture Overview
- Next.js 15 in the `/app` directory with React 19.
- Global state via Zustand stores in `src/stores` (e.g. `designStore.ts`).
- Canvas drawing powered by Konva and react-konva (`src/components/Canvas`).
- Core logic encapsulated in custom hooks under `src/hooks` (e.g. `useAutoSave.ts`, `useDimensionTool.ts`).
- Utilities in `src/utils` handle persistence (`storage`), export helpers (`pdfmake`, `jszip`).

## 2. Project Structure & Conventions
```
src/
  app/           # Next.js entry points: layout.tsx, page.tsx
  components/    # Feature UI (Canvas, Sidebar, Export, etc.)
  stores/        # Zustand stores with immer-friendly state updates
  hooks/         # Reusable hooks following `useX` naming
  utils/         # Standalone helpers (storage, math, export)
__tests__/       # Jest unit/integration tests mirroring src structure
```
- Use absolute imports (`@/path/to/file`) configured in `tsconfig.json` and `jest.config.js`.
- Strict TypeScript; avoid `any` and prefer precise types.

## 3. Developer Workflows
```bash
npm install
npm run dev           # Next.js dev server (Turbopack)
npm run build         # Production build (ESLint ignored during build)
npm run start         # Start production server
npm run lint          # Run ESLint
npm test              # Run all Jest tests
npm run test:watch    # Jest in watch mode
npm run test:coverage # Generate coverage report
```
- Jest uses `ts-jest`, `jest-canvas-mock`, and mocks Konva imports via `transformIgnorePatterns`.
- Next.js Webpack fallback for `fs` and `canvas` in `next.config.ts` to support `pdfmake` in the browser.

## 4. State & Hooks Patterns
- Stores return actions + selectors: `const { walls, addWall } = useDesignStore()`.
- Hook effects depend on full slices (e.g. `[walls, doors]`) to trigger updates.
- `useAutoSave(intervalMs = 30000)` auto-saves non-empty designs via `storage.autoSave()`.

## 5. Testing Patterns
- Tests live alongside code in `__tests__` or under `src/**`, using `.test.ts[x]` suffix.
- Use `moduleNameMapper` for `^@/(.*)$` imports.
- Canvas APIs are mocked; import assertions may require `jest-canvas-mock`.

## 6. Key Integration Points
- Exports: `pdfmake`, `jszip`, `file-saver` pipelines in `src/utils/export*`.
- Material assignments in store drive rendering in `materialRenderer2D.ts` (large file, refer for examples).
- Keyboard shortcuts implemented in `useGlobalKeyboardShortcuts.tsx`.

---

*Please review and let me know if any section needs more detail or clarity.*
