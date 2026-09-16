# Week_10 NestJS E-commerce API + Cursor AI Course — Design

**Date:** 2026-09-12
**Status:** Approved by user (approach A, design presented and approved 2026-09-12)

## Goal

A course in which students build a NestJS + Prisma + PostgreSQL API that is a
**drop-in replacement for dummyjson.com** as consumed by the React e-commerce
app (`workshop/temp/react-ecommerce-app`). At the end, the student changes one
line in the React app (`VITE_API_BASE_URL=http://localhost:3000`) and every page
(Home, Category, Product, Cart, Checkout, Order Success) works against their own
API, with the same 194 products, 24 categories and 3 reviews per product.

The course teaches **one endpoint per lesson**, and the student builds each one
by writing a structured prompt for **Cursor Agent**, then reviewing the output
against a concrete checklist. The pedagogical model is the same as
`Week_05_06/04_react_ecommerce_ai_project`: **understand-first, then delegate**.

**Governing rule, stated in lesson 01 and repeated in every prompt lesson:**
AI พิมพ์แทนคุณได้ แต่คุณต้องอธิบายทุกบรรทัดได้ — ถ้าอธิบายไม่ได้ แปลว่ายังไม่ผ่านบทนี้

## Decisions

| Question | Decision |
| --- | --- |
| Contract | Drop-in: same paths and response shapes as dummyjson, including `POST /carts/add`. React app changes only its base URL. |
| Database | Prisma 7.10 (pinned) + PostgreSQL 17 in Docker Compose. Same stack as Week_09 ch. 19–31. |
| Prerequisites | Week_09 (NestJS Fundamentals) and Week_05_06/04 (Cursor). Each lesson gives a short concept recap, not a re-teach. Cursor chapter is one lesson. |
| Extra scope | DTO validation + CORS (required for the React app), Swagger docs. **No** e2e tests, **no** "when Cursor gets it wrong" lesson. |
| Approach | A: database first (seed real data in chapter 2), then one endpoint per lesson against real data. |
| Location | `Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/` (folder already exists, empty). |

## Output location and format

`Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/`
- `index.html` (chapter index, same structure as Week_09's)
- `lesson.css` — copied from `Week_09/01_nestjs_basic/content/lesson.css`, then
  extended with exactly two blocks (see below)
- `01_….html` … `24_….html`

Course title: **สร้าง E-commerce API ด้วย NestJS + Cursor AI**
`<title>` pattern: `<Thai lesson title>` (same as Week_09: title only, no suffix).
Eyebrow: `NestJS E-commerce API Workshop · บทที่ N จาก 24`.
Footer: `NestJS E-commerce API Workshop ภาษาไทย · ตรวจทานแหล่งอ้างอิงเมื่อ 12 กันยายน 2026`.

### Format contract (mirrors Week_09 exactly)

- Thai narration; English technical terms untranslated.
- `<html lang="th">`, `<meta name="description">`, `<link rel="stylesheet" href="lesson.css">`,
  `<main>` → `<p class="eyebrow">`, `<h1>`,
  `<section class="learning-objectives">` with `<h2>เมื่อจบบทนี้ คุณจะสามารถ</h2>` + 3 bullets.
- Concept sections as plain `<h2>` + `<p>`/`<ul>`/`<pre><code>`; `.comparison` tables
  and `.note` / `.warning` boxes where useful.
- Code blocks: `<pre><code>` with HTML entities escaped (no language class, as Week_09).
- Exercise block `<section class="workshop">`, then `<section class="expected-result">`,
  then `<section class="verification">` (checklist), then `<h2>แหล่งอ้างอิง</h2>` +
  `<ul class="source-list">`, then `<nav class="lesson-navigation">` prev / index / next.

### CSS additions (the only two)

```css
.cursor-prompt { /* same box as .prompt-example, label differs */ }
.cursor-prompt::before { content: "Prompt ที่ส่งให้ Cursor"; color: #7cc7ff; }
.review { background: #f5f1ff; border: 1px solid #c9b8ee; }
.review::before { content: "ตรวจโค้ดที่ AI สร้าง"; color: #533986; }
.review ul { list-style: "✅  "; }
```

`.cursor-prompt` is added to every selector list that already contains
`.prompt-example` (shared box styles, `::before` label styles, mobile padding).
`.review` is added to the shared box selector lists the same way.
`.prompt-example` (label "คำสั่งที่ใช้") stays for shell/curl commands.

## Per-lesson anatomy

**Prompt lessons** (05–22 except where marked ✍️):

1. Learning objectives (3 bullets).
2. **แนวคิด** — 2–4 short concept sections: what this endpoint/feature must do,
   the dummyjson fact it must honour (quoting the captured payload from lesson 02),
   and the NestJS/Prisma idea behind it (recap, with a link to the Week_09 lesson
   that taught it).
3. **เป้าหมายของบทนี้** — file tree of what will be created/changed, and the
   *contract* each file must satisfy (does / must not do).
4. `<section class="workshop">` — one sentence of setup (new chat, Agent mode,
   commit first), then `<div class="cursor-prompt"><code>…</code></div>` holding
   the prompt. Some lessons have a second, smaller follow-up prompt.
5. `<section class="review">` — checklist of what must be true in the generated
   code, plus one `<p><strong>AI มักพลาดตรงนี้:</strong> …</p>` naming the realistic
   mistake at that spot. Followed by the reference final code (`<pre><code>`) so
   the student can diff.
6. `<section class="expected-result">` — what the running app does now.
7. `<section class="verification">` — runtime checks (`curl`, pgAdmin, log lines),
   always ending with the contract comparison: the same request against
   `https://dummyjson.com` must give the same shape.
8. Sources, nav.

**Hand-typed lessons** (✍️: 02, 03, 04, 08, 23) use the Week_09 shape unchanged
(`.workshop` + `.prompt-example` for shell commands) and state in one sentence
why this part is not delegated.

## Prompt template (used verbatim in every prompt lesson)

Same five-part shape as the React + Cursor course, so students see one shape
across both courses. Thai, plain text, no markdown headings inside the prompt.

```text
<one-line goal, imperative>

บริบท: @<file> @<folder> …
<facts Cursor cannot know: what exists already, the captured dummyjson payload,
 versions, conventions from .cursor/rules that matter here>

โครงสร้าง: สร้าง/แก้ไฟล์ตามนี้ ไม่มากไม่น้อยกว่านี้
- <path> (สร้างใหม่ | แก้ไข)

ข้อกำหนดทางเทคนิค:
- <exact names, signatures, decorators, response shape, error behaviour>

ขอบเขต:
- ห้ามติดตั้ง dependency ใหม่ (unless the lesson says which)
- ห้ามแก้ไฟล์อื่นนอกจากที่ระบุ
- ห้ามสร้าง index.ts / barrel
- ยังไม่ต้อง <the thing the next lesson does>
```

Rules for writing prompts:
- Every `@`-mention names a file/folder that exists at that point in the course.
- Any fact about dummyjson comes from the payload captured in lesson 02 and is
  quoted in the prompt (field lists, exact error message, status code).
- The prompt is specific enough that a reasonable Cursor run yields the reference
  code; where it plausibly would not, the review checklist calls out the gap.
- Scope always forbids touching files that later lessons will create.

## Project stack (source of truth)

Verified facts from the Week_09 migration apply (see memory
`prisma-7-nestjs-validated-facts`): Nest 12 ESM, `.js` on relative imports,
Vitest scaffolded (unused here), TS 6 strict, `prisma7.config.ts`, default
generator output `src/generated/prisma`, `PrismaModule` global, CJS packages
via default import, every decorated parameter typed.

- `nest new ecommerce-api` (@nestjs/cli 12), npm, port 3000.
- `docker compose` service `postgres:17`, db `ecommerce`, port 5432.
- Prisma exactly as Week_09 lesson 22 verified it: `@prisma/client@7.10.0`,
  `@prisma/adapter-pg@7.10.0`, `dotenv`, dev `prisma@7.10.0`;
  `PrismaService extends PrismaClient` constructed with
  `new PrismaPg({ connectionString: process.env.DATABASE_URL })`, connect in
  `onModuleInit`, disconnect in `onModuleDestroy`; client imported from
  `src/generated/prisma/client.js`.
- `class-validator`, `class-transformer`, `@nestjs/config`, `@nestjs/swagger`, dev `tsx`.
- `.cursor/rules/project.mdc` (written by hand in lesson 04):
  ESM `.js` imports, strict TS / no `any` / no `as` to silence errors, one module
  per domain (`products`, `orders`), DTOs in `dto/`, all DB access through
  `PrismaService`, response shapes are the dummyjson contract in `docs/contract/`,
  no barrel files, no new deps unless told, no comments restating code.

## Captured contract (lesson 02 writes these to `docs/contract/*.json`)

Verified live on 2026-09-12:

| Request | Status | Shape / notes |
| --- | --- | --- |
| `GET /products/categories` | 200 | `[{slug, name, url}]`, 24 items, `url` = `<base>/products/category/<slug>` |
| `GET /products?limit&skip` | 200 | `{products: Product[], total: 194, skip, limit}`; default `limit` 30; `limit=0` returns all; the echoed `limit` is the number of products actually returned (`?limit=10&skip=190` → `limit: 4`) |
| `GET /products/category/:slug?limit&skip` | 200 | same envelope; unknown slug → `{products: [], total: 0, skip: 0, limit: 0}` (200, not 404) |
| `GET /products/:id` | 200 / 404 | full `Product`; not found → `{"message": "Product with id '9999' not found"}` |
| `POST /carts/add` | 201 / 400 | body `{userId, products: [{id, quantity}], address?}`; response = cart (below); missing userId → `{"message": "User id is required"}` |

`Product` (22 keys): `id, title, description, category (slug string), price,
discountPercentage, rating, stock, tags[], brand (absent on 92 of 194), sku,
weight, dimensions{width,height,depth}, warrantyInformation, shippingInformation,
availabilityStatus, reviews[{rating, comment, date, reviewerName, reviewerEmail}],
returnPolicy, minimumOrderQuantity, meta{createdAt, updatedAt, barcode, qrCode},
images[], thumbnail`. Dates are ISO strings. Numbers are JSON numbers (never
strings).

Cart response: `{id, products: [{id, title, price, quantity, total,
discountPercentage, discountedPrice, thumbnail}], total, discountedTotal, userId,
totalProducts, totalQuantity}` where `total = price × quantity`,
`discountedPrice = Math.round(total × (1 − discountPercentage/100))`,
`discountedTotal = Math.round(sum of discountedPrice)`. (Observed: 9.99 × 2 =
19.98 → discountedPrice 18.)

### Known, accepted deviations (documented in lesson 15)

- `GET /products/abc` → 400 from `ParseIntPipe` (dummyjson: 404). React never
  sends non-numeric ids.
- Validation errors use Nest's `{statusCode, message: string[], error}` (dummyjson:
  `{message}`). The React `ApiError` reads `data.message` either way.
- Category `url` host is `APP_URL` (`http://localhost:3000`), not dummyjson.
- Key order inside objects may differ; JSON consumers do not depend on it.

## Data model (Prisma)

Flattened columns for `dimensions` and `meta`; a mapper rebuilds the nested
contract shape. `Float` (not `Decimal`) for money/ratings so JSON serialises as
numbers. Product ids are the dummyjson ids (seed inserts explicit ids).

```prisma
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
  discountPercentage   Float
  rating               Float
  stock                Int
  tags                 String[]
  brand                String?
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
  orderItems           OrderItem[]
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
}

model Order {            // added in lesson 16
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
  id                 Int     @id @default(autoincrement())
  orderId            Int
  order              Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId          Int
  product            Product @relation(fields: [productId], references: [id])
  title              String
  thumbnail          String
  price              Float
  discountPercentage Float
  quantity           Int
  total              Float
  discountedPrice    Float
}
```

Seed (`prisma/seed.ts`, run with `npm run db:seed` = `tsx prisma/seed.ts`;
`tsx` is a devDependency because the generated client imports its own files with
`.js` extensions that plain Node type stripping cannot resolve): fetches
`https://dummyjson.com/products/categories` and `https://dummyjson.com/products?limit=0`,
then inside one `$transaction` deletes reviews, products, categories (and, from
lesson 16, order items and orders) and re-inserts everything with `createMany`,
keeping dummyjson's product ids and review order. Idempotent.

## Module layout

```
src/
├── app.module.ts                 (ConfigModule.forRoot, PrismaModule, ProductsModule, OrdersModule)
├── main.ts                       (ValidationPipe, CORS, Swagger, PORT)
├── prisma/  prisma.module.ts, prisma.service.ts
├── products/
│   ├── products.module.ts
│   ├── products.controller.ts    GET /products/categories, /products, /products/category/:slug, /products/:id
│   ├── products.service.ts
│   ├── product.mapper.ts         toProductResponse(row with reviews & category)
│   └── dto/ pagination-query.dto.ts, product-response.dto.ts
└── orders/
    ├── orders.module.ts
    ├── carts.controller.ts       POST /carts/add
    ├── orders.service.ts
    ├── cart.mapper.ts            toCartResponse(order with items)
    └── dto/ add-cart.dto.ts (+ nested CartProductDto, AddressDto), cart-response.dto.ts
scripts/contract-check.ts         (lesson 15)
docs/contract/*.json              (lesson 02)
```

Route order matters: `/products/categories` and `/products/category/:slug` are
declared before `/products/:id` (lesson 12 explains why).

## Lesson map (24 lessons, 5 chapters)

Filenames follow Week_09 (`NN_kebab-slug.html`). ✍️ = hand-typed, no prompt.

**1. ก่อนเริ่ม (01–04)**
1. `01_what-well-be-building.html` สิ่งที่เราจะสร้างและกติกาของคอร์ส — the drop-in
   idea, the five endpoints, the governing rule, how a prompt lesson is laid out
   (🤖 prompt → ✅ review → verification), prerequisites and versions.
2. ✍️ `02_scaffolding-the-project.html` Scaffold โปรเจกต์ด้วย Nest CLI — `nest new
   ecommerce-api`, `npm run start:dev`, first commit, the commit-before-every-prompt
   habit.
3. ✍️ `03_capturing-the-dummyjson-contract.html` จับสัญญาของ dummyjson ด้วย curl —
   `docs/contract/` inside the project, `curl` each endpoint into a file, read the
   facts (default limit 30, 404 message, empty category, 201 cart, brand missing
   on 92). Why by hand: this is the truth every later prompt quotes.
4. ✍️ `04_cursor-rules-and-the-prompt-template.html` Cursor Rules และแม่แบบ Prompt —
   write `.cursor/rules/project.mdc`, the five-part template, the review loop
   (`npm run build`, `npm run lint`, watch log, `curl`, compare with contract),
   refine vs revert.

**2. ฐานข้อมูล (05–09)**
5. `05_running-postgresql.html` รัน PostgreSQL ด้วย Docker Compose — prompt for
   `docker-compose.yml` + `.env` (`DATABASE_URL`, `PORT`, `APP_URL`) + `.gitignore`.
6. `06_setting-up-prisma.html` ติดตั้ง Prisma และ PrismaModule — `npm i` pinned
   versions (told in prompt), `npx prisma init --no-skills`, prompt for
   `PrismaModule`/`PrismaService` (global) and `ConfigModule.forRoot({ isGlobal:
   true })` in `AppModule` so `.env` is loaded without `dotenv/config` in `main.ts`.
7. `07_modeling-products-in-prisma.html` ออกแบบ Prisma Model ของสินค้า — prompt for
   `Category`, `Product`, `Review` with the field list from the contract; why
   flatten dimensions/meta; why `Float` not `Decimal`.
8. ✍️ `08_running-the-first-migration.html` รัน Migration แรกและดูตารางใน pgAdmin —
   `prisma migrate dev --name init`, `prisma generate`, inspect tables. Commands
   only, no prompt: migrations are run, not written.
9. `09_seeding-real-products.html` Seed สินค้าจริงจาก dummyjson — prompt for
   `prisma/seed.ts` + `"prisma": {"seed": …}`; verify 24 / 194 / 582 rows.

**3. Products endpoints (10–15)**
10. `10_get-products-categories.html` GET /products/categories — prompt for
    `ProductsModule`, controller, service, `APP_URL` via `ConfigService`.
11. `11_mapping-rows-to-the-contract.html` แปลงแถวจากฐานข้อมูลเป็นรูปทรงของ dummyjson —
    prompt for `dto/product-response.dto.ts` (classes `ProductDimensionsDto`,
    `ProductReviewDto`, `ProductMetaDto`, `ProductResponseDto`, `CategoryResponseDto`,
    `ProductListResponseDto`; classes so the Swagger CLI plugin can document them in
    lesson 22) and `product.mapper.ts` (`toProductResponse`); brand omitted when
    null; nested `dimensions`/`meta`; `category` as slug string; dates via
    `toISOString()`.
12. `12_get-product-by-id.html` GET /products/:id — `ParseIntPipe`, `include`
    reviews + category, `NotFoundException` with the exact message, route order.
13. `13_get-products-with-pagination.html` GET /products พร้อม skip/limit —
    `PaginationQueryDto` (`@IsOptional @IsInt @Min(0)`, `@Type(() => Number)`),
    global `ValidationPipe({ whitelist, transform })`, default 30, `limit=0` = all,
    `findMany` + `count` in a `$transaction`.
14. `14_get-products-by-category.html` GET /products/category/:slug — reuse the DTO
    and envelope; empty result (200) for unknown slug.
15. `15_checking-the-contract.html` ตรวจสัญญากับ dummyjson อัตโนมัติ — prompt for
    `scripts/contract-check.ts`: fetch a fixed list of requests from both hosts,
    normalise (category `url` host), deep-compare, print diffs; document the
    accepted deviations.

**4. Orders (16–19)**
16. `16_modeling-orders.html` ออกแบบ Model ของคำสั่งซื้อ — prompt for `Order`,
    `OrderItem` + migration `add-orders`.
17. `17_validating-the-cart-payload.html` Validate Payload ของ POST /carts/add —
    prompt for `AddCartDto`, `CartProductDto`, `AddressDto` with `@ValidateNested`,
    `@ArrayMinSize(1)`, `@IsEmail`; the React zod schema is quoted as the truth.
18. `18_creating-orders-in-a-transaction.html` สร้างคำสั่งซื้อใน Transaction —
    prompt for `OrdersService.create`: load products, 404 on unknown id, compute
    totals with dummyjson rounding, nested create, return the cart shape.
19. `19_post-carts-add.html` POST /carts/add — prompt for `CartsController`
    (`@Controller('carts')`, `@Post('add')`, 201), `OrdersModule` wiring; verify
    with the exact payload the React app sends.

**5. เชื่อมกับ React app (20–24)**
20. `20_enabling-cors-and-port-config.html` เปิด CORS และตั้งค่า PORT — prompt to edit
    `main.ts` (`app.enableCors({ origin: CORS_ORIGIN })`, `PORT` from config).
21. `21_adding-swagger.html` เพิ่มเอกสาร API ด้วย Swagger — prompt for
    `@nestjs/swagger` setup at `/api`, CLI plugin in `nest-cli.json`.
22. `22_documenting-dtos-and-responses.html` ตกแต่ง DTO และ Response ให้เอกสารครบ —
    prompt for `@ApiProperty`/`@ApiResponse`/`@ApiTags` on both modules.
23. ✍️ `23_switching-the-react-app.html` สลับ React app มาใช้ API ของเรา — change
    `.env.local`, run both apps, walk Home → Category (pagination) → Product →
    Add to cart → Checkout → Order Success, check the `orders` table, run
    `npm test` in the React app (still green: tests pin their own base URL).
24. `24_wrap-up.html` สรุปและก้าวต่อไป — what was built, what the student can now
    explain, next steps (auth, deploy, tests).

## Source of truth and verification

- The reference project is built for real in the session scratchpad
  (`verify/ecommerce-api`) lesson by lesson, against `postgres:17` in a throwaway
  container. Every reference code block in the course is copied from that
  project. `scripts/contract-check.ts` is run against live dummyjson.
- Final check: the React app in `workshop/temp/react-ecommerce-app` runs against
  the scratchpad API with `VITE_API_BASE_URL=http://localhost:3000` and every page
  works; its `npm test` stays green. The React app itself is not modified.
- Before commit: file inventory (24 + index + css), nav chain prev/next correct,
  every `@`-mention in a prompt refers to a file that exists at that lesson, every
  lesson number in cross-references is right, HTML validates (no unescaped `<`
  inside `<code>`).

## Non-goals

- No auth, no users endpoint, no e2e/unit test lessons, no deployment.
- No changes to the React app other than `.env.local`.
- No "when Cursor gets it wrong" lesson (failure modes are mentioned inline in
  each lesson's "AI มักพลาดตรงนี้" note only).
- No quiz JSON in `extra/`.
- Week_09 content is untouched.

## Production notes

- Build the content on its own branch in a git worktree; the main checkout has
  unrelated uncommitted Week_09 changes.
- Write order: reference project first (so code is real), then `lesson.css`,
  `index.html`, then lessons 01–24 in order.
- Version pins used in lessons: `@nestjs/cli@12`, `prisma@7.10.0`,
  `@prisma/client@7.10.0`, `postgres:17`, `class-validator`, `class-transformer`,
  `@nestjs/config`, `@nestjs/swagger` (latest at build time, recorded in lesson 06/21).
