# Week_10 NestJS Course — Consumer-Derived Contract Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework `Week_10/02_nestjs_ecommerce_api_with_cursor_v2` so the API contract is designed by the student from the React consumer's own source code (types, API client, MSW fixtures) instead of captured from dummyjson.com, and rebuild the scratchpad reference project + every affected lesson to match.

**Architecture:** The reference NestJS project (scratchpad `ecommerce-api`, tag `lesson-06`) is branched and rebuilt lesson-by-lesson from lesson 07 onward with the new contract decisions (brand required, discountPercentage optional, validated 1–100 pagination, self-designed order receipt, 2dp rounding). Each lesson task edits or rewrites the corresponding `.html` file in the course content, using real command output captured from the rebuilt reference project as evidence — never invented output.

**Tech Stack:** NestJS 12 (ESM) + Prisma 7.10 + PostgreSQL 17 (unchanged) · `@faker-js/faker@10.6.0` (new, seed data) · `zod@4.6.2` (new, runtime contract checks) · `tsx` (already present, now also runs `contract-check.ts`).

**Spec:** `docs/superpowers/specs/2026-09-13-nestjs-course-consumer-derived-contract-design.md`

## Global Constraints

- Course location, format contract (Thai narration, `<html lang="th">`, eyebrow/nav scheme, `.workshop`/`.expected-result`/`.verification`/`.cursor-prompt`/`.review` sections), 24-lesson count, and Cursor five-part prompt template are unchanged — see the 2026-09-12 spec for the full format contract; do not restate or redesign it.
- **No lesson filenames are renamed** — even lessons that are fully rewritten (03, 09, 15) keep their existing filename so every `<nav>` `href` across the other 23 lessons and `index.html` stays valid without a repo-wide link-rewrite pass. Only `<title>`, eyebrow text stays the same pattern, and body content change.
- **Correction to the design spec's "unchanged" list:** the spec claimed lessons 02, 05, 06, 08, 20, 21, 22 need no changes. Verified by grep against the actual lesson files and the reference project's git history, this is only true for **02, 06, 20**. Lessons **05, 08, 21, 22** each contain a fact that depends on the old contract (dummyjson-framed APP_URL justification, a psql column-nullability walkthrough baked from the old schema, a Swagger description string calling the API "a drop-in replacement for dummyjson.com", and a stray `/products/194` example plus an "8 lines" contract-check claim) and are added to this plan as small edit tasks. This is a scope correction discovered during planning, not a reopening of the approved design.
- **Reference project:** scratchpad path `/private/tmp/claude-501/-Users-varis-Sites-varis-lab-frontend-bootcamp-content-7-july-2026/16431c67-c41f-48ab-8541-21a433bf6c5d/scratchpad/verify/ecommerce-api`, tags `lesson-02` … `lesson-22` already exist. **Branch from tag `lesson-06`** (not `lesson-08` as the spec first suggested — verified: lesson 07 is where `schema.prisma`'s models are first authored, and lesson 08's committed migration SQL is generated from that schema, so both encode the old brand/discountPercentage nullability and must be redone). Create a new branch `rework-consumer-contract` from `lesson-06` there before Task 1. Every lesson task that touches the reference project commits on that branch and re-tags `lesson-NN` (overwriting the old tag) once its content is verified.
- **Tag-drift correction (found during Task 6):** the old `lesson-07`…`lesson-22` tags are all on the ORIGINAL (pre-rework) branch, a sibling of `rework-consumer-contract`, not an ancestor of it — once Task 1 branches off, those old tags stay stuck on abandoned history unless a task explicitly moves them. A task that edits reference-project code naturally re-tags its own lesson number when it commits, but an **HTML-only task (no reference-project changes — e.g. lessons 04/05, 09's prose-adjacent siblings, 14, 17, 23) must still force-move its own `lesson-NN` tag to the current tip of `rework-consumer-contract`** (`git tag -f lesson-NN <current-HEAD>`, no new commit needed) before finishing — otherwise the *next* lesson's audit `@`-mention check (which walks `lesson-{n-1}`'s tree) silently validates against the wrong sibling-branch history. This bit Task 6 concretely: Task 5 (lesson 10, HTML-only) never moved `lesson-10`, so Task 6 found it pointing at abandoned history and had to reconstruct lesson 10's reference code from the published HTML to unblock the audit. Every task from 7 onward must check `git tag -f lesson-NN <rework-consumer-contract HEAD>` as part of its own completion, whether or not it created a new scratchpad commit.
- **Every command shown in a lesson must actually be run against the rebuilt reference project during that lesson's task, with its real output captured** — never invent curl/psql/node output. If real output differs from what a step below predicts, use the real output and flag the discrepancy in the task's completion note.
- **Money is 2 decimal places**, not whole numbers: `round2(x) = Math.round(x * 100) / 100`.
- **`brand` is required** (`string`, always present). **`discountPercentage` is optional** (present only when the product has a discount; omit the key, don't send `null`, when absent).
- **Pagination:** `skip` (`@IsInt() @Min(0)`, default `0`) and `limit` (`@IsInt() @Min(1) @Max(100)`, default `20`) are both validated; out-of-range or non-integer → `400`. The envelope's `skip`/`limit` **echo the request** (not `rows.length`, not a "0 means all" special case).
- **New dataset:** 24 categories (same slugs/names as the old course — generic e-commerce category names, not dummyjson-proprietary), 208 products total, generated by `@faker-js/faker@10.6.0` with `faker.seed(20260913)`. `beauty` has exactly 5 products (ids 1–5), `groceries` has exactly 27 products, every other category has exactly 8. **Product id 1 is hand-authored** (not faker-generated) — see Task 3 for its exact fields; it is the row every lesson quotes by exact value and the row used for the "22 keys present" assertion.
- **Order receipt (`POST /carts/add`, 201):** `{ id, userId, products: [{ id, title, price, quantity, total, discountPercentage?, discountedPrice, thumbnail }], total, discountedTotal, totalProducts, totalQuantity }`.

---

### Task 1: Rebuild the schema (lessons 07–08) with the new nullability

**Files:**
- Reference project (branch `rework-consumer-contract` from tag `lesson-06`): `prisma/schema.prisma`, `prisma/migrations/<new-timestamp>_init/migration.sql`
- Modify: `Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/07_modeling-products-in-prisma.html`
- Modify: `Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/08_running-the-first-migration.html`

**Interfaces:**
- Produces: the `Product` model with `brand String` (required) and `discountPercentage Float?` (nullable) — every later task that touches `Product` (mapper, DTO, service) assumes this exact nullability.

- [ ] **Step 1: Branch the reference project**

```bash
SCRATCH=/private/tmp/claude-501/-Users-varis-Sites-varis-lab-frontend-bootcamp-content-7-july-2026/16431c67-c41f-48ab-8541-21a433bf6c5d/scratchpad/verify/ecommerce-api
cd "$SCRATCH"
git switch -c rework-consumer-contract lesson-06
```

Expected: branch created, `git log --oneline -1` shows the lesson-06 commit.

- [ ] **Step 2: Edit `prisma/schema.prisma`** — apply exactly this diff to the `Product` model (the rest of the file, including `Category` and `Review`, is unchanged from tag `lesson-06`... but `lesson-06` has no models yet, so write the full schema):

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

// Get a free hosted Postgres database in seconds: `npx create-db`

generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model Category {
  id       Int       @id @default(autoincrement())
  slug     String    @unique
  name     String
  products Product[]
}

model Product {
  id                   Int      @id
  title                String
  description          String
  price                Float
  discountPercentage   Float?
  rating               Float
  stock                Int
  tags                 String[]
  brand                String
  sku                  String
  weight               Float
  width                Float
  height               Float
  depth                Float
  warrantyInformation  String
  shippingInformation  String
  availabilityStatus   String
  returnPolicy         String
  minimumOrderQuantity Int
  barcode              String
  qrCode               String
  images               String[]
  thumbnail            String
  createdAt            DateTime
  updatedAt            DateTime
  categoryId           Int
  category             Category @relation(fields: [categoryId], references: [id])
  reviews              Review[]

  @@index([categoryId])
}

model Review {
  id            Int      @id @default(autoincrement())
  rating        Int
  comment       String
  date          DateTime
  reviewerName  String
  reviewerEmail String
  productId     Int
  product       Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@index([productId])
}
```

Only two lines differ from the old schema: `discountPercentage Float` → `discountPercentage Float?`, and `brand String?` → `brand String`.

- [ ] **Step 3: Run the migration and capture real output**

```bash
npx prisma migrate dev --name init
psql "$DATABASE_URL" -c '\d "Product"'
```

Confirm the generated `migration.sql` shows `"discountPercentage" DOUBLE PRECISION,` (no `NOT NULL`) and `"brand" TEXT NOT NULL,`. Confirm the `\d "Product"` output shows `discountPercentage | double precision | | |` (blank Nullable) and `brand | text | | not null |`.

- [ ] **Step 4: Commit and re-tag**

```bash
git add -A && git commit -m "feat: product schema (brand required, discountPercentage optional)"
git tag -f lesson-07
npx prisma migrate dev --name init  # already run in step 3; this step is the lesson-08 checkpoint
git tag -f lesson-08
```

(If step 3's migrate command was already the "first migration" moment, tag `lesson-07` right after the schema-file commit, before running migrate, and `lesson-08` right after — two commits, matching the two lessons.)

- [ ] **Step 5: Edit lesson 07 HTML**

In `07_modeling-products-in-prisma.html`:
- Change the `@docs/contract/product-1.json @docs/contract/categories.json` Cursor prompt context line to `@docs/api-spec.md`.
- In the schema code block, change `brand String?` → `brand String` and `discountPercentage Float` → `discountPercentage Float?`.
- Add one sentence after the schema explaining the swap: brand is required because our own catalog always assigns one; `discountPercentage` is nullable because not every product in our seed carries a discount, and the client's own `discountPercentage?: number` type already expects it to be optional (cite `src/features/products/types.ts`).
- Update the verification checklist item that counts `docs/contract/product-1.json`'s 22 keys to instead reference `docs/api-spec.md`'s `Product` interface.

- [ ] **Step 6: Edit lesson 08 HTML**

In `08_running-the-first-migration.html`, replace the migration SQL excerpt's two lines:
```
    "discountPercentage" DOUBLE PRECISION NOT NULL,
```
→
```
    "discountPercentage" DOUBLE PRECISION,
```
and
```
    "brand" TEXT,
```
→
```
    "brand" TEXT NOT NULL,
```

Replace the `\d "Product"` excerpt block with:
```
        Column        |              Type              | Collation | Nullable | Default
----------------------+--------------------------------+-----------+----------+---------
 id                   | integer                        |           | not null |
 discountPercentage   | double precision               |           |          |
 tags                 | text[]                         |           |          |
 brand                | text                           |           | not null |
 categoryId           | integer                        |           | not null |
Indexes:
    "Product_pkey" PRIMARY KEY, btree (id)
    "Product_categoryId_idx" btree ("categoryId")
Foreign-key constraints:
    "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"(id) ON UPDATE CASCADE ON DELETE RESTRICT
```

Replace the `brand`-nullable bullet with a `discountPercentage`-nullable bullet:
> `discountPercentage | double precision | |` — ช่อง Nullable ว่าง แปลว่าคอลัมน์นี้ยอมให้เป็น NULL ได้ ตรงกับ `discountPercentage Float?` เพราะสินค้าบางชิ้นของเราไม่มีส่วนลด เทียบกับ `brand` ที่เขียน `not null` ไว้ชัดเจน เพราะเราออกแบบให้สินค้าทุกชิ้นต้องมียี่ห้อ

Keep the `tags`/`categoryId` bullets unchanged (unaffected by this swap).

- [ ] **Step 7: Verify and commit the content changes**

```bash
cd /Users/varis/Sites/varis-lab/frontend-bootcamp-content-7-july-2026
python3 /private/tmp/claude-501/-Users-varis-Sites-varis-lab-frontend-bootcamp-content-7-july-2026/16431c67-c41f-48ab-8541-21a433bf6c5d/scratchpad/verify/audit.py
git add Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/07_modeling-products-in-prisma.html Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/08_running-the-first-migration.html
git commit -m "content(week10): lessons 07-08 — brand required, discountPercentage optional"
```

Expected: `audit done: 0 problem(s) across 24 lessons`.

---

### Task 2: Write `docs/api-spec.md` and rewrite lesson 03

**Files:**
- Create: `Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/api-spec.md`
- Delete: `Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/contract/` (all 8 files — untracked, added 2026-09-13, superseded)
- Modify: `Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/03_capturing-the-dummyjson-contract.html` (keep filename)

**Interfaces:**
- Produces: `api-spec.md` — every later lesson's `@`-mention and "compare against the spec" verification step points at this file.

- [ ] **Step 1: Delete the old contract folder**

```bash
cd /Users/varis/Sites/varis-lab/frontend-bootcamp-content-7-july-2026/Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content
rm -rf contract
```

- [ ] **Step 2: Write `api-spec.md`**

Content requirements (this is the file both the printed lesson reference and `docs/api-spec.md` in the student's own project should match):

````markdown
# API Spec — derived from the React storefront's own contract

This project has no reference API to copy. The React e-commerce app
(`workshop/temp/react-ecommerce-app`) was prototyped against a public mock
API we don't control and won't ship with. This document is what we get by
reading the app's own source code: its TypeScript types, its API client,
its mock fixtures. Every clause below cites the client file that requires it.

## Endpoints (from `src/features/products/api.ts` and `src/features/checkout/api.ts`)

| Method | Path | Query / Body |
| --- | --- | --- |
| GET | `/products/categories` | — |
| GET | `/products` | `skip` (int, ≥0, default 0), `limit` (int, 1–100, default 20) |
| GET | `/products/category/:slug` | same as above |
| GET | `/products/:id` | — |
| POST | `/carts/add` | `{ userId, products: [{id, quantity}], address: {address, email, phone} }` |

## Product (from `src/features/products/types.ts`)

```ts
interface Product {
  id: number;
  title: string;
  description: string;
  category: string;            // category slug, not an object
  price: number;
  discountPercentage?: number; // omit the key when the product has no discount
  rating: number;
  stock: number;
  tags: string[];
  brand: string;                // always present — we assign one to every product
  sku: string;
  weight: number;
  dimensions: { width: number; height: number; depth: number };
  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: string;
  reviews: Array<{ rating: number; comment: string; date: string; reviewerName: string; reviewerEmail: string }>;
  returnPolicy: string;
  minimumOrderQuantity: number;
  meta: { createdAt: string; updatedAt: string; barcode: string; qrCode: string };
  images: string[];
  thumbnail: string;
}
```

`discountPercentage?: number` in the client's own type (no `?` on `brand`) is why the
optionality is assigned this way — see `calculateOriginalPrice` in
`src/shared/utils/price.utils.ts`, which already treats `discountPercentage` as
possibly `undefined`.

## Category (from `src/features/products/types.ts`)

```ts
interface Category { slug: string; name: string; url: string; }
```

`GET /products/categories` returns this as a bare array (24 items), not wrapped in an envelope.

## List envelope + pagination (from `src/shared/types/generic.type.ts`, `src/features/products/api.ts`)

```ts
interface ProductListResponse {
  products: Product[];
  total: number; // total rows matching the filter
  skip: number;  // echoes the request
  limit: number; // echoes the request
}
```

`limit` must be `1–100`; `skip` must be `≥ 0`. Either violated → `400`. No client call
site ever needs anything outside this range (`Home.tsx` sends 5 and 12, `Category.tsx`
sends 20, the client's own default is 20) — this validated range gives real DTO content,
not a copied external quirk.

An unknown category slug is `200` with an empty envelope
(`{ products: [], total: 0, skip, limit }`), not `404` — a syntactically valid query
that matches nothing is not an error, and `Category.tsx` renders an empty grid for it,
not an error screen.

## Errors (from `src/shared/api/client.ts`)

`ApiError` reads `error.response.data.message` — every error body we send must carry
a `message` field.

- Non-existent product id → `404`: `{ "message": "Product <id> not found", "error": "Not Found", "statusCode": 404 }`
- Non-numeric product id → `400` (Nest's `ParseIntPipe` default shape)
- Any DTO validation failure → `400` (Nest's `ValidationPipe` default shape: `message` is an array of strings)

## Order receipt (from `src/features/checkout/api.ts`, `src/features/checkout/types.ts`)

The client's `PlaceOrderResponse` is only `{ id: number }` and the checkout flow
ignores everything else in the body — but an order endpoint that returns nothing
but an id leaves no way for any client to confirm what was ordered. We design a
full receipt; the client safely ignores fields it doesn't read.

```ts
interface OrderResponse {
  id: number;
  userId: number;
  products: Array<{
    id: number;
    title: string;
    price: number;
    quantity: number;
    total: number;               // price × quantity, rounded to 2dp
    discountPercentage?: number; // omitted if the product has none
    discountedPrice: number;     // total × (1 − discountPercentage/100), rounded to 2dp
    thumbnail: string;
  }>;
  total: number;           // sum of products[].total
  discountedTotal: number; // sum of products[].discountedPrice
  totalProducts: number;   // number of line items
  totalQuantity: number;   // sum of quantities
}
```

Status `201`.
````

- [ ] **Step 3: Rewrite lesson 03 HTML**

Keep the filename `03_capturing-the-dummyjson-contract.html`. New `<title>`:
"อ่านโค้ดฝั่ง client แล้วออกแบบสัญญาเป็นของตัวเอง". New eyebrow: unchanged pattern
(`NestJS E-commerce API Workshop · บทที่ 3 จาก 24`).

Learning objectives (3):
1. อ่านไฟล์ฝั่ง client ห้าไฟล์แล้วสรุปเป็นสัญญา API ได้ด้วยตัวเอง
2. เขียน `docs/api-spec.md` ที่ระบุ endpoint, รูปทรง response, กฎการแบ่งหน้า และรูปทรง error ครบ
3. อธิบายได้ว่าทำไม `brand` ต้องมีทุกชิ้นแต่ `discountPercentage` ไม่ต้อง โดยอ้างจากโค้ด client จริง

Body content must:
- Open with the "no reference API" framing from the design spec's "Why this change" section (state plainly: the React app was prototyped against a public mock we don't control; our job is to read what it actually needs and design the real backend).
- Walk through the five client files in this order, quoting the load-bearing snippet from each (paste the exact snippets already read earlier in this plan's investigation from `src/features/products/types.ts`, `src/features/products/api.ts`, `src/shared/types/generic.type.ts`, `src/shared/api/client.ts`, `src/features/checkout/{api.ts,schema.ts}`), and state what each one proves — mirror the bullet list under "Product" and "Errors" in the `api-spec.md` content above.
- Instruct the student to write `docs/api-spec.md` in their own project by hand (not via Cursor).
- Add a "cross-check with Cursor" subsection: open Cursor in **Ask mode** (not Agent), `@`-mention the same five client files, and ask it to review the draft spec for anything missed — the student's draft stays the artifact of record.
- Workshop section: `mkdir -p docs`, write the file, `git add docs && git commit -m "docs: add api-spec.md"`.
- Expected-result / verification sections: checklist-style, e.g. `test -f docs/api-spec.md`, `grep -c 'discountPercentage' docs/api-spec.md`, `git log --oneline` shows the contract commit.
- Sources list: link to the reference `api-spec.md` shipped with the course (`<a href="api-spec.md">`), plus `docs.cursor.com` Ask-mode docs if relevant.

- [ ] **Step 4: Verify and commit**

```bash
cd /Users/varis/Sites/varis-lab/frontend-bootcamp-content-7-july-2026
python3 /private/tmp/claude-501/-Users-varis-Sites-varis-lab-frontend-bootcamp-content-7-july-2026/16431c67-c41f-48ab-8541-21a433bf6c5d/scratchpad/verify/audit.py
git add Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/api-spec.md Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/03_capturing-the-dummyjson-contract.html
git add -u Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/contract  # stages the deletion
git commit -m "content(week10): lesson 03 — derive the contract from the client, not dummyjson"
```

Expected: `audit done: 0 problem(s) across 24 lessons`; `git status` shows `contract/` gone.

---

### Task 3: Rewrite lesson 09 (faker seed generator)

**Files:**
- Reference project (branch `rework-consumer-contract`): `package.json`, `prisma/seed.ts`
- Modify: `Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/09_seeding-real-products.html`

**Interfaces:**
- Consumes: `prisma/schema.prisma` from Task 1 (`brand String`, `discountPercentage Float?`).
- Produces: 208 seeded products (`beauty`=5 ids 1–5, `groceries`=27 ids 22–48, all others=8), with product id 1 fixed exactly as below. Every later task's example data (mapper, cart-add math, Swagger examples) uses product id 1. Lesson 23's Category-page walkthrough uses the exact `groceries` title list this task produces.

- [ ] **Step 1: Pin faker and add the seed script**

```bash
SCRATCH=/private/tmp/claude-501/-Users-varis-Sites-varis-lab-frontend-bootcamp-content-7-july-2026/16431c67-c41f-48ab-8541-21a433bf6c5d/scratchpad/verify/ecommerce-api
cd "$SCRATCH"
npm i -D @faker-js/faker@10.6.0
```

- [ ] **Step 2: Write `prisma/seed.ts`**

```ts
import 'dotenv/config';
import { faker } from '@faker-js/faker';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const CATEGORIES: Array<[slug: string, name: string]> = [
  ['beauty', 'Beauty'],
  ['fragrances', 'Fragrances'],
  ['furniture', 'Furniture'],
  ['groceries', 'Groceries'],
  ['home-decoration', 'Home Decoration'],
  ['kitchen-accessories', 'Kitchen Accessories'],
  ['laptops', 'Laptops'],
  ['mens-shirts', "Men's Shirts"],
  ['mens-shoes', "Men's Shoes"],
  ['mens-watches', "Men's Watches"],
  ['mobile-accessories', 'Mobile Accessories'],
  ['motorcycle', 'Motorcycle'],
  ['skin-care', 'Skin Care'],
  ['smartphones', 'Smartphones'],
  ['sports-accessories', 'Sports Accessories'],
  ['sunglasses', 'Sunglasses'],
  ['tablets', 'Tablets'],
  ['tops', 'Tops'],
  ['vehicle', 'Vehicle'],
  ['womens-bags', "Women's Bags"],
  ['womens-dresses', "Women's Dresses"],
  ['womens-jewellery', "Women's Jewellery"],
  ['womens-shoes', "Women's Shoes"],
  ['womens-watches', "Women's Watches"],
];

const COUNT_OVERRIDES: Record<string, number> = { beauty: 5, groceries: 27 };
const DEFAULT_COUNT = 8;

const WARRANTY = [
  'No warranty', '1 week warranty', '1 month warranty', '3 months warranty',
  '6 months warranty', '1 year warranty', '2 year warranty', '3 year warranty',
  '5 year warranty', 'Lifetime warranty',
];
const SHIPPING = [
  'Ships in 1-2 business days', 'Ships in 3-5 business days', 'Ships overnight',
  'Ships in 1 week', 'Ships in 2 weeks', 'Ships in 1 month',
];
const AVAILABILITY = ['In Stock', 'In Stock', 'In Stock', 'In Stock', 'Low Stock', 'Out of Stock'];
const RETURN_POLICY = [
  'No return policy', '7 days return policy', '30 days return policy',
  '60 days return policy', '90 days return policy',
];

function titleCase(value: string): string {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function groceryName(usedTitles: Set<string>): string {
  let candidate: string;
  do {
    const pick = faker.number.int({ min: 0, max: 2 });
    const word =
      pick === 0 ? faker.food.ingredient() : pick === 1 ? faker.food.fruit() : faker.food.vegetable();
    candidate = titleCase(word);
  } while (usedTitles.has(candidate));
  return candidate;
}

function productName(usedTitles: Set<string>): string {
  let candidate: string;
  do {
    candidate = titleCase(faker.commerce.productName());
  } while (usedTitles.has(candidate));
  return candidate;
}

interface GeneratedProduct {
  id: number;
  slug: string;
  title: string;
  description: string;
  price: number;
  discountPercentage: number | null;
  rating: number;
  stock: number;
  tags: string[];
  brand: string;
  sku: string;
  weight: number;
  width: number;
  height: number;
  depth: number;
  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: string;
  returnPolicy: string;
  minimumOrderQuantity: number;
  barcode: string;
  qrCode: string;
  images: string[];
  thumbnail: string;
  createdAt: Date;
  updatedAt: Date;
  reviews: Array<{ rating: number; comment: string; date: Date; reviewerName: string; reviewerEmail: string }>;
}

function handAuthoredProductOne(slug: string): GeneratedProduct {
  return {
    id: 1,
    slug,
    title: 'Velvet Matte Lipstick',
    description:
      'Long-wearing matte lipstick with a lightweight, non-drying formula in a true-red shade.',
    price: 9.99,
    discountPercentage: 10.48,
    rating: 4.6,
    stock: 42,
    tags: ['beauty', 'lipstick'],
    brand: 'Lumina',
    sku: 'BEA-LUM-001',
    weight: 2,
    width: 3.2,
    height: 9.5,
    depth: 3.2,
    warrantyInformation: 'No warranty',
    shippingInformation: 'Ships in 1-2 business days',
    availabilityStatus: 'In Stock',
    returnPolicy: '30 days return policy',
    minimumOrderQuantity: 1,
    barcode: '8901234567891',
    qrCode: 'https://picsum.photos/seed/product-1-qr/200/200',
    images: [
      'https://picsum.photos/seed/product-1-a/600/600',
      'https://picsum.photos/seed/product-1-b/600/600',
    ],
    thumbnail: 'https://picsum.photos/seed/product-1-thumb/300/300',
    createdAt: new Date('2026-01-15T08:00:00.000Z'),
    updatedAt: new Date('2026-08-20T11:30:00.000Z'),
    reviews: [
      {
        rating: 5,
        comment: 'Stays on all day, love the finish.',
        date: new Date('2026-06-02T10:15:00.000Z'),
        reviewerName: 'Aom Suksawat',
        reviewerEmail: 'aom.suksawat@example.com',
      },
      {
        rating: 4,
        comment: 'Great color but a bit drying on my lips.',
        date: new Date('2026-06-10T14:30:00.000Z'),
        reviewerName: 'Beth Carter',
        reviewerEmail: 'beth.carter@example.com',
      },
      {
        rating: 5,
        comment: 'Repurchased three times already.',
        date: new Date('2026-06-18T09:05:00.000Z'),
        reviewerName: 'Nok Chaiyaporn',
        reviewerEmail: 'nok.chaiyaporn@example.com',
      },
    ],
  };
}

function generatedProduct(id: number, slug: string, usedTitles: Set<string>): GeneratedProduct {
  const title = slug === 'groceries' ? groceryName(usedTitles) : productName(usedTitles);
  usedTitles.add(title);
  const hasDiscount = faker.number.int({ min: 0, max: 2 }) !== 0;
  const discountPercentage = hasDiscount
    ? Math.round(faker.number.float({ min: 1, max: 25, fractionDigits: 4 }) * 100) / 100
    : null;
  return {
    id,
    slug,
    title,
    description: faker.commerce.productDescription(),
    price: Number(faker.commerce.price({ min: 4, max: 1999, dec: 2 })),
    discountPercentage,
    rating: Math.round(faker.number.float({ min: 2.5, max: 5, fractionDigits: 3 }) * 100) / 100,
    stock: faker.number.int({ min: 0, max: 100 }),
    tags: [slug, faker.word.noun().toLowerCase()],
    brand: titleCase(faker.company.name()),
    sku: faker.string.alphanumeric({ length: 8, casing: 'upper' }),
    weight: faker.number.int({ min: 1, max: 10 }),
    width: Math.round(faker.number.float({ min: 5, max: 100, fractionDigits: 3 }) * 100) / 100,
    height: Math.round(faker.number.float({ min: 5, max: 100, fractionDigits: 3 }) * 100) / 100,
    depth: Math.round(faker.number.float({ min: 5, max: 100, fractionDigits: 3 }) * 100) / 100,
    warrantyInformation: faker.helpers.arrayElement(WARRANTY),
    shippingInformation: faker.helpers.arrayElement(SHIPPING),
    availabilityStatus: faker.helpers.arrayElement(AVAILABILITY),
    returnPolicy: faker.helpers.arrayElement(RETURN_POLICY),
    minimumOrderQuantity: faker.number.int({ min: 1, max: 50 }),
    barcode: faker.string.numeric(13),
    qrCode: `https://picsum.photos/seed/product-${id}-qr/200/200`,
    images: Array.from(
      { length: faker.number.int({ min: 1, max: 4 }) },
      (_, index) => `https://picsum.photos/seed/product-${id}-${index}/600/600`,
    ),
    thumbnail: `https://picsum.photos/seed/product-${id}-thumb/300/300`,
    createdAt: faker.date.past({ years: 2 }),
    updatedAt: faker.date.recent({ days: 120 }),
    reviews: Array.from({ length: 3 }, () => ({
      rating: faker.number.int({ min: 1, max: 5 }),
      comment: faker.lorem.sentence(),
      date: faker.date.recent({ days: 180 }),
      reviewerName: faker.person.fullName(),
      reviewerEmail: faker.internet.email().toLowerCase(),
    })),
  };
}

function buildProducts(): GeneratedProduct[] {
  faker.seed(20260913);
  const products: GeneratedProduct[] = [];
  let nextId = 1;
  for (const [slug] of CATEGORIES) {
    const count = COUNT_OVERRIDES[slug] ?? DEFAULT_COUNT;
    const usedTitles = new Set<string>();
    for (let index = 0; index < count; index++) {
      const id = nextId++;
      if (id === 1) {
        products.push(handAuthoredProductOne(slug));
        usedTitles.add('Velvet Matte Lipstick');
        continue;
      }
      products.push(generatedProduct(id, slug, usedTitles));
    }
  }
  return products;
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const products = buildProducts();

  await prisma.$transaction(async (tx) => {
    await tx.review.deleteMany();
    await tx.product.deleteMany();
    await tx.category.deleteMany();

    await tx.category.createMany({
      data: CATEGORIES.map(([slug, name]) => ({ slug, name })),
    });
    const categoryIdBySlug = new Map(
      (await tx.category.findMany()).map((category) => [category.slug, category.id]),
    );
    const categoryId = (slug: string): number => {
      const id = categoryIdBySlug.get(slug);
      if (id === undefined) {
        throw new Error(`Unknown category slug: ${slug}`);
      }
      return id;
    };

    await tx.product.createMany({
      data: products.map((product) => ({
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price,
        discountPercentage: product.discountPercentage,
        rating: product.rating,
        stock: product.stock,
        tags: product.tags,
        brand: product.brand,
        sku: product.sku,
        weight: product.weight,
        width: product.width,
        height: product.height,
        depth: product.depth,
        warrantyInformation: product.warrantyInformation,
        shippingInformation: product.shippingInformation,
        availabilityStatus: product.availabilityStatus,
        returnPolicy: product.returnPolicy,
        minimumOrderQuantity: product.minimumOrderQuantity,
        barcode: product.barcode,
        qrCode: product.qrCode,
        images: product.images,
        thumbnail: product.thumbnail,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        categoryId: categoryId(product.slug),
      })),
    });

    await tx.review.createMany({
      data: products.flatMap((product) =>
        product.reviews.map((review) => ({
          productId: product.id,
          rating: review.rating,
          comment: review.comment,
          date: review.date,
          reviewerName: review.reviewerName,
          reviewerEmail: review.reviewerEmail,
        })),
      ),
    });
  });

  const reviewCount = products.reduce((count, product) => count + product.reviews.length, 0);
  console.log(`Seeded ${CATEGORIES.length} categories, ${products.length} products, ${reviewCount} reviews`);
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
```

- [ ] **Step 3: Run the seed and capture real category/product counts**

```bash
npm run db:seed
psql "$DATABASE_URL" -c "SELECT c.slug, count(*) FROM \"Product\" p JOIN \"Category\" c ON c.id = p.\"categoryId\" GROUP BY c.slug ORDER BY count(*) DESC LIMIT 3;"
psql "$DATABASE_URL" -c "SELECT count(*) FROM \"Product\";"
```

Expected (verify against real output, adjust the lesson text if it differs due to a code change during review): total 208 products; `groceries` = 27; `beauty` = 5; every other category = 8. `SELECT * FROM "Product" WHERE id = 1` returns `title = 'Velvet Matte Lipstick'`, `price = 9.99`, `"discountPercentage" = 10.48`, `brand = 'Lumina'`.

- [ ] **Step 4: Capture the Groceries page-1/page-2 title split for lesson 23**

```bash
psql "$DATABASE_URL" -c "SELECT title FROM \"Product\" p JOIN \"Category\" c ON c.id = p.\"categoryId\" WHERE c.slug = 'groceries' ORDER BY p.id ASC;"
```

**Correction (confirmed by a real run during execution — Task 3, agent a413cfba2ec592a2e):** the numbers below were computed by the controller with a *simplified* proxy script (only title/price/discount/brand draws per product) before this plan was written, not the full `generatedProduct` function above, which draws roughly twenty faker calls per product (description, rating, stock, tags, sku, dimensions, warranty/shipping/availability/returnPolicy, barcode, images, dates, three reviews) before moving to the next product. Since faker's seeded PRNG is one shared sequential stream, the full function lands at a different point in that stream by the time it reaches the `groceries` category (the 4th category), so the proxy script's predicted titles were never going to match the real run. The implementer verified their `prisma/seed.ts` is byte-identical to the code block above and `@faker-js/faker` resolved to exactly `10.6.0` — the divergence is fully explained by the proxy-vs-real algorithm difference, not a transcription bug. **The confirmed real output (use this, not the numbers this correction replaces):**

Real page 1 (ids 22–41, `skip=0&limit=20`): Dandelion, Prunes, Pasta, Dried Chinese Broccoli, Leeks, Okra, Endive, Broccolini, Paprik, Bok Choy, Coconut, Fresh Chillies, Carrot, Cheddar, Cucumber, Lettuce, Goji Berry, Allspice, Pumpkin, Butternut Lettuce.

Real page 2 (ids 42–48, `skip=20&limit=20`): Mulberry, Juniper Berry, Chinese Cabbage, White Bread, Peppers, Cabbage, Bean Shoots.

If a later re-run of this exact code against this exact faker version produces a different list again, trust that later real run over this one, and update lesson 23 (Task 16) accordingly.

- [ ] **Step 5: Commit and re-tag**

```bash
git add -A && git commit -m "feat: faker seed generator (208 products, 24 categories)"
git tag -f lesson-09
```

- [ ] **Step 6: Rewrite lesson 09 HTML**

Title: "เขียน seed generator ด้วย faker" (or similar — keep filename
`09_seeding-real-products.html`). Learning objectives (3):
1. ติดตั้งและ pin เวอร์ชัน `@faker-js/faker` แล้วเขียน seed script ที่ deterministic
2. อธิบายได้ว่าทำไม product id 1 ต้องเขียนด้วยมือ ไม่ปล่อยให้ faker สุ่ม
3. ยืนยันด้วย SQL ว่าจำนวนสินค้าต่อหมวดตรงกับที่ตั้งใจไว้ (`beauty`=5, `groceries`=27, อื่น ๆ=8)

Body must:
- State plainly there is no dummyjson to fetch from anymore — the catalog is generated.
- Explain the pin (`@faker-js/faker@10.6.0`) the same way Prisma and `postgres:17` are pinned: faker's locale word lists can shift between minor versions, and this lesson (and later lessons) quote generated values.
- Show the full `CATEGORIES` array and `COUNT_OVERRIDES` table, explaining the two deliberate overrides (`beauty`=5 for "no pagination needed" in lesson 23, `groceries`=27 for "two real pages" in lesson 23).
- Show `handAuthoredProductOne` in full, explicitly stating: this is the one product every later lesson quotes by exact value (mapper output, cart-add math), so it is typed by hand, not generated.
- Show the rest of the seed script (or the load-bearing parts: `generatedProduct`, `buildProducts`, the `$transaction` block) with brief explanation of each helper.
- Workshop: `npm i -D @faker-js/faker@10.6.0`, write `prisma/seed.ts`, `npm run db:seed`.
- Expected-result / verification: the real psql counts from Step 3, plus `SELECT * FROM "Product" WHERE id = 1` matching the hand-authored fields.

- [ ] **Step 7: Verify and commit the lesson content**

```bash
cd /Users/varis/Sites/varis-lab/frontend-bootcamp-content-7-july-2026
python3 /private/tmp/claude-501/-Users-varis-Sites-varis-lab-frontend-bootcamp-content-7-july-2026/16431c67-c41f-48ab-8541-21a433bf6c5d/scratchpad/verify/audit.py
git add Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/09_seeding-real-products.html
git commit -m "content(week10): lesson 09 — faker seed generator, not a dummyjson fetch"
```

---

### Task 4: Edit lessons 04 and 05 (small path/wording fixes)

**Files:**
- Modify: `Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/04_cursor-rules-and-the-prompt-template.html`
- Modify: `Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/05_running-postgresql.html`

- [ ] **Step 1: Lesson 04** — in the `.cursor/rules/project.mdc` code block, change:
```
- docs/contract/ คือ payload จริงของ dummyjson (README.md คือสรุปสัญญาทั้งหมด) — response ของทุก endpoint ต้องมีรูปทรงตรงกับไฟล์เหล่านี้
```
→
```
- docs/api-spec.md คือสัญญาของ API ที่เราออกแบบเองจากโค้ดฝั่ง client — response ของทุก endpoint ต้องมีรูปทรงตรงกับไฟล์นี้
```
Update the prose paragraph explaining this rule ("บรรทัด `docs/contract/` เป็นหัวใจ...") to say `docs/api-spec.md` instead, same reasoning (source of truth is a file in the project, not the model's guess).

- [ ] **Step 2: Lesson 05** — the table row justifying `APP_URL`:
```
<tr><td><code>APP_URL</code></td><td><code>ProductsService</code></td><td>ฐานของ <code>url</code> ในผลลัพธ์ <code>GET /products/categories</code> (บทที่ 10) เพราะ dummyjson ส่ง URL เต็มกลับมาด้วย</td></tr>
```
→
```
<tr><td><code>APP_URL</code></td><td><code>ProductsService</code></td><td>ฐานของ <code>url</code> ในผลลัพธ์ <code>GET /products/categories</code> (บทที่ 10) เพราะ type <code>Category</code> ฝั่ง client (<code>src/features/products/types.ts</code>) กำหนดให้มี <code>url</code> เต็มเสมอ</td></tr>
```

- [ ] **Step 3: Verify and commit**

```bash
cd /Users/varis/Sites/varis-lab/frontend-bootcamp-content-7-july-2026
python3 /private/tmp/claude-501/-Users-varis-Sites-varis-lab-frontend-bootcamp-content-7-july-2026/16431c67-c41f-48ab-8541-21a433bf6c5d/scratchpad/verify/audit.py
git add Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/04_cursor-rules-and-the-prompt-template.html Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/05_running-postgresql.html
git commit -m "content(week10): lessons 04-05 — point at api-spec.md, not dummyjson"
```

---

### Task 5: Edit lesson 10 (categories endpoint)

**Files:**
- Modify: `Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/10_get-products-categories.html`

- [ ] **Step 1**: Change the Cursor prompt's context line `@docs/contract/categories.json` → `@docs/api-spec.md`. Change the sentence "ใน contract ที่วางไว้ในโปรเจกต์ตั้งแต่บทที่ 3 มี endpoint เดียว..." to reference `docs/api-spec.md`'s Category section instead.

- [ ] **Step 2**: Replace the `diff`-against-captured-file verification step:
```bash
curl -s http://localhost:3000/products/categories \
  | sed 's#http://localhost:3000#https://dummyjson.com#g' > /tmp/actual.json
diff /tmp/actual.json docs/contract/categories.json && echo IDENTICAL
```
with a node assertion against the spec (24 items, each with exactly `slug`/`name`/`url`):
```bash
curl -s http://localhost:3000/products/categories -o /tmp/actual.json
node -e "
const categories = require('/tmp/actual.json');
if (categories.length !== 24) throw new Error('expected 24, got ' + categories.length);
for (const c of categories) {
  const keys = Object.keys(c).sort().join(',');
  if (keys !== 'name,slug,url') throw new Error('unexpected keys: ' + keys);
}
console.log('OK: 24 categories, each {slug,name,url}');
"
```

- [ ] **Step 3: Verify and commit**

```bash
cd /Users/varis/Sites/varis-lab/frontend-bootcamp-content-7-july-2026
python3 /private/tmp/claude-501/-Users-varis-Sites-varis-lab-frontend-bootcamp-content-7-july-2026/16431c67-c41f-48ab-8541-21a433bf6c5d/scratchpad/verify/audit.py
git add Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/10_get-products-categories.html
git commit -m "content(week10): lesson 10 — verify against api-spec.md, not a dummyjson diff"
```

---

### Task 6: Rewrite lesson 11 (mapper) + rebuild reference project's mapper/DTO

**Files:**
- Reference project: `src/products/product.mapper.ts`, `src/products/dto/product-response.dto.ts`
- Modify: `Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/11_mapping-rows-to-the-contract.html`

**Interfaces:**
- Consumes: `Product` model from Task 1 (`brand String`, `discountPercentage Float?`).
- Produces: `ProductResponseDto` and `toProductResponse` — every later products-domain task (12, 13, 14, 21, 22) assumes `brand` unconditional and `discountPercentage` conditionally spread.

- [ ] **Step 1: Update `src/products/dto/product-response.dto.ts`**

**Correction (found while dispatching Task 6 — verified against the reference project's actual pre-rework history, tags `lesson-11` through `lesson-21`):** no field in this file carries a Swagger decorator yet at this point in the course. In the original course, `@ApiPropertyOptional()` is introduced for the first time in lesson 22 ("documenting DTOs and responses"), which comes eleven lessons after this one and well after Swagger itself is added (lesson 21). Task 6/lesson 11 must stay decorator-free, matching that historical timeline — the decorator moves from `brand` to `discountPercentage` in lesson 22 instead (see Task 15's corrected steps below). Write the DTO below with NO `@nestjs/swagger` import and NO decorator anywhere — plain fields only, exactly as the file already documents ("ไม่มี decorator ไม่มี method"):

```ts
export class ProductDimensionsDto {
  width: number;
  height: number;
  depth: number;
}

export class ProductReviewDto {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

export class ProductMetaDto {
  createdAt: string;
  updatedAt: string;
  barcode: string;
  qrCode: string;
}

export class ProductResponseDto {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage?: number;
  rating: number;
  stock: number;
  tags: string[];
  brand: string;
  sku: string;
  weight: number;
  dimensions: ProductDimensionsDto;
  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: string;
  reviews: ProductReviewDto[];
  returnPolicy: string;
  minimumOrderQuantity: number;
  meta: ProductMetaDto;
  images: string[];
  thumbnail: string;
}

export class CategoryResponseDto {
  slug: string;
  name: string;
  url: string;
}

export class ProductListResponseDto {
  products: ProductResponseDto[];
  total: number;
  skip: number;
  limit: number;
}
```

- [ ] **Step 2: Update `src/products/product.mapper.ts`**

```ts
import type { Category, Product, Review } from '../generated/prisma/client.js';
import { ProductResponseDto } from './dto/product-response.dto.js';

export type ProductWithRelations = Product & { category: Category; reviews: Review[] };

export function toProductResponse(product: ProductWithRelations): ProductResponseDto {
  return {
    id: product.id,
    title: product.title,
    description: product.description,
    category: product.category.slug,
    price: product.price,
    ...(product.discountPercentage !== null ? { discountPercentage: product.discountPercentage } : {}),
    rating: product.rating,
    stock: product.stock,
    tags: product.tags,
    brand: product.brand,
    sku: product.sku,
    weight: product.weight,
    dimensions: { width: product.width, height: product.height, depth: product.depth },
    warrantyInformation: product.warrantyInformation,
    shippingInformation: product.shippingInformation,
    availabilityStatus: product.availabilityStatus,
    reviews: product.reviews.map((review) => ({
      rating: review.rating,
      comment: review.comment,
      date: review.date.toISOString(),
      reviewerName: review.reviewerName,
      reviewerEmail: review.reviewerEmail,
    })),
    returnPolicy: product.returnPolicy,
    minimumOrderQuantity: product.minimumOrderQuantity,
    meta: {
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      barcode: product.barcode,
      qrCode: product.qrCode,
    },
    images: product.images,
    thumbnail: product.thumbnail,
  };
}
```

- [ ] **Step 3: Run build/lint/tests, commit, re-tag**

```bash
SCRATCH=/private/tmp/claude-501/-Users-varis-Sites-varis-lab-frontend-bootcamp-content-7-july-2026/16431c67-c41f-48ab-8541-21a433bf6c5d/scratchpad/verify/ecommerce-api
cd "$SCRATCH"
npm run build && npm run lint
git add -A && git commit -m "feat: product mapper — brand unconditional, discountPercentage conditional"
git tag -f lesson-11
```

- [ ] **Step 4: Rewrite lesson 11 HTML**

Keep filename. Update the Cursor prompt's context line to `@docs/api-spec.md` (drop `@docs/contract/product-1.json`). Update the technical-requirements section: the conditional-spread pattern now applies to `discountPercentage`, not `brand`; `brand` is now unconditional. Update the review checklist bullet that counted 22 keys to say explicitly: "นับกับ product id 1 (`SELECT * FROM \"Product\" WHERE id = 1`) เพราะเป็นตัวเดียวที่มี `discountPercentage` เสมอ — สินค้าอื่นบางชิ้นจะมีแค่ 21 key ถ้าไม่มีส่วนลด".

**Correction (found during Task 6's own execution):** a curl-based key-count check is impossible at lesson 11 — `GET /products/:id` doesn't exist until lesson 12 (Task 7), and the lesson's own unedited expected-result paragraph already says so explicitly ("ยังไม่มีอะไรให้ยิง curl ในบทนี้"). Do not add a curl snippet here — it would make the file self-contradicting. Use a server-free check of what this lesson actually produces instead:
```bash
sed -n '/export class ProductResponseDto/,/^}/p' src/products/dto/product-response.dto.ts | grep -c ';'  # must print 22
```

- [ ] **Step 5: Verify and commit**

```bash
cd /Users/varis/Sites/varis-lab/frontend-bootcamp-content-7-july-2026
python3 /private/tmp/claude-501/-Users-varis-Sites-varis-lab-frontend-bootcamp-content-7-july-2026/16431c67-c41f-48ab-8541-21a433bf6c5d/scratchpad/verify/audit.py
git add Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/11_mapping-rows-to-the-contract.html
git commit -m "content(week10): lesson 11 — discountPercentage is the conditionally-omitted field now"
```

---

### Task 7: Edit lesson 12 (product by id) + update NotFoundException message

**Files:**
- Reference project: `src/products/products.service.ts`
- Modify: `Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/12_get-product-by-id.html`

- [ ] **Step 1**: In `src/products/products.service.ts`, change the `findOne` error message:
```ts
throw new NotFoundException(`Product with id '${id}' not found`);
```
→
```ts
throw new NotFoundException(`Product ${id} not found`);
```

- [ ] **Step 2**: Run, verify, commit, re-tag:

```bash
SCRATCH=/private/tmp/claude-501/-Users-varis-Sites-varis-lab-frontend-bootcamp-content-7-july-2026/16431c67-c41f-48ab-8541-21a433bf6c5d/scratchpad/verify/ecommerce-api
cd "$SCRATCH"
(npm run start:dev &) ; sleep 8
curl -s http://localhost:3000/products/999999
curl -s http://localhost:3000/products/abc -w '\n%{http_code}\n'
npm run build && npm run lint
git add -A && git commit -m "feat: self-authored not-found message"
git tag -f lesson-12
```
Expected: `/products/999999` → `{"message":"Product 999999 not found","error":"Not Found","statusCode":404}`; `/products/abc` → Nest's default `ParseIntPipe` 400 body, code `400`.

- [ ] **Step 3**: Rewrite lesson 12's error-message references. Change the quoted 404 body from `{"message":"Product with id '9999' not found"}` to `{"message":"Product 9999 not found","error":"Not Found","statusCode":404}` throughout (technical requirements, review checklist, expected result, verification). Change the Cursor prompt context line to `@docs/api-spec.md`. Update the framing sentence: this is now our own message (not a literal copy), still required to carry `message` because `src/shared/api/client.ts`'s `ApiError` reads it.

- [ ] **Step 4: Verify and commit**

```bash
cd /Users/varis/Sites/varis-lab/frontend-bootcamp-content-7-july-2026
python3 /private/tmp/claude-501/-Users-varis-Sites-varis-lab-frontend-bootcamp-content-7-july-2026/16431c67-c41f-48ab-8541-21a433bf6c5d/scratchpad/verify/audit.py
git add Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/12_get-product-by-id.html
git commit -m "content(week10): lesson 12 — self-designed 404 message"
```

---

### Task 8: Rewrite lesson 13 (pagination validation)

**Files:**
- Reference project: `src/products/dto/pagination-query.dto.ts`, `src/products/products.service.ts`
- Modify: `Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/13_get-products-with-pagination.html`

**Interfaces:**
- Produces: `PaginationQueryDto` (`skip` default 0, `limit` default 20 min 1 max 100) and `paginate()` echoing `limit` directly — Task 9 (lesson 14, uses the same DTO) and Task 12 (lesson 17, cart DTO validation pattern) reference this.

- [ ] **Step 1**: Update `src/products/dto/pagination-query.dto.ts`:

```ts
import { IsInt, Max, Min } from 'class-validator';

export class PaginationQueryDto {
  @IsInt()
  @Min(0)
  skip: number = 0;

  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}
```

- [ ] **Step 2**: Update the `paginate` private method in `src/products/products.service.ts`:

```ts
private async paginate(
  where: Prisma.ProductWhereInput,
  skip: number,
  limit: number,
): Promise<ProductListResponseDto> {
  const [rows, total] = await this.prisma.$transaction([
    this.prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { id: 'asc' },
      include: productInclude,
    }),
    this.prisma.product.count({ where }),
  ]);
  return { products: rows.map(toProductResponse), total, skip, limit };
}
```

(Removes the old `take: limit === 0 ? undefined : limit` special case and the old `limit: rows.length` echo — `limit` now always equals the validated request value.)

- [ ] **Step 3**: Run, verify with real curl output, commit, re-tag:

```bash
SCRATCH=/private/tmp/claude-501/-Users-varis-Sites-varis-lab-frontend-bootcamp-content-7-july-2026/16431c67-c41f-48ab-8541-21a433bf6c5d/scratchpad/verify/ecommerce-api
cd "$SCRATCH"
npm run build && npm run lint
(npm run start:dev &) ; sleep 8
curl -s "http://localhost:3000/products?limit=5&skip=0" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const j=JSON.parse(d);console.log(j.limit, j.products.length, j.total)})"
curl -s "http://localhost:3000/products?limit=0" -w '\n%{http_code}\n'
curl -s "http://localhost:3000/products?limit=101" -w '\n%{http_code}\n'
curl -s "http://localhost:3000/products" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const j=JSON.parse(d);console.log(j.limit, j.products.length)})"
git add -A && git commit -m "feat: validated pagination (limit 1-100, echoes request)"
git tag -f lesson-13
```
Expected: `?limit=5&skip=0` → `5 5 208`; `?limit=0` and `?limit=101` → both `400`; no query → `limit=20`, `20` products.

- [ ] **Step 4**: Rewrite lesson 13 HTML. Replace the old "limit echoes rows returned / limit=0 means all" narrative with: limit and skip are validated (1–100 / ≥0), out of range is 400, and the envelope always echoes exactly what was requested — cite `docs/api-spec.md`'s pagination section and the client call-site evidence (Home.tsx sends 5/12, Category.tsx sends 20). Update the Cursor prompt's technical-requirements section and context line (`@docs/api-spec.md`, drop `@docs/contract/products-page.json`). Replace every verification step that diffed against `docs/contract/products-page.json` with the real curl assertions from Step 3's expected output.

- [ ] **Step 5: Verify and commit**

```bash
cd /Users/varis/Sites/varis-lab/frontend-bootcamp-content-7-july-2026
python3 /private/tmp/claude-501/-Users-varis-Sites-varis-lab-frontend-bootcamp-content-7-july-2026/16431c67-c41f-48ab-8541-21a433bf6c5d/scratchpad/verify/audit.py
git add Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/13_get-products-with-pagination.html
git commit -m "content(week10): lesson 13 — validated 1-100 pagination, not dummyjson's echo quirk"
```

---

### Task 9: Edit lesson 14 (products by category)

**Files:**
- Reference project: `src/products/products.service.ts`, `src/products/products.controller.ts`
- Modify: `Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/14_get-products-by-category.html`

**Correction (found while dispatching — verified directly: `git show lesson-13:src/products/products.service.ts` has no `findByCategory` at all):** this task's original text assumed `GET /products/category/:slug` already existed in the reference project and only needed re-verifying — it doesn't exist yet anywhere on `rework-consumer-contract`. Lesson 14 is where it's built for the first time (same as lesson 12 was for `GET /products/:id`, in Task 7). Added Step 0 below to build it, using this lesson's own already-published reference code (which itself needs two updates first — see Step 0a).

**Interfaces:**
- Consumes: `PaginationQueryDto` from Task 8 (unchanged endpoint behavior for unknown category — still 200 + empty envelope, but `limit` now echoes the request per Task 8, not `rows.length` — this changes the unknown-category example's `limit` value, see Step 1).

- [ ] **Step 0a: Update this lesson's own reference-code paste before using it** — the `products.service.ts` code block already printed later in this same lesson (under "โค้ดอ้างอิงของบทนี้") is a full copy of the service file and has gone stale relative to Tasks 7 and 8: it still shows `throw new NotFoundException(\`Product with id '${id}' not found\`)` (pre-Task-7 format) and the `paginate` method still shows `take: limit === 0 ? undefined : limit` / `limit: rows.length` (pre-Task-8 behavior). Fix both in that reference code block: the message becomes `` `Product ${id} not found` ``; `paginate` becomes `take: limit` (no ternary) returning `{ products: rows.map(toProductResponse), total, skip, limit }` (echoes the parameter, not `rows.length`). Add `findByCategory(slug: string, query: PaginationQueryDto) { return this.paginate({ category: { slug } }, query.skip, query.limit); }` to that same reference block, and add the `@Get('category/:slug')` handler to the `products.controller.ts` reference block, positioned between `findCategories` and `findAll` (matching the lesson's own stated route-ordering rule).

- [ ] **Step 0b: Build it for real in the reference project** using the corrected code from Step 0a:
```bash
SCRATCH=/private/tmp/claude-501/-Users-varis-Sites-varis-lab-frontend-bootcamp-content-7-july-2026/16431c67-c41f-48ab-8541-21a433bf6c5d/scratchpad/verify/ecommerce-api
cd "$SCRATCH"
npm run build && npm run lint
git add -A && git commit -m "feat: GET /products/category/:slug"
git tag -f lesson-14
```

- [ ] **Step 1**: This endpoint's behavior for an unknown category (200 + empty envelope) is **unchanged in kind**, but the `limit` value in that empty envelope is different now — it echoes the request (e.g. `?limit=5` → `limit: 5`), not `rows.length` (which would have been `0`). Update the Cursor prompt's context lines from `@docs/contract/products-by-category.json @docs/contract/products-by-category-unknown.json` to `@docs/api-spec.md`. Update the intro paragraph's justification for "unknown category → 200, not 404" to cite the design spec's reasoning directly: `Category.tsx` calls `useQuery` un-guarded when the category changes, and a 404 there would trip `isError` and render the error screen instead of the empty grid the UI actually shows for an empty category. Update the paragraph explaining the empty envelope's `limit` value (it currently says `limit: 0` "because `paginate` returns `rows.length`" — both the number and the reasoning are now wrong) to state `limit` simply echoes whatever was requested, same as every other endpoint since Task 8.

- [ ] **Step 2**: Verify against the real running reference project (built fresh in Step 0b, so this is a first real run, not a re-check):

```bash
SCRATCH=/private/tmp/claude-501/-Users-varis-Sites-varis-lab-frontend-bootcamp-content-7-july-2026/16431c67-c41f-48ab-8541-21a433bf6c5d/scratchpad/verify/ecommerce-api
cd "$SCRATCH"
(npm run start:dev &) ; sleep 8
curl -s "http://localhost:3000/products/category/groceries?limit=20&skip=0" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const j=JSON.parse(d);console.log(j.total, j.products.length)})"
curl -s "http://localhost:3000/products/category/nope?limit=5&skip=0"
git tag -f lesson-14
```
Expected: `groceries` → `27 20`; `nope` → `{"products":[],"total":0,"skip":0,"limit":5}`.

- [ ] **Step 3**: Update the two verification `diff`/curl examples in the lesson to use `groceries` (27 total) instead of `beauty` (5 total, matching the old dummyjson data) as the "real category" example, and confirm the unknown-category example still prints the real curl output above.

- [ ] **Step 4: Verify and commit**

```bash
cd /Users/varis/Sites/varis-lab/frontend-bootcamp-content-7-july-2026
python3 /private/tmp/claude-501/-Users-varis-Sites-varis-lab-frontend-bootcamp-content-7-july-2026/16431c67-c41f-48ab-8541-21a433bf6c5d/scratchpad/verify/audit.py
git add Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/14_get-products-by-category.html
git commit -m "content(week10): lesson 14 — point at api-spec.md and the new dataset"
```

---

### Task 10: Rewrite lesson 16 (modeling orders) + rebuild schema/DTO/mapper

**Files:**
- Reference project: `prisma/schema.prisma` (Order/OrderItem models), `src/orders/dto/cart-response.dto.ts`, `src/orders/cart.mapper.ts`, `src/orders/orders.service.ts`
- Modify: `Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/16_modeling-orders.html`

**Interfaces:**
- Produces: `Order`/`OrderItem` Prisma models, `CartResponseDto`, `toCartResponse`, `OrdersService.create` — Task 11 (lesson 15's zod schema), Task 12 (lesson 17), Task 13 (lesson 18), and Task 14 (lesson 19) all depend on this exact receipt shape.

- [ ] **Step 1**: Add `Order`/`OrderItem` to `prisma/schema.prisma` (append to the file from Task 1; `discountPercentage` on `OrderItem` is nullable, matching `Product.discountPercentage`):

```prisma
model Order {
  id              Int         @id @default(autoincrement())
  userId          Int
  address         String
  email           String
  phone           String
  total           Float
  discountedTotal Float
  totalProducts   Int
  totalQuantity   Int
  createdAt       DateTime    @default(now())
  items           OrderItem[]
}

model OrderItem {
  id                 Int      @id @default(autoincrement())
  orderId            Int
  order              Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId          Int
  product            Product  @relation(fields: [productId], references: [id])
  title              String
  thumbnail          String
  price              Float
  discountPercentage Float?
  quantity           Int
  total              Float
  discountedPrice    Float

  @@index([orderId])
  @@index([productId])
}
```

Also add `orderItems OrderItem[]` to the `Product` model (needed for the relation).

- [ ] **Step 2**: Run the migration:

```bash
SCRATCH=/private/tmp/claude-501/-Users-varis-Sites-varis-lab-frontend-bootcamp-content-7-july-2026/16431c67-c41f-48ab-8541-21a433bf6c5d/scratchpad/verify/ecommerce-api
cd "$SCRATCH"
npx prisma migrate dev --name add_orders
```
Confirm the generated SQL shows `"discountPercentage" DOUBLE PRECISION` (nullable, no `NOT NULL`) on `OrderItem`.

- [ ] **Step 3**: Write `src/orders/dto/cart-response.dto.ts`:

**Correction (same reasoning as Task 6's DTO):** no decorator here either — in the original course, `discountPercentage` on the cart response was always required (never optional), so no lesson ever taught decorating it, and no task in this plan re-teaches that pattern a second time on this DTO (lesson 22 only covers `product-response.dto.ts`, having already taught the concept once). Leave `discountPercentage?: number` plain. This is a deliberate, minor simplification: this one field's Swagger schema won't be marked non-required — cosmetic only, not a functional gap, and explicitly not something any task claims to fix.

```ts
export class CartProductResponseDto {
  id: number;
  title: string;
  price: number;
  quantity: number;
  total: number;
  discountPercentage?: number;
  discountedPrice: number;
  thumbnail: string;
}

export class CartResponseDto {
  id: number;
  userId: number;
  products: CartProductResponseDto[];
  total: number;
  discountedTotal: number;
  totalProducts: number;
  totalQuantity: number;
}
```

- [ ] **Step 4**: Write `src/orders/cart.mapper.ts`:

```ts
import type { Order, OrderItem } from '../generated/prisma/client.js';
import { CartResponseDto } from './dto/cart-response.dto.js';

export type OrderWithItems = Order & { items: OrderItem[] };

export function toCartResponse(order: OrderWithItems): CartResponseDto {
  return {
    id: order.id,
    userId: order.userId,
    products: order.items.map((item) => ({
      id: item.productId,
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      total: item.total,
      ...(item.discountPercentage !== null ? { discountPercentage: item.discountPercentage } : {}),
      discountedPrice: item.discountedPrice,
      thumbnail: item.thumbnail,
    })),
    total: order.total,
    discountedTotal: order.discountedTotal,
    totalProducts: order.totalProducts,
    totalQuantity: order.totalQuantity,
  };
}
```

- [ ] **Step 5**: Write `src/orders/orders.service.ts` with 2dp rounding and null-discount handling:

```ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { toCartResponse } from './cart.mapper.js';
import { AddCartDto } from './dto/add-cart.dto.js';
import { CartResponseDto } from './dto/cart-response.dto.js';

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: AddCartDto): Promise<CartResponseDto> {
    const order = await this.prisma.$transaction(async (tx) => {
      const ids = dto.products.map((product) => product.id);
      const products = await tx.product.findMany({ where: { id: { in: ids } } });
      const productById = new Map(products.map((product) => [product.id, product]));

      const items = dto.products.map(({ id, quantity }) => {
        const product = productById.get(id);
        if (!product) {
          throw new NotFoundException(`Product ${id} not found`);
        }
        const total = round2(product.price * quantity);
        const discountedPrice = round2(total * (1 - (product.discountPercentage ?? 0) / 100));
        return {
          productId: product.id,
          title: product.title,
          thumbnail: product.thumbnail,
          price: product.price,
          discountPercentage: product.discountPercentage,
          quantity,
          total,
          discountedPrice,
        };
      });

      return tx.order.create({
        data: {
          userId: dto.userId,
          address: dto.address.address,
          email: dto.address.email,
          phone: dto.address.phone,
          total: round2(items.reduce((sum, item) => sum + item.total, 0)),
          discountedTotal: round2(items.reduce((sum, item) => sum + item.discountedPrice, 0)),
          totalProducts: items.length,
          totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
          items: { create: items },
        },
        include: { items: { orderBy: { id: 'asc' } } },
      });
    });

    return toCartResponse(order);
  }
}
```

- [ ] **Step 6**: Build, lint, commit, re-tag:

```bash
npm run build && npm run lint
git add -A && git commit -m "feat: order models and receipt (2dp rounding, nullable item discount)"
git tag -f lesson-16
```

- [ ] **Step 7**: Rewrite lesson 16 HTML. Keep filename. Framing: this is the receipt we design (per `api-spec.md`), not dummyjson's cart body. Show the schema addition, explain why `OrderItem.discountPercentage` mirrors `Product.discountPercentage`'s nullability (a snapshot of a possibly-absent discount at order time). Show the DTO and mapper. State the rounding rule plainly: `round2(x) = Math.round(x * 100) / 100`, 2 decimal places, because this is our own money model now. Do **not** carry over the old worked example (`19.98 × ... → 18`) — Task 13 (lesson 18) owns the full worked numeric walkthrough; this lesson only needs to state the formula and field shapes.

- [ ] **Step 8: Verify and commit**

```bash
cd /Users/varis/Sites/varis-lab/frontend-bootcamp-content-7-july-2026
python3 /private/tmp/claude-501/-Users-varis-Sites-varis-lab-frontend-bootcamp-content-7-july-2026/16431c67-c41f-48ab-8541-21a433bf6c5d/scratchpad/verify/audit.py
git add Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/16_modeling-orders.html
git commit -m "content(week10): lesson 16 — our own order receipt shape and rounding rule"
```

---

### Task 11: Rewrite lesson 15 (zod contract check)

**Files:**
- Reference project: `package.json`, `scripts/contract-schemas.ts` (new), `scripts/contract-check.ts` (rewrite, delete old)
- Modify: `Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/15_checking-the-contract.html`

**Correction (found while dispatching Task 10 — verified against the course's own lesson ordering):** lesson 15 comes BEFORE lesson 16 (modeling orders) through lesson 19 (POST /carts/add) in the finished course. A student following the lessons in order does not have `POST /carts/add` working yet at lesson 15 — it doesn't exist until lesson 19. The original 10-check design here included a `POST /carts/add` check, which a student running `npm run contract:check` at lesson 15 could never pass. **This task ships 9 checks (products only); Task 14 (lesson 19) adds the 10th (`POST /carts/add`) once that endpoint actually exists**, extending this same script rather than lesson 15 pretending it's already live. `orderResponseSchema`/`cartProductSchema` may still be *defined* in `contract-schemas.ts` in this task (defining a schema for code that will exist soon is normal and harmless) — just don't import or use them in `contract-check.ts`'s checks array yet.

**Interfaces:**
- Consumes: the order receipt shape from Task 10 (lesson 16), completed immediately before this task, for the schema definitions only (not the check itself).
- Produces: `npm run contract:check` at 9 checks/lines — Task 14 (lesson 19) extends it to 10; lesson 22 (Task 15) correctly says "10 lines" because by then Task 14 has already run.

- [ ] **Step 1**: Add zod:

```bash
SCRATCH=/private/tmp/claude-501/-Users-varis-Sites-varis-lab-frontend-bootcamp-content-7-july-2026/16431c67-c41f-48ab-8541-21a433bf6c5d/scratchpad/verify/ecommerce-api
cd "$SCRATCH"
npm i zod@4.6.2
```

- [ ] **Step 2**: Write `scripts/contract-schemas.ts`:

```ts
import { z } from 'zod';

export const dimensionsSchema = z.object({
  width: z.number(),
  height: z.number(),
  depth: z.number(),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string(),
  date: z.iso.datetime(),
  reviewerName: z.string(),
  reviewerEmail: z.email(),
});

export const metaSchema = z.object({
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  barcode: z.string(),
  qrCode: z.url(),
});

export const productSchema = z
  .object({
    id: z.number().int(),
    title: z.string(),
    description: z.string(),
    category: z.string(),
    price: z.number(),
    discountPercentage: z.number().optional(),
    rating: z.number(),
    stock: z.number().int(),
    tags: z.array(z.string()),
    brand: z.string(),
    sku: z.string(),
    weight: z.number(),
    dimensions: dimensionsSchema,
    warrantyInformation: z.string(),
    shippingInformation: z.string(),
    availabilityStatus: z.string(),
    reviews: z.array(reviewSchema),
    returnPolicy: z.string(),
    minimumOrderQuantity: z.number().int(),
    meta: metaSchema,
    images: z.array(z.url()),
    thumbnail: z.url(),
  })
  .strict();

export const categorySchema = z
  .object({ slug: z.string(), name: z.string(), url: z.url() })
  .strict();

export const listEnvelopeSchema = z
  .object({
    products: z.array(productSchema),
    total: z.number().int(),
    skip: z.number().int(),
    limit: z.number().int(),
  })
  .strict();

export const errorSchema = z
  .object({
    message: z.union([z.string(), z.array(z.string())]),
    error: z.string(),
    statusCode: z.number(),
  })
  .strict();

export const cartProductSchema = z
  .object({
    id: z.number().int(),
    title: z.string(),
    price: z.number(),
    quantity: z.number().int(),
    total: z.number(),
    discountPercentage: z.number().optional(),
    discountedPrice: z.number(),
    thumbnail: z.url(),
  })
  .strict();

export const orderResponseSchema = z
  .object({
    id: z.number().int(),
    userId: z.number().int(),
    products: z.array(cartProductSchema),
    total: z.number(),
    discountedTotal: z.number(),
    totalProducts: z.number().int(),
    totalQuantity: z.number().int(),
  })
  .strict();
```

- [ ] **Step 3**: Delete the old `scripts/contract-check.ts` and write the new one:

```ts
import {
  categorySchema,
  errorSchema,
  listEnvelopeSchema,
  productSchema,
} from './contract-schemas.js';

const BASE = process.env.LOCAL_URL ?? 'http://localhost:3000';

interface Check {
  name: string;
  run: () => Promise<void>;
}

async function getJson(path: string, init?: RequestInit) {
  const response = await fetch(`${BASE}${path}`, init);
  const body = await response.json();
  return { status: response.status, body };
}

const checks: Check[] = [
  {
    name: 'GET /products/categories → 200, 24 categories',
    run: async () => {
      const { status, body } = await getJson('/products/categories');
      if (status !== 200) throw new Error(`status ${status}`);
      const categories = categorySchema.array().parse(body);
      if (categories.length !== 24) throw new Error(`expected 24 categories, got ${categories.length}`);
    },
  },
  {
    name: 'GET /products?limit=5&skip=0 → limit and skip echo the request',
    run: async () => {
      const { status, body } = await getJson('/products?limit=5&skip=0');
      if (status !== 200) throw new Error(`status ${status}`);
      const envelope = listEnvelopeSchema.parse(body);
      if (envelope.limit !== 5 || envelope.products.length !== 5) {
        throw new Error('limit did not echo the request');
      }
    },
  },
  {
    name: 'GET /products?limit=0 → 400 (out of range)',
    run: async () => {
      const { status, body } = await getJson('/products?limit=0');
      if (status !== 400) throw new Error(`expected 400, got ${status}`);
      errorSchema.parse(body);
    },
  },
  {
    name: 'GET /products?limit=101 → 400 (out of range)',
    run: async () => {
      const { status, body } = await getJson('/products?limit=101');
      if (status !== 400) throw new Error(`expected 400, got ${status}`);
      errorSchema.parse(body);
    },
  },
  {
    name: 'GET /products/1 → validated product',
    run: async () => {
      const { status, body } = await getJson('/products/1');
      if (status !== 200) throw new Error(`status ${status}`);
      productSchema.parse(body);
    },
  },
  {
    name: 'GET /products/999999 → 404 with message',
    run: async () => {
      const { status, body } = await getJson('/products/999999');
      if (status !== 404) throw new Error(`expected 404, got ${status}`);
      errorSchema.parse(body);
    },
  },
  {
    name: 'GET /products/abc → 400 with message',
    run: async () => {
      const { status, body } = await getJson('/products/abc');
      if (status !== 400) throw new Error(`expected 400, got ${status}`);
      errorSchema.parse(body);
    },
  },
  {
    name: 'GET /products/category/groceries?limit=20&skip=0 → total 27',
    run: async () => {
      const { status, body } = await getJson('/products/category/groceries?limit=20&skip=0');
      if (status !== 200) throw new Error(`status ${status}`);
      const envelope = listEnvelopeSchema.parse(body);
      if (envelope.total !== 27) throw new Error(`expected total 27, got ${envelope.total}`);
    },
  },
  {
    name: 'GET /products/category/nope?limit=5&skip=0 → 200, empty envelope',
    run: async () => {
      const { status, body } = await getJson('/products/category/nope?limit=5&skip=0');
      if (status !== 200) throw new Error(`status ${status}`);
      const envelope = listEnvelopeSchema.parse(body);
      if (envelope.products.length !== 0 || envelope.total !== 0) {
        throw new Error('unknown category should be empty, not an error');
      }
    },
  },
];
// Task 14 (lesson 19) appends a tenth check here — POST /carts/add → 201 —
// once that endpoint exists. Do not add it in this task: a student running
// this script at lesson 15 doesn't have /carts/add yet (it arrives at
// lesson 19), and a check that can never pass at the point it's introduced
// is worse than not having it yet.

let failures = 0;
for (const check of checks) {
  try {
    await check.run();
    console.log(`✅ ${check.name}`);
  } catch (error) {
    failures += 1;
    console.log(`❌ ${check.name}`);
    console.log(`   ${error instanceof Error ? error.message : String(error)}`);
  }
}
process.exit(failures === 0 ? 0 : 1);
```

- [ ] **Step 4**: Update `package.json`'s script:
```json
"contract:check": "tsx scripts/contract-check.ts"
```
(was `"node scripts/contract-check.ts"` — now `tsx` because the script imports typed zod schemas from a sibling module).

- [ ] **Step 5**: Run for real, capture the 10-line output, commit, re-tag:

```bash
(npm run start:dev &) ; sleep 8
npm run contract:check
git add -A && git commit -m "feat: zod contract check against our own API"
git tag -f lesson-15
```
Expected: 9 lines, all `✅`, exit code `0`. If any check fails, fix the underlying service/DTO (not the schema) and rerun before writing the lesson.

- [ ] **Step 6**: Rewrite lesson 15 HTML. Keep filename. New framing: "making the contract executable" — the spec written by hand in lesson 03 becomes zod schemas that validate our own live API. State explicitly (per the design spec's DTO-vs-zod resolution): `ProductResponseDto` (read by Swagger's CLI plugin in lessons 21–22) is the compile-time/Swagger-facing type; this zod schema is a separate, runtime-only check of our own responses — not a third "official" shape. Show the schema file and the check script (or the load-bearing parts), explain `.strict()` (rejects unexpected keys — catches an AI-added stray field), and keep the sabotage/"AI gets this wrong" exercise: break one field (e.g. rename `discountedPrice` to `discountPrice` in the mapper) and show the real zod error output naming the exact path, then revert. Update every verification step to the real command output captured in Step 5 (nine checks, not ten — say plainly that the tenth (carts) arrives in lesson 19 once that endpoint exists, so a student isn't confused when this run has fewer lines than lesson 22 later describes).

- [ ] **Step 7: Verify and commit**

```bash
cd /Users/varis/Sites/varis-lab/frontend-bootcamp-content-7-july-2026
python3 /private/tmp/claude-501/-Users-varis-Sites-varis-lab-frontend-bootcamp-content-7-july-2026/16431c67-c41f-48ab-8541-21a433bf6c5d/scratchpad/verify/audit.py
git add Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/15_checking-the-contract.html
git commit -m "content(week10): lesson 15 — zod makes our own contract executable"
```

---

### Task 12: Edit lesson 17 (cart DTO validation)

**Files:**
- Modify: `Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/17_validating-the-cart-payload.html`

- [ ] **Step 1**: `AddCartDto`/`AddressDto`/`CartProductDto` are **unchanged** in structure (address validation is independent of the product-contract change). Only update: the Cursor prompt's context line `@docs/contract/cart-add.txt` → `@docs/api-spec.md`; the intro paragraph's framing from "dummyjson's cart response" to "the receipt we designed in lesson 16" (cite `src/features/checkout/schema.ts`'s zod validation and `src/features/checkout/api.ts`'s `PlaceOrderPayload` as the source, same as before — that part was already correct since it read the client, not dummyjson).

- [ ] **Step 2: Verify and commit**

```bash
cd /Users/varis/Sites/varis-lab/frontend-bootcamp-content-7-july-2026
python3 /private/tmp/claude-501/-Users-varis-Sites-varis-lab-frontend-bootcamp-content-7-july-2026/16431c67-c41f-48ab-8541-21a433bf6c5d/scratchpad/verify/audit.py
git add Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/17_validating-the-cart-payload.html
git commit -m "content(week10): lesson 17 — point at api-spec.md and lesson 16's receipt"
```

---

### Task 13: Rewrite lesson 18 (orders transaction — worked numeric example)

**Files:**
- Modify: `Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/18_creating-orders-in-a-transaction.html`

**Interfaces:**
- Consumes: `OrdersService.create` from Task 10, product id 1 (price `9.99`, `discountPercentage 10.48`) from Task 3.

- [ ] **Step 1**: Replace the worked numeric example end to end with 2 decimal places, using product id 1 and quantity 2:
  - `total = round2(9.99 × 2) = round2(19.98) = 19.98`
  - `discountedPrice = round2(19.98 × (1 − 10.48/100)) = round2(19.98 × 0.8952) = round2(17.886096) = 17.89`
  - `discountedTotal = 17.89` (single item), `total = 19.98`, `totalProducts = 1`, `totalQuantity = 2`

- [ ] **Step 2**: Run the real transaction against the reference project to confirm:

```bash
SCRATCH=/private/tmp/claude-501/-Users-varis-Sites-varis-lab-frontend-bootcamp-content-7-july-2026/16431c67-c41f-48ab-8541-21a433bf6c5d/scratchpad/verify/ecommerce-api
cd "$SCRATCH"
(npm run start:dev &) ; sleep 8
curl -s -X POST http://localhost:3000/carts/add \
  -H 'Content-Type: application/json' \
  -d '{"userId":1,"products":[{"id":1,"quantity":2}],"address":{"address":"1 Sukhumvit Rd","email":"a@b.com","phone":"0812345678"}}'
git tag -f lesson-18
```
Expected: `discountedPrice: 17.89`, `total: 19.98`, `discountedTotal: 17.89`. Use this exact real output in the lesson, adjusting the hand-computed numbers above if they differ.

- [ ] **Step 3**: Update every place in the lesson that quotes the old dummyjson-derived numbers (`19.98 × (1 − 10.48/100) → 18`, or any `Math.round(...)` without `× 100 / 100`) to the 2dp version above. Update the `node -e` hand-calculation snippet:
```bash
node -e "console.log(Math.round(19.98 * (1 - 10.48 / 100) * 100) / 100)"  # 17.89
```

- [ ] **Step 4: Verify and commit**

```bash
cd /Users/varis/Sites/varis-lab/frontend-bootcamp-content-7-july-2026
python3 /private/tmp/claude-501/-Users-varis-Sites-varis-lab-frontend-bootcamp-content-7-july-2026/16431c67-c41f-48ab-8541-21a433bf6c5d/scratchpad/verify/audit.py
git add Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/18_creating-orders-in-a-transaction.html
git commit -m "content(week10): lesson 18 — 2dp rounding worked example (17.89, not 18)"
```

---

### Task 14: Rewrite lesson 19 (POST /carts/add — full response verification)

**Files:**
- Reference project: `scripts/contract-schemas.ts`, `scripts/contract-check.ts`
- Modify: `Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/19_post-carts-add.html`

**Correction (companion to Task 11's correction above):** Task 11 shipped `contract:check` with 9 checks (product endpoints only) because `POST /carts/add` doesn't exist at lesson 15's point in the course. It exists now. This task adds the 10th check to that same script — the natural moment, since this lesson's entire subject is `POST /carts/add`.

- [ ] **Step 1**: Replace every quoted response body with the real output captured in Task 13 Step 2 (full receipt: `id`, `userId`, `products[0]` with `discountedPrice: 17.89`, `total: 19.98`, `discountedTotal: 17.89`, `totalProducts: 1`, `totalQuantity: 2`).

- [ ] **Step 2**: Confirm the controller/wiring built alongside the service in Task 10 (`carts.controller.ts`, `orders.module.ts`, `OrdersModule` imported in `app.module.ts`) is present and unchanged:

```bash
SCRATCH=/private/tmp/claude-501/-Users-varis-Sites-varis-lab-frontend-bootcamp-content-7-july-2026/16431c67-c41f-48ab-8541-21a433bf6c5d/scratchpad/verify/ecommerce-api
cd "$SCRATCH"
cat src/orders/carts.controller.ts
```

- [ ] **Step 3**: Add the tenth check to `scripts/contract-check.ts` — import `orderResponseSchema` from `./contract-schemas.js` and append this check object to the `checks` array (after the `nope` category check, before the closing `];`):
```ts
  {
    name: 'POST /carts/add → 201, discountedPrice rounds to 2dp',
    run: async () => {
      const { status, body } = await getJson('/carts/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 1,
          products: [{ id: 1, quantity: 2 }],
          address: { address: '1 Sukhumvit Rd', email: 'a@b.com', phone: '0812345678' },
        }),
      });
      if (status !== 201) throw new Error(`expected 201, got ${status}`);
      const receipt = orderResponseSchema.parse(body);
      if (receipt.products[0].discountedPrice !== 17.89) {
        throw new Error(`expected discountedPrice 17.89, got ${receipt.products[0].discountedPrice}`);
      }
    },
  },
```
Run it for real:
```bash
(npm run start:dev &) ; sleep 8
npm run contract:check
git add -A && git commit -m "feat: extend contract check with POST /carts/add"
git tag -f lesson-19
```
Expected: 10 lines, all ✅, exit code 0. If it fails, fix the underlying service/DTO (not the schema) and rerun.

- [ ] **Step 4**: Rewrite lesson 19's own contract-check verification step (if it has one) or add a brief mention that `npm run contract:check` now shows all 10 checks, referencing the real 10-line output from Step 3.

- [ ] **Step 5: Verify and commit**

```bash
cd /Users/varis/Sites/varis-lab/frontend-bootcamp-content-7-july-2026
python3 /private/tmp/claude-501/-Users-varis-Sites-varis-lab-frontend-bootcamp-content-7-july-2026/16431c67-c41f-48ab-8541-21a433bf6c5d/scratchpad/verify/audit.py
git add Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/19_post-carts-add.html
git commit -m "content(week10): lesson 19 — real receipt with 2dp discountedPrice"
```

---

### Task 15: Edit lessons 21 and 22 (Swagger description, stray dummyjson references, brand→discountPercentage decorator)

**Files:**
- Reference project: `src/main.ts`, `src/products/dto/product-response.dto.ts`
- Modify: `Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/21_adding-swagger.html`
- Modify: `Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/22_documenting-dtos-and-responses.html`

**Correction (found while dispatching Task 6/reviewing Task 15 — verified against the actual pre-rework `22_documenting-dtos-and-responses.html` content, which this task inherits unedited until now):** this lesson's whole point is decorating `product-response.dto.ts` with `@ApiPropertyOptional()` on the one optional field — in the OLD course that was `brand`, and the lesson's Cursor prompt, review checklist, reference code, and verification all name `brand` six separate times. Since `brand` is now required and `discountPercentage` is the optional field (Task 6), every one of those six spots is now wrong and must move to `discountPercentage`. This lesson ALSO still quotes the old dummyjson-style 404 message (`"Product with id '9999' not found"`, with the single quotes) in five places, and the old 8-line dummyjson-path-based `contract:check` output — both need updating to match Task 7's new message format and Task 11's new zod-based check output. None of this was in the task's original scope; it is added here because it's the same two files this task already touches.

- [ ] **Step 1**: In `src/main.ts`, change:
```ts
.setDescription('Drop-in replacement for dummyjson.com used by the React e-commerce app')
```
→
```ts
.setDescription("E-commerce API designed from the React storefront's own contract (see docs/api-spec.md)")
```
Rebuild and commit/re-tag:
```bash
SCRATCH=/private/tmp/claude-501/-Users-varis-Sites-varis-lab-frontend-bootcamp-content-7-july-2026/16431c67-c41f-48ab-8541-21a433bf6c5d/scratchpad/verify/ecommerce-api
cd "$SCRATCH"
npm run build && npm run lint
git add -A && git commit -m "feat: swagger description no longer frames the API as a dummyjson clone"
git tag -f lesson-21
```

- [ ] **Step 2**: In `21_adding-swagger.html`, update both quotes of the `.setDescription(...)` string (the prose sentence and the code block) to the new value.

- [ ] **Step 2a: Move the `@ApiPropertyOptional()` decorator from `brand` to `discountPercentage` in the reference project**

In `src/products/dto/product-response.dto.ts`, add the import and decorator:
```ts
import { ApiPropertyOptional } from '@nestjs/swagger';
```
and change:
```ts
  discountPercentage?: number;
```
to:
```ts
  @ApiPropertyOptional()
  discountPercentage?: number;
```
Leave `brand: string;` undecorated (it's required now). Rebuild, run the app, and re-run the same schema-introspection one-liner lesson 22 already teaches (see Step 3 below) to capture real output before writing the lesson:
```bash
SCRATCH=/private/tmp/claude-501/-Users-varis-Sites-varis-lab-frontend-bootcamp-content-7-july-2026/16431c67-c41f-48ab-8541-21a433bf6c5d/scratchpad/verify/ecommerce-api
cd "$SCRATCH"
npm run build && npm run lint
(npm run start:dev &) ; sleep 8
curl -s http://localhost:3000/api-json | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const j=JSON.parse(d);console.log(JSON.stringify(j.paths['/products/{id}'].get.responses));console.log(Object.keys(j.components.schemas));console.log(j.components.schemas.ProductResponseDto.required.includes('discountPercentage'))})"
```
Expected: the `required` array no longer includes `discountPercentage`; the last line prints `false`. Also confirm `npm run contract:check` (Task 11's zod check) still prints all 10 lines ✅ — capture that real output verbatim for Step 3 below. Commit this reference-project change before moving to Step 3:
```bash
git add -A && git commit -m "feat: move @ApiPropertyOptional from brand to discountPercentage"
git tag -f lesson-22
```

- [ ] **Step 3**: In `22_documenting-dtos-and-responses.html`, apply all of the following (all six `brand`→`discountPercentage` swaps, the 404-message format update, the `/products/194`→`/products/208` fix, and the contract-check output replacement — this lesson gets no other task, so this is the only chance to fix it):

1. **Comparison-table row** (decorator table): change
   `ทำให้ brand หลุดจาก required ของ schema — ตรงกับ mapper ที่ตัด brand ออกเมื่อค่าเป็น null`
   → `ทำให้ discountPercentage หลุดจาก required ของ schema — ตรงกับ mapper ที่ตัด discountPercentage ออกเมื่อค่าเป็น null`
2. **"เป้าหมายของบทนี้" contract bullet**: change
   `ต้องใส่ @ApiPropertyOptional() ให้ brand ตัวเดียว / ต้องไม่ใส่ decorator ให้ field อื่น`
   → `ต้องใส่ @ApiPropertyOptional() ให้ discountPercentage ตัวเดียว / ต้องไม่ใส่ decorator ให้ field อื่น`
3. **Cursor prompt technical-requirements line**: change
   `product-response.dto.ts: ใส่ @ApiPropertyOptional() ให้ brand ตัวเดียว (plugin จัดการ field อื่นให้)`
   → `product-response.dto.ts: ใส่ @ApiPropertyOptional() ให้ discountPercentage ตัวเดียว (plugin จัดการ field อื่นให้)`
4. **Cursor prompt's `findOne` line and the review checklist's matching bullet** — both currently quote the OLD 404 message with single quotes around the id (`"Product with id '9999' not found"`). Task 7 already changed the real message to `` `Product ${id} not found` `` (no quotes around the id). Update every occurrence in this lesson to `"Product 9999 not found"` (drop the single quotes): the Cursor prompt's `findOne` requirement line, the review checklist bullet naming the exact message, the reference `products.controller.ts` code block's `@ApiNotFoundResponse({ description: ... })` argument, the expected-result paragraph's quoted message, and both places in the verification section's captured JSON output (the schema-introspection result block and its surrounding prose).
5. **Review checklist bullet**: change
   `ใน product-response.dto.ts มี @ApiPropertyOptional() แค่ที่ brand — field อื่นสะอาดเหมือนเดิม`
   → `ใน product-response.dto.ts มี @ApiPropertyOptional() แค่ที่ discountPercentage — field อื่นสะอาดเหมือนเดิม`
6. **Reference code block** (`/* src/products/dto/product-response.dto.ts — เฉพาะส่วนที่เปลี่ยน */`): replace
   ```
   import { ApiPropertyOptional } from '@nestjs/swagger';

   export class ProductResponseDto {
     id: number;
     title: string;
     description: string;
     category: string;
     price: number;
     discountPercentage: number;
     rating: number;
     stock: number;
     tags: string[];
     @ApiPropertyOptional()
     brand?: string;
     sku: string;
     weight: number;
     /* … field ที่เหลือเหมือนเดิม ไม่มี decorator … */
   }
   ```
   with
   ```
   import { ApiPropertyOptional } from '@nestjs/swagger';

   export class ProductResponseDto {
     id: number;
     title: string;
     description: string;
     category: string;
     price: number;
     @ApiPropertyOptional()
     discountPercentage?: number;
     rating: number;
     stock: number;
     tags: string[];
     brand: string;
     sku: string;
     weight: number;
     /* … field ที่เหลือเหมือนเดิม ไม่มี decorator … */
   }
   ```
7. **Verification one-liner and its captured output**: change the schema-introspection command's last `console.log` argument from `j.components.schemas.ProductResponseDto.required.includes('brand')` to `j.components.schemas.ProductResponseDto.required.includes('discountPercentage')`. Use the REAL output captured in Step 2a above for the printed result block (the `200`/`404` line, the `components.schemas` array — unchanged — and the final `false`), and update the surrounding bullet from `บรรทัดสุดท้ายเป็น false คือ brand ไม่อยู่ใน required ตามที่ @ApiPropertyOptional() สั่ง` to `บรรทัดสุดท้ายเป็น false คือ discountPercentage ไม่อยู่ใน required ตามที่ @ApiPropertyOptional() สั่ง`.
8. **`/products/194` example**: change to `/products/208` (the new last id — confirm against Task 3's real seeded max id; if the real max id differs, use that value).
9. **"สัญญากับ dummyjson ยังไม่เพี้ยน" bullet and the 8-line output block below it**: change the bullet to `สัญญากับ docs/api-spec.md ยังไม่เพี้ยน: npm run contract:check ต้องได้ ✅ ครบทั้งสิบบรรทัด` (ten lines). Replace the whole 8-line `<pre><code>` block (the old dummyjson-URL-style lines: `✅ /products/categories`, `✅ /products?limit=3&skip=0`, etc.) with Task 11's REAL captured `contract:check` output — ten lines, each `✅ <check name>` exactly as Task 11's zod script actually printed them when it ran. Do not invent this text; copy it from Task 11's report/ledger record, or re-run `npm run contract:check` in the reference project if that record isn't at hand.

- [ ] **Step 4: Verify and commit**

```bash
cd /Users/varis/Sites/varis-lab/frontend-bootcamp-content-7-july-2026
python3 /private/tmp/claude-501/-Users-varis-Sites-varis-lab-frontend-bootcamp-content-7-july-2026/16431c67-c41f-48ab-8541-21a433bf6c5d/scratchpad/verify/audit.py
git add Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/21_adding-swagger.html Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/22_documenting-dtos-and-responses.html
git commit -m "content(week10): lessons 21-22 — drop dummyjson framing from swagger description and examples"
```

---

### Task 16: Rewrite lesson 23 (switching the React app — new dataset)

**Files:**
- Modify: `Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/23_switching-the-react-app.html`

**Interfaces:**
- Consumes: Task 3's seeded dataset — `beauty` (5 products, no pagination) and `groceries` (27 products, two pages) — and the exact Groceries title list captured in Task 3 Step 4.

- [ ] **Step 1**: This lesson's env-var-flip mechanism is unchanged. Update the specific data-dependent claims:
  - The Home-page "DEALS OF THE DAY" and category-menu checks are unaffected by counts (still 5 deals, 24 categories) — keep as is, just confirm against a real run.
  - The Category-page pagination walkthrough: "อย่าใช้ Beauty ทดสอบ pagination เพราะข้อมูล seed ของเรามีแค่ 5 ชิ้น... ให้เลือก Groceries ที่มี 27 ชิ้นแทน" stays structurally identical (Beauty=5, Groceries=27 by design — see Task 3's `COUNT_OVERRIDES`), but the **7 named products on page 2** must be replaced with the real titles Task 3 actually captured when it ran (confirmed by Task 3's implementer, not a prediction): Mulberry, Juniper Berry, Chinese Cabbage, White Bread, Peppers, Cabbage, Bean Shoots — and page 1 (20 items, for confirming the pagination request/response shape) is: Dandelion, Prunes, Pasta, Dried Chinese Broccoli, Leeks, Okra, Endive, Broccolini, Paprik, Bok Choy, Coconut, Fresh Chillies, Carrot, Cheddar, Cucumber, Lettuce, Goji Berry, Allspice, Pumpkin, Butternut Lettuce (verify against the actual reference-project output before writing — if Task 3's seed was re-run since and produced a different real list, use that instead).

- [ ] **Step 2**: Update the framing sentence in the workshop intro from "ถ้าสัญญาที่เราจับมาตั้งแต่บทที่ 3 ถูกต้องจริง" (if the contract we captured is right) to "ถ้าสัญญาที่เราออกแบบเองตั้งแต่บทที่ 3 ตรงกับที่โค้ด client ต้องการจริง" (if the contract we designed ourselves matches what the client code actually needs) — the payoff is now evidence that reading the client correctly, not evidence that copying dummyjson correctly.

- [ ] **Step 3**: Actually run the React app against the rebuilt reference API and confirm the five checks (Home, category menu, Category page pagination, product detail, checkout) with a real browser or curl-against-the-network-tab pass, per the original course's verification method for this lesson. Capture real Network-tab URLs (they're unaffected by this change: `GET /products?skip=0&limit=5`, `GET /products/categories`, `GET /products/category/beauty?skip=0&limit=12`, `GET /products/category/groceries?skip=0&limit=20` then `skip=20&limit=20`).

- [ ] **Step 4: Verify and commit**

```bash
cd /Users/varis/Sites/varis-lab/frontend-bootcamp-content-7-july-2026
python3 /private/tmp/claude-501/-Users-varis-Sites-varis-lab-frontend-bootcamp-content-7-july-2026/16431c67-c41f-48ab-8541-21a433bf6c5d/scratchpad/verify/audit.py
git add Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/23_switching-the-react-app.html
git commit -m "content(week10): lesson 23 — real Groceries page-2 titles from the faker seed"
```

---

### Task 17: Edit lesson 24 (wrap-up) and index.html

**Files:**
- Modify: `Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/24_wrap-up.html`
- Modify: `Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/index.html`
- Modify: `Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/01_what-well-be-building.html`

- [ ] **Step 1**: In `24_wrap-up.html`, update the project tree:
```
├── docs/contract/                       สัญญาของ dummyjson ที่คอร์สจับมาให้ (บทที่ 3)
│   ├── README.md
│   ├── categories.json
│   ├── products-page.json
│   ├── products-by-category.json
│   ├── products-by-category-unknown.json
│   ├── product-1.json
│   ├── product-not-found.txt
│   └── cart-add.txt
```
→
```
├── docs/api-spec.md                     สัญญาที่เราออกแบบเองจากโค้ด client (บทที่ 3)
```
Update `scripts/contract-check.ts` description from "เทียบ response ของเรากับ dummyjson (บทที่ 15)" to "ตรวจ response ของเราเองด้วย zod (บทที่ 15)". Update `prisma/seed.ts` description from "ดึงสินค้า 194 ชิ้นลงฐานข้อมูล" to "สร้างสินค้า 208 ชิ้นด้วย faker".

- [ ] **Step 2**: In `01_what-well-be-building.html`:
  - Project tree: same `docs/api-spec.md` / `seed.ts` / `contract-check.ts` wording swap as Step 1.
  - Change "บทที่ 3 จะวาง สัญญา (contract) นี้ลงเป็นไฟล์จริงในโปรเจกต์ — payload ที่คอร์สยิงเก็บมาจาก dummyjson ให้แล้ว" to "บทที่ 3 จะอ่านโค้ดฝั่ง client แล้วออกแบบ สัญญา (contract) นี้เป็นไฟล์จริงในโปรเจกต์เอง".
  - Change the "five lessons without Cursor" bullet for lesson 3 from "สัญญาของ dummyjson ต้องมาจากการยิงของจริง คอร์สจึงยิงเก็บไว้ให้แล้วเป็นไฟล์..." to: "บทที่ 3 คือ**การออกแบบที่ AI ทำแทนไม่ได้** — สัญญาต้องมาจากการอ่านโค้ดฝั่ง client ของคุณเองแล้วตัดสินใจเอง ถ้าให้ AI ออกแบบสัญญาให้ มันจะเดารูปทรงที่ดูสมเหตุสมผลแต่ไม่ตรงกับที่ client ต้องการจริง".

- [ ] **Step 3**: In `index.html`:
  - Meta description and intro `<p>`: change "สร้าง API แทน dummyjson.com" framing to "สร้าง API จากสัญญาที่ออกแบบเองจากโค้ด client".
  - Lesson-list link text: `03_capturing-the-dummyjson-contract.html` → "อ่านโค้ดฝั่ง client แล้วออกแบบสัญญาเป็นของตัวเอง" (matches Task 2's new `<title>`); `09_seeding-real-products.html` → "เขียน seed generator ด้วย faker" (matches Task 3); `15_checking-the-contract.html` → "ทำสัญญาให้ตรวจสอบได้จริงด้วย zod" (matches Task 11).

- [ ] **Step 4: Verify and commit**

```bash
cd /Users/varis/Sites/varis-lab/frontend-bootcamp-content-7-july-2026
python3 /private/tmp/claude-501/-Users-varis-Sites-varis-lab-frontend-bootcamp-content-7-july-2026/16431c67-c41f-48ab-8541-21a433bf6c5d/scratchpad/verify/audit.py
git add Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/24_wrap-up.html Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/01_what-well-be-building.html Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/index.html
git commit -m "content(week10): lessons 01/24 and index — consumer-derived contract framing"
```

---

### Task 18: Full-course re-verification and final audit

**Files:** none new — this task only runs checks across everything Tasks 1–17 produced.

- [ ] **Step 1**: Clean-database rerun of the whole reference project from scratch:

```bash
SCRATCH=/private/tmp/claude-501/-Users-varis-Sites-varis-lab-frontend-bootcamp-content-7-july-2026/16431c67-c41f-48ab-8541-21a433bf6c5d/scratchpad/verify/ecommerce-api
cd "$SCRATCH"
npx prisma migrate reset --force
npm run db:seed
npm run build
npm run lint
(npm run start:dev &) ; sleep 8
npm run contract:check
curl -s -X POST http://localhost:3000/carts/add \
  -H 'Content-Type: application/json' \
  -d '{"userId":1,"products":[{"id":1,"quantity":2}],"address":{"address":"1 Sukhumvit Rd","email":"a@b.com","phone":"0812345678"}}'
```
Expected: `contract:check` prints 10 `✅` lines, exit 0; cart-add response matches the receipt quoted in lessons 18/19 exactly (`discountedPrice: 17.89`).

- [ ] **Step 2**: Re-tag the final state and push tags if the scratchpad project has a remote (it doesn't by default — local tags only, matching the original course's setup):

```bash
git tag -f lesson-22
```

- [ ] **Step 3**: Structural audit and link sweep across the course content:

```bash
cd /Users/varis/Sites/varis-lab/frontend-bootcamp-content-7-july-2026
python3 /private/tmp/claude-501/-Users-varis-Sites-varis-lab-frontend-bootcamp-content-7-july-2026/16431c67-c41f-48ab-8541-21a433bf6c5d/scratchpad/verify/audit.py
cd Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content
for f in *.html; do
  python3 -c "
import re, os, sys
s = open('$f', encoding='utf-8').read()
for m in re.findall(r'(?:href|src)=\"([^\"]+)\"', s):
    if m.startswith('http'):
        continue
    if not os.path.exists(m):
        print('MISSING in $f:', m)
"
done
grep -rn 'docs/contract\|dummyjson.com' *.html || echo "no stray dummyjson-capture references remain"
```
Expected: `audit done: 0 problem(s) across 24 lessons`; no MISSING link lines; the final grep prints only lines that are deliberate historical mentions (lesson 01's "we used to think about this the dummyjson way" framing, if any survives — review each hit and confirm it's intentional prose, not a leftover path/fact).

- [ ] **Step 4**: Full-repo git status check — confirm only Week_10 files (plus this plan/spec under `docs/superpowers/`) are staged, and the other session's Week_09 in-progress files are untouched:

```bash
cd /Users/varis/Sites/varis-lab/frontend-bootcamp-content-7-july-2026
git status --short
```
Expected: modified/added files are only under `Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/` and `docs/superpowers/`; `Week_09/01_nestjs_basic/content/23_...` and `24_...` and `extra/quiz-questions-week09-nestjs-basic-01-23.json` remain exactly as they were at the start (untouched by this plan).

- [ ] **Step 5**: Final commit (if any stray verification-only changes remain uncommitted) and report to the user: what changed, the real `contract:check` output, and confirmation that the other session's files were not touched.

---

## Self-review notes (fixed inline before handoff)

- **Spec coverage:** every numbered item in the design spec's §1–§7 maps to a task above (§1→Task 2, §2→Tasks 6/7/8/10, §3→Task 3, §4→Tasks 11/14, §5→Task 2, §6→Tasks 4/5/9/12/13/15/16/17, §7→Task 2/18). No spec requirement is without a task.
- **Placeholder scan:** no TBD/TODO — every task has real code, real numbers, or an explicit "run this and use the real output" instruction where output cannot be known before execution (faker output, live curl responses).
- **Type consistency:** `ProductResponseDto`, `product.mapper.ts`, `PaginationQueryDto`, `CartResponseDto`, `cart.mapper.ts`, `orders.service.ts`, and `contract-schemas.ts` all agree on field names, optionality, and nullability across Tasks 6, 8, 10, 11 — cross-checked against each other while writing this plan.
- **Corrected scope vs. the design spec:** lessons 05, 08, 21, 22 added (spec said unchanged); lessons 07/08 branch point corrected to tag `lesson-06` (spec suggested `lesson-08`, which already bakes the old schema/migration). Both corrections are evidenced by direct grep/git inspection recorded in the Global Constraints section, not by re-opening the approved design decisions (contract source, faker seed, zod verification, 2dp rounding, order shape are all unchanged from the spec).
