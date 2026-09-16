# Week_10 NestJS Course — Consumer-Derived Contract (Design)

**Date:** 2026-09-13
**Status:** Approved by user (design presented and approved 2026-09-13)
**Supersedes (in part):** `2026-09-12-nestjs-ecommerce-api-cursor-course-design.md` —
that spec's "drop-in replacement for dummyjson" premise and its dummyjson-capture
mechanics (lesson 03, lesson 09 fetch, lesson 15 live diff) are replaced by this
document. The rest of that spec (stack, folder, format contract, lesson count,
Cursor prompt template, review cycle, endpoints and paths) still holds.

## Why this change

The original course had students capture dummyjson.com's real responses and
build an API that copies them byte-for-byte. That taught "clone an existing
API" — not the situation most students will actually face, where there is no
reference API and the contract has to be **designed** from what the consumer
(the React app) needs. This spec moves the course to that premise: dummyjson
is dropped as a source of truth; the React app's own source code becomes it.

**Governing idea, stated in lesson 01 and lesson 03:** the React app was
prototyped against a public mock API that we don't control and won't ship
with. Our job is to read what the app actually declares it needs — its
TypeScript types, its API client, its mock handlers — and design + build the
real backend from that. The "drop-in replacement" payoff in lesson 23 (flip
one env var, nothing else changes) still lands, but now because the contract
was *derived from* the consumer instead of *copied from* a third party.

## What stays unchanged from the 2026-09-12 spec

- Stack: NestJS 12 (ESM) + Prisma 7.10 (pinned) + PostgreSQL 17 in Docker.
- Location, format contract, CSS blocks, 24-lesson count, eyebrow/nav scheme.
- Five endpoints and their paths (unchanged — they come from the client's
  `api.ts`, which was never dummyjson-specific in the first place):
  `GET /products/categories`, `GET /products`, `GET /products/category/:slug`,
  `GET /products/:id`, `POST /carts/add`.
- Cursor five-part prompt template, review cycle, `.cursor/rules/project.mdc`.
- Reference project: branch from git tag `lesson-08` in the scratchpad
  `ecommerce-api` project (scaffold → docker → prisma init → schema →
  migration are untouched by this change; divergence starts at lesson 09).

## What changes

### 1. Contract source: the consumer's code, not dummyjson

Lesson 03 (renamed, see below) has the student open five files in the React
app and read them as a spec:

- `src/features/products/types.ts` — `Product`, `Category`, `ProductDimensions`,
  `ProductReview`, `ProductMeta`, `FetchProductsResponse`.
- `src/features/products/api.ts` — the five call sites, their query params,
  and defaults (`page = 1, limit = 20`).
- `src/shared/types/generic.type.ts` — `Pagination { total, skip, limit }`.
- `src/shared/api/client.ts` — `ApiError` reads `error.response.data.message`,
  meaning every error body we design **must** carry a `message` field.
- `src/features/checkout/{api.ts,schema.ts}` — `PlaceOrderPayload`,
  `PlaceOrderResponse { id: number }`, and the zod-validated address shape
  the server must re-validate.
- `src/test/msw/{handlers.ts,fixtures.ts}` — confirms shapes and status codes
  (201 for cart add) independent of the type files, as a cross-check.

The output is `docs/api-spec.md`, written by the student (by hand, not by
Cursor — see §5), containing: the five endpoints and their query params, the
`Product` interface with every field's type, the list envelope and its
pagination rule, the category shape, the two error shapes (404 / 400), and
the order response shape. This file replaces `docs/contract/` entirely.
`Week_10/.../content/contract/` (the dummyjson captures added on 2026-09-13,
untracked) is deleted — it's no longer the course's premise.

### 2. Fields we now own — three decisions, each justified from the client

| Field / behavior | Old (dummyjson-copied) | New (self-designed) | Why |
| --- | --- | --- | --- |
| `brand` | optional, 92/194 products lack the key | **required** `string` | Client types it `brand: string` (no `?`). We own the data, so every product gets a brand. |
| `discountPercentage` | always present (dummyjson happens to always send it) | **optional**, omit key when absent | Client types it `discountPercentage?: number`, and `calculateOriginalPrice` in `price.utils.ts` already treats it as possibly `undefined`. This becomes the "omit null/undefined field" teaching point that `brand` served before. |
| List envelope `limit`/`skip` | `limit` echoes rows *actually returned* (dummyjson quirk); `limit=0` means "all" | `skip`/`limit` **echo the request**; `limit` constrained `1–100` via DTO validation, `skip` `≥ 0`; out-of-range → `400` | No client call site needs quirky echo semantics (grep of every `getProducts`/`getProductsByCategory` call site: `limit` 5, 12, 20, or default 20 — all comfortably inside 1–100). A validated range gives lessons 13/17 real DTO-validation content instead of copying an arbitrary external behavior. |
| Unknown category slug | 200 + empty envelope (matches dummyjson) | **kept: 200 + empty envelope** | A syntactically valid query that matches nothing is not an error. Also required: `Category.tsx` calls `useQuery` un-guarded on category change — a 404 here would trip `isError` and render the error component instead of an empty grid, which is not what the empty-category UI does today. |
| Product not found (`GET /products/:id`) | 404, dummyjson's literal string | **404**, our own message, still containing `message` (required by `ApiError`) | `ParseIntPipe` on a non-numeric id → **400** (Nest's standard shape). Both are now specified behavior, not an "accepted deviation" apologized for. |
| Order response | dummyjson's cart body (`id` from dummyjson's own counter) | Receipt we design: `id`, `userId`, `products[]` (id, title, price, quantity, `total`, `discountPercentage`, `discountedPrice`, `thumbnail`), `total`, `discountedTotal`, `totalProducts`, `totalQuantity` | Client's `PlaceOrderResponse` is only `{ id: number }` and checkout ignores the rest — but an order endpoint that returns *only* an id leaves no way for any client to confirm what was bought. We design a full receipt as the responsible API design choice; the client safely ignores fields it doesn't read. Keeps lessons 18–19's transaction / price-snapshot / rounding content intact. |
| Discount rounding | `Math.round(total × (1 − pct/100))` → whole number | `Math.round(total × (1 − pct/100) × 100) / 100` → **2 decimal places** | We're not copying dummyjson's integer rounding anymore; money at 2dp is the defensible choice for an API we own. Changes the worked numeric example (see §3). |

`ProductResponseDto` (read by the Swagger CLI plugin in lessons 21–22) is the
single compile-time and Swagger-facing type. The lesson-15 zod schema (§4) is
explicitly **runtime-only**, validating our own live responses — the spec
must say this once, in lesson 15, so lessons 21–22 don't grow a third
"official" shape.

### 3. Seed data: `faker`, not a live dummyjson fetch (lesson 09 rewrite)

Lesson 09 becomes "write a seed generator" instead of "fetch dummyjson and
insert it":

- `npm i -D @faker-js/faker@<exact pinned version>` — pinned the same way the
  course already pins Prisma and `postgres:17`, because faker's locale data
  can shift between minor versions and lesson prose quotes generated values.
- A 24-entry category list the student writes by hand (name + slug), matching
  the count the old course used, but now *our* list, not dummyjson's.
- **Product id 1 is hand-authored in the seed script**, not faker-generated —
  every worked example the course quotes by exact value (price, discount,
  the lesson-16/18/19 cart-add walkthrough) references this row, so it must
  be pinned text, not a function of faker's PRNG. `faker.seed(20260913)` then
  generates the remaining rows for byte-identical bulk data across machines,
  but no lesson quotes a bulk row by value.
- Product id 1 also carries **all 22 fields**, including `discountPercentage`
  — it is the row lessons 11 and 13 point their `Object.keys(product).length
  === 22` assertion at, since `discountPercentage` is now sometimes omitted
  across the dataset.
- Ids 1–200, one category with more than 20 products (so lesson 23's
  Category page, which paginates at `PAGE_LIMIT = 20`, has two real pages to
  click through), every category non-empty (Category page defaults to
  `categories[0]`), 3 reviews per product, `picsum.photos` URLs for images.
- **Worked numeric example (2dp rounding):** id 1 = price `9.99`,
  `discountPercentage 10.48`, ordered qty `2`. `total = 9.99 × 2 = 19.98`.
  `discountedPrice = Math.round(19.98 × (1 − 10.48/100) × 100) / 100 =
  Math.round(1788.6096) / 100 = 1789 / 100 = 17.89`. This replaces the old `→ 18` example in
  lessons 16, 18 and 19 end to end — every quoted number in those three
  lessons must be recomputed from this row, not carried over from the
  dummyjson-derived draft.

### 4. Verification: node/curl per lesson, zod becomes the executable contract in lesson 15

Lessons 10–14 drop the "capture dummyjson, `diff` against it" pattern (there
is nothing external to diff against). Each keeps the same shape — curl the
new endpoint, then verify — but the check becomes small `node -e` assertions
against `docs/api-spec.md`'s stated rules: key count, key names, JS `typeof`
per field, envelope keys, status code. Each check still ends with a clear
pass/fail echo (e.g. `&& echo OK`), matching the crispness of the old
`&& echo IDENTICAL` rather than a silent-on-success assertion.

Lesson 15 keeps its identity ("checking the contract") but its content
changes to **making the contract executable**:
- `npm i zod`
- `src/contract/*.schema.ts` — zod schemas mirroring `docs/api-spec.md`
  (`productSchema`, `categorySchema`, `listEnvelopeSchema`, `orderResponseSchema`).
- `scripts/contract-check.ts` — calls the student's own running API (not
  dummyjson — there is nothing external to call now) for every endpoint and
  edge case, parses each response through the matching zod schema, and
  fails loudly with the schema's own error path on a mismatch.
- The existing sabotage/"AI gets this wrong" exercise is kept and improved:
  breaking a field now produces a zod error naming the exact path, a better
  teaching artifact than the old raw-diff output.
- One sentence pins the three-representations rule from §2: the DTO class is
  compile-time/Swagger truth; this zod schema is a separate, runtime-only
  check of our own API, not a duplicate "official" type.

### 5. Lesson 03 rewrite: "อ่านโค้ดฝั่ง client แล้วออกแบบสัญญาเป็นของตัวเอง"

Student-authored, not Cursor-authored — same principle as before
("AI เดาสัญญาแทนไม่ได้"), now pointed at reading code instead of copying a
capture:

1. Open the five client files listed in §1, one at a time, noting what each
   proves (the `?` on `discountPercentage`, the lack of `?` on `brand`, the
   `Pagination` interface, the `message` field `ApiError` requires, `201` in
   the MSW handler).
2. Write `docs/api-spec.md` by hand: endpoints, `Product`/`Category`/
   envelope shapes, the two error shapes, the order response shape, the
   `limit` 1–100 / `skip` ≥ 0 validation rule.
3. **Cross-check with Cursor in Ask mode** (not Agent): `@`-mention the same
   five client files and ask Cursor whether the draft spec missed anything.
   The student's draft is the artifact of record; Cursor is a second pair of
   eyes, not the author — mirrors the course's existing "AI reviews, human
   decides" stance rather than introducing a new one.
4. Compare against the lesson's own printed reference spec and commit.

Workshop/verification sections follow the existing house style (checklist of
concrete commands, not prose).

### 6. Cascading edits to other lessons

- **01** — endpoints table and project-tree stay (same five endpoints); the
  framing paragraph changes from "dummyjson contract" to "the contract we'll
  design from the client's code"; the "five lessons without Cursor" reasoning
  for lesson 3 is reworded (still hand-authored, now for a different reason).
- **04** — `.cursor/rules/project.mdc`'s `docs/contract/` line becomes
  `docs/api-spec.md`; prompt-template example context lines that referenced
  captured payloads now reference the spec file.
- **07** (Prisma model) — "open `docs/contract/product-1.json`" becomes "open
  `docs/api-spec.md`"; the `brand`/`discountPercentage` nullability swap from
  §2 changes which column is nullable in the schema walkthrough.
- **09** — full rewrite per §3.
- **10, 12, 13, 14** — `@docs/contract/*.json` mentions in Cursor prompts
  become `@docs/api-spec.md`; "compare with the captured file" verification
  steps become the node/curl assertions from §4; lesson 13/17 pagination
  content is rewritten around the `1–100` validated range instead of
  dummyjson's echo/zero-means-all quirks.
- **11** (mapper) — conditional-omit teaching point moves from `brand` to
  `discountPercentage`; the 22-key assertion points at seed id 1 specifically
  (per §3).
- **15** — full rewrite per §4.
- **16, 18, 19** (orders) — response shape and all worked numbers per §2/§3
  (2dp rounding, id-1 example, full receipt shape).
- **17** (cart DTO validation) — unaffected in structure (address validation
  rules are independent of the contract-source change); example error bodies
  updated to match the new `message`-carrying error shape from §2.
- **23** — no functional change (env var flip still works); framing sentence
  updated to say the contract was designed from this app's own code, so the
  match is expected rather than a coincidence to marvel at.
- **24** (wrap-up) — project tree: `docs/contract/` → `docs/api-spec.md`;
  `scripts/contract-check.ts` description updated to "validates our own API
  against the zod contract" instead of "diffs against dummyjson".
- **20, 21, 22, 02, 05, 06, 08** — untouched.

### 7. Housekeeping

- Delete `Week_10/.../content/contract/` (untracked; created 2026-09-13,
  superseded by this design before being committed).
- New reference file the course ships: `Week_10/.../content/api-spec.md` (the
  printed reference version of what lesson 03 has the student derive) —
  replaces the old `contract/README.md`.
- Reference project: create a new branch/worktree from tag `lesson-08` in the
  scratchpad `ecommerce-api` project; re-verify lessons 09 onward against
  this design (seed generator, validated pagination, new order shape, zod
  contract check) with real command output before any lesson claims a
  command's result. Re-tag `lesson-09` … `lesson-22` as each is re-verified.
- Git: only Week_10 files and this spec are touched; Week_09's in-progress
  changes from the other session are left alone.

## Open items resolved during design (for the record)

- Money rounding: **2 decimal places** (not dummyjson's integer rounding) —
  because we now own the pricing model.
- Cursor's role in lesson 03: **Ask-mode cross-check**, not spec author.
- `limit` range **1–100**: checked against every client call site
  (`Home.tsx`: 5, 12; `Category.tsx`: `PAGE_LIMIT = 20`; `api.ts` default 20)
  — none falls outside the range, so no client call trips the new 400.
