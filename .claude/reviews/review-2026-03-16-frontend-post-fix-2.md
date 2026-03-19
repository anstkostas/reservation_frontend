# Frontend Code Review — Pass 3 (Post-Fix Verification)
**Date:** 2026-03-16
**Scope:** `reservation_frontend/src/`
**Context:** Third and final pass — verifies all fixes from pass 1 and pass 2 were applied correctly, and scans for any remaining issues.

---

## Summary of Previous Passes
- **Pass 1** (3 Critical, 7 Warning, 5 Suggestion) → all resolved
- **Pass 2** (0 Critical, 4 Warning, 6 Suggestion) → all resolved (1 suggestion dropped)

---

## Findings

### WARNINGS

---

[WARNING] Unused `step` state in `ReservationCreateModal`
File: `src/features/reservations/components/ReservationCreateModal.jsx:38`
Issue: `const [step, setStep] = useState(1)` is declared but `setStep` is never called anywhere in the component. The comment `// 1 = Form, 2 = Success (optional, or just close)` reveals a multi-step flow was planned but never implemented.
Why it matters: Dead state adds confusion — it implies a flow that doesn't exist, and it causes React to maintain unnecessary state on every render. ESLint would flag this as an unused variable.
Fix direction: Remove the `step` state declaration and the comment entirely.

---

[WARNING] Unused `action` variable in `OwnerDashboard.handleResolve`
File: `src/features/reservations/pages/OwnerDashboard.jsx:40`
Issue: `const action = status === 'completed' ? 'Check in' : 'no-show';` is declared but never referenced — it is neither passed to `toast.promise` nor used elsewhere in the function.
Why it matters: Dead code; ESLint `no-unused-vars` would flag it. Looks like it was intended for the toast message but was never wired up.
Fix direction: Remove the `action` variable, or wire it into the toast messages if the intent was to use it there.

---

[WARNING] Missing mutation objects in `useEffect` dependency array
File: `src/features/reservations/components/ReservationDetailModal.jsx:66–78`
Issue: The `useEffect` calls `cancelMutation.reset()` and `updateMutation.reset()` (lines 75–76) but neither `cancelMutation` nor `updateMutation` appears in the dependency array `[open, reservation, form]`.
Why it matters: ESLint exhaustive-deps would flag this. While TanStack Query mutation objects are stable between renders (so it won't cause a bug in practice), it's a documented convention violation and would produce a linter warning.
Fix direction: Add `cancelMutation.reset` and `updateMutation.reset` to the dependency array, or extract the `.reset` calls into a `useCallback` and include that in the array.

---

### SUGGESTIONS

---

[SUGGESTION] `mutate()` callbacks vs `async/await` in `ReservationCreateModal.onSubmit`
File: `src/features/reservations/components/ReservationCreateModal.jsx:50–70`
Issue: `onSubmit` uses `createMutation.mutate(...)` with inline `onSuccess`/`onError` callbacks instead of `mutateAsync` + try/catch. This is inconsistent with `ReservationDetailModal`, which uses `await mutateAsync(...)` throughout.
Why it matters: The project convention is `async/await` everywhere. Callbacks are not `.then()/.catch()` chains, but they achieve the same result with the same drawbacks (visual nesting, harder to trace execution flow). The inconsistency between the two modals is a readability smell.
Fix direction: Convert `onSubmit` to `async`, switch to `createMutation.mutateAsync`, wrap in try/catch, and move the toast calls inside the block.

---

[SUGGESTION] Mixed icon libraries in `ReservationDetailModal`
File: `src/features/reservations/components/ReservationDetailModal.jsx:29`
Issue: `AiOutlineLoading3Quarters` is imported from `react-icons/ai`. All other icons in the codebase use Lucide React (`lucide-react`).
Why it matters: `react-icons` is an additional dependency not listed in the project stack. Adding a second icon library increases bundle size and fragments the visual design system — if the Lucide style ever changes, this icon won't match.
Fix direction: Replace `AiOutlineLoading3Quarters` with `Loader2` from `lucide-react` and apply the `animate-spin` class — Lucide's `Loader2` is the standard loading spinner used elsewhere (e.g. `ReservationCreateModal`).

---

[SUGGESTION] Hardcoded fallback URL in `fetch.js`
File: `src/lib/fetch.js:2`
Issue: `const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api"` silently falls back to a hardcoded dev URL if the env var is missing in production.
Why it matters: If `VITE_API_URL` is accidentally omitted from a deployment, all API calls silently hit `localhost:3000` — the app appears to load but all data calls fail with no obvious indication of why.
Fix direction: Log a warning (or throw in production) if `VITE_API_URL` is not defined, rather than silently falling back. Acceptable as-is for a local-only project, but worth noting.

---

## Verified Clean (previously fixed)

| Item | Status |
|------|--------|
| `isLoading` → `isPending` on all 3 mutations (AuthProvider) | ✅ Clean |
| `invalidateQueries(["me"])` → v5 object syntax (AuthProvider) | ✅ Clean |
| Role guard added to `ProtectedRoute` | ✅ Clean |
| Logout error surfaced via toast (Navbar) | ✅ Clean |
| `window.confirm()` → `AlertDialog` (ReservationDetailModal) | ✅ Clean |
| `isCancelConfirmOpen` reset in `useEffect` (ReservationDetailModal) | ✅ Clean |
| Nested `<FormControl>` removed (SignupRestaurantDetails) | ✅ Clean |
| Capacity label: `"persons"` → `"Tables"` (RestaurantCard) | ✅ Clean |
| Import path `../useRestaurants` → `../queries` (RestaurantList, RestaurantDetails) | ✅ Clean |
| `useReservations.js` / `useRestaurants.js` marked `@deprecated` | ✅ Clean |
| `.sort()` → `.toSorted()` (OwnerDashboard, ReservationHistory) | ✅ Clean |
| Loose equality `==` / `!=` → strict (RestaurantDetails) | ✅ Clean |
| Unused imports removed (RestaurantCard) | ✅ Clean |
| `EmptyState` unused `type` prop removed (ReservationHistory) | ✅ Clean |
| `normalizeApiError` rewritten as `async` (apiError.js) | ✅ Clean |
| `queryKey: ["/unowned-restaurants"]` → `["unowned-restaurants"]` (restaurants/queries.js) | ✅ Clean |
| Route role guards applied to `/my-reservations` and `/owner-dashboard` (router.jsx) | ✅ Clean |
| All reservation queries/mutations use v5 `{ queryKey: [...] }` invalidation syntax | ✅ Clean |

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| Warning | 3 |
| Suggestion | 3 |

**Most important to address first:** The unused `step` state (Warning 1) and unused `action` variable (Warning 2) — both would trigger ESLint and represent genuine dead code. Simple one-line removals with no risk.

**Pattern to note:** The `react-icons` dependency in `ReservationDetailModal` is the only place outside Lucide for icons in the entire codebase. Likely a leftover from early development that slipped through the Lucide migration.
