# Frontend Architecture

This document describes how data flows through the frontend and the conventions every feature should follow.

## Stack

- React + TypeScript + Vite
- Axios for HTTP
- Zod for API response validation
- React Context + custom hooks for state
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
  layouts/        # page layouts (header/footer)
  pages/          # route pages (HomePage.tsx, ProductPage.tsx)
  schemas/        # Zod schemas for api response validation
  styles/         # global styles
  tests/          # unit and integration tests
  types/          # shared TypeScript interfaces/types
```

Naming conventions:
- API file: `xApi.ts`, exports an object of plain async functions (`usersApi.getCurrentUser`, `usersApi.getUsers`)
- Context file: `XContext.tsx`, exports `XProvider` and `useXContext()`
  - **Established exception**: `AuthContext`'s hook is `useAuthContext()`, not `useAuthContext()`. Every other context calls it this way (`UsersContext`, `InventoryContext`, `TransactionsContext`, `ClientContext`), so this is the correct, intentional name — don't rename it to match the `useXContext()` pattern.
- Schema file: `schemas/api.ts` — Zod schemas prefixed `Api*` (`ApiUser`, `ApiGroup`, `ApiGroupMember`) representing the **raw backend shape**, not the internal domain type
- Adapter file: `adapters/xAdapter.ts` — default-exports an object of pure functions named `apiXToY` (e.g. `userAdapter.apiUserToUser`, `userAdapter.apiGroupMemberToUser`), converting a validated `Api*` schema type into an internal domain type (`User`, `GroupInfo`, etc.)

## API layer (axios + Zod + adapters)

Every API function follows the same pipeline:

```
axios response -> unwrap response.data.data -> Zod .safeParse against Api* schema -> adapter transforms to internal type -> return
```

- **Axios instance**: `src/api/axiosInstance.ts` — base URL, headers, interceptors.
  - Base URL comes from `VITE_API_URL` env var.
  - _Fill in: any interceptors (auth token attach, refresh-on-401, logging)?_
- **Auth token handling**: _Fill in: where is the token stored (memory, localStorage, cookie) and how is it attached to requests?_
- **Response envelope**: the backend wraps all payloads as `{ data: {...} }`. API functions unwrap `response.data.data` before validating — don't validate the raw axios response directly.
- **Validation**: API functions call `.safeParse()` (not `.parse()`) against the matching `Api*` schema from `schemas/api.ts`. On failure, log `parsed.error.issues` via `console.error` with a message identifying which endpoint/shape failed, then **throw** — API functions throw on invalid or failed responses, they do not return an `{ data, error }` shape.
- **Adapters run only on validated data**: the adapter is called with `parsed.data`, never with the raw response. Adapters can assume their input already matches the `Api*` shape and don't need to defensively re-check it.
- **Typing**: every API function has an explicit return type using the internal domain type (`User`, `GroupInfo`), not the `Api*` schema type. No `any`.

Example:
```ts
// api/usersApi.ts
import api from './axiosInstance';
import userAdapter from '../adapters/userAdapter';
import { apiGroup } from '../schemas/api';

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
- **Always expose a custom hook**, never export the raw context:
  ```ts
  export function useAuthContext() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
    return ctx;
  }
  ```
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

  **Rule**: a provider must be nested *inside* (as a descendant of) every provider whose context it calls internally via `useXContext()`/`useAuthContext()`. This is not arbitrary — it's the required topological order given each provider's actual dependencies:

  | Provider | Depends on (calls internally) |
  |---|---|
  | `NotificationProvider` | none |
  | `AuthProvider` | none (talks to `usersApi`/`authApi` directly, not another context) |
  | `UsersProvider` | `useAuth` |
  | `InventoryProvider` | `useAuth` |
  | `TransactionsProvider` | `useUsersContext`, `useInventoryContext`, `useAuth` |
  | `CartProvider` | `useTransactionsContext`, `useNotificationContext` |
  | `ClientProvider` | `useAuth`, `useNotificationContext` |
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

## Types

- Location: `src/types/global.d.ts` — ambient/global, so internal domain types (`User`, `GroupInfo`) are used across the codebase without explicit imports.
- Raw backend response types live separately as Zod-inferred types in `schemas/api.ts` (`ApiUser`, `ApiGroup`, etc.) — these are **not** the same as the internal domain types and should never be used directly in components or contexts.
- Since types are hand-written (not generated from backend), **when the backend contract changes, the schema + adapter + type + API function must all be updated simultaneously.**

## Environment & tooling

- `VITE_API_URL` — backend base URL, set per environment (`.env.development`, `.env.production`)
- _Fill in: any Vite dev server proxy config for local backend calls?_
- _Fill in: other env vars worth documenting_

## Testing

- _Fill in: how do you mock axios in tests (msw, jest.mock, axios-mock-adapter)?_
- _Fill in: is there a custom `render()` test util that wraps components in providers?_

## Golden path example

Use this as the template when adding a new resource end-to-end:

1. `schemas/api.ts` — define the raw `Api*` Zod schema (e.g. `apiProduct`)
2. `types/global.d.ts` — define the internal domain type (`Product`)
3. `adapters/productAdapter.ts` — `apiProductToProduct(apiProduct): Product`
4. `api/productApi.ts` — `getProduct`, `createProduct`, etc. (unwrap response -> `.safeParse` -> adapt -> return)
5. `contexts/ProductContext.tsx` — `ProductProvider`, `useProductContext()` (calls the API layer, catches thrown errors into `error` state)
6. `components/ProductCard.tsx` or `pages/ProductPage.tsx` — consumes `useProductContext()`

## Anti-patterns to avoid

- ❌ Calling axios directly inside a component
- ❌ Putting business logic in the API layer
- ❌ Exporting a context object directly instead of a hook
- ❌ Duplicating context state into local component state
- ❌ Using `any` for API response types
- ❌ Using an `Api*` schema type directly in a component or context instead of the adapted internal type
- ❌ Calling `.parse()` instead of `.safeParse()` in the API layer (throws an uncontrolled ZodError instead of a clean, logged failure)
- ❌ Wrapping the parse+adapt step in a try/catch that re-throws a generic error, masking the original Zod validation error
- _Add project-specific gotchas here as they come up_

---
*This is a living document — update it when conventions change or new patterns are introduced.*