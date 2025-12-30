# Coding Rules

### Node.js · Express · Sequelize · MySQL · React (Functional Only)

**Version 3.0**

---

## A. General (Cross‑Cutting) Rules

### A.1 Scope & Authority

- These rules apply to **all outputs**: code, refactoring, debugging, architecture, documentation, tests.
- If a user instruction contradicts a rule, the instruction may be followed only if **the violation is explicitly acknowledged and scoped**.
- If an instruction is ambiguous, default to **strict mode**.
- All generated code must be **complete, runnable, and production‑ready**.

### A.2 Global Code Style

- Indentation: 2 spaces
- Semicolons required
- Max line length: 120

### A.3 Global Tooling

- Git required
- ESLint enforced
- Prettier optional but recommended

### A.4 Documentation (Global)

- JSDoc is required only for:
  - exported public functions, hooks, and components
  - non-obvious utility functions
- JSDoc must describe behavior, constraints, and side-effects.
  It must not restate type information that is already evident.
- Inline comments are permitted only when explaining:
  - non-obvious decisions or trade-offs
  - constraints imposed by external systems
  - behavior that would otherwise appear incorrect
- Inline comments must not describe what the code is doing line-by-line.
- The README must be updated when a new top-level feature, service, or module is added.

### A.5 Debugging (Global)

- A root-cause must be identified before proposing a fix.
  The root-cause must be traceable to a specific line, condition, or interaction.
- Temporary debugging instrumentation (e.g. logging) may be used during analysis
  but must not appear in the final code.
- Fixes must:
  - address the identified root-cause directly
  - modify the smallest possible surface area
  - avoid refactors unless they are necessary to fix the issue
- Each fix must include a brief explanation stating:
  - what the root-cause was
  - why this change resolves it

---

## B. Backend Rules (Node.js · Express · Sequelize · MySQL)

### B.1 Backend Architecture (Classic MVC)

#### B.1.1 Folder Structure

```
/src
  /config
  /routes
  /controllers
  /services
  /models
  /migrations
  /middlewares
  /utils
  /helpers
  /logs
  /tests
  app.js
  server.js
```

#### B.1.2 MVC Boundaries

- Routes: routing only, attach middleware, no business logic
- Controllers: orchestrate services, no database access
- Services: full business logic, orchestrate helpers/utils
- Models: define fields and associations

### B.2 Backend Naming Conventions

- camelCase: variables, functions
- PascalCase: classes
- snake_case: database fields
- Naming Strategy: Files in `/controllers` and `/services` must use the resource name in `camelCase` (e.g., `admin.js`, `auth.js`, `document.js`), while the Classes inside utilize `PascalCase` with full suffix (e.g., `class AdminController`, `class AuthService`).

### B.3 Database & Sequelize Rules

- All fields explicitly define type, allowNull, defaultValue
- Associations defined in model files
- Strict migrations with up/down
- No raw SQL unless explicitly requested

### B.4 Error Handling (Backend)

- Centralized errorHandler middleware
- Controllers must not swallow errors

### B.5 Logging (Backend — Winston)

- JSON logs with timestamps
- Levels: error, warn, info
- All logs written strictly to `/src/logs/`
- No log files outside `/src/logs/`
- Daily log rotation required
- Logger auto‑creates `/src/logs/` if missing
- Request‑scoped correlation ID required
- No console.log anywhere

### B.6 Backend Testing

- Jest required
- Unit tests required for all business logic
- No real database usage (use mocks)
- Coverage requirements: see Section D

### B.7 Backend Code Generation Rules

- Every new backend resource requires:
  - model
  - migration
  - controller
  - service
  - route

- Code must be complete and production‑ready

---

## C. Frontend Rules (React — Functional Only)

### C.1 Frontend Core Rules

- Only functional components allowed
- State and side-effects must be implemented using hooks.
- Custom hooks must only be created when:
  - logic is reused by ≥2 components, or
  - logic exceeds ~30 lines, or
  - logic is independently testable.
- Prop drilling is allowed up to 3 component levels.
- Context or global state must only be introduced when:
  - the same state is consumed by ≥3 unrelated components, or
  - the state represents application-level concerns (e.g. auth, theme, locale).
- Components must not contain business rules or data orchestration.
  Such logic must be placed in hooks or services.

### C.2 Frontend Architecture (Scalable Modular)

#### C.2.1 Folder Structure

```
/src
  /api            # HTTP clients, interceptors
  /assets         # Images, icons, fonts
  /components     # Reusable presentational components
  /features       # Feature‑based modules
  /hooks          # Global reusable hooks
  /layouts        # Layout wrappers
  /pages          # Route‑level composition only
  /routes         # Router configuration
  /store          # Global state management
  /styles         # Themes, global styles
  /utils          # Pure utility functions
  /constants      # App‑wide constants
  App.jsx
  main.jsx
```

#### C.2.2 Responsibility Boundaries

- pages: routing + composition only
- features: domain logic, API calls, UI
- components: presentational only
- api: centralized HTTP logic
- hooks: reusable logic without UI

### C.3 Frontend State Management

- Local state: useState / useReducer
- Cross‑feature state: Redux Toolkit or Zustand
- Server state: React Query / TanStack Query
- No mixed responsibilities in a single store

### C.4 Frontend Styling Rules

- Choose **one**: CSS Modules, Tailwind, or styled‑components
- No inline styles except for dynamic values
- Theme variables live in `/styles`

### C.5 Frontend Side‑Effects & Data Fetching

- UI components must remain declarative and must not implement side-effect logic directly.
- All data fetching and mutations must be encapsulated in:
  - an API layer (HTTP concerns only), and
  - feature-level hooks or services (orchestration, caching, transformation).
- Components may only consume hooks/services, never raw API calls.
- Loading, error, empty, and success states must be explicitly modeled and rendered.
- All backend API calls must use environment-based base URLs (e.g. `API_URL`).
- Backend-served media assets must use environment-based URLs;

### C.6 Frontend Performance

- Memoize expensive components
- Route‑level code splitting (lazy + Suspense)
- Avoid unnecessary re‑renders

### C.7 Frontend Naming Conventions

- Components: PascalCase
- Hooks: useXxx
- Files: camelCase or PascalCase (consistent)
- One component per file

### C.8 Frontend Testing

- Jest + React Testing Library (or Vitest for Vite projects)
- Unit tests required for components, hooks, context, and services
- Mock API layer
- Coverage requirements: see Section D

---

## D. Test Coverage Rules

### D.1 Coverage Requirements

Coverage enforcement applies at both global and file levels:

- Global coverage thresholds must pass.
- No file may reduce its existing coverage.
- New or modified files must meet global thresholds unless exceptions are justified via ignore directives.
- 100% per-file coverage is encouraged but not required.

- **Default Target Coverage**: 90–95%
- **Per-Metric Targets**:
  - Statements / Lines: 90–95%
  - Functions: 90%
  - Branches: 80–90%
- Coverage reports must be generated on every test run
- All new code must include corresponding unit tests

### D.2 Coverage Tooling

- **Backend (Jest)**: Use `--coverage` flag
- **Frontend (Vitest)**: Use `--coverage` flag with v8 provider
- Coverage thresholds should be enforced in CI/CD pipelines

### D.3 Coverage Ignore Directives

When code cannot be reasonably unit tested, use coverage ignore directives with **mandatory reason comments**:

#### D.3.1 Backend (Jest/Istanbul)

```javascript
/* istanbul ignore next -- @preserve [REASON] */
```

#### D.3.2 Frontend (Vitest/c8)

```javascript
/* c8 ignore start -- [REASON] */
// code block
/* c8 ignore stop */
```

Or for single lines:

```javascript
/* c8 ignore next -- [REASON] */
```

### D.4 Valid Reasons for Coverage Ignores

Use coverage ignores **only** for the following scenarios:

| Category                    | Example                             | Valid Reason                                                                |
| --------------------------- | ----------------------------------- | --------------------------------------------------------------------------- |
| **Startup/Init Code**       | Directory creation, env fallbacks   | Runs once at module load before tests execute                               |
| **Production Config**       | use_env_variable, cloud deployments | Only active in production environments                                      |
| **External API Data**       | Third-party API response parsing    | Response structure varies, requires integration tests                       |
| **Async Polling/Timers**    | setInterval completion states       | Requires real timing, tested via e2e                                        |
| **Error Recovery**          | Catch blocks for transient failures | Defensive code for edge cases                                               |
| **ORM Internals**           | Sequelize associate() checks        | Framework behavior, varies by model                                         |
| **UI-only cosmetic states** | Button text during loading          | Non-interactive visual differences that do not affect behavior or user flow |

### D.5 Invalid Uses of Coverage Ignores

**DO NOT** use coverage ignores for:

- Code that can be tested with proper mocking
- Lazy avoidance of writing tests
- Complex business logic
- Security-critical code paths
- Core functionality

### D.6 Ignore Directive Format

Every ignore directive **must include a reason** following this format:

```javascript
/* istanbul ignore next -- @preserve [Category]: [Brief explanation] */
```

Examples:

```javascript
/* istanbul ignore next -- @preserve Startup code: directories already exist when tests run */
/* istanbul ignore next -- @preserve Production config: use_env_variable only set in cloud deployments */
/* c8 ignore start -- Error handling: API error response structure varies, tested separately */
```

---

## E. Compliance

- Violations must be fixed, not documented
- Consistency is prioritized over personal preference
- Coverage ignores without reasons are violations
- All new coverage ignores require user review
