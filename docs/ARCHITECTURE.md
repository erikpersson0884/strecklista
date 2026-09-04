# Frontend Architecture

This document describes how data flows through the frontend and the conventions every feature should follow.

## Stack

- React + TypeScript + Vite
- React Router (`react-router-dom`) for routing
- Axios for HTTP
- Zod for API response validation
- React Context + custom hooks for state
- Vitest + `@testing-library/react` for testing
<!-- - Hand-written TypeScript types (no shared/generated types with backend) -->

## Data flow

```
Component -> Context (via custom hook) -> API layer (axios + Zod + adapter) -> Backend
```

Rules:
- Components **never** import axios or call the API layer directly. They only call custom hooks (`useAuthContext()`, `useCartContext()`, etc.).
- The API layer **never** touches React state, contexts, or hooks. It only makes HTTP calls, validates the response shape, adapts it to an internal type, and returns typed data or throws.
- Contexts are the only layer allowed to call the API layer.
- Types are the shared contract between all three layers — define them once, import everywhere.

## Folder structure

```
.github/
  workflows/      # CI/CD workflows
docs/
  ARCHITECTURE.md # this file
src/
  adapters/       # transforms validated API types into internal domain types
  api/            # axios instance + one file per resource (userApi.ts, inventoryApi.ts)
  assets/         # static assets (images, icons, etc.)
  components/     # UI, consumes contexts via hooks only
  contexts/       # one context+provider+hook per domain (AuthContext.tsx)
  layouts/        # page shell (header/footer), always mounted, not route content
  pages/          # route pages (ShopPage.tsx, BalancePage.tsx)
  schemas/        # Zod schemas for api response validation
  styles/         # global styles
  tests/          # unit and integration tests, mirrors src/ structure (not co-located)
  types/          # shared TypeScript interfaces/types
```

Path alias: `@/*` maps to `./src/*` (configured in both `vite.config.ts` and `tsconfig.json`). Newer files (`Header.tsx`, `App.tsx`, `ProtectedRoute.tsx`) use `@/contexts/...` imports; older files still use relative imports (`../../contexts/...`). **Prefer the `@/` alias for new code** — it's shorter and doesn't break when a file moves — but don't churn-edit existing relative imports just to convert them.

Naming conventions:
- API file: `xApi.ts`, exports an object of plain async functions (`usersApi.getCurrentUser`, `usersApi.getUsers`)
- Context file: `XContext.tsx`. Every context follows the exact same three-export shape:
  ```ts
  export const XProvider: React.FC<{ children: ReactNode }> = ({ children }) => { ... };
  export const useXContext = () => { ... };
  export default useXContext;
  ```
  Consumers import the **default export**: `import useAuthContext from '@/contexts/AuthContext';`, not a named import. This is consistent across every context in the codebase (`Auth`, `Users`, `Inventory`, `Transactions`, `Cart`, `Client`, `Modal`, `Notification`).
- Schema file: `schemas/api.ts` — Zod schemas prefixed `Api*` (`ApiUser`, `ApiGroup`, `ApiGroupMember`) representing the **raw backend shape**, not the internal domain type
- Adapter file: `adapters/xAdapter.ts` — default-exports an object of pure functions named `apiXToY` (e.g. `userAdapter.apiUserToUser`, `userAdapter.apiGroupMemberToUser`), converting a validated `Api*` schema type into an internal domain type (`User`, `GroupInfo`, etc.)

## Routing

- Defined in `src/App.tsx` using `react-router-dom`'s `<Routes>`/`<Route>`.
- Route-to-page mapping is a plain array (`{ url, component }`) mapped into `<Route>` elements, rather than one `<Route>` written out per page — new pages get added to this array.
- `/login` and `/callback` (OAuth redirect handler) are the only unauthenticated routes.
- Every other route is wrapped in a single `<Route element={<ProtectedRoute/>}>` parent, which uses React Router's nested-route `<Outlet/>` pattern: `ProtectedRoute` checks `isLoggingIn`/`isAuthenticated` from `useAuthContext()` and either shows a loading state, redirects to `/login`, or renders `<Outlet/>` (which renders the matched child route).
- Unknown paths (`*`) redirect to `/` via `<Navigate replace>`.
- `<Header/>` and `<Footer/>` (from `layouts/`) are rendered once, outside `<Routes>`, so they persist across page navigation — they are not part of any route.
- `App.tsx` itself also gates on `isLoggingIn` from `useAuthContext()` before rendering routes at all, showing a plain loading state first.

## API layer (axios + Zod + adapters)

Every API function follows the same pipeline:

```
axios response -> unwrap response.data.data -> Zod .safeParse against Api* schema -> adapter transforms to internal type -> return
```

- **Axios instance**: `src/api/axiosInstance.ts` — created with `baseURL: __API_BASE__` (a Vite `define` constant, not read directly from `import.meta.env`).
  - No request/response interceptors exist. Auth is attached imperatively via `setAuthToken(token)`, which sets/deletes `api.defaults.headers.common['Authorization'] = 'Bearer <token>'` directly.
  - ⚠️ **No 401/refresh handling** — an expired token isn't detected or refreshed automatically. This is a known gap, not an intentional design choice.
- **Auth token storage**: the token lives in `localStorage` under the key `authToken`. On module load, `axiosInstance.ts` reads `localStorage.getItem('authToken')` and calls `setAuthToken()` immediately, so the header survives a page refresh without waiting for `AuthContext` to mount.
- **Response envelope**: the backend wraps all payloads as `{ data: {...} }`. API functions unwrap `response.data.data` before validating — don't validate the raw axios response directly.
- **Validation**: API functions call `.safeParse()` (not `.parse()`) against the matching `Api*` schema from `schemas/api.ts`. On failure, log `parsed.error.issues` via `console.error` with a message identifying which endpoint/shape failed, then **throw** — API functions throw on invalid or failed responses, they do not return an `{ data, error }` shape.
- **Adapters run only on validated data**: the adapter is called with `parsed.data`, never with the raw response. Adapters can assume their input already matches the `Api*` shape and don't need to defensively re-check it.
- **Backend error messages**: for non-2xx responses (as opposed to Zod shape failures), the convention is to catch and extract `error.response?.data?.message`, falling back to a generic string, then throw a new `Error` with that message (see `authApi.login`). This is a **separate** error path from Zod validation failure — one surfaces the backend's own error message, the other surfaces a validation failure.
- **Typing**: every API function has an explicit return type using the internal domain type (`User`, `GroupInfo`), not the `Api*` schema type. No `any`.

Example:
```ts
// api/usersApi.ts
import api from './axiosInstance';
import userAdapter from '@/adapters/userAdapter';
import { apiGroup } from '@/schemas/api';

export const usersApi = {
  getGroupInfo: async (): Promise<GroupInfo> => {
    const response = await api.get('/group');
    const parsed = apiGroup.safeParse(response.data.data.group);
    if (!parsed.success) {
      console.error('Zod: Unexpected /group shape:', parsed.error.issues);
      throw new Error('Failed to parse group info');
    }
    return userAdapter.apiGroupToGroupInfo(parsed.data);
  },
};

export default usersApi;
```

> ⚠️ **Known inconsistency to watch for**: some API functions wrap the whole parse+adapt step in a `try/catch` that re-throws a second, more generic error message (masking the original Zod error), while others throw directly without a wrapping `try/catch`. Until this is cleaned up, **the direct-throw style (no wrapping try/catch) is the intended pattern** — new API functions should follow that, not the try/catch-and-rethrow version.

## Context layer

- One context per domain/feature (Auth, Cart, Notifications, etc.) — not one giant global context.
- Standard shape:
  ```ts
  interface XContextProps {
    data: X | null;
    loading: boolean;
    error: string | null;
    // actions
    refresh: () => Promise<void>;
    update: (input: XInput) => Promise<void>;
  }
  ```
- Contexts call the API layer inside their action functions (or `useEffect` for initial load), and manage `loading`/`error` state around the call.
- Since API functions throw on failure, contexts are responsible for catching those errors and translating them into `error` state — don't let a thrown error propagate uncaught out of a context action.
- **Always expose a custom hook**, never export the raw context. Every context exports exactly three things — the pattern is fixed, not just a suggestion:
  ```ts
  export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => { ... };

  export const useAuthContext = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
    return ctx;
  };

  export default useAuthContext;
  ```
  Import the hook via its **default export** (`import useAuthContext from '@/contexts/AuthContext'`), not a named import — this holds for every context in the codebase.
- **Provider nesting order matters** and is defined in `src/contexts/Providers.tsx`:

  ```
  NotificationProvider
    AuthProvider
      UsersProvider
        InventoryProvider
          TransactionsProvider
            CartProvider
              ClientProvider
                ModalProvider
  ```

  **Rule**: a provider must be nested *inside* (as a descendant of) every provider whose context it calls internally via `useXContext()`. This is not arbitrary — it's the required topological order given each provider's actual dependencies:

  | Provider | Depends on (calls internally) |
  |---|---|
  | `NotificationProvider` | none |
  | `AuthProvider` | none (talks to `usersApi`/`authApi` directly, not another context) |
  | `UsersProvider` | `useAuthContext` |
  | `InventoryProvider` | `useAuthContext` |
  | `TransactionsProvider` | `useUsersContext`, `useInventoryContext`, `useAuthContext` |
  | `CartProvider` | `useTransactionsContext`, `useNotificationContext` |
  | `ClientProvider` | `useAuthContext`, `useNotificationContext` |
  | `ModalProvider` | none |

  If you add a new context that calls another context's hook internally, it **must** be nested inside that provider, or React will throw a "must be used within a Provider" error at runtime. `NotificationProvider` and `ModalProvider` have no dependencies and aren't depended on by anything in the ordering-sensitive chain — their outer/inner placement is convention, not a hard requirement.

## Component layer

- Components call `useXContext()` hooks only, and render based on `{ data, loading, error }`.
- Standard pattern for handling states:
  ```tsx
  const { data, loading } = useUserContext();
  if (loading) return <Spinner />;
  if (!data) return null;
  return <UserProfile user={data} />;
  ```
- Components never duplicate context state into local `useState` unless it's purely local UI state (e.g. form input before submit).
- **Pages** (`pages/`) follow the same rule as components — they call context hooks directly (e.g. `useUsersContext()`, `useAuthContext()`, `useModalContext()`) rather than receiving data via props.
- A small subcomponent used only by one page (e.g. a list-item component) may be defined in the same file as that page rather than split into `components/`. _Confirm: is this intentional for one-off subcomponents, or should these be split out into `components/` going forward?_

## Modal pattern

Three layers, from generic to specific:

1. **`Modal.tsx`** (rendered by `ModalProvider`) — a bare full-screen overlay. Any click on the overlay itself calls `onClose` (wired to `closeModal()`). It knows nothing about popup styling or content structure.
2. **`PopupWindow.tsx`** — the actual visual modal shell almost every modal content component should render into. It provides:
   - An optional `title` header
   - A close button (`Closebutton`) wired to `closeModal()`
   - `onClick={(e) => e.stopPropagation()}` on its root **and** its content wrapper — this is what stops a click inside the popup from bubbling up to `Modal.tsx`'s overlay and closing it. Content components using `PopupWindow` don't need to handle this themselves.
3. **`ActionPopupWindow.tsx`** — a thin wrapper around `PopupWindow` for the common "confirm/accept" case: renders `children` plus a single accept button, and defaults `onAccept` to `onClose` if not provided.

**How to open a modal**: call `openModal(<YourPopupComponent {...props} />)` from `useModalContext()`, typically from a click handler in a page or component (e.g. `BalancePage`'s `UserBalance` subcomponent).

**How a modal closes itself**: content components call `closeModal()` (from `useModalContext()`) directly after a successful action — see `RefillUserBalancePopup`, which calls `closeModal()` after `addUserBalance` resolves successfully, and calls `notify(...)` instead if it fails (the modal stays open on failure so the user can retry).

**Convention**: new modal content should be built on `PopupWindow` (or `ActionPopupWindow` if it's a single accept-action popup) rather than passed to `openModal()` as raw, unwrapped JSX — building raw content directly loses the click-outside-to-close safety, the standard header, and the close button for free.

## Types

- Location: `src/types/global.d.ts` — ambient/global, so internal domain types (`User`, `GroupInfo`) are used across the codebase without explicit imports.
- Raw backend response types live separately as Zod-inferred types in `schemas/api.ts` (`ApiUser`, `ApiGroup`, etc.) — these are **not** the same as the internal domain types and should never be used directly in components or contexts.
- Since types are hand-written (not generated from backend), **when the backend contract changes, the schema + adapter + type + API function must all be updated simultaneously.**

## Environment & tooling

- `__API_BASE__` — a Vite `define` constant (not a plain `import.meta.env` var) resolved in `vite.config.ts` from `env.API_URL` or `process.env.VITE_API_URL`, falling back to `http://localhost:9999` in test mode, or throwing at build time if unset otherwise.
- Vite dev server proxies `/api` → the backend (`env.API_URL` / `VITE_API_URL`, default `http://localhost:8080`), rewriting away the `/api` prefix.
- ⚠️ **Env var name mismatch**: `.env.example` documents `VITE_BASE_URL`, but the code actually reads `API_URL` / `VITE_API_URL`. Anyone copying `.env.example` as-is will get an undefined base URL. This should either be fixed in `.env.example` or the code should be updated to match — until then, use `VITE_API_URL`, not `VITE_BASE_URL`.

## Testing

- Framework: **Vitest** (`describe`/`it`/`expect`/`vi`) + `@testing-library/react` + `@testing-library/user-event`.
- Test files live under `src/tests/`, mirroring the `src/` folder structure (`tests/api/`, `tests/layout/`), rather than being co-located next to the source file.
- **Mocking axios**: `vi.mock('../../api/axiosInstance')`, then cast the mocked module to an object of `vi.fn()`s for `get`/`post`/`patch` and set return values per-test with `mockResolvedValueOnce` / `mockRejectedValueOnce`.
- **No shared global `render()` test util yet** — each test file defines its own local wrapper function for the providers it needs, e.g.:
  ```tsx
  function renderWithBrowserRouter(children: React.ReactNode) {
    return render(<BrowserRouter><AuthProvider>{children}</AuthProvider></BrowserRouter>);
  }
  ```
  If more tests start needing the same provider combinations, consider consolidating into a shared test-utils file rather than duplicating these wrappers per test file.

## Golden path example

Use this as the template when adding a new resource end-to-end:

1. `schemas/api.ts` — define the raw `Api*` Zod schema (e.g. `apiProduct`)
2. `types/global.d.ts` — define the internal domain type (`Product`)
3. `adapters/productAdapter.ts` — `apiProductToProduct(apiProduct): Product`
4. `api/productApi.ts` — `getProduct`, `createProduct`, etc. (unwrap response -> `.safeParse` -> adapt -> return)
5. `contexts/ProductContext.tsx` — `ProductProvider`, `useProductContext()` + `export default useProductContext` (calls the API layer, catches thrown errors into `error` state)
6. Add `ProductProvider` to `contexts/Providers.tsx` in the correct nesting position relative to any context it depends on
7. `components/ProductCard.tsx` or `pages/ProductPage.tsx` — consumes `useProductContext()` via its default import

## Anti-patterns to avoid

- ❌ Calling axios directly inside a component
- ❌ Putting business logic in the API layer
- ❌ Exporting a context object directly instead of a hook
- ❌ Duplicating context state into local component state
- ❌ Using `any` for API response types
- ❌ Using an `Api*` schema type directly in a component or context instead of the adapted internal type
- ❌ Calling `.parse()` instead of `.safeParse()` in the API layer (throws an uncontrolled ZodError instead of a clean, logged failure)
- ❌ Wrapping the parse+adapt step in a try/catch that re-throws a generic error, masking the original Zod validation error
- ❌ Passing raw, unwrapped JSX to `openModal()` instead of building on `PopupWindow`/`ActionPopupWindow` (loses click-outside-to-close, header, and close button)
- ❌ Adding a new context provider to `Providers.tsx` without checking whether it needs to sit inside a provider it depends on
- _Add project-specific gotchas here as they come up_

---
*This is a living document — update it when conventions change or new patterns are introduced.*
