# NestJS E-commerce API + Cursor AI Course Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce the 24-lesson Thai course `Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/` that teaches students to build, with Cursor Agent, a NestJS + Prisma + PostgreSQL API that drop-in replaces dummyjson.com for the React e-commerce app.

**Architecture:** Phase 1 (Tasks 1–11) builds the real reference project `ecommerce-api` in the session scratchpad, lesson by lesson, tagging a git commit per lesson so every code block and every "expected output" in the course is copied from a verified state. Phase 2 (Tasks 12–18) writes `lesson.css`, `index.html` and the 24 lesson pages in the Week_09 format, embedding the five-part Cursor prompts and review checklists, then runs a verification pass and commits.

**Tech Stack:** NestJS 12 (ESM, TS 6 strict, Vitest scaffold), Prisma 7.10.0 + `@prisma/adapter-pg`, PostgreSQL 17 (Docker), `@nestjs/config`, `class-validator` + `class-transformer`, `@nestjs/swagger`, `tsx` (seed runner). Course pages: static HTML + the Week_09 `lesson.css`.

**Spec:** `docs/superpowers/specs/2026-09-12-nestjs-ecommerce-api-cursor-course-design.md` — read it first; the plan argues from it.

## Global Constraints

- Course output folder: `Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/` (exists, empty). Files: `index.html`, `lesson.css`, `01_…html` … `24_…html`. Nothing else.
- Format = Week_09 format exactly (`Week_09/01_nestjs_basic/content/06_creating-a-basic-controller.html` and `24_using-prisma-client-to-access-database.html` are the reference shapes). Thai narration, English technical terms, `<html lang="th">`, no language classes on `<code>`, HTML entities escaped inside `<pre><code>` and inside `.cursor-prompt`.
- Course title: `สร้าง E-commerce API ด้วย NestJS + Cursor AI`. Eyebrow: `NestJS E-commerce API Workshop · บทที่ N จาก 24`. Footer: `NestJS E-commerce API Workshop ภาษาไทย · ตรวจทานแหล่งอ้างอิงเมื่อ 12 กันยายน 2026`.
- Only two CSS additions to the copied `lesson.css`: `.cursor-prompt` (label `Prompt ที่ส่งให้ Cursor`) and `.review` (label `ตรวจโค้ดที่ AI สร้าง`).
- Every Cursor prompt uses the five-part template verbatim: goal line, `บริบท:`, `โครงสร้าง:`, `ข้อกำหนดทางเทคนิค:`, `ขอบเขต:`. Every `@`-mention must name a file/folder that exists at that lesson. The prompts in this plan are the prompts; copy them exactly.
- Governing rule sentence (lesson 01, and every prompt lesson's workshop intro links back to it): `AI พิมพ์แทนคุณได้ แต่คุณต้องอธิบายทุกบรรทัดได้ — ถ้าอธิบายไม่ได้ แปลว่ายังไม่ผ่านบทนี้`
- Versions pinned in lesson text: `@nestjs/cli@12` (`nest --version` → 12.x), `prisma@7.10.0`, `@prisma/client@7.10.0`, `@prisma/adapter-pg@7.10.0`, `postgres:17`. Other packages unpinned (`npm i` latest) and the version observed at build time is recorded in the lesson's expected result.
- Nest 12 rules (from memory `prisma-7-nestjs-validated-facts`): every relative import ends in `.js`; `import type` for interface-only types used in decorated signatures; every decorated parameter typed; `prisma7.config.ts` is the CLI config file; `prisma migrate dev` does NOT run `generate` (run `npx prisma generate` after every migration); never run `prisma migrate reset` or `db push --accept-data-loss` from an agent (Prisma refuses without user consent).
- The React app `/Users/varis/Sites/varis-lab/workshop/temp/react-ecommerce-app` is never modified. Verification runs it with a shell env override, not by editing `.env.local`.
- Work on a branch in a git worktree (`superpowers:using-git-worktrees`); the main checkout has unrelated uncommitted Week_09 changes. Commit after every task with the attribution trailer from the session.
- Scratchpad: `$SCRATCH` below means the session scratchpad directory named in the system prompt. The reference project lives at `$SCRATCH/verify/ecommerce-api`.

---

## File Structure

**Phase 1 — reference project** (`$SCRATCH/verify/ecommerce-api`, its own git repo, one tag per lesson `lesson-02` … `lesson-22`):

```
ecommerce-api/
├── .cursor/rules/project.mdc        lesson 04  project rules for Cursor
├── docs/contract/                   lesson 03  captured dummyjson payloads (7 files)
├── docker-compose.yml               lesson 05  postgres:17
├── .env / .env.example              lesson 05  DATABASE_URL, PORT, APP_URL, CORS_ORIGIN
├── prisma/schema.prisma             lesson 07 (+16)
├── prisma/seed.ts                   lesson 09 (+16)
├── prisma7.config.ts                lesson 06 (prisma init)
├── scripts/contract-check.ts        lesson 15
├── nest-cli.json                    lesson 21 (swagger plugin)
└── src/
    ├── main.ts                      13 (ValidationPipe) 20 (CORS) 21 (Swagger)
    ├── app.module.ts                06, 10, 19
    ├── prisma/prisma.module.ts, prisma.service.ts      06
    ├── products/
    │   ├── products.module.ts, products.controller.ts, products.service.ts   10, 12, 13, 14, 22
    │   ├── product.mapper.ts                          11
    │   └── dto/product-response.dto.ts (11, 22), pagination-query.dto.ts (13)
    └── orders/
        ├── orders.module.ts, carts.controller.ts      19, 22
        ├── orders.service.ts, cart.mapper.ts          18
        └── dto/add-cart.dto.ts (17, 22), cart-response.dto.ts (18)
```

**Phase 2 — course content** (`Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/`): `lesson.css`, `index.html`, 24 lesson files named exactly:

| N | File | Thai title (`<h1>` and `<title>`) |
| --- | --- | --- |
| 01 | `01_what-well-be-building.html` | สิ่งที่เราจะสร้างและกติกาของคอร์ส |
| 02 | `02_scaffolding-the-project.html` | Scaffold โปรเจกต์ด้วย Nest CLI |
| 03 | `03_capturing-the-dummyjson-contract.html` | จับสัญญาของ dummyjson ด้วย curl |
| 04 | `04_cursor-rules-and-the-prompt-template.html` | Cursor Rules และแม่แบบ Prompt |
| 05 | `05_running-postgresql.html` | รัน PostgreSQL ด้วย Docker Compose |
| 06 | `06_setting-up-prisma.html` | ติดตั้ง Prisma และ PrismaModule |
| 07 | `07_modeling-products-in-prisma.html` | ออกแบบ Prisma Model ของสินค้า |
| 08 | `08_running-the-first-migration.html` | รัน Migration แรกและดูตารางจริง |
| 09 | `09_seeding-real-products.html` | Seed สินค้าจริงจาก dummyjson |
| 10 | `10_get-products-categories.html` | GET /products/categories |
| 11 | `11_mapping-rows-to-the-contract.html` | แปลงแถวจากฐานข้อมูลเป็นรูปทรงของ dummyjson |
| 12 | `12_get-product-by-id.html` | GET /products/:id |
| 13 | `13_get-products-with-pagination.html` | GET /products พร้อม skip และ limit |
| 14 | `14_get-products-by-category.html` | GET /products/category/:slug |
| 15 | `15_checking-the-contract.html` | ตรวจสัญญากับ dummyjson อัตโนมัติ |
| 16 | `16_modeling-orders.html` | ออกแบบ Model ของคำสั่งซื้อ |
| 17 | `17_validating-the-cart-payload.html` | Validate Payload ของ POST /carts/add |
| 18 | `18_creating-orders-in-a-transaction.html` | สร้างคำสั่งซื้อใน Transaction |
| 19 | `19_post-carts-add.html` | POST /carts/add |
| 20 | `20_enabling-cors-and-port-config.html` | เปิด CORS และตั้งค่า PORT |
| 21 | `21_adding-swagger.html` | เพิ่มเอกสาร API ด้วย Swagger |
| 22 | `22_documenting-dtos-and-responses.html` | ตกแต่ง DTO และ Response ให้เอกสารครบ |
| 23 | `23_switching-the-react-app.html` | สลับ React app มาใช้ API ของเรา |
| 24 | `24_wrap-up.html` | สรุปและก้าวต่อไป |

Chapters for `index.html`: 1–4 ก่อนเริ่ม · 5–9 ฐานข้อมูล · 10–15 Products Endpoints · 16–19 Orders · 20–24 เชื่อมกับ React app.

---

# Phase 1 — Reference project

### Task 1: Worktree, scaffold, contract capture, Cursor rules (lessons 02–04)

**Files:**
- Create: `$SCRATCH/verify/ecommerce-api/` (via `nest new`)
- Create: `$SCRATCH/verify/ecommerce-api/docs/contract/{categories.json,products-page.json,product-1.json,product-not-found.txt,products-by-category.json,products-by-category-unknown.json,cart-add.txt}`
- Create: `$SCRATCH/verify/ecommerce-api/.cursor/rules/project.mdc`

**Interfaces:**
- Produces: the project every later task builds on; the seven contract files that every later prompt `@`-mentions; git tags `lesson-02`, `lesson-03`, `lesson-04`.

- [ ] **Step 1: Create the content branch in a worktree**

Use `superpowers:using-git-worktrees` to create a worktree on branch `week10-nestjs-ecommerce-api-course` from `main`. All Phase 2 files are written inside that worktree. Note its path as `$WT`.

- [ ] **Step 2: Scaffold the Nest 12 project**

```bash
mkdir -p "$SCRATCH/verify" && cd "$SCRATCH/verify"
npx @nestjs/cli@12 --version          # expect 12.x
npx @nestjs/cli@12 new ecommerce-api -p npm
cd ecommerce-api
node --version                         # record; lesson 02 says "Node 24 LTS or newer"
cat package.json | grep '"type"'       # expect "type": "module"
```

Expected: `package.json` has `"type": "module"`, `vitest.config.ts` exists, `src/main.ts` ends with `await bootstrap();`. If `nest new` did not `git init`, run `git init && git add -A && git commit -m "chore: scaffold ecommerce-api"`; otherwise commit anyway.

- [ ] **Step 3: Boot it once**

```bash
npm run start:dev &   # in background, or a second terminal
sleep 8; curl -s -i http://localhost:3000 | head -1; curl -s http://localhost:3000
```

Expected: `HTTP/1.1 200 OK` and `Hello World!`. Stop the dev server. Tag: `git tag lesson-02`.

- [ ] **Step 4: Capture the dummyjson contract (lesson 03 commands, verbatim)**

```bash
mkdir -p docs/contract
curl -s https://dummyjson.com/products/categories -o docs/contract/categories.json
curl -s "https://dummyjson.com/products?limit=2&skip=0" -o docs/contract/products-page.json
curl -s https://dummyjson.com/products/1 -o docs/contract/product-1.json
curl -s -i https://dummyjson.com/products/9999 -o docs/contract/product-not-found.txt
curl -s "https://dummyjson.com/products/category/beauty?limit=2&skip=0" -o docs/contract/products-by-category.json
curl -s "https://dummyjson.com/products/category/nope?limit=2&skip=0" -o docs/contract/products-by-category-unknown.json
curl -s -i -X POST https://dummyjson.com/carts/add \
  -H 'Content-Type: application/json' \
  -d '{"userId":1,"products":[{"id":1,"quantity":2}],"address":{"address":"1 Sukhumvit Rd","email":"a@b.com","phone":"0812345678"}}' \
  -o docs/contract/cart-add.txt
node -e "fetch('https://dummyjson.com/products?limit=0').then(r=>r.json()).then(({products})=>console.log(products.length,'products;',products.filter(p=>!('brand' in p)).length,'without brand'))"
```

Expected: `categories.json` is an array of 24 `{slug,name,url}`; `products-page.json` has `"total":194,"skip":0,"limit":2`; `product-1.json` has 22 keys; `product-not-found.txt` first line `HTTP/2 404` and body `{"message":"Product with id '9999' not found"}`; `products-by-category-unknown.json` is `{"products":[],"total":0,"skip":0,"limit":0}` (dummyjson's `limit` echoes the number of products actually returned); `cart-add.txt` first line `HTTP/2 201` and body contains `"discountedPrice":18` and `"totalQuantity":2`; the node one-liner prints `194 products; 92 without brand`. Record the exact outputs — lesson 03 quotes them. Commit `docs: capture dummyjson contract`, tag `lesson-03`.

- [ ] **Step 5: Write the Cursor rules file (lesson 04, hand-typed)**

Create `.cursor/rules/project.mdc`:

```markdown
---
description: กติกาของโปรเจกต์ ecommerce-api
alwaysApply: true
---

# Stack
- NestJS 12 แบบ ES module ("type": "module") + TypeScript strict บน Node.js 24
- PostgreSQL ผ่าน Prisma 7 เท่านั้น และเข้าถึงผ่าน PrismaService ที่ inject มา ห้าม new PrismaClient ในไฟล์อื่น
- Validation ด้วย class-validator + class-transformer ผ่าน DTO class (ห้ามใช้ interface เป็น body)

# โครงสร้างไฟล์
- src/<domain>/ หนึ่งโฟลเดอร์ต่อหนึ่ง business domain (products, orders) มี *.module.ts, *.controller.ts, *.service.ts และ dto/
- src/prisma/ มี PrismaModule (global) และ PrismaService
- src/generated/prisma/ คือโค้ดที่ Prisma generate ห้ามแก้ด้วยมือ
- docs/contract/ คือ payload จริงของ dummyjson — response ของทุก endpoint ต้องมีรูปทรงตรงกับไฟล์เหล่านี้

# กติกาการเขียนโค้ด
- import ไฟล์ในโปรเจกต์ต้องลงท้ายด้วย .js เสมอ (เช่น './products.service.js') แม้ไฟล์จริงจะเป็น .ts
- ใช้ import type สำหรับ interface/type ที่ปรากฏใน signature ของ method หรือ constructor ที่มี decorator
- ห้ามใช้ any ห้ามใช้ as เพื่อกลบ type error ห้าม non-null assertion (!) และทุกพารามิเตอร์ที่มี decorator ต้องระบุ type
- error ที่ต้องตอบ client ให้ throw HttpException ของ Nest (NotFoundException, BadRequestException) ห้าม throw Error ธรรมดา
- ตั้งชื่อไฟล์ kebab-case.<role>.ts เช่น products.controller.ts, add-cart.dto.ts
- response ต้องเป็น JSON ธรรมดา (number, string, array, object) ห้ามส่ง Date object หรือ Decimal ออกไปโดยไม่แปลง

# ขอบเขต
- ห้ามติดตั้ง dependency ใหม่ถ้าไม่ได้สั่ง
- ห้ามแก้ไฟล์ที่ไม่ได้ระบุในคำสั่ง
- ห้ามสร้าง index.ts หรือ barrel file
- ห้ามเขียน comment อธิบายสิ่งที่โค้ดบอกอยู่แล้ว
- ห้ามรันคำสั่ง prisma migrate, db push, generate หรือ docker เอง ให้บอกผู้ใช้รัน
```

Commit `chore: add cursor rules`, tag `lesson-04`.

---

### Task 2: PostgreSQL, Prisma, PrismaModule, ConfigModule (lessons 05–06)

**Files:**
- Create: `docker-compose.yml`, `.env`, `.env.example`; Modify: `.gitignore`
- Create: `src/prisma/prisma.service.ts`, `src/prisma/prisma.module.ts`; Modify: `src/app.module.ts`
- Created by `prisma init`: `prisma/schema.prisma`, `prisma7.config.ts`

**Interfaces:**
- Produces: `PrismaService` (extends `PrismaClient`, global) injectable everywhere; `ConfigService` global; env keys `DATABASE_URL`, `PORT`, `APP_URL`, `CORS_ORIGIN`.

- [ ] **Step 1: Lesson 05 files (what the Cursor prompt must produce)**

`docker-compose.yml`:

```yaml
services:
  db:
    image: postgres:17
    restart: always
    ports:
      - "5432:5432"
    environment:
      POSTGRES_PASSWORD: pass123
      POSTGRES_DB: ecommerce
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

`.env` and `.env.example` (identical content):

```
DATABASE_URL=postgresql://postgres:pass123@localhost:5432/ecommerce
PORT=3000
APP_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:5173
```

Append `.env` to `.gitignore`.

- [ ] **Step 2: Start Postgres**

```bash
lsof -i :5432 || true     # if something else owns 5432, use "5499:5432" in compose AND port 5499 in .env for the scratchpad build only; lesson text keeps 5432
docker compose up -d
docker compose exec db psql -U postgres -d ecommerce -c '\l' | grep ecommerce
```

Expected: the `ecommerce` database row is listed. Commit `feat: postgres via docker compose`, tag `lesson-05`.

- [ ] **Step 3: Lesson 06 hand steps**

```bash
npm install @prisma/client@7.10.0 @prisma/adapter-pg@7.10.0 dotenv @nestjs/config
npm install -D prisma@7.10.0 tsx
npx prisma init --no-skills
cat .env; cat .gitignore; cat prisma7.config.ts; cat prisma/schema.prisma
```

Expected: `prisma7.config.ts` created with `import "dotenv/config"` and `url: process.env["DATABASE_URL"]`; `schema.prisma` has `generator client { provider = "prisma-client"  output = "../src/generated/prisma" }` and `datasource db { provider = "postgresql" }`. If `prisma init` appended a second `DATABASE_URL=` example line to `.env`, delete it so `.env` stays the four lines above. Record the exact `@nestjs/config` version installed (`npm ls @nestjs/config`).

- [ ] **Step 4: Lesson 06 files (what the prompt must produce)**

`src/prisma/prisma.service.ts`:

```ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

`src/prisma/prisma.module.ts`:

```ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

`src/app.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

- [ ] **Step 5: Generate the (empty-schema) client and boot**

```bash
npx prisma generate
ls src/generated/prisma | head
npm run build
(npm run start:dev &) ; sleep 8; curl -s http://localhost:3000
docker compose stop db; sleep 2   # observe the dev server: restart it and it must fail to start while db is down
docker compose start db
```

Expected: `generate` succeeds with zero models; build succeeds; app boots and answers `Hello World!`; with the db stopped, a fresh start logs a connection error (proves `$connect()` runs). Commit `feat: prisma service and config module`, tag `lesson-06`.

---

### Task 3: Product schema and first migration (lessons 07–08)

**Files:**
- Modify: `prisma/schema.prisma`
- Created by CLI: `prisma/migrations/<ts>_init/migration.sql`

**Interfaces:**
- Produces: Prisma models `Category`, `Product`, `Review` and the generated client types of the same names (used by Task 5–7 mappers).

- [ ] **Step 1: Append the three models to `prisma/schema.prisma`**

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

Commit `feat: product schema`, tag `lesson-07`.

- [ ] **Step 2: Migrate, generate, inspect (lesson 08 commands, verbatim)**

```bash
npx prisma migrate dev --name init
npx prisma generate
docker compose exec db psql -U postgres -d ecommerce -c '\dt'
docker compose exec db psql -U postgres -d ecommerce -c '\d "Product"'
grep -n "export type\|models" src/generated/prisma/client.ts | head
```

Expected: `prisma/migrations/<timestamp>_init/migration.sql` with three `CREATE TABLE` and two `CREATE INDEX`; `\dt` lists `Category`, `Product`, `Review`, `_prisma_migrations`; `\d "Product"` shows `brand text` nullable and `tags text[]`. The last grep tells you where model types come from: if `client.ts` re-exports `./models.js` types, import `Category`/`Product`/`Review` from `'../generated/prisma/client.js'` in Tasks 5–7; otherwise from `'../generated/prisma/models.js'` and adjust the lesson 11/18 prompts' "import type" line accordingly. Commit `chore: init migration`, tag `lesson-08`.

---

### Task 4: Seed real products (lesson 09)

**Files:**
- Create: `prisma/seed.ts`; Modify: `package.json` (script `db:seed`)

**Interfaces:**
- Consumes: models from Task 3.
- Produces: 24 categories (ids in dummyjson order), 194 products with their dummyjson ids, 582 reviews in dummyjson order. `npm run db:seed` is idempotent.

- [ ] **Step 1: Write `prisma/seed.ts`**

```ts
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

interface DummyCategory {
  slug: string;
  name: string;
  url: string;
}

interface DummyReview {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

interface DummyProduct {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  tags: string[];
  brand?: string;
  sku: string;
  weight: number;
  dimensions: { width: number; height: number; depth: number };
  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: string;
  reviews: DummyReview[];
  returnPolicy: string;
  minimumOrderQuantity: number;
  meta: { createdAt: string; updatedAt: string; barcode: string; qrCode: string };
  images: string[];
  thumbnail: string;
}

const SOURCE = 'https://dummyjson.com';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${SOURCE}${path}`);
  if (!response.ok) {
    throw new Error(`${path} responded ${response.status}`);
  }
  return response.json() as Promise<T>;
}

async function main() {
  const categories = await fetchJson<DummyCategory[]>('/products/categories');
  const { products } = await fetchJson<{ products: DummyProduct[] }>('/products?limit=0');

  await prisma.$transaction(async (tx) => {
    await tx.review.deleteMany();
    await tx.product.deleteMany();
    await tx.category.deleteMany();

    await tx.category.createMany({
      data: categories.map(({ slug, name }) => ({ slug, name })),
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
        brand: product.brand ?? null,
        sku: product.sku,
        weight: product.weight,
        width: product.dimensions.width,
        height: product.dimensions.height,
        depth: product.dimensions.depth,
        warrantyInformation: product.warrantyInformation,
        shippingInformation: product.shippingInformation,
        availabilityStatus: product.availabilityStatus,
        returnPolicy: product.returnPolicy,
        minimumOrderQuantity: product.minimumOrderQuantity,
        barcode: product.meta.barcode,
        qrCode: product.meta.qrCode,
        images: product.images,
        thumbnail: product.thumbnail,
        createdAt: new Date(product.meta.createdAt),
        updatedAt: new Date(product.meta.updatedAt),
        categoryId: categoryId(product.category),
      })),
    });

    await tx.review.createMany({
      data: products.flatMap((product) =>
        product.reviews.map((review) => ({
          productId: product.id,
          rating: review.rating,
          comment: review.comment,
          date: new Date(review.date),
          reviewerName: review.reviewerName,
          reviewerEmail: review.reviewerEmail,
        })),
      ),
    });
  });

  const reviewCount = products.reduce((count, product) => count + product.reviews.length, 0);
  console.log(`Seeded ${categories.length} categories, ${products.length} products, ${reviewCount} reviews`);
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
```

Add to `package.json` scripts: `"db:seed": "tsx prisma/seed.ts"`.

- [ ] **Step 2: Run it twice and count**

```bash
npm run db:seed
npm run db:seed
docker compose exec db psql -U postgres -d ecommerce -c 'SELECT (SELECT count(*) FROM "Category") AS categories, (SELECT count(*) FROM "Product") AS products, (SELECT count(*) FROM "Review") AS reviews;'
docker compose exec db psql -U postgres -d ecommerce -c 'SELECT id, slug FROM "Category" ORDER BY id LIMIT 3;'
docker compose exec db psql -U postgres -d ecommerce -c 'SELECT count(*) FROM "Product" WHERE brand IS NULL;'
npm run lint
```

Expected: both runs print `Seeded 24 categories, 194 products, 582 reviews`; counts `24 | 194 | 582`; first categories by id are `beauty`, `fragrances`, `furniture` (the absolute ids advance on every re-seed because `deleteMany` does not reset the Postgres sequence — compare slugs, not id numbers); `92` products without brand; lint clean (if oxlint complains about `prisma/seed.ts`, fix the code, not the config). If `tsx` cannot resolve `../src/generated/prisma/client.js`, replace the `db:seed` script with `"db:seed": "tsx --tsconfig tsconfig.json prisma/seed.ts"` and record which one worked for the lesson. Commit `feat: seed from dummyjson`, tag `lesson-09`.

---

### Task 5: ProductsModule and GET /products/categories (lesson 10)

**Files:**
- Create: `src/products/products.module.ts`, `src/products/products.controller.ts`, `src/products/products.service.ts`; Modify: `src/app.module.ts`

**Interfaces:**
- Produces: `ProductsService.findCategories(): Promise<{ slug: string; name: string; url: string }[]>`; route `GET /products/categories`.

- [ ] **Step 1: Write the three files and register the module**

`src/products/products.service.ts`:

```ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async findCategories() {
    const appUrl = this.config.getOrThrow<string>('APP_URL');
    const categories = await this.prisma.category.findMany({ orderBy: { id: 'asc' } });
    return categories.map(({ slug, name }) => ({
      slug,
      name,
      url: `${appUrl}/products/category/${slug}`,
    }));
  }
}
```

`src/products/products.controller.ts`:

```ts
import { Controller, Get } from '@nestjs/common';
import { ProductsService } from './products.service.js';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('categories')
  findCategories() {
    return this.productsService.findCategories();
  }
}
```

`src/products/products.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
```

In `src/app.module.ts` add `import { ProductsModule } from './products/products.module.js';` and `ProductsModule` after `PrismaModule` in `imports`.

- [ ] **Step 2: Verify against the contract**

```bash
npm run build && npm run lint
(npm run start:dev &) ; sleep 8
curl -s http://localhost:3000/products/categories | head -c 300; echo
diff <(curl -s http://localhost:3000/products/categories | sed 's#http://localhost:3000#https://dummyjson.com#g') docs/contract/categories.json && echo IDENTICAL
```

Expected: dev log has `Mapped {/products/categories, GET} route`; the `diff` prints `IDENTICAL` (byte-identical after host substitution). Commit `feat: GET /products/categories`, tag `lesson-10`.

---

### Task 6: Response DTOs, mapper, GET /products/:id (lessons 11–12)

**Files:**
- Create: `src/products/dto/product-response.dto.ts`, `src/products/product.mapper.ts`
- Modify: `src/products/products.service.ts`, `src/products/products.controller.ts`

**Interfaces:**
- Produces: classes `ProductDimensionsDto`, `ProductReviewDto`, `ProductMetaDto`, `ProductResponseDto`, `CategoryResponseDto`, `ProductListResponseDto`; `type ProductWithRelations`; `toProductResponse(product: ProductWithRelations): ProductResponseDto`; `ProductsService.findOne(id: number): Promise<ProductResponseDto>`; route `GET /products/:id`.

- [ ] **Step 1: `src/products/dto/product-response.dto.ts` (lesson 11)**

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
  discountPercentage: number;
  rating: number;
  stock: number;
  tags: string[];
  brand?: string;
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

- [ ] **Step 2: `src/products/product.mapper.ts` (lesson 11)**

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
    discountPercentage: product.discountPercentage,
    rating: product.rating,
    stock: product.stock,
    tags: product.tags,
    ...(product.brand !== null ? { brand: product.brand } : {}),
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

(If Task 3 Step 2 showed model types live in `models.js`, change the first import path.) `npm run build` must pass. Commit `feat: product response dto and mapper`, tag `lesson-11`.

- [ ] **Step 3: `findOne` in service and controller (lesson 12)**

Add to `ProductsService` (imports: `NotFoundException` from `@nestjs/common`, `toProductResponse` from `./product.mapper.js`, `ProductResponseDto` from `./dto/product-response.dto.js`):

```ts
  async findOne(id: number): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true, reviews: { orderBy: { id: 'asc' } } },
    });
    if (!product) {
      throw new NotFoundException(`Product with id '${id}' not found`);
    }
    return toProductResponse(product);
  }
```

Add to `ProductsController` as the LAST handler (imports `Param`, `ParseIntPipe`):

```ts
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }
```

- [ ] **Step 4: Verify**

```bash
npm run build && npm run lint
diff <(curl -s http://localhost:3000/products/1 | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log(JSON.stringify(JSON.parse(d),Object.keys(JSON.parse(d)).sort())))") \
     <(node -e "const d=require('./docs/contract/product-1.json');console.log(JSON.stringify(d,Object.keys(d).sort()))") && echo IDENTICAL
curl -s -i http://localhost:3000/products/9999 | sed -n '1p;$p'
curl -s -i http://localhost:3000/products/abc | sed -n '1p;$p'
curl -s http://localhost:3000/products/2 | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log('brand' in JSON.parse(d)))"
```

Expected: `IDENTICAL` for product 1 (sorted-key comparison; `brand` present); 9999 → `HTTP/1.1 404` with body containing `"message":"Product with id '9999' not found"`; `abc` → `HTTP/1.1 400` (documented deviation); pick a product without brand from `psql -c 'SELECT id FROM "Product" WHERE brand IS NULL LIMIT 1'` and confirm the key is absent (`false`). Commit `feat: GET /products/:id`, tag `lesson-12`.

---

### Task 7: Pagination, ValidationPipe, GET /products, GET /products/category/:slug (lessons 13–14)

**Files:**
- Create: `src/products/dto/pagination-query.dto.ts`
- Modify: `src/products/products.service.ts`, `src/products/products.controller.ts`, `src/main.ts`

**Interfaces:**
- Produces: `PaginationQueryDto { skip = 0; limit = 30 }`; `ProductsService.findAll(query)`, `findByCategory(slug, query)`, both `Promise<ProductListResponseDto>`; routes `GET /products`, `GET /products/category/:slug`; global `ValidationPipe`.

- [ ] **Step 1: Install validators and write the DTO (lesson 13)**

```bash
npm install class-validator class-transformer
npm ls class-validator class-transformer   # record versions
```

`src/products/dto/pagination-query.dto.ts`:

```ts
import { IsInt, Min } from 'class-validator';

export class PaginationQueryDto {
  @IsInt()
  @Min(0)
  skip: number = 0;

  @IsInt()
  @Min(0)
  limit: number = 30;
}
```

`src/main.ts` — add before `app.listen`:

```ts
import { ValidationPipe } from '@nestjs/common';
// …
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
```

- [ ] **Step 2: Service — shared include, `paginate`, `findAll`, `findByCategory`**

Final `src/products/products.service.ts` after lessons 13 and 14:

```ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { PaginationQueryDto } from './dto/pagination-query.dto.js';
import { ProductListResponseDto, ProductResponseDto } from './dto/product-response.dto.js';
import { toProductResponse } from './product.mapper.js';

const productInclude = {
  category: true,
  reviews: { orderBy: { id: 'asc' } },
} satisfies Prisma.ProductInclude;

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async findCategories() {
    const appUrl = this.config.getOrThrow<string>('APP_URL');
    const categories = await this.prisma.category.findMany({ orderBy: { id: 'asc' } });
    return categories.map(({ slug, name }) => ({
      slug,
      name,
      url: `${appUrl}/products/category/${slug}`,
    }));
  }

  findAll(query: PaginationQueryDto) {
    return this.paginate({}, query.skip, query.limit);
  }

  findByCategory(slug: string, query: PaginationQueryDto) {
    return this.paginate({ category: { slug } }, query.skip, query.limit);
  }

  async findOne(id: number): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: productInclude,
    });
    if (!product) {
      throw new NotFoundException(`Product with id '${id}' not found`);
    }
    return toProductResponse(product);
  }

  private async paginate(
    where: Prisma.ProductWhereInput,
    skip: number,
    limit: number,
  ): Promise<ProductListResponseDto> {
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit === 0 ? undefined : limit,
        orderBy: { id: 'asc' },
        include: productInclude,
      }),
      this.prisma.product.count({ where }),
    ]);
    return { products: rows.map(toProductResponse), total, skip, limit: rows.length };
  }
}
```

Lesson 13's prompt asks for `findAll` + `paginate` + refactoring `findOne` to `productInclude`; lesson 14's prompt adds `findByCategory` only. The tag `lesson-13` must not contain `findByCategory`.

- [ ] **Step 3: Controller — handler order matters**

Final `src/products/products.controller.ts` after lesson 14 (lesson 13 tag lacks `findByCategory`):

```ts
import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { PaginationQueryDto } from './dto/pagination-query.dto.js';
import { ProductsService } from './products.service.js';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('categories')
  findCategories() {
    return this.productsService.findCategories();
  }

  @Get('category/:slug')
  findByCategory(@Param('slug') slug: string, @Query() query: PaginationQueryDto) {
    return this.productsService.findByCategory(slug, query);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }
}
```

- [ ] **Step 4: Verify lesson 13 state, tag, then lesson 14 state, tag**

```bash
npm run build && npm run lint
curl -s "http://localhost:3000/products?limit=2&skip=0" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const j=JSON.parse(d);console.log(j.total,j.skip,j.limit,j.products.map(p=>p.id))})"
curl -s "http://localhost:3000/products" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const j=JSON.parse(d);console.log(j.limit,j.products.length)})"
curl -s "http://localhost:3000/products?limit=0" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const j=JSON.parse(d);console.log(j.limit,j.products.length)})"
curl -s -i "http://localhost:3000/products?limit=abc" | sed -n '1p;$p'
curl -s -i "http://localhost:3000/products?limit=-1" | sed -n '1p'
```

Expected: `194 0 2 [ 1, 2 ]`; `30 30`; `194 194`; `limit=abc` → 400 with `"limit must be an integer number"`; `-1` → 400. Commit `feat: GET /products with pagination`, tag `lesson-13`. Then add `findByCategory` (service + controller):

```bash
curl -s "http://localhost:3000/products/category/beauty?limit=2&skip=1" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const j=JSON.parse(d);console.log(j.total,j.skip,j.limit,j.products.map(p=>p.id))})"
curl -s "http://localhost:3000/products/category/nope?limit=2&skip=0"
```

Expected: `5 1 2 [ 2, 3 ]`; `{"products":[],"total":0,"skip":0,"limit":0}` (matches `docs/contract/products-by-category-unknown.json` exactly — dummyjson echoes the number of products actually returned as `limit`). Commit `feat: GET /products/category/:slug`, tag `lesson-14`.

---

### Task 8: Contract check script (lesson 15)

**Files:**
- Create: `scripts/contract-check.ts`; Modify: `package.json` (script `contract:check`)

**Interfaces:**
- Produces: `npm run contract:check` exits 0 when every GET request matches dummyjson after normalisation.

- [ ] **Step 1: Write `scripts/contract-check.ts`** (no imports; plain Node runs it)

```ts
const LOCAL = process.env.LOCAL_URL ?? 'http://localhost:3000';
const REMOTE = 'https://dummyjson.com';

const REQUESTS = [
  '/products/categories',
  '/products?limit=3&skip=0',
  '/products?limit=2&skip=190',
  '/products/1',
  '/products/194',
  '/products/9999',
  '/products/category/beauty?limit=2&skip=1',
  '/products/category/nope?limit=5&skip=0',
];

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

function isObject(value: Json): value is { [key: string]: Json } {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function normalize(value: Json): Json {
  if (Array.isArray(value)) {
    return value.map(normalize);
  }
  if (isObject(value)) {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, normalize(value[key])]),
    );
  }
  if (typeof value === 'string') {
    return value.replace(REMOTE, LOCAL);
  }
  return value;
}

function firstDifference(a: Json, b: Json, path = '$'): string | null {
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return `${path}.length ${a.length} vs ${b.length}`;
    }
    for (let i = 0; i < a.length; i++) {
      const diff = firstDifference(a[i], b[i], `${path}[${i}]`);
      if (diff) return diff;
    }
    return null;
  }
  if (isObject(a) && isObject(b)) {
    for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
      if (!(key in a)) return `${path}.${key} missing on remote`;
      if (!(key in b)) return `${path}.${key} missing on local`;
      const diff = firstDifference(a[key], b[key], `${path}.${key}`);
      if (diff) return diff;
    }
    return null;
  }
  return a === b ? null : `${path}: ${JSON.stringify(a)} vs ${JSON.stringify(b)}`;
}

async function load(base: string, path: string): Promise<{ status: number; body: Json }> {
  const response = await fetch(`${base}${path}`);
  const body = (await response.json()) as Json;
  return { status: response.status, body };
}

function messageOf(body: Json): Json {
  return isObject(body) ? body.message : null;
}

let failures = 0;
for (const path of REQUESTS) {
  const [remote, local] = await Promise.all([load(REMOTE, path), load(LOCAL, path)]);
  let diff: string | null;
  if (remote.status !== local.status) {
    diff = `status ${remote.status} vs ${local.status}`;
  } else if (remote.status >= 400) {
    diff = firstDifference(messageOf(remote.body), messageOf(local.body), '$.message');
  } else {
    diff = firstDifference(normalize(remote.body), normalize(local.body));
  }
  console.log(`${diff ? '❌' : '✅'} ${path}${diff ? `  ${diff}` : ''}`);
  if (diff) failures += 1;
}
process.exit(failures === 0 ? 0 : 1);
```

Add script `"contract:check": "node scripts/contract-check.ts"`.

- [ ] **Step 2: Run it**

```bash
npm run contract:check; echo "exit $?"
npm run lint
```

Expected: eight ✅ lines and `exit 0`. If a data value differs (dummyjson changed a product since the seed), re-run `npm run db:seed` and check again; if a shape differs, fix the API, not the script. Commit `feat: contract check script`, tag `lesson-15`.

---

### Task 9: Orders — schema, seed update, DTOs, service, controller (lessons 16–19)

**Files:**
- Modify: `prisma/schema.prisma`, `prisma/seed.ts`
- Create: `src/orders/dto/add-cart.dto.ts`, `src/orders/dto/cart-response.dto.ts`, `src/orders/cart.mapper.ts`, `src/orders/orders.service.ts`, `src/orders/carts.controller.ts`, `src/orders/orders.module.ts`
- Modify: `src/app.module.ts`

**Interfaces:**
- Consumes: `PrismaService`; models `Product`.
- Produces: models `Order`, `OrderItem`; `AddCartDto { userId; products: CartProductDto[]; address: AddressDto }`; `CartResponseDto`; `OrdersService.create(dto: AddCartDto): Promise<CartResponseDto>`; route `POST /carts/add` → 201.

- [ ] **Step 1: Lesson 16 — schema and seed**

Append to `prisma/schema.prisma` and add `orderItems OrderItem[]` as the last field of `Product`:

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

  @@index([orderId])
  @@index([productId])
}
```

In `prisma/seed.ts`, inside the transaction before `tx.review.deleteMany()`, add:

```ts
    await tx.orderItem.deleteMany();
    await tx.order.deleteMany();
```

```bash
npx prisma migrate dev --name add-orders
npx prisma generate
npm run db:seed
docker compose exec db psql -U postgres -d ecommerce -c '\dt'
```

Expected: new migration folder `<ts>_add_orders`; tables `Order`, `OrderItem` listed; seed still prints the same counts. Commit `feat: order schema`, tag `lesson-16`.

- [ ] **Step 2: Lesson 17 — `src/orders/dto/add-cart.dto.ts`**

```ts
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class CartProductDto {
  @IsInt()
  @Min(1)
  id: number;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class AddressDto {
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;
}

export class AddCartDto {
  @IsInt()
  @Min(1)
  userId: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CartProductDto)
  products: CartProductDto[];

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;
}
```

`npm run build` passes. Commit `feat: add-cart dto`, tag `lesson-17`.

- [ ] **Step 3: Lesson 18 — response DTO, mapper, service**

`src/orders/dto/cart-response.dto.ts`:

```ts
export class CartProductResponseDto {
  id: number;
  title: string;
  price: number;
  quantity: number;
  total: number;
  discountPercentage: number;
  discountedPrice: number;
  thumbnail: string;
}

export class CartResponseDto {
  id: number;
  products: CartProductResponseDto[];
  total: number;
  discountedTotal: number;
  userId: number;
  totalProducts: number;
  totalQuantity: number;
}
```

`src/orders/cart.mapper.ts`:

```ts
import type { Order, OrderItem } from '../generated/prisma/client.js';
import { CartResponseDto } from './dto/cart-response.dto.js';

export type OrderWithItems = Order & { items: OrderItem[] };

export function toCartResponse(order: OrderWithItems): CartResponseDto {
  return {
    id: order.id,
    products: order.items.map((item) => ({
      id: item.productId,
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      total: item.total,
      discountPercentage: item.discountPercentage,
      discountedPrice: item.discountedPrice,
      thumbnail: item.thumbnail,
    })),
    total: order.total,
    discountedTotal: order.discountedTotal,
    userId: order.userId,
    totalProducts: order.totalProducts,
    totalQuantity: order.totalQuantity,
  };
}
```

`src/orders/orders.service.ts`:

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
          throw new NotFoundException(`Product with id '${id}' not found`);
        }
        const total = round2(product.price * quantity);
        return {
          productId: product.id,
          title: product.title,
          thumbnail: product.thumbnail,
          price: product.price,
          discountPercentage: product.discountPercentage,
          quantity,
          total,
          discountedPrice: Math.round(total * (1 - product.discountPercentage / 100)),
        };
      });

      return tx.order.create({
        data: {
          userId: dto.userId,
          address: dto.address.address,
          email: dto.address.email,
          phone: dto.address.phone,
          total: round2(items.reduce((sum, item) => sum + item.total, 0)),
          discountedTotal: items.reduce((sum, item) => sum + item.discountedPrice, 0),
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

`npm run build && npm run lint` pass. Commit `feat: orders service`, tag `lesson-18`.

- [ ] **Step 4: Lesson 19 — controller and module**

`src/orders/carts.controller.ts`:

```ts
import { Body, Controller, Post } from '@nestjs/common';
import { AddCartDto } from './dto/add-cart.dto.js';
import { OrdersService } from './orders.service.js';

@Controller('carts')
export class CartsController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('add')
  create(@Body() dto: AddCartDto) {
    return this.ordersService.create(dto);
  }
}
```

`src/orders/orders.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { CartsController } from './carts.controller.js';
import { OrdersService } from './orders.service.js';

@Module({
  controllers: [CartsController],
  providers: [OrdersService],
})
export class OrdersModule {}
```

Add `OrdersModule` after `ProductsModule` in `AppModule.imports`.

- [ ] **Step 5: Verify with the exact React payload**

```bash
npm run build && npm run lint
curl -s -i -X POST http://localhost:3000/carts/add -H 'Content-Type: application/json' \
  -d '{"userId":1,"products":[{"id":1,"quantity":2}],"address":{"address":"1 Sukhumvit Rd","email":"a@b.com","phone":"0812345678"}}' | sed -n '1p;$p'
curl -s -i -X POST http://localhost:3000/carts/add -H 'Content-Type: application/json' -d '{"products":[{"id":1,"quantity":1}],"address":{"address":"x","email":"a@b.com","phone":"1"}}' | sed -n '1p;$p'
curl -s -i -X POST http://localhost:3000/carts/add -H 'Content-Type: application/json' -d '{"userId":1,"products":[{"id":99999,"quantity":1}],"address":{"address":"x","email":"a@b.com","phone":"1"}}' | sed -n '1p;$p'
curl -s -i -X POST http://localhost:3000/carts/add -H 'Content-Type: application/json' -d '{"userId":1,"products":[{"id":1,"quantity":1}],"address":{"address":"x","email":"not-an-email","phone":"1"}}' | sed -n '1p;$p'
docker compose exec db psql -U postgres -d ecommerce -c 'SELECT id, "userId", total, "discountedTotal", "totalQuantity" FROM "Order";'
docker compose exec db psql -U postgres -d ecommerce -c 'SELECT count(*) FROM "Order";'   # after the 404 case: still 1 row (transaction rolled back)
```

Expected: first → `HTTP/1.1 201 Created`, body has `"total":19.98,"discountedTotal":18,"totalProducts":1,"totalQuantity":2` and `products[0].discountedPrice` = 18 (same numbers as `docs/contract/cart-add.txt`); missing userId → 400; unknown product → 404 `Product with id '99999' not found` and no new Order row; bad email → 400 `email must be an email`. Commit `feat: POST /carts/add`, tag `lesson-19`.

---

### Task 10: CORS, Swagger setup, Swagger decorations (lessons 20–22)

**Files:**
- Modify: `src/main.ts`, `nest-cli.json`, `src/products/products.controller.ts`, `src/orders/carts.controller.ts`, `src/products/dto/product-response.dto.ts`, `src/orders/dto/add-cart.dto.ts`

**Interfaces:**
- Produces: CORS for `CORS_ORIGIN`; Swagger UI at `/api`, JSON at `/api-json` with response schemas for all five endpoints.

- [ ] **Step 1: Lesson 20 — CORS**

In `src/main.ts` after `useGlobalPipes`:

```ts
  app.enableCors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' });
```

```bash
curl -s -i -H 'Origin: http://localhost:5173' http://localhost:3000/products/categories | grep -i access-control-allow-origin
curl -s -i -H 'Origin: http://evil.test' http://localhost:3000/products/categories | grep -i access-control-allow-origin
```

Expected: both print `Access-Control-Allow-Origin: http://localhost:5173` — with a fixed-string `origin`, the cors middleware always emits the configured value and never echoes the request's origin; the browser rejects the mismatch for `http://evil.test`. (Verified: it does NOT omit the header.) Commit `feat: cors`, tag `lesson-20`.

- [ ] **Step 2: Lesson 21 — Swagger setup**

```bash
npm install @nestjs/swagger && npm ls @nestjs/swagger   # record version
```

`nest-cli.json` → inside `compilerOptions` add `"plugins": ["@nestjs/swagger/plugin"]`.

`src/main.ts` final form:

```ts
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.enableCors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' });

  const config = new DocumentBuilder()
    .setTitle('E-commerce API')
    .setDescription('Drop-in replacement for dummyjson.com used by the React e-commerce app')
    .setVersion('1.0')
    .build();
  SwaggerModule.setup('api', app, SwaggerModule.createDocument(app, config));

  await app.listen(process.env.PORT ?? 3000);
}

await bootstrap();
```

```bash
npm run build && npm run start:dev & sleep 8
curl -s http://localhost:3000/api-json | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const j=JSON.parse(d);console.log(Object.keys(j.paths));console.log(Object.keys(j.components?.schemas??{}))})"
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/api
```

Expected: paths `/products/categories`, `/products/category/{slug}`, `/products`, `/products/{id}`, `/carts/add`; schemas include `AddCartDto`, `CartProductDto`, `AddressDto` (plugin picked up the `.dto.ts` body classes; `PaginationQueryDto` is NOT a schema — `@Query()` DTOs are expanded into per-field `parameters` on `/products` and `/products/category/{slug}`); `/api` → 200. Commit `feat: swagger`, tag `lesson-21`.

- [ ] **Step 3: Lesson 22 — decorations**

`products.controller.ts`: add `@ApiTags('products')` on the class; `@ApiOkResponse({ type: [CategoryResponseDto] })` on `findCategories`; `@ApiOkResponse({ type: ProductListResponseDto })` on `findByCategory` and `findAll`; `@ApiOkResponse({ type: ProductResponseDto })` + `@ApiNotFoundResponse({ description: "Product with id '9999' not found" })` on `findOne`. Imports: `ApiNotFoundResponse, ApiOkResponse, ApiTags` from `@nestjs/swagger`; the three DTO classes from `./dto/product-response.dto.js`.

`carts.controller.ts`: `@ApiTags('carts')` on the class; `@ApiCreatedResponse({ type: CartResponseDto })` + `@ApiBadRequestResponse({ description: 'Validation failed' })` on `create`.

`product-response.dto.ts`: `import { ApiPropertyOptional } from '@nestjs/swagger';` and `@ApiPropertyOptional()` on `brand`.

`add-cart.dto.ts`: `import { ApiProperty } from '@nestjs/swagger';` then `@ApiProperty({ example: 1 })` on `userId`, `@ApiProperty({ type: [CartProductDto] })` on `products`, `@ApiProperty({ type: AddressDto })` on `address`.

```bash
npm run build && npm run lint
curl -s http://localhost:3000/api-json | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const j=JSON.parse(d);console.log(JSON.stringify(j.paths['/products/{id}'].get.responses));console.log(Object.keys(j.components.schemas));console.log(j.components.schemas.ProductResponseDto.required.includes('brand'))})"
npm run contract:check
```

Expected: `/products/{id}` has `200` with `$ref: '#/components/schemas/ProductResponseDto'` and `404`; schemas now also list `ProductResponseDto`, `ProductListResponseDto`, `CategoryResponseDto`, `CartResponseDto`; `brand` not required (`false`); contract check still all ✅. Commit `feat: swagger decorations`, tag `lesson-22`.

---

### Task 11: Run the React app against the API (lesson 23 rehearsal)

**Files:** none in the repo. Read-only use of `/Users/varis/Sites/varis-lab/workshop/temp/react-ecommerce-app`.

- [ ] **Step 1: Start both apps**

```bash
# terminal A (API, already running on :3000 with seeded db)
# terminal B
cd /Users/varis/Sites/varis-lab/workshop/temp/react-ecommerce-app
VITE_API_BASE_URL=http://localhost:3000 npm run dev -- --port 5173
```

Do NOT edit `.env.local`; the shell variable overrides it for this run only.

- [ ] **Step 2: Walk the pages in a browser** (claude-in-chrome or playwright tools; screenshots go to `$SCRATCH/verify/screens/`)

1. `http://localhost:5173/` — "Deals of the day" shows 5 products; category menu lists 24 categories; clicking a category updates the grid.
2. Category page `/categories` — pick a category with more than 20 products (Groceries has 27; Beauty has only 5); pagination shows pages; page 2 loads different products (network tab: `GET /products/category/groceries?skip=20&limit=20` hits `localhost:3000`).
3. Product page `/products/1` — title, brand, price, 3 reviews; "Add to cart" opens the modal; cart badge increments.
4. Cart → Checkout — fill address (any address, a valid email, a phone), pick delivery/payment, "Place order" → Order Success page; network tab shows `POST http://localhost:3000/carts/add` → 201.
5. `docker compose exec db psql -U postgres -d ecommerce -c 'SELECT id, email, "totalQuantity" FROM "Order" ORDER BY id DESC LIMIT 1;'` shows the order just placed.

Record which screenshot proves each step; lesson 23 describes exactly these five checks.

- [ ] **Step 3: React tests stay green**

```bash
cd /Users/varis/Sites/varis-lab/workshop/temp/react-ecommerce-app && npm test 2>&1 | tail -5
```

Expected: the same result as before the URL switch (their base URL is pinned in `vite.config.ts` `test.env`, so the API cannot affect them). Verified 2026-09-12: on Node 26.7 the suite fails in `src/test/setup.ts` with `ExperimentalWarning: localStorage is not available because --localstorage-file was not provided` (Node's built-in localStorage shadows jsdom's) — identical before and after the switch, unrelated to the API. Stop the Vite dev server. Leave the API and db running for Phase 2 spot checks; note `git -C "$SCRATCH/verify/ecommerce-api" tag` lists `lesson-02` … `lesson-22`.

---

# Phase 2 — Course content

All files below go in `$WT/Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/`. Reference code for every lesson is read from the scratchpad project at the matching tag (`git -C "$SCRATCH/verify/ecommerce-api" show lesson-NN:path`) — never retype it from memory. Escape `<`, `>`, `&` inside `<pre><code>` and `.cursor-prompt`.

### Lesson page skeleton (used by every task in this phase)

```html
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="…one Thai sentence…" />
  <title>…Thai title…</title>
  <link rel="stylesheet" href="lesson.css" />
</head>
<body>
  <main>
    <p class="eyebrow">NestJS E-commerce API Workshop · บทที่ N จาก 24</p>
    <h1>…Thai title…</h1>
    <section class="learning-objectives" aria-labelledby="objectives-heading">
      <h2 id="objectives-heading">เมื่อจบบทนี้ คุณจะสามารถ</h2>
      <ul><li>…</li><li>…</li><li>…</li></ul>
    </section>

    <h2>…concept section…</h2>
    <p>…</p>

    <h2>เป้าหมายของบทนี้</h2>
    <pre><code>…file tree with (สร้างใหม่)/(แก้ไข) markers…</code></pre>
    <ul><li><strong><code>file</code></strong> — สัญญา: ต้องทำ… / ต้องไม่ทำ…</li></ul>

    <section class="workshop" aria-labelledby="exercise-heading">
      <h2 id="exercise-heading">…imperative Thai heading…</h2>
      <p>commit งานก่อน (<code>git add -A &amp;&amp; git commit -m "…"</code>) เปิดแชทใหม่ใน Cursor โหมด Agent แล้วส่ง prompt นี้</p>
      <div class="cursor-prompt"><code>…prompt verbatim, entities escaped…</code></div>
    </section>
    <section class="review" aria-labelledby="review-heading">
      <h2 id="review-heading">ตรวจโค้ดที่ AI สร้าง</h2>
      <ul><li>…</li></ul>
      <p><strong>AI มักพลาดตรงนี้:</strong> …</p>
      <p>โค้ดอ้างอิงของบทนี้ (เทียบกับของคุณทีละบรรทัด):</p>
      <pre><code>…reference code from the tag…</code></pre>
    </section>
    <section class="expected-result" aria-labelledby="exercise-result-heading">
      <h2 id="exercise-result-heading">ผลลัพธ์ที่คาดหวัง</h2>
      <p>…</p>
    </section>
    <section class="verification" aria-labelledby="exercise-check-heading">
      <h2 id="exercise-check-heading">ตรวจว่าใช้งานได้จริง</h2>
      <ul><li>…curl/psql/log checks…</li></ul>
    </section>
    <h2>แหล่งอ้างอิง</h2>
    <ul class="source-list"><li><a href="…">…</a></li></ul>
    <nav class="lesson-navigation" aria-label="การนำทางบทเรียน">
      <a class="lesson-navigation__link" href="PREV.html" rel="prev">← บทก่อนหน้า</a>
      <a class="lesson-navigation__link" href="index.html">บทเรียนทั้งหมด</a>
      <a class="lesson-navigation__link" href="NEXT.html" rel="next">บทถัดไป →</a>
    </nav>
  </main>
  <footer><p>NestJS E-commerce API Workshop ภาษาไทย · ตรวจทานแหล่งอ้างอิงเมื่อ 12 กันยายน 2026</p></footer>
</body>
</html>
```

Hand-typed lessons (02, 03, 04, 08, 23) drop the `.cursor-prompt` and `.review` sections and use `<div class="prompt-example"><code>…shell…</code></div>` inside `.workshop`, exactly like Week_09. Lesson 01 has no prev link; lesson 24 has no next link (omit the anchor, keep the nav).

Every prompt lesson's workshop paragraph starts with the same sentence: `commit งานก่อน แล้วเปิดแชทใหม่ใน Cursor โหมด Agent` and its review section ends with the governing-rule reminder: `ถ้าอธิบายบรรทัดไหนไม่ได้ ยังไม่ผ่านบทนี้ — กลับไปอ่านส่วนแนวคิดก่อน`.

---

### Task 12: `lesson.css` and `index.html`

**Files:**
- Create: `content/lesson.css` (copy of `Week_09/01_nestjs_basic/content/lesson.css` + additions)
- Create: `content/index.html`

- [ ] **Step 1: Copy and extend the CSS**

```bash
cp Week_09/01_nestjs_basic/content/lesson.css "$WT/Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/lesson.css"
```

Edit the copy:
1. In the shared box selector list (`.learning-objectives,\n.workshop,\n.prompt-example,` …) add `.cursor-prompt,` after `.prompt-example,` and `.review,` after `.verification,`.
2. In the `> :last-child` list add `.cursor-prompt > :last-child,` and `.review > :last-child,`.
3. In the `::before` list (`.workshop::before, .prompt-example::before, …`) add `.cursor-prompt::before,` and `.review::before,`.
4. After the `.prompt-example code { … }` rule insert:

```css
.cursor-prompt {
  overflow-x: auto;
  color: var(--code-text);
  background: var(--code-bg);
  border: 1px solid #3a3542;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  line-height: 1.65;
  white-space: pre-wrap;
}
.cursor-prompt::before { content: "Prompt ที่ส่งให้ Cursor"; color: #7cc7ff; }
.cursor-prompt code { color: inherit; background: transparent; border: 0; }
.review { background: #f5f1ff; border: 1px solid #c9b8ee; }
.review::before { content: "ตรวจโค้ดที่ AI สร้าง"; color: #533986; }
.review ul { list-style: "✅  "; }
```

5. In the `@media (max-width: 640px)` block change `pre, .prompt-example {` to `pre, .prompt-example, .cursor-prompt {` and add `.cursor-prompt, .review,` to the padding list.

Verify: `grep -c "cursor-prompt" lesson.css` ≥ 7 and `grep -c "\.review" lesson.css` ≥ 6.

- [ ] **Step 2: Write `index.html`**

Same structure as `Week_09/01_nestjs_basic/content/index.html`: `<h1>สร้าง E-commerce API ด้วย NestJS + Cursor AI</h1>`, an intro paragraph (24 lessons; we build `ecommerce-api`, a drop-in replacement for dummyjson.com that the React e-commerce app from Week_05_06 will use unchanged except for its base URL; every endpoint is built with Cursor Agent from a structured prompt and then reviewed), `เมื่อเรียนจบ` section (can turn a captured API contract into prompts Cursor executes reliably; can review generated NestJS/Prisma code line by line; has a running API with Products + Orders, validation, CORS and Swagger; has proven it by running the React app against it), `สิ่งที่ควรเตรียม` section (Week_09 NestJS Fundamentals finished; Cursor installed and used in Week_05_06; Node.js 24 LTS+, Docker Desktop, the React e-commerce project on disk), then five `<section class="lesson-index">` blocks with `<ol start="N">` and the 24 links using the exact filenames and Thai titles from the File Structure table, chapter headings:

- `1–4. ก่อนเริ่ม` (this section is `class="workshop"` like Week_09's first chapter and shows the setup commands `npm i -g @nestjs/cli`, `nest new ecommerce-api -p npm`, `cd ecommerce-api`, `npm run start:dev`)
- `5–9. ฐานข้อมูล: PostgreSQL + Prisma + ข้อมูลจริง`
- `10–15. Products Endpoints ทีละตัว`
- `16–19. Orders: POST /carts/add`
- `20–24. เชื่อมกับ React app`

Then the `.updated` box (reviewed 12 กันยายน 2026; versions change; check NestJS/Prisma docs) and the footer. `<meta name="description">`: `สารบัญ Workshop ภาษาไทย สร้าง E-commerce API ด้วย NestJS + Cursor AI: 24 บทเรียน สร้าง API แทน dummyjson.com ทีละ endpoint ด้วย Cursor Agent`.

- [ ] **Step 3: Open both in a browser (or `open`) and commit**

Check the label text renders on a dummy `.cursor-prompt` block, then `git add` the two files and commit `content(week10): lesson.css and index for NestJS e-commerce API course`.

---

### Task 13: Lessons 01–04 (ก่อนเริ่ม)

**Files:** `01_what-well-be-building.html`, `02_scaffolding-the-project.html`, `03_capturing-the-dummyjson-contract.html`, `04_cursor-rules-and-the-prompt-template.html`

- [ ] **Step 1: Lesson 01 — สิ่งที่เราจะสร้างและกติกาของคอร์ส** (no workshop/prompt; ends with a `.verification` checklist of prerequisites)

Sections:
1. `เราจะแทนที่ dummyjson ด้วย API ของเราเอง` — the React app from Week_05_06 calls five dummyjson endpoints; show a `.comparison` table: Method+Path | React ใช้ที่ไหน | ตอบอะไร: `GET /products/categories` (Home, Category menus) → array of `{slug,name,url}`; `GET /products?limit&skip` (Home deals) → `{products,total,skip,limit}`; `GET /products/category/:slug?limit&skip` (Home, Category with pagination) → same envelope; `GET /products/:id` (Product page) → full product with reviews; `POST /carts/add` (Checkout) → cart with id. "Drop-in" = same paths, same shapes, the React app changes only `VITE_API_BASE_URL`.
2. `สถาปัตยกรรมที่จะได้ตอนจบ` — `<pre><code>` tree of the final project (from the plan's File Structure) and one paragraph: Nest 12 + Prisma 7 + PostgreSQL 17 in Docker, the same stack as Week_09 chapters 19–31.
3. `กติกาของคอร์ส: เข้าใจก่อน แล้วค่อยสั่ง` — the governing rule in a `.warning` box; every prompt lesson = แนวคิด → เป้าหมาย → 🤖 prompt → ✅ review → ตรวจว่าใช้งานได้จริง; hand-typed lessons (02, 03, 04, 08, 23) exist because those parts are the truth Cursor cannot invent (the contract), or are run-not-written (migrations), or are the proof (React app).
4. `เวอร์ชันที่คอร์สนี้ใช้` — `.comparison` table: Node 24 LTS+, `@nestjs/cli` 12, Prisma 7.10.0, PostgreSQL 17, plus the observed versions of `@nestjs/config`, `class-validator`, `class-transformer`, `@nestjs/swagger`, `tsx` from Phase 1.
5. `.verification` "พร้อมเริ่มหรือยัง": Week_09 done (can explain module/controller/service/DTO/PrismaService), Cursor installed and signed in, `node --version` ≥ 24, `docker --version`, the React project runs with `npm run dev` and shows products from dummyjson.

Sources: NestJS docs home, Prisma docs home, dummyjson.com/docs/products, dummyjson.com/docs/carts.

- [ ] **Step 2: Lesson 02 — Scaffold โปรเจกต์ด้วย Nest CLI** (✍️)

Sections: why not delegate (`nest new` is one command and gives the ESM/Vitest baseline every prompt assumes); commands (`nest --version` → 12.x, `nest new ecommerce-api -p npm`, `cd ecommerce-api`, `npm run start:dev`, `curl -i http://localhost:3000`); what the scaffold contains (point to Week_09 lesson 02, note `"type": "module"`, `.js` imports, top-level `await bootstrap()`); `นิสัยสำคัญที่สุดของคอร์สนี้: commit ก่อนทุก prompt` — `git status` (nest new already ran `git init`), `git add -A && git commit -m "chore: scaffold ecommerce-api"`; every AI change becomes a reviewable diff, and `git checkout -- .` is the undo button. Expected result: `Hello World!` and the log line `Nest application successfully started`. Verification: `git log --oneline` shows one commit; `cat package.json | grep '"type"'` shows `module`.

- [ ] **Step 3: Lesson 03 — จับสัญญาของ dummyjson ด้วย curl** (✍️)

Sections:
1. `ทำไมต้องจับด้วยมือ` — the contract is the one thing Cursor cannot know; a hallucinated field breaks the React app silently. Every later prompt `@`-mentions these files.
2. `เจ็ดไฟล์ใน docs/contract/` — the exact eight commands from Task 1 Step 4 in a `.prompt-example`, one file per request, and a `.comparison` table: file | request | สิ่งที่ต้องสังเกต.
3. `อ่านสัญญา: ข้อเท็จจริงที่ต้องจำ` — bullet list of facts with the evidence file: default `limit` 30 and `skip` 0; `limit=0` returns all 194; the `limit` in every list response is the number of products actually returned (not the requested value — `?limit=10&skip=190` answers `limit: 4`, an unknown category answers `limit: 0`); 22 keys on a product (list them); nested `dimensions`, `meta`, `reviews[]` (3 per product); `brand` absent on 92 of 194 (the node one-liner); dates are ISO strings; unknown category → 200 with empty `products` and `total: 0`; unknown id → 404 `{"message":"Product with id '9999' not found"}`; `POST /carts/add` → 201 with the cart shape and `discountedPrice: 18` for 2 × 9.99 at 10.48% (show the arithmetic: 19.98 × 0.8952 = 17.886 → `Math.round` → 18).
4. Commit: `git add docs && git commit -m "docs: capture dummyjson contract"`.
Verification: seven files exist; `product-not-found.txt` starts with `HTTP/2 404`; `cart-add.txt` starts with `HTTP/2 201`; `categories.json` has 24 entries.

- [ ] **Step 4: Lesson 04 — Cursor Rules และแม่แบบ Prompt** (✍️)

Sections:
1. `Rules คือความจำถาวรของ Cursor` — recap of `.cursor/rules` from Week_05_06 lesson 07 in two sentences; the full `project.mdc` from Task 1 Step 5 in a `<pre><code>`; a paragraph per group explaining why each rule exists for *this* project (ESM `.js` imports; `import type` under `isolatedModules` + decorators; PrismaService only; contract folder as the source of truth; "don't run migrate/docker yourself").
2. `แม่แบบ Prompt ห้าส่วน` — the template from the spec in a `.cursor-prompt` block (yes, the template itself), then one paragraph per part: goal line (one sentence, imperative); บริบท (files via `@`, facts Cursor cannot know — quote the contract); โครงสร้าง (exact files, "ไม่มากไม่น้อยกว่านี้"); ข้อกำหนดทางเทคนิค (names, signatures, decorators, shapes, error text); ขอบเขต (what not to touch, and "ยังไม่ต้อง…" for the next lesson's work).
3. `วงจรตรวจงาน` — ordered list: read the diff in Cursor's review panel → `npm run build` → `npm run lint` → watch the `Mapped {…} route` log → `curl` the endpoint → compare with `docs/contract` → ask yourself "อธิบายได้ไหม" → commit or `git checkout -- .` and re-prompt with the missing fact added to บริบท. A `.note`: refine (follow-up prompt) when one requirement was missed; revert when the structure is wrong.
4. Workshop: create the rules file (hand-typed), commit `chore: add cursor rules`. Verification: Cursor shows the rule as "Always" in Settings → Rules; a throwaway Ask "โปรเจกต์นี้ import ไฟล์อย่างไร" answers with `.js` extension.

Sources: Cursor docs (rules), NestJS CLI docs.

- [ ] **Step 5: Nav chain and commit**

Prev/next links 01→02→03→04→05. Commit `content(week10): lessons 01-04`.

---

### Task 14: Lessons 05–09 (ฐานข้อมูล)

**Files:** `05_running-postgresql.html`, `06_setting-up-prisma.html`, `07_modeling-products-in-prisma.html`, `08_running-the-first-migration.html`, `09_seeding-real-products.html`

- [ ] **Step 1: Lesson 05 — รัน PostgreSQL ด้วย Docker Compose**

Concept: recap Week_09 lesson 20 (compose file, `docker compose up -d`); why a named volume (data survives `down`); why `POSTGRES_DB=ecommerce` (a dedicated database, unlike Week_09's default `postgres`); the four env keys and who uses each (`DATABASE_URL` → Prisma, `PORT` → main.ts, `APP_URL` → category url in lesson 10, `CORS_ORIGIN` → lesson 20). เป้าหมาย: `docker-compose.yml`, `.env`, `.env.example` (สร้างใหม่), `.gitignore` (แก้ไข).

Prompt:

```
สร้าง Docker Compose สำหรับ PostgreSQL และไฟล์ .env ของโปรเจกต์

บริบท: @package.json @.gitignore @.cursor/rules/project.mdc
โปรเจกต์นี้เป็น NestJS 12 ที่เพิ่ง scaffold ยังไม่มีฐานข้อมูล ยังไม่ได้ติดตั้ง Prisma
เครื่องมี Docker Desktop รันอยู่แล้ว
บทเรียนถัดไปจะติดตั้ง Prisma ซึ่งต้องการตัวแปร DATABASE_URL

โครงสร้าง: สร้าง/แก้ไฟล์ตามนี้ ไม่มากไม่น้อยกว่านี้
- docker-compose.yml (สร้างใหม่)
- .env (สร้างใหม่)
- .env.example (สร้างใหม่)
- .gitignore (แก้ไข: เพิ่ม .env ต่อท้าย)

ข้อกำหนดทางเทคนิค:
- docker-compose.yml ไม่มี key version (Compose รุ่นใหม่ไม่ใช้แล้ว) มี service เดียวชื่อ db
  image: postgres:17, restart: always, ports: "5432:5432"
  environment: POSTGRES_PASSWORD=pass123 และ POSTGRES_DB=ecommerce
  volumes: named volume ชื่อ pgdata เมานต์ที่ /var/lib/postgresql/data และประกาศ volumes: pgdata: ไว้ท้ายไฟล์
- .env มีสี่บรรทัดตามลำดับนี้ ไม่มีเครื่องหมายคำพูดครอบค่า
  DATABASE_URL=postgresql://postgres:pass123@localhost:5432/ecommerce
  PORT=3000
  APP_URL=http://localhost:3000
  CORS_ORIGIN=http://localhost:5173
- .env.example มี key และค่าเดียวกันทั้งสี่บรรทัด (โปรเจกต์นี้ไม่มี secret จริง)
- .gitignore เพิ่มบรรทัด .env ต่อท้ายไฟล์ ห้ามลบบรรทัดเดิม

ขอบเขต:
- ห้ามติดตั้ง dependency ใหม่
- ห้ามแก้ไฟล์อื่นนอกจากที่ระบุ
- ห้ามรัน docker compose up ให้ผมรันเอง
- ยังไม่ต้องติดตั้งหรือตั้งค่า Prisma
```

Review checklist: no `version:` key; `postgres:17` not `postgres:latest`; `POSTGRES_DB: ecommerce` present; `.env` has exactly four lines and is listed in `.gitignore` (`git status` must not show `.env`); `.env.example` identical. AI มักพลาดตรงนี้: adds `version: "3"` or a `POSTGRES_USER` line, or wraps values in quotes. Reference code: compose + env from tag `lesson-05`. Workshop hand step after the prompt: `docker compose up -d`, `docker compose ps`. Verification: `docker compose exec db psql -U postgres -d ecommerce -c '\l'` lists `ecommerce`; `git status` clean of `.env`; commit `feat: postgres via docker compose`.

- [ ] **Step 2: Lesson 06 — ติดตั้ง Prisma และ PrismaModule**

Concept: recap Week_09 lesson 22 (Prisma 7 needs a driver adapter; `prisma7.config.ts` is CLI-only; `PrismaService extends PrismaClient`); new here: `ConfigModule.forRoot({ isGlobal: true })` from day one so no `dotenv/config` in `main.ts` (link Week_09 lesson 42) and `ConfigService` is injectable anywhere (lesson 10 uses it); `tsx` installed now because lesson 09's seed runs outside Nest. Hand steps before the prompt (`.prompt-example`): the `npm install` lines and `npx prisma init --no-skills` from Task 2 Step 3, then "open `.env`: if `prisma init` appended an example `DATABASE_URL`, delete it". Show the generated `schema.prisma` and `prisma7.config.ts` as in Week_09.

Prompt:

```
สร้าง PrismaModule กับ PrismaService แบบ global และเปิดใช้ ConfigModule ใน AppModule

บริบท: @src/app.module.ts @src/main.ts @prisma/schema.prisma @prisma7.config.ts @.env @.cursor/rules/project.mdc
ติดตั้งแล้ว: @prisma/client@7.10.0, @prisma/adapter-pg@7.10.0, dotenv, @nestjs/config และ prisma@7.10.0 (devDependency)
npx prisma init สร้าง prisma/schema.prisma (generator prisma-client, output ../src/generated/prisma) และ prisma7.config.ts ไว้แล้ว
schema ยังไม่มี model ใด ๆ และยังไม่ได้ generate — ห้ามเพิ่ม model ในรอบนี้
Prisma 7 ต้องสร้าง PrismaClient พร้อม driver adapter เสมอ: new PrismaClient({ adapter: new PrismaPg({ connectionString }) })
Prisma Client ที่ generate จะอยู่ที่ src/generated/prisma/client.ts จึง import จาก '../generated/prisma/client.js'
โปรเจกต์เป็น ES module ทุก import ไฟล์ในโปรเจกต์ต้องลงท้าย .js

โครงสร้าง: สร้าง/แก้ไฟล์ตามนี้ ไม่มากไม่น้อยกว่านี้
- src/prisma/prisma.service.ts (สร้างใหม่)
- src/prisma/prisma.module.ts (สร้างใหม่)
- src/app.module.ts (แก้ไข)

ข้อกำหนดทางเทคนิค:
- prisma.service.ts: import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
  import { PrismaPg } from '@prisma/adapter-pg' และ import { PrismaClient } from '../generated/prisma/client.js'
  @Injectable() export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy
  constructor เรียก super({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })
  onModuleInit เรียก await this.$connect() และ onModuleDestroy เรียก await this.$disconnect()
  ห้าม import dotenv ในไฟล์นี้
- prisma.module.ts: @Global() @Module({ providers: [PrismaService], exports: [PrismaService] }) export class PrismaModule
- app.module.ts: เพิ่ม ConfigModule.forRoot({ isGlobal: true }) เป็นรายการแรกของ imports ตามด้วย PrismaModule
  คง AppController และ AppService ไว้ตามเดิม

ขอบเขต:
- ห้ามติดตั้ง dependency ใหม่
- ห้ามแก้ main.ts, schema.prisma, prisma7.config.ts หรือ .env
- ห้ามสร้าง index.ts / barrel
- ห้ามรัน prisma generate หรือ migrate ให้ผมรันเอง
- ยังไม่ต้องสร้าง model, service หรือ controller ของสินค้า
```

Review: `@Global()` present; `import … from '../generated/prisma/client.js'` (with `.js`, from `src/generated`, not from `@prisma/client`); `adapter` passed to `super`; `isGlobal: true`; no `dotenv` import anywhere in `src/`. AI มักพลาดตรงนี้: imports `PrismaClient` from `@prisma/client` (works in Prisma 5, throws "adapter required" here) or forgets `.js`. Reference code: the three files at tag `lesson-06`. Hand steps after: `npx prisma generate`, `npm run start:dev`. Expected: app boots (empty schema still generates a client). Verification: `ls src/generated/prisma` shows `client.ts`; stop the db (`docker compose stop db`) and restart the app → connection error in the log; `docker compose start db`; commit `feat: prisma service and config module`.

- [ ] **Step 3: Lesson 07 — ออกแบบ Prisma Model ของสินค้า**

Concept: from `product-1.json` to columns — a `.comparison` table dummyjson field → Prisma field → note (nested `dimensions` → `width/height/depth`; `meta` → `barcode/qrCode/createdAt/updatedAt`; `category` string → relation to `Category`; `reviews[]` → `Review` model with `onDelete: Cascade`; `brand` → `String?`); why `Float` not `Decimal` (Prisma serialises Decimal as a string → contract broken; link Prisma docs); why `Product.id` has no `autoincrement()` (we keep dummyjson ids so React links like `/product/1` keep working); why not `Json` columns (can't index, can't validate, and we want to practise relations from Week_09 lesson 25).

Prompt:

```
เพิ่ม Prisma model ของ Category, Product และ Review ให้ตรงกับ payload ของ dummyjson

บริบท: @prisma/schema.prisma @docs/contract/product-1.json @docs/contract/categories.json @.cursor/rules/project.mdc
schema.prisma ตอนนี้มีแค่ generator กับ datasource ห้ามแก้สองบล็อกนั้น
docs/contract/product-1.json คือ response จริงของ GET https://dummyjson.com/products/1 — ทุก field ของ Product ต้องมาจากไฟล์นี้
docs/contract/categories.json คือ response จริงของ GET /products/categories แต่ละรายการมี slug, name, url — url ไม่ต้องเก็บเพราะคำนวณจาก slug ได้
สินค้าบางชิ้น (92 จาก 194) ไม่มี field brand
ฐานข้อมูลคือ PostgreSQL 17

โครงสร้าง: แก้ไฟล์เดียว
- prisma/schema.prisma (แก้ไข: เพิ่มสาม model ต่อท้าย)

ข้อกำหนดทางเทคนิค:
- model Category: id Int @id @default(autoincrement()), slug String @unique, name String, products Product[]
- model Product: id Int @id (ไม่ใส่ autoincrement เพราะเราจะ seed ด้วย id เดิมของ dummyjson)
  field ตามลำดับนี้: title String, description String, price Float, discountPercentage Float, rating Float, stock Int,
  tags String[], brand String?, sku String, weight Float, width Float, height Float, depth Float,
  warrantyInformation String, shippingInformation String, availabilityStatus String, returnPolicy String,
  minimumOrderQuantity Int, barcode String, qrCode String, images String[], thumbnail String,
  createdAt DateTime, updatedAt DateTime (ไม่ใส่ @default หรือ @updatedAt เพราะค่ามาจาก meta ของ dummyjson)
  categoryId Int, category Category @relation(fields: [categoryId], references: [id]), reviews Review[]
  และ @@index([categoryId])
- model Review: id Int @id @default(autoincrement()), rating Int, comment String, date DateTime, reviewerName String, reviewerEmail String,
  productId Int, product Product @relation(fields: [productId], references: [id], onDelete: Cascade) และ @@index([productId])
- ใช้ Float สำหรับทุกค่าที่เป็นทศนิยม ห้ามใช้ Decimal (Prisma serialize Decimal เป็น string ซึ่งผิด contract)
- dimensions และ meta ของ dummyjson เป็น object ซ้อน ให้แบนเป็นคอลัมน์ตามที่ระบุด้านบน ห้ามใช้ Json
- ห้ามสร้าง model อื่น ห้ามใส่ @@map หรือ @map

ขอบเขต:
- ห้ามแก้ไฟล์อื่น
- ห้ามรัน prisma migrate, db push หรือ generate ให้ผมรันเอง
- ยังไม่ต้องเขียน seed หรือ service
```

Review: `Product.id Int @id` without autoincrement; `brand String?` is the only optional; `updatedAt` has no `@updatedAt`; `Review` has `onDelete: Cascade`; both `@@index`; no `Decimal`, no `Json`; `npx prisma validate` passes. AI มักพลาดตรงนี้: adds `@updatedAt` to `updatedAt` (would overwrite dummyjson's value on every update) or uses `Decimal` for price. Reference: schema at tag `lesson-07`. Verification: `npx prisma validate` → "The schema is valid"; `npx prisma format` changes nothing; commit `feat: product schema`.

- [ ] **Step 4: Lesson 08 — รัน Migration แรกและดูตารางจริง** (✍️)

Concept: recap Week_09 lesson 31 (`migrate dev` creates SQL + applies + records in `_prisma_migrations`; Prisma 7 does not auto-run `generate`; never `migrate dev` against production). Commands from Task 3 Step 2 (`migrate dev --name init`, `generate`, `\dt`, `\d "Product"`). Show the head of the generated `migration.sql` (`CREATE TABLE "Product" (…)`) from the scratchpad. Explain the three `\d "Product"` lines that prove the schema decisions: `brand text` nullable, `tags text[]`, `"categoryId" integer NOT NULL` with the index. `.note`: `docker compose exec db psql …` is the GUI-free way; pgAdmin from Week_09 lesson 21 works too. Verification: `prisma/migrations/<ts>_init/migration.sql` exists; `_prisma_migrations` has one row; `src/generated/prisma/client.ts` mentions `Product`; commit `chore: init migration`.

- [ ] **Step 5: Lesson 09 — Seed สินค้าจริงจาก dummyjson**

Concept: recap Week_08 lesson 19 (seed = a plain script; delete in FK order; `createMany`); why fetch live instead of committing 194 products (the contract files are samples, the catalogue is data); why keep dummyjson ids (React routes); why `createMany` ×3 instead of 194 `create` calls (one round-trip each, and review order = insertion order = dummyjson order); why `tsx` (the generated client imports `./x.js` while the files are `.ts`; Node alone cannot resolve that, `tsx` can); why a transaction (a failed fetch mid-way must not leave half a catalogue).

Prompt:

```
เขียน seed script ที่ดึงสินค้าและหมวดหมู่จริงจาก dummyjson ลง PostgreSQL

บริบท: @prisma/schema.prisma @src/prisma/prisma.service.ts @package.json @docs/contract/products-page.json @docs/contract/categories.json @.cursor/rules/project.mdc
schema มี model Category, Product, Review แล้ว migrate และ generate แล้ว Prisma Client อยู่ที่ src/generated/prisma/client.ts
GET https://dummyjson.com/products/categories คืน array ของ { slug, name, url } จำนวน 24 รายการ
GET https://dummyjson.com/products?limit=0 คืน { products, total, skip, limit } โดย products คือสินค้าทั้งหมด 194 ชิ้น รูปทรงแต่ละชิ้นตาม docs/contract/products-page.json
สินค้าแต่ละชิ้นมี reviews 3 รายการ และ field category เป็น slug string ที่ตรงกับ categories
สินค้าบางชิ้นไม่มี field brand
script นี้รันนอก NestJS ด้วย tsx (ติดตั้งไว้แล้วเป็น devDependency) จึงต้องสร้าง PrismaClient เองพร้อม adapter แบบเดียวกับ prisma.service.ts และต้อง import 'dotenv/config' บรรทัดแรก
Node.js เวอร์ชันนี้มี fetch ในตัว ห้ามติดตั้ง axios

โครงสร้าง: สร้าง/แก้ไฟล์ตามนี้ ไม่มากไม่น้อยกว่านี้
- prisma/seed.ts (สร้างใหม่)
- package.json (แก้ไข: เพิ่ม script "db:seed": "tsx prisma/seed.ts")

ข้อกำหนดทางเทคนิค:
- ประกาศ interface DummyCategory, DummyReview, DummyProduct ที่บรรยาย payload ของ dummyjson ให้ครบทุก field ตาม docs/contract (brand เป็น optional)
- ฟังก์ชัน fetchJson<T>(path: string): Promise<T> ที่ต่อ path เข้ากับ https://dummyjson.com และ throw Error ถ้า response.ok เป็น false
- ฟังก์ชัน main() ทำงานตามลำดับ: ดึง categories และ products ทั้งหมด (limit=0) แล้วเข้า prisma.$transaction(async (tx) => { ... }) ซึ่งข้างใน
  1. ลบข้อมูลเดิมตามลำดับ review, product, category ด้วย deleteMany
  2. category.createMany จาก slug และ name
  3. อ่าน category กลับมาแล้วสร้าง Map จาก slug ไป id พร้อมฟังก์ชันช่วยที่ throw Error บอกชื่อ slug ถ้าไม่พบ
  4. product.createMany โดยส่ง id เดิมของ dummyjson แบน dimensions เป็น width/height/depth และ meta เป็น barcode/qrCode/createdAt/updatedAt (แปลง string เป็น new Date) brand ที่ไม่มีให้เป็น null
  5. review.createMany จาก flatMap ของ reviews ทุกชิ้น พร้อม productId และ date เป็น new Date
- ห้ามใช้ upsert ห้ามวน loop create ทีละชิ้น
- จบด้วย console.log บอกจำนวน categories, products, reviews ที่ seed
- บรรทัดล่างสุดใช้ top-level await เรียก main() ใน try/finally ที่ finally เรียก prisma.$disconnect()
- ห้ามใช้ any และห้าม non-null assertion (!)

ขอบเขต:
- ห้ามติดตั้ง dependency ใหม่
- ห้ามแก้ schema.prisma, prisma7.config.ts หรือไฟล์ใน src/
- ห้ามรัน script ให้ผมรันเอง
- ยังไม่ต้องสร้าง controller หรือ endpoint ของสินค้า
```

Review: `import 'dotenv/config'` first line; `PrismaPg` adapter; delete order review → product → category; three `createMany`; explicit `id: product.id`; `brand: product.brand ?? null`; `new Date(...)` on the four date fields; no `!`, no `any`; `db:seed` script uses `tsx`. AI มักพลาดตรงนี้: loops `create` per product (slow but works) or forgets `limit=0` and seeds only 30 products — the verification count catches it. Reference: `prisma/seed.ts` at tag `lesson-09`. Hand steps: `npm run db:seed` twice. Expected: `Seeded 24 categories, 194 products, 582 reviews` both times. Verification: the psql count query from Task 4 Step 2 → `24 | 194 | 582`; `SELECT count(*) FROM "Product" WHERE brand IS NULL` → 92; `SELECT id, slug FROM "Category" ORDER BY id LIMIT 3` → beauty, fragrances, furniture (a `.note`: the id numbers grow on each re-seed because the sequence is not reset; only the order matters, nothing exposes category ids); commit `feat: seed from dummyjson`.

- [ ] **Step 6: Nav chain and commit**

04→05→06→07→08→09→10. Commit `content(week10): lessons 05-09`.

---

### Task 15: Lessons 10–15 (Products Endpoints)

**Files:** `10_get-products-categories.html`, `11_mapping-rows-to-the-contract.html`, `12_get-product-by-id.html`, `13_get-products-with-pagination.html`, `14_get-products-by-category.html`, `15_checking-the-contract.html`

- [ ] **Step 1: Lesson 10 — GET /products/categories**

Concept: the simplest endpoint first (no params, no mapper); recap Week_09 lessons 06/12/14 (controller → service → module); the `url` field: dummyjson returns `https://dummyjson.com/products/category/beauty`, ours must return `http://localhost:3000/products/category/beauty`, so the host comes from `APP_URL` through `ConfigService.getOrThrow` (link Week_09 lesson 45); order by `id` = dummyjson order because the seed inserted in that order. เป้าหมาย: three new files + `app.module.ts`.

Prompt:

```
สร้าง ProductsModule พร้อม endpoint GET /products/categories ที่ตอบเหมือน dummyjson

บริบท: @src/app.module.ts @src/prisma/prisma.service.ts @prisma/schema.prisma @docs/contract/categories.json @.env @.cursor/rules/project.mdc
ฐานข้อมูลถูก seed แล้ว ตาราง Category มี 24 แถว (id เรียงตามลำดับเดียวกับ dummyjson)
docs/contract/categories.json คือ response จริง: array ของ { slug, name, url } โดย url คือ https://dummyjson.com/products/category/<slug>
ของเรา url ต้องเป็น <APP_URL>/products/category/<slug> โดย APP_URL อ่านจาก .env ผ่าน ConfigService (ConfigModule เป็น global แล้ว)
PrismaModule เป็น global แล้ว ฉีด PrismaService ผ่าน constructor ได้เลย

โครงสร้าง: สร้าง/แก้ไฟล์ตามนี้ ไม่มากไม่น้อยกว่านี้
- src/products/products.module.ts (สร้างใหม่)
- src/products/products.controller.ts (สร้างใหม่)
- src/products/products.service.ts (สร้างใหม่)
- src/app.module.ts (แก้ไข: เพิ่ม ProductsModule ใน imports ต่อจาก PrismaModule)

ข้อกำหนดทางเทคนิค:
- products.service.ts: @Injectable() export class ProductsService
  constructor(private readonly prisma: PrismaService, private readonly config: ConfigService)
  method async findCategories() ดึง category ทั้งหมดด้วย findMany({ orderBy: { id: 'asc' } })
  แล้ว map เป็น { slug, name, url } โดย url = `${appUrl}/products/category/${slug}` และ appUrl มาจาก this.config.getOrThrow<string>('APP_URL')
  ห้ามคืน id ของ category ออกไป
- products.controller.ts: @Controller('products') export class ProductsController
  constructor(private readonly productsService: ProductsService)
  handler @Get('categories') findCategories() return this.productsService.findCategories()
- products.module.ts: @Module({ controllers: [ProductsController], providers: [ProductsService] })
- import ไฟล์ในโปรเจกต์ทุกตัวลงท้าย .js
- ห้ามสร้าง DTO หรือ interface ในรอบนี้

ขอบเขต:
- ห้ามติดตั้ง dependency ใหม่
- ห้ามแก้ไฟล์อื่นนอกจากที่ระบุ ห้ามลบ AppController/AppService
- ห้ามสร้าง index.ts / barrel
- ยังไม่ต้องสร้าง endpoint อื่นของสินค้า
```

Review: `getOrThrow` (not `get`, which returns `undefined` silently); `orderBy: { id: 'asc' }`; no `id` in the response; `.js` on all four imports; `ProductsModule` registered. AI มักพลาดตรงนี้: hard-codes `http://localhost:3000` in the template string, or imports `ConfigModule` into `ProductsModule` (harmless but unnecessary since it is global). Reference: three files at tag `lesson-10`. Verification: log line `Mapped {/products/categories, GET} route`; the `diff <(curl … | sed …) docs/contract/categories.json && echo IDENTICAL` command from Task 5 Step 2 prints `IDENTICAL`; change `APP_URL` in `.env`, restart, and the urls follow; commit `feat: GET /products/categories`.

- [ ] **Step 2: Lesson 11 — แปลงแถวจากฐานข้อมูลเป็นรูปทรงของ dummyjson**

Concept: the storage shape (flat columns, relation, `Date` objects, `brand: null`) ≠ the contract shape (nested `dimensions`/`meta`, `category` slug string, ISO strings, `brand` key absent); a pure mapper function is the single place that knows both, and it is unit-testable without Nest; why classes not interfaces for response DTOs (lesson 22's Swagger plugin reads class fields; `strictPropertyInitialization` is off in Nest 12 tsconfig so bare fields compile); the conditional spread idiom `...(product.brand !== null ? { brand: product.brand } : {})` versus `brand: undefined` (JSON.stringify drops `undefined` too, but the type would then allow `null`); `ProductWithRelations = Product & { category: Category; reviews: Review[] }` mirrors an `include`. State where model types are exported from (from Task 3 Step 2).

Prompt:

```
สร้าง response DTO และ mapper ที่แปลงแถวสินค้าจาก Prisma เป็นรูปทรง Product ของ dummyjson

บริบท: @prisma/schema.prisma @src/products/products.service.ts @docs/contract/product-1.json @.cursor/rules/project.mdc
docs/contract/product-1.json คือรูปทรงเป้าหมาย: 22 key เรียงตามนี้
  id, title, description, category, price, discountPercentage, rating, stock, tags, brand, sku, weight,
  dimensions { width, height, depth }, warrantyInformation, shippingInformation, availabilityStatus,
  reviews [{ rating, comment, date, reviewerName, reviewerEmail }], returnPolicy, minimumOrderQuantity,
  meta { createdAt, updatedAt, barcode, qrCode }, images, thumbnail
ในฐานข้อมูล category เป็น relation (ต้องตอบเป็น slug string) ส่วน dimensions และ meta ถูกแบนเป็นคอลัมน์ width/height/depth และ barcode/qrCode/createdAt/updatedAt
date ทุกตัวใน dummyjson เป็น ISO string เช่น "2025-04-30T09:41:02.053Z"
สินค้าที่ brand เป็น null ใน DB ต้องไม่มี key brand ใน response (dummyjson ไม่ส่ง key นี้มาเลย ไม่ใช่ส่ง null)
Prisma Client อยู่ที่ src/generated/prisma/client.ts และ export type ของ model ชื่อ Product, Category, Review

โครงสร้าง: สร้างไฟล์ตามนี้ ไม่มากไม่น้อยกว่านี้
- src/products/dto/product-response.dto.ts (สร้างใหม่)
- src/products/product.mapper.ts (สร้างใหม่)

ข้อกำหนดทางเทคนิค:
- product-response.dto.ts: export class หกตัวตามลำดับ ไม่มี decorator ไม่มี method มีแต่ field ที่ระบุ type
  ProductDimensionsDto { width: number; height: number; depth: number }
  ProductReviewDto { rating: number; comment: string; date: string; reviewerName: string; reviewerEmail: string }
  ProductMetaDto { createdAt: string; updatedAt: string; barcode: string; qrCode: string }
  ProductResponseDto ที่มี field ครบ 22 ตัวตามลำดับด้านบน โดย category: string, brand?: string (optional ตัวเดียว), dimensions: ProductDimensionsDto, reviews: ProductReviewDto[], meta: ProductMetaDto, tags และ images เป็น string[]
  CategoryResponseDto { slug: string; name: string; url: string }
  ProductListResponseDto { products: ProductResponseDto[]; total: number; skip: number; limit: number }
- product.mapper.ts: import type { Category, Product, Review } from '../generated/prisma/client.js'
  export type ProductWithRelations = Product & { category: Category; reviews: Review[] }
  export function toProductResponse(product: ProductWithRelations): ProductResponseDto
  สร้าง object literal เรียง key ตามลำดับ contract, category เป็น product.category.slug,
  brand ใส่เฉพาะเมื่อไม่เป็น null ด้วย spread แบบมีเงื่อนไข ...(product.brand !== null ? { brand: product.brand } : {})
  date, createdAt, updatedAt แปลงด้วย .toISOString()
  reviews map ทีละตัวเลือกเฉพาะห้า field ของ contract (ห้ามส่ง id หรือ productId ออกไป)
- ห้ามใช้ any ห้ามใช้ as

ขอบเขต:
- ห้ามติดตั้ง dependency ใหม่
- ห้ามแก้ไฟล์อื่นนอกจากที่ระบุ (products.service.ts ยังไม่ต้องแก้)
- ห้ามสร้าง index.ts / barrel
- ยังไม่ต้องสร้าง endpoint ที่ใช้ mapper
```

Review: six classes, `brand?` the only optional; `import type` for the model types; conditional spread for brand; `toISOString()` on all four dates; review objects have exactly five keys; `npm run build` passes. AI มักพลาดตรงนี้: `brand: product.brand ?? undefined` (type becomes `string | undefined`, fine at runtime, but then Cursor often types it `brand: string | null` in the DTO — check the DTO) or returns `category: product.category` (the whole object). Reference: both files at tag `lesson-11`. Verification: `npm run build` clean; nothing to curl yet — the next lesson proves it; commit `feat: product response dto and mapper`.

- [ ] **Step 3: Lesson 12 — GET /products/:id**

Concept: recap Week_09 lessons 07/13 (route params, `ParseIntPipe`, `NotFoundException`); the 404 message must be byte-identical (`Product with id '9999' not found`, single quotes) because the React `ApiError` shows `data.message`; `include` with `reviews: { orderBy: { id: 'asc' } }` (link Week_09 lesson 26) — Postgres returns relation rows in no guaranteed order unless told; **route order**: Nest registers handlers in declaration order, so `@Get('categories')` must stay above `@Get(':id')` or `/products/categories` would parse `categories` as an id → 400. Show the one accepted deviation: `/products/abc` → 400 here, 404 on dummyjson (React never sends it).

Prompt:

```
เพิ่ม endpoint GET /products/:id ที่ตอบสินค้าหนึ่งชิ้นตามรูปทรง dummyjson และ 404 ด้วยข้อความเดียวกัน

บริบท: @src/products/products.controller.ts @src/products/products.service.ts @src/products/product.mapper.ts @src/products/dto/product-response.dto.ts @docs/contract/product-1.json @docs/contract/product-not-found.txt @.cursor/rules/project.mdc
มี toProductResponse(product: ProductWithRelations) ที่รับแถวสินค้าพร้อม category และ reviews แล้วคืน ProductResponseDto
docs/contract/product-not-found.txt คือ response จริงของ GET /products/9999: status 404 body { "message": "Product with id '9999' not found" }
reviews ต้องเรียงตามลำดับที่ seed (id น้อยไปมาก) เพื่อให้ตรงกับ dummyjson
controller มี route GET /products/categories อยู่แล้ว route ใหม่ที่มี parameter ต้องประกาศไว้หลัง route ที่เป็นคำตายตัวเสมอ

โครงสร้าง: แก้ไฟล์ตามนี้ ไม่มากไม่น้อยกว่านี้
- src/products/products.service.ts (แก้ไข: เพิ่ม method)
- src/products/products.controller.ts (แก้ไข: เพิ่ม handler)

ข้อกำหนดทางเทคนิค:
- service: async findOne(id: number): Promise<ProductResponseDto>
  ใช้ this.prisma.product.findUnique({ where: { id }, include: { category: true, reviews: { orderBy: { id: 'asc' } } } })
  ถ้าได้ null ให้ throw new NotFoundException(`Product with id '${id}' not found`) ข้อความต้องตรงตัวอักษรต่ออักษรรวม single quote
  คืน toProductResponse(product)
- controller: handler @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) วางไว้เป็น handler สุดท้ายของ class ต่อจาก findCategories
- ห้ามแก้ findCategories ห้ามแตะ mapper

ขอบเขต:
- ห้ามติดตั้ง dependency ใหม่
- ห้ามแก้ไฟล์อื่นนอกจากที่ระบุ
- ยังไม่ต้องทำ GET /products (list) หรือ pagination
```

Review: `ParseIntPipe` on the param; `findUnique` + `include` with `orderBy`; exact message with single quotes; handler is last; return type `Promise<ProductResponseDto>`. AI มักพลาดตรงนี้: `Product #9999 not found` (the Week_09 wording) or `findFirst` without `include`. Reference: the two files at tag `lesson-12`. Verification: the sorted-key `diff … && echo IDENTICAL` command for product 1 from Task 6 Step 4; 9999 → 404 with the exact message; `curl /products/categories` still works (route order); a product without brand has no `brand` key; commit `feat: GET /products/:id`.

- [ ] **Step 4: Lesson 13 — GET /products พร้อม skip และ limit**

Concept: recap Week_09 lessons 11/16/18 (query DTO, `ValidationPipe`, `enableImplicitConversion`); the dummyjson rules (default 30/0, `limit=0` = all, ordered by id); defaults live on the DTO class fields (`skip: number = 0`) — with `transform: true` the pipe instantiates the class so initialisers run; `whitelist: true` drops unknown query keys silently (React sends only `skip` and `limit`); `$transaction([findMany, count])` so `total` and the page come from one snapshot (link Week_09 lesson 29); `take: undefined` = no limit; the shared `productInclude` constant with `satisfies Prisma.ProductInclude` keeps the literal `'asc'` type. Hand step first: `npm install class-validator class-transformer`.

Prompt:

```
เพิ่ม endpoint GET /products พร้อม skip/limit ที่ตอบ envelope เหมือน dummyjson และเปิด ValidationPipe แบบ global

บริบท: @src/main.ts @src/products/products.controller.ts @src/products/products.service.ts @src/products/product.mapper.ts @src/products/dto/product-response.dto.ts @docs/contract/products-page.json @.cursor/rules/project.mdc
ติดตั้ง class-validator และ class-transformer แล้ว
docs/contract/products-page.json คือ response จริงของ GET /products?limit=2&skip=0: { products: Product[], total: 194, skip: 0, limit: 2 }
กติกาของ dummyjson: ถ้าไม่ส่ง limit ใช้ 30, ถ้าไม่ส่ง skip ใช้ 0, limit=0 หมายถึงเอาทั้งหมด, สินค้าเรียงตาม id น้อยไปมาก
field limit ใน response ไม่ใช่ค่าที่ client ขอมา แต่คือจำนวนสินค้าที่ส่งกลับจริง (products.length) เช่น ?limit=10&skip=190 ตอบ limit: 4 และหมวดที่ไม่มีสินค้าตอบ limit: 0
มี ProductListResponseDto { products, total, skip, limit } และ toProductResponse อยู่แล้ว
findOne ใช้ include: { category: true, reviews: { orderBy: { id: 'asc' } } } — list ต้องใช้ include เดียวกัน

โครงสร้าง: สร้าง/แก้ไฟล์ตามนี้ ไม่มากไม่น้อยกว่านี้
- src/products/dto/pagination-query.dto.ts (สร้างใหม่)
- src/products/products.service.ts (แก้ไข)
- src/products/products.controller.ts (แก้ไข)
- src/main.ts (แก้ไข)

ข้อกำหนดทางเทคนิค:
- pagination-query.dto.ts: export class PaginationQueryDto มีสอง field พร้อมค่าเริ่มต้น
  @IsInt() @Min(0) skip: number = 0
  @IsInt() @Min(0) limit: number = 30
  ไม่ต้องใส่ @Type และไม่ต้องใส่ @IsOptional เพราะจะเปิด enableImplicitConversion ที่ pipe และมีค่าเริ่มต้นแล้ว
- main.ts: ก่อน app.listen เพิ่ม app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, transformOptions: { enableImplicitConversion: true } }))
- service: ประกาศค่าคงที่ระดับไฟล์ const productInclude = { category: true, reviews: { orderBy: { id: 'asc' } } } satisfies Prisma.ProductInclude
  (import type { Prisma } from '../generated/prisma/client.js') แล้วให้ findOne ใช้ include: productInclude แทนของเดิม
  เพิ่ม private async paginate(where: Prisma.ProductWhereInput, skip: number, limit: number): Promise<ProductListResponseDto>
  ใช้ this.prisma.$transaction([ findMany, count ]) โดย findMany มี where, skip, take: limit === 0 ? undefined : limit, orderBy: { id: 'asc' }, include: productInclude ส่วน count มี where เดียวกัน
  คืน { products: rows.map(toProductResponse), total, skip, limit: rows.length } (limit คือจำนวนที่ส่งกลับจริงตาม dummyjson)
  เพิ่ม findAll(query: PaginationQueryDto) ที่คืน this.paginate({}, query.skip, query.limit)
- controller: เพิ่ม handler @Get() findAll(@Query() query: PaginationQueryDto) วางไว้ระหว่าง findCategories กับ findOne (ต้องอยู่ก่อน @Get(':id'))

ขอบเขต:
- ห้ามติดตั้ง dependency ใหม่
- ห้ามแก้ไฟล์อื่นนอกจากที่ระบุ
- ยังไม่ต้องทำ GET /products/category/:slug
```

Review: DTO defaults `0`/`30` with `@IsInt @Min(0)`; pipe options exactly `whitelist`, `transform`, `enableImplicitConversion`; `$transaction([...])` array form; `take: limit === 0 ? undefined : limit`; `limit: rows.length` in the envelope; `productInclude` reused in `findOne`; `findAll` declared before `findOne`. AI มักพลาดตรงนี้: `skip?: number` with `@IsOptional()` and then `query.skip ?? 0` sprinkled around, or `take: limit` (limit=0 → empty page instead of all). Reference: four files at tag `lesson-13`. Verification: the five curl checks from Task 7 Step 4 (`194 0 2 [1,2]`, default `30 30`, `limit=0` → `194 194`, `limit=abc` → 400 `limit must be an integer number`, `limit=-1` → 400); `diff` of `/products?limit=2&skip=0` sorted keys against `products-page.json` (write the node one-liner in the lesson); commit `feat: GET /products with pagination`.

- [ ] **Step 5: Lesson 14 — GET /products/category/:slug**

Concept: the payoff of `paginate(where, …)`: one new `where` (`{ category: { slug } }`, a relation filter — link Week_09 lesson 26) and one handler; unknown slug is a 200 with an empty list and `limit: 0` because dummyjson does that (show `products-by-category-unknown.json`; `limit` = products returned) and the React Category page relies on `total: 0`; route order again: `category/:slug` has two segments so it cannot collide with `:id`, but it must still be declared before `@Get(':id')` for readability and before `@Get()` to keep static-first ordering.

Prompt:

```
เพิ่ม endpoint GET /products/category/:slug ที่ใช้ pagination เดิม และตอบ list ว่างเมื่อไม่พบหมวดหมู่

บริบท: @src/products/products.controller.ts @src/products/products.service.ts @src/products/dto/pagination-query.dto.ts @docs/contract/products-by-category.json @docs/contract/products-by-category-unknown.json @.cursor/rules/project.mdc
มี private method paginate(where, skip, limit) ที่คืน ProductListResponseDto อยู่แล้ว
docs/contract/products-by-category.json คือ response จริงของ GET /products/category/beauty?limit=2&skip=0 (envelope เดียวกับ GET /products, total คือจำนวนสินค้าในหมวดนั้น)
docs/contract/products-by-category-unknown.json คือ response จริงของ slug ที่ไม่มี: status 200 กับ { products: [], total: 0, skip, limit } — ไม่ใช่ 404

โครงสร้าง: แก้ไฟล์ตามนี้ ไม่มากไม่น้อยกว่านี้
- src/products/products.service.ts (แก้ไข: เพิ่ม method เดียว)
- src/products/products.controller.ts (แก้ไข: เพิ่ม handler เดียว)

ข้อกำหนดทางเทคนิค:
- service: findByCategory(slug: string, query: PaginationQueryDto) คืน this.paginate({ category: { slug } }, query.skip, query.limit)
  ห้าม query ตาราง category แยกต่างหาก ห้าม throw เมื่อไม่พบ
- controller: handler @Get('category/:slug') findByCategory(@Param('slug') slug: string, @Query() query: PaginationQueryDto)
  วางไว้ถัดจาก findCategories และก่อน findAll
- ห้ามแก้ paginate, findAll, findOne, productInclude

ขอบเขต:
- ห้ามติดตั้ง dependency ใหม่
- ห้ามแก้ไฟล์อื่นนอกจากที่ระบุ
- ยังไม่ต้องเขียน script ตรวจ contract
```

Review: relation filter `{ category: { slug } }`; no extra `findUnique` on category; no `NotFoundException`; handler placed between `findCategories` and `findAll`. AI มักพลาดตรงนี้: looks the category up first and throws 404 when missing (breaks the contract). Reference: two files at tag `lesson-14`. Verification: `beauty?limit=2&skip=1` → `5 1 2 [2,3]`; `nope?limit=2&skip=0` → exactly the bytes of `products-by-category-unknown.json`; `diff` of `beauty?limit=2&skip=0` (sorted keys) against `products-by-category.json`; commit `feat: GET /products/category/:slug`.

- [ ] **Step 6: Lesson 15 — ตรวจสัญญากับ dummyjson อัตโนมัติ**

Concept: manual `diff`s per lesson do not scale; a script that hits both hosts with the same requests and reports the first differing path is a regression test for the contract; normalisation (sort keys, swap host in strings) and why error bodies compare only `message`; the accepted deviations table (`.comparison`): non-numeric id → 400 vs 404; validation errors carry `statusCode`/`error`; category url host; key order. Why `node scripts/…ts` works without `tsx`: no imports, only erasable TS syntax (Node 24 strips types natively).

Prompt:

```
เขียน script ตรวจว่า API ของเราตอบเหมือน dummyjson สำหรับทุก endpoint ฝั่ง GET

บริบท: @package.json @docs/contract @.cursor/rules/project.mdc
API ของเรารันที่ http://localhost:3000 และ dummyjson อยู่ที่ https://dummyjson.com
endpoint ที่ต้องเทียบ: /products/categories, /products (มี limit/skip), /products/:id, /products/category/:slug
ความต่างที่ยอมรับได้: (1) field url ของ category ต่างกันแค่ host (2) response error ของเรามี key statusCode และ error เพิ่มจาก message (3) ลำดับ key ใน object ไม่สำคัญ
script รันด้วย node ตรง ๆ (Node 24 รัน .ts ที่มีแต่ type annotation ได้เอง) ห้าม import อะไรเลย และห้ามใช้ enum, namespace หรือ parameter properties

โครงสร้าง: สร้าง/แก้ไฟล์ตามนี้ ไม่มากไม่น้อยกว่านี้
- scripts/contract-check.ts (สร้างใหม่)
- package.json (แก้ไข: เพิ่ม script "contract:check": "node scripts/contract-check.ts")

ข้อกำหนดทางเทคนิค:
- const LOCAL = process.env.LOCAL_URL ?? 'http://localhost:3000' และ const REMOTE = 'https://dummyjson.com'
- const REQUESTS ตามลำดับนี้
  '/products/categories', '/products?limit=3&skip=0', '/products?limit=2&skip=190', '/products/1', '/products/194', '/products/9999',
  '/products/category/beauty?limit=2&skip=1', '/products/category/nope?limit=5&skip=0'
- type Json = null | boolean | number | string | Json[] | { [key: string]: Json } และ type guard isObject(value: Json)
- function normalize(value: Json): Json — array: map ซ้ำ, object: สร้าง object ใหม่เรียง key ตามตัวอักษรและ normalize ค่าข้างใน, string: replace REMOTE ด้วย LOCAL, อื่น ๆ คืนเดิม
- function firstDifference(a: Json, b: Json, path = '$'): string | null — คืน path แรกที่ต่างกัน เช่น "$.products[0].brand: \"Essence\" vs undefined" หรือ "$.products.length 3 vs 2" ถ้าเหมือนกันทั้งหมดคืน null ต้องรายงานทั้ง key ที่หายไปฝั่งใดฝั่งหนึ่งและค่าที่ต่างกัน
- async function load(base: string, path: string): Promise<{ status: number; body: Json }>
- loop ทุก REQUESTS ด้วย top-level await: ยิงทั้งสองฝั่งพร้อมกันด้วย Promise.all ถ้า status ต่างกันรายงาน "status <remote> vs <local>", ถ้า status >= 400 เทียบเฉพาะ body.message, ไม่งั้นเทียบ normalize ของทั้งสอง body
  พิมพ์บรรทัดละ request ขึ้นต้นด้วย ✅ หรือ ❌ ตามด้วย path และ diff (ถ้ามี)
- จบด้วย process.exit(1) ถ้ามี ❌ อย่างน้อยหนึ่งรายการ ไม่งั้น exit 0
- ห้ามใช้ any ห้ามใช้ as ยกเว้น (await response.json()) as Json

ขอบเขต:
- ห้ามติดตั้ง dependency ใหม่
- ห้ามแก้ไฟล์ใน src/
- ห้ามรัน script ให้ผมรันเอง
- ยังไม่ต้องเพิ่ม model ของคำสั่งซื้อ
```

Review: no `import` lines; eight requests in order; keys sorted in `normalize`; host replaced in strings; missing-key detection on both sides; error path compares `message` only; exit code. AI มักพลาดตรงนี้: uses `JSON.stringify(a) === JSON.stringify(b)` (no path on failure) or `import fetch from 'node-fetch'`. Reference: `scripts/contract-check.ts` at tag `lesson-15`. Verification: `npm run contract:check` → eight ✅ and exit 0; break something on purpose (change the mapper's last line to `thumbnail: product.thumbnail + '-broken',` — a rename would be a TypeScript error and watch mode would not restart) → ❌ on every product-bearing request with `$.thumbnail: "…thumbnail.webp" vs "…thumbnail.webp-broken"`; restore the file from the last commit; commit `feat: contract check script`.

- [ ] **Step 7: Nav chain and commit**

09→10→…→15→16. Commit `content(week10): lessons 10-15`.

---

### Task 16: Lessons 16–19 (Orders)

**Files:** `16_modeling-orders.html`, `17_validating-the-cart-payload.html`, `18_creating-orders-in-a-transaction.html`, `19_post-carts-add.html`

- [ ] **Step 1: Lesson 16 — ออกแบบ Model ของคำสั่งซื้อ**

Concept: what the React checkout sends (`userId`, `products[{id,quantity}]`, `address{address,email,phone}`) and what dummyjson answers (show `cart-add.txt`); `Order` 1-n `OrderItem`; **snapshot columns** (`title`, `price`, `discountPercentage`, `thumbnail` copied into the item at order time — a price change tomorrow must not rewrite yesterday's receipt); computed totals stored, not recomputed; `onDelete: Cascade` on `order` but not on `product` (never lose a receipt because a product was deleted); why the seed must delete orders first now (FK from `OrderItem` to `Product`).

Prompt:

```
เพิ่ม Prisma model ของ Order และ OrderItem และอัปเดต seed ให้ล้างคำสั่งซื้อก่อนล้างสินค้า

บริบท: @prisma/schema.prisma @prisma/seed.ts @docs/contract/cart-add.txt @.cursor/rules/project.mdc
docs/contract/cart-add.txt คือ response จริงของ POST https://dummyjson.com/carts/add (status 201):
  { id, products: [{ id, title, price, quantity, total, discountPercentage, discountedPrice, thumbnail }], total, discountedTotal, userId, totalProducts, totalQuantity }
React app ส่ง body { userId, products: [{ id, quantity }], address: { address, email, phone } } — เราจะเก็บ address ไว้ที่ Order ด้วย
schema มี Category, Product, Review แล้ว seed.ts ลบข้อมูลตามลำดับ review, product, category ใน transaction
เมื่อมี OrderItem อ้างถึง Product แล้ว seed จะลบ product ไม่ได้ถ้ายังมีคำสั่งซื้อค้างอยู่

โครงสร้าง: แก้ไฟล์ตามนี้ ไม่มากไม่น้อยกว่านี้
- prisma/schema.prisma (แก้ไข: เพิ่มสอง model ต่อท้าย และเพิ่ม relation ฝั่ง Product)
- prisma/seed.ts (แก้ไข: เพิ่มการลบ orderItem และ order)

ข้อกำหนดทางเทคนิค:
- model Order: id Int @id @default(autoincrement()), userId Int, address String, email String, phone String,
  total Float, discountedTotal Float, totalProducts Int, totalQuantity Int, createdAt DateTime @default(now()), items OrderItem[]
- model OrderItem: id Int @id @default(autoincrement()), orderId Int, order Order @relation(fields: [orderId], references: [id], onDelete: Cascade),
  productId Int, product Product @relation(fields: [productId], references: [id]), title String, thumbnail String,
  price Float, discountPercentage Float, quantity Int, total Float, discountedPrice Float และ @@index([orderId]) @@index([productId])
- Product เพิ่ม field orderItems OrderItem[] ต่อท้าย
- ราคาและชื่อสินค้าถูกคัดลอกลง OrderItem ตอนสั่งซื้อ (snapshot) เพราะสินค้าอาจเปลี่ยนราคาภายหลัง ห้ามตัด field เหล่านี้ออก
- seed.ts: ใน transaction ก่อน tx.review.deleteMany() เพิ่ม await tx.orderItem.deleteMany() แล้ว await tx.order.deleteMany() ตามลำดับ ห้ามแก้ส่วนอื่น

ขอบเขต:
- ห้ามแก้ไฟล์ใน src/
- ห้ามรัน migrate หรือ generate ให้ผมรันเอง
- ยังไม่ต้องสร้าง DTO, service หรือ controller ของคำสั่งซื้อ
```

Review: both models with the exact fields; `onDelete: Cascade` only on `order`; two `@@index`; `Product.orderItems`; seed deletes `orderItem` then `order` first. AI มักพลาดตรงนี้: puts `onDelete: Cascade` on the `product` relation too, or adds `@updatedAt`. Reference: schema + seed at tag `lesson-16`. Hand steps: `npx prisma migrate dev --name add-orders`, `npx prisma generate`, `npm run db:seed`. Verification: `\dt` lists `Order`, `OrderItem`; seed prints the same counts; commit `feat: order schema`.

- [ ] **Step 2: Lesson 17 — Validate Payload ของ POST /carts/add**

Concept: recap Week_09 lessons 15–17 (DTO classes, whitelist); nested validation needs `@ValidateNested` + `@Type(() => Class)` because JSON gives plain objects and class-validator only validates class instances; `{ each: true }` for arrays, `@ArrayMinSize(1)` (an empty cart must not become an order); mirror the React zod schema (show `checkoutAddressSchema` from the React app: address min 1, email, phone min 1) — the API re-validates because the client is not trusted; Nest's 400 body (`message: string[]`) vs dummyjson's `{ message }` — accepted deviation (the React `ApiError` reads `data.message` either way).

Prompt:

```
สร้าง DTO สำหรับ validate body ของ POST /carts/add ตามที่ React app ส่งมา

บริบท: @src/products/dto/pagination-query.dto.ts @src/main.ts @docs/contract/cart-add.txt @.cursor/rules/project.mdc
ValidationPipe แบบ global เปิด whitelist และ transform อยู่แล้ว (ดูใน main.ts)
React app ส่ง body รูปนี้เสมอ:
  { "userId": 1, "products": [{ "id": 1, "quantity": 2 }], "address": { "address": "...", "email": "...", "phone": "..." } }
address ฝั่ง React ถูก validate ด้วย zod: address ต้องไม่ว่าง, email ต้องเป็นอีเมล, phone ต้องไม่ว่าง — ฝั่ง API ต้องตรวจซ้ำ
dummyjson ตอบ 400 { "message": "User id is required" } เมื่อไม่มี userId ของเราให้ ValidationPipe ตอบ 400 ตามรูปแบบมาตรฐานของ Nest ได้เลย

โครงสร้าง: สร้างไฟล์เดียว
- src/orders/dto/add-cart.dto.ts (สร้างใหม่)

ข้อกำหนดทางเทคนิค:
- export class สามตัวในไฟล์เดียว เรียงตามลำดับนี้
  CartProductDto: @IsInt() @Min(1) id: number และ @IsInt() @Min(1) quantity: number
  AddressDto: @IsString() @IsNotEmpty() address: string, @IsEmail() email: string, @IsString() @IsNotEmpty() phone: string
  AddCartDto: @IsInt() @Min(1) userId: number,
    @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => CartProductDto) products: CartProductDto[],
    @ValidateNested() @Type(() => AddressDto) address: AddressDto
- @Type มาจาก class-transformer ที่เหลือมาจาก class-validator
- ไม่มี field ใดเป็น optional ไม่มี default
- ห้ามใช้ interface สำหรับ body เพราะ ValidationPipe ต้องการ class

ขอบเขต:
- ห้ามติดตั้ง dependency ใหม่
- ห้ามแก้ไฟล์อื่น
- ยังไม่ต้องสร้าง service, controller หรือ module ของ orders
```

Review: class order (nested classes declared before `AddCartDto` — `@Type(() => …)` would otherwise hit the TDZ); `@Type` on both nested fields; `@ArrayMinSize(1)`; `@IsEmail`; no optional. AI มักพลาดตรงนี้: forgets `@Type(() => AddressDto)` — validation then silently passes any object. Reference: file at tag `lesson-17`. Verification: `npm run build`; nothing to curl yet; commit `feat: add-cart dto`.

- [ ] **Step 3: Lesson 18 — สร้างคำสั่งซื้อใน Transaction**

Concept: the arithmetic from `cart-add.txt` (`.comparison` table: field | formula | example with 2 × 9.99 at 10.48%); `round2` for money, `Math.round` to integer for `discountedPrice` because that is what dummyjson does; the interactive `$transaction(async (tx) => …)` (link Week_09 lesson 29): read products and insert the order in one snapshot, and a `NotFoundException` thrown inside rolls everything back; nested `create` for items (link Week_09 lesson 27); the mapper pattern again (`cart.mapper.ts`) — `products[].id` is the *product* id, not the item id; no stock decrement (dummyjson does not, and the React app re-reads stock from `/products/:id`).

Prompt:

```
สร้าง OrdersService ที่บันทึกคำสั่งซื้อใน transaction และคืน cart ตามรูปทรง dummyjson

บริบท: @prisma/schema.prisma @src/orders/dto/add-cart.dto.ts @src/products/products.service.ts @src/products/product.mapper.ts @src/products/dto/product-response.dto.ts @docs/contract/cart-add.txt @.cursor/rules/project.mdc
schema มี Order และ OrderItem แล้ว (migrate และ generate แล้ว)
docs/contract/cart-add.txt คือ response จริงของ POST /carts/add ด้วย body { userId: 1, products: [{ id: 1, quantity: 2 }] }:
  { "id": 209, "products": [{ "id": 1, "title": "Essence Mascara Lash Princess", "price": 9.99, "quantity": 2, "total": 19.98, "discountPercentage": 10.48, "discountedPrice": 18, "thumbnail": "..." }], "total": 19.98, "discountedTotal": 18, "userId": 1, "totalProducts": 1, "totalQuantity": 2 }
กติกาคำนวณ: total ของรายการ = price × quantity ปัดทศนิยม 2 ตำแหน่ง, discountedPrice = Math.round(total × (1 − discountPercentage / 100)) เป็นจำนวนเต็ม,
  total ของ cart = ผลรวม total ของทุกรายการปัด 2 ตำแหน่ง, discountedTotal = ผลรวม discountedPrice, totalProducts = จำนวนรายการ, totalQuantity = ผลรวม quantity
products.service.ts และ product.mapper.ts คือรูปแบบมาตรฐานของ service และ mapper ในโปรเจกต์นี้ ให้ทำตาม
สินค้าที่ id ไม่มีจริงต้องได้ 404 ข้อความ Product with id '<id>' not found แบบเดียวกับ ProductsService

โครงสร้าง: สร้างไฟล์ตามนี้ ไม่มากไม่น้อยกว่านี้
- src/orders/dto/cart-response.dto.ts (สร้างใหม่)
- src/orders/cart.mapper.ts (สร้างใหม่)
- src/orders/orders.service.ts (สร้างใหม่)

ข้อกำหนดทางเทคนิค:
- cart-response.dto.ts: export class CartProductResponseDto { id, title, price, quantity, total, discountPercentage, discountedPrice, thumbnail } (type ตาม contract) และ
  export class CartResponseDto { id: number; products: CartProductResponseDto[]; total: number; discountedTotal: number; userId: number; totalProducts: number; totalQuantity: number }
  ไม่มี decorator ไม่มี method
- cart.mapper.ts: import type { Order, OrderItem } from '../generated/prisma/client.js'
  export type OrderWithItems = Order & { items: OrderItem[] }
  export function toCartResponse(order: OrderWithItems): CartResponseDto โดย products[].id คือ item.productId (ไม่ใช่ id ของ OrderItem) และไม่ส่ง address, email, phone, createdAt ออกไป
- orders.service.ts: @Injectable() export class OrdersService constructor(private readonly prisma: PrismaService)
  function round2(value: number): number คืน Math.round(value * 100) / 100 ประกาศระดับไฟล์นอก class
  async create(dto: AddCartDto): Promise<CartResponseDto> ทำงานทั้งหมดใน this.prisma.$transaction(async (tx) => { ... }) แล้วคืน toCartResponse(order)
  ข้างใน transaction: tx.product.findMany({ where: { id: { in: ids } } }) → สร้าง Map จาก id ไป product →
  map dto.products ตามลำดับที่ส่งมา ถ้าไม่พบ throw new NotFoundException(`Product with id '${id}' not found`) ไม่งั้นสร้าง item { productId, title, thumbnail, price, discountPercentage, quantity, total, discountedPrice } ตามกติกาคำนวณ →
  return tx.order.create({ data: { userId, address: dto.address.address, email, phone, total, discountedTotal, totalProducts, totalQuantity, items: { create: items } }, include: { items: { orderBy: { id: 'asc' } } } })
- ห้ามแก้ stock ของสินค้า ห้ามใช้ any ห้ามใช้ as

ขอบเขต:
- ห้ามติดตั้ง dependency ใหม่
- ห้ามแก้ไฟล์อื่นนอกจากที่ระบุ
- ยังไม่ต้องสร้าง controller หรือ module
```

Review: interactive transaction wrapping both the read and the create; `Map` lookup preserving request order; `round2` for totals, `Math.round` for `discountedPrice`; nested `items: { create }` with `include` + `orderBy`; mapper uses `item.productId`. AI มักพลาดตรงนี้: computes `discountedPrice` with two decimals (dummyjson rounds to an integer — 18, not 17.89) or fetches products outside the transaction. Reference: three files at tag `lesson-18`. Verification: `npm run build && npm run lint`; commit `feat: orders service`.

- [ ] **Step 4: Lesson 19 — POST /carts/add**

Concept: the path is dictated by the client (`/carts/add`, not `/orders`) — the file is `carts.controller.ts`, the module and service are `orders` because that is the domain; recap Week_09 lessons 08/09 (`@Body`, POST → 201 by default); the four responses to demonstrate (201, 400 missing userId, 404 unknown product with rollback, 400 bad email).

Prompt:

```
สร้าง CartsController ที่เปิด POST /carts/add และลงทะเบียน OrdersModule

บริบท: @src/orders/orders.service.ts @src/orders/dto/add-cart.dto.ts @src/products/products.controller.ts @src/products/products.module.ts @src/app.module.ts @.cursor/rules/project.mdc
React app เรียก POST /carts/add (path นี้ต้องตรงตัว เพราะเราแทนที่ dummyjson โดยไม่แก้ฝั่ง frontend) และคาดหวัง status 201
OrdersService.create(dto: AddCartDto) คืน Promise<CartResponseDto> แล้ว
products.controller.ts และ products.module.ts คือรูปแบบมาตรฐานของ controller และ module ในโปรเจกต์นี้

โครงสร้าง: สร้าง/แก้ไฟล์ตามนี้ ไม่มากไม่น้อยกว่านี้
- src/orders/carts.controller.ts (สร้างใหม่)
- src/orders/orders.module.ts (สร้างใหม่)
- src/app.module.ts (แก้ไข: เพิ่ม OrdersModule ต่อจาก ProductsModule)

ข้อกำหนดทางเทคนิค:
- carts.controller.ts: @Controller('carts') export class CartsController constructor(private readonly ordersService: OrdersService)
  handler @Post('add') create(@Body() dto: AddCartDto) return this.ordersService.create(dto)
  ไม่ต้องใส่ @HttpCode เพราะ POST ของ Nest ตอบ 201 อยู่แล้ว
- orders.module.ts: @Module({ controllers: [CartsController], providers: [OrdersService] })
- ชื่อไฟล์ controller คือ carts.controller.ts (ตาม path) แต่ module และ service ใช้คำว่า orders (ตาม domain)

ขอบเขต:
- ห้ามติดตั้ง dependency ใหม่
- ห้ามแก้ไฟล์อื่นนอกจากที่ระบุ
- ยังไม่ต้องเปิด CORS
```

Review: `@Controller('carts')` + `@Post('add')`; `@Body() dto: AddCartDto` (typed, so the pipe validates); no `@HttpCode(200)`; module registered. AI มักพลาดตรงนี้: names it `OrdersController` with `@Controller('orders')` (the React app would 404). Reference: files at tag `lesson-19`. Verification: the four curl cases from Task 9 Step 5 with their expected status lines, the psql `SELECT … FROM "Order"` row, and the rollback proof (order count unchanged after the 404 case); commit `feat: POST /carts/add`.

- [ ] **Step 5: Nav chain and commit**

15→16→17→18→19→20. Commit `content(week10): lessons 16-19`.

---

### Task 17: Lessons 20–24 (เชื่อมกับ React app)

**Files:** `20_enabling-cors-and-port-config.html`, `21_adding-swagger.html`, `22_documenting-dtos-and-responses.html`, `23_switching-the-react-app.html`, `24_wrap-up.html`

- [ ] **Step 1: Lesson 20 — เปิด CORS และตั้งค่า PORT**

Concept: what CORS is in two paragraphs (browser-enforced, preflight `OPTIONS`, `Access-Control-Allow-Origin`); `curl` never hits it, the React app at `:5173` does; allow exactly the Vite origin from `CORS_ORIGIN`, not `*`; `PORT` already read in the scaffold's `main.ts`. Show the two `curl -H 'Origin: …'` checks.

Prompt:

```
เปิด CORS ให้ React app ที่ localhost:5173 เรียก API ได้ โดยอ่าน origin จาก environment

บริบท: @src/main.ts @.env @.cursor/rules/project.mdc
.env มี PORT=3000 และ CORS_ORIGIN=http://localhost:5173 อยู่แล้ว และ ConfigModule.forRoot({ isGlobal: true }) โหลด .env เข้า process.env ตอน AppModule ถูก import
React app รันด้วย Vite ที่ http://localhost:5173 และเรียก API ด้วย axios แบบไม่ส่ง cookie
main.ts ตอนนี้มี ValidationPipe แบบ global และ app.listen(process.env.PORT ?? 3000) อยู่แล้ว

โครงสร้าง: แก้ไฟล์เดียว
- src/main.ts (แก้ไข)

ข้อกำหนดทางเทคนิค:
- หลัง useGlobalPipes เพิ่ม app.enableCors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' })
- ห้ามใช้ origin: '*' หรือ origin: true
- ห้ามเปิด credentials
- คง ValidationPipe และ app.listen ไว้ตามเดิม

ขอบเขต:
- ห้ามติดตั้ง dependency ใหม่
- ห้ามแก้ไฟล์อื่น
- ยังไม่ต้องตั้งค่า Swagger
```

Review: `enableCors` with the env origin; no wildcard; no `credentials: true`. AI มักพลาดตรงนี้: `app.enableCors()` with no options (= `*`). Reference: `main.ts` at tag `lesson-20`. Verification: the two `curl -H 'Origin: …' | grep -i access-control-allow-origin` checks — both answer `Access-Control-Allow-Origin: http://localhost:5173`; the point to teach is that the header never says `http://evil.test`, and the browser, not the server, blocks the mismatch; commit `feat: cors`.

- [ ] **Step 2: Lesson 21 — เพิ่มเอกสาร API ด้วย Swagger**

Concept: recap Week_09 lessons 59–60 (`DocumentBuilder`, `SwaggerModule.setup`, CLI plugin reads `.dto.ts` classes so field types appear without decorators); hand step `npm install @nestjs/swagger` (record the version); what `/api-json` is and how to read `paths` and `components.schemas`.

Prompt:

```
ตั้งค่า Swagger UI ที่ /api และเปิดใช้ CLI plugin ของ @nestjs/swagger

บริบท: @src/main.ts @nest-cli.json @package.json @.cursor/rules/project.mdc
ติดตั้ง @nestjs/swagger แล้ว
main.ts มี ValidationPipe, enableCors และ app.listen อยู่แล้ว
DTO ทุกไฟล์ในโปรเจกต์ลงท้าย .dto.ts ซึ่งตรงกับค่าเริ่มต้นของ plugin

โครงสร้าง: แก้ไฟล์ตามนี้ ไม่มากไม่น้อยกว่านี้
- src/main.ts (แก้ไข)
- nest-cli.json (แก้ไข)

ข้อกำหนดทางเทคนิค:
- main.ts: import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
  หลัง enableCors และก่อน app.listen สร้าง config ด้วย new DocumentBuilder().setTitle('E-commerce API').setDescription('Drop-in replacement for dummyjson.com used by the React e-commerce app').setVersion('1.0').build()
  แล้ว SwaggerModule.setup('api', app, SwaggerModule.createDocument(app, config))
- nest-cli.json: ใน compilerOptions เพิ่ม "plugins": ["@nestjs/swagger/plugin"] คงค่าอื่นไว้ทั้งหมด

ขอบเขต:
- ห้ามติดตั้ง dependency ใหม่
- ห้ามแก้ไฟล์อื่น ห้ามใส่ decorator ของ swagger ใน controller หรือ DTO ในรอบนี้
```

Review: setup before `listen`; plugin in `compilerOptions.plugins`; no decorators added yet. AI มักพลาดตรงนี้: puts `plugins` at the top level of `nest-cli.json` instead of under `compilerOptions`. Reference: `main.ts` + `nest-cli.json` at tag `lesson-21`. Verification: `/api` → 200 and shows five routes; `/api-json` `components.schemas` lists `AddCartDto`, `CartProductDto`, `AddressDto`, and `/products` shows `skip`/`limit` as query `parameters` (query DTOs are expanded, not published as schemas) (the node one-liner from Task 10 Step 2); restart `start:dev` was required for the plugin to take effect; commit `feat: swagger`.

- [ ] **Step 3: Lesson 22 — ตกแต่ง DTO และ Response ให้เอกสารครบ**

Concept: recap Week_09 lessons 61–63; response classes only appear in the document when a handler references them (`@ApiOkResponse({ type })`), which is why lesson 11 made them classes; `@ApiPropertyOptional` for `brand`; `@ApiTags` groups; `[Type]` for arrays.

Prompt:

```
ตกแต่ง controller และ DTO ด้วย decorator ของ @nestjs/swagger ให้เอกสารที่ /api บอก response ของทุก endpoint

บริบท: @src/products/products.controller.ts @src/orders/carts.controller.ts @src/products/dto/product-response.dto.ts @src/orders/dto/cart-response.dto.ts @src/orders/dto/add-cart.dto.ts @src/products/dto/pagination-query.dto.ts @.cursor/rules/project.mdc
Swagger ตั้งค่าที่ /api แล้ว และ CLI plugin เปิดอยู่ (plugin อ่าน type ของ field ใน class ที่ลงท้าย .dto.ts ให้เอง จึงไม่ต้องใส่ @ApiProperty ทุกบรรทัด)
ตอนนี้ /api แสดง endpoint ครบแต่ไม่มี response schema และไม่มี tag

โครงสร้าง: แก้ไฟล์ตามนี้ ไม่มากไม่น้อยกว่านี้
- src/products/products.controller.ts (แก้ไข)
- src/orders/carts.controller.ts (แก้ไข)
- src/products/dto/product-response.dto.ts (แก้ไข)
- src/orders/dto/add-cart.dto.ts (แก้ไข)

ข้อกำหนดทางเทคนิค:
- products.controller.ts: @ApiTags('products') บน class
  findCategories: @ApiOkResponse({ type: [CategoryResponseDto] })
  findByCategory และ findAll: @ApiOkResponse({ type: ProductListResponseDto })
  findOne: @ApiOkResponse({ type: ProductResponseDto }) และ @ApiNotFoundResponse({ description: "Product with id '9999' not found" })
- carts.controller.ts: @ApiTags('carts') บน class, create: @ApiCreatedResponse({ type: CartResponseDto }) และ @ApiBadRequestResponse({ description: 'Validation failed' })
- product-response.dto.ts: ใส่ @ApiPropertyOptional() ให้ brand ตัวเดียว (plugin จัดการ field อื่นให้)
- add-cart.dto.ts: ใส่ @ApiProperty({ example: 1 }) ให้ userId, @ApiProperty({ type: [CartProductDto] }) ให้ products และ @ApiProperty({ type: AddressDto }) ให้ address
- ห้ามแก้ logic ใด ๆ ใน controller ห้ามเปลี่ยนลำดับ handler

ขอบเขต:
- ห้ามติดตั้ง dependency ใหม่
- ห้ามแก้ไฟล์อื่น ห้ามแตะ service, mapper หรือ main.ts
```

Review: decorators exactly as listed; handler order unchanged; `brand` optional in the schema. AI มักพลาดตรงนี้: adds `@ApiProperty()` to every field of every DTO (noise) or reorders handlers. Reference: four files at tag `lesson-22`. Verification: the `/api-json` one-liner from Task 10 Step 3 (`ProductResponseDto` ref on `/products/{id}` 200, `brand` not required); `npm run contract:check` still green; commit `feat: swagger decorations`.

- [ ] **Step 4: Lesson 23 — สลับ React app มาใช้ API ของเรา** (✍️)

Concept: the moment of truth; one line changes (`.env.local` in the React project: `VITE_API_BASE_URL=http://localhost:3000`); Vite reads `.env.local` at startup so restart `npm run dev`; the five checks from Task 11 Step 2 as an ordered list (routes `/`, `/categories`, `/products/1`, `/cart`, `/checkout`, `/order/success`; use Groceries for pagination since Beauty has only 5 products) with what to look for in the Network tab (host `localhost:3000`, status codes) and the psql query for the placed order; then `npm test` in the React project gives the same result as before the switch because `vite.config.ts` pins the test base URL to dummyjson and MSW intercepts it (show the `test.env` line) — the API cannot change the outcome. `.note`: on Node 26 the suite currently fails with `ExperimentalWarning: localStorage is not available` before AND after the switch; that is a Node/jsdom incompatibility, not the API — run it once before switching to see the baseline. `.note`: to go back to dummyjson, restore the line. Verification: all five checks pass; `SELECT … FROM "Order"` shows the order; `npm test` result unchanged from the baseline run.

- [ ] **Step 5: Lesson 24 — สรุปและก้าวต่อไป**

Sections: `สิ่งที่คุณสร้าง` (the final tree, five endpoints, contract check, Swagger, React app running on it); `สิ่งที่คุณควรอธิบายได้ตอนนี้` — a checklist of ten questions (why `Float`; why product ids are not autoincrement; what `whitelist` drops; why `categories` is declared before `:id`; why `limit=0` → `take: undefined`; why the mapper omits `brand`; what a `$transaction` callback rolls back; why `/carts/add` and not `/orders`; what `enableCors` origin protects; why response DTOs are classes); `ก้าวต่อไป` — auth with guards (Week_09 lesson 52), e2e tests with Vitest (Week_09 lessons 67–69), `migrate deploy` + hosting (Week_08 lesson 18 Neon), stock decrement inside the order transaction, replacing the seed's live fetch with a committed JSON. No workshop; closing paragraph repeats the governing rule.

- [ ] **Step 6: Nav chain and commit**

19→20→21→22→23→24 (24 has no next). Commit `content(week10): lessons 20-24`.

---

### Task 18: Verification pass, spot checks, finish

**Files:** all of `Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content/`

- [ ] **Step 1: Inventory and nav chain**

```bash
cd "$WT/Week_10/02_nestjs_ecommerce_api_with_cursor_v2/content"
ls | wc -l                                            # 26
ls [0-9][0-9]_*.html | wc -l                          # 24
for f in [0-9][0-9]_*.html; do n=${f%%_*}; grep -q "บทที่ $((10#$n)) จาก 24" "$f" || echo "eyebrow wrong: $f"; done
python3 - <<'EOF'
import re,glob,os
files=sorted(glob.glob('[0-9][0-9]_*.html'))
for i,f in enumerate(files):
    s=open(f,encoding='utf-8').read()
    prev=re.search(r'href="([^"]+)" rel="prev"',s); nxt=re.search(r'href="([^"]+)" rel="next"',s)
    if i>0 and (not prev or prev.group(1)!=files[i-1]): print('bad prev',f,prev and prev.group(1))
    if i<len(files)-1 and (not nxt or nxt.group(1)!=files[i+1]): print('bad next',f,nxt and nxt.group(1))
    if i==0 and prev: print('01 must not have prev')
    if i==len(files)-1 and nxt: print('24 must not have next')
    for href in re.findall(r'href="(\d\d_[^"]+)"',s):
        if not os.path.exists(href): print('dangling',f,href)
idx=open('index.html',encoding='utf-8').read()
for f in files:
    if f not in idx: print('missing in index',f)
print('nav check done')
EOF
```

Expected: 26 files, 24 lessons, no lines except `nav check done`.

- [ ] **Step 2: Prompt `@`-mention and escaping audit**

```bash
python3 - <<'EOF'
import re,glob,subprocess
repo="$SCRATCH/verify/ecommerce-api"   # replace with the real path
for f in sorted(glob.glob('[0-9][0-9]_*.html')):
    n=int(f[:2]); s=open(f,encoding='utf-8').read()
    for block in re.findall(r'<div class="cursor-prompt"><code>(.*?)</code></div>',s,re.S):
        if '<' in block.replace('&lt;','').replace('&gt;','').replace('&amp;',''): print('unescaped < in prompt',f)
        for m in re.findall(r'@([\w./-]+)',block):
            tag=f'lesson-{n-1:02d}' if n>1 else 'lesson-02'
            r=subprocess.run(['git','-C',repo,'ls-tree','-r','--name-only',tag],capture_output=True,text=True).stdout.split('\n')
            if not any(p==m or p.startswith(m.rstrip('/')+'/') for p in r) and m not in ('.env','.cursor/rules/project.mdc'):
                print(f'{f}: @{m} does not exist at {tag}')
    for pre in re.findall(r'<pre><code>(.*?)</code></pre>',s,re.S):
        if re.search(r'<(?!/?code>)',pre): print('unescaped < in pre',f)
print('prompt audit done')
EOF
```

Expected: only `prompt audit done` (`.env` is gitignored, so it is whitelisted; every other `@`-mention must exist at the previous lesson's tag).

- [ ] **Step 3: Spot-check three pages visually**

Open `index.html`, `13_get-products-with-pagination.html`, `23_switching-the-react-app.html` in the browser: `.cursor-prompt` shows the blue label and wraps long lines; `.review` shows the purple label with ✅ bullets; tables scroll horizontally at 400px width; Thai text has no stray English placeholders (`grep -il "TODO\|TBD\|lorem" *.html` prints nothing).

- [ ] **Step 4: Re-run the reference project end to end from a clean database**

```bash
cd "$SCRATCH/verify/ecommerce-api"
docker compose down -v && docker compose up -d && sleep 5
npx prisma migrate deploy && npx prisma generate && npm run db:seed
npm run build && npm run lint
(npm run start:dev &) ; sleep 8
npm run contract:check
curl -s -o /dev/null -w '%{http_code}\n' -X POST http://localhost:3000/carts/add -H 'Content-Type: application/json' -d '{"userId":1,"products":[{"id":1,"quantity":2}],"address":{"address":"1 Sukhumvit Rd","email":"a@b.com","phone":"0812345678"}}'
```

Expected: seed counts `24/194/582`, eight ✅, `201`. If anything differs from what a lesson states, fix the lesson (the project is the truth). Stop the API, `docker compose down`.

- [ ] **Step 5: Update memory and finish the branch**

Add a `project` memory `week10-nestjs-ecommerce-api-course` (spec/plan paths, reference project location and tag scheme, the versions observed, the two accepted deviations most likely to bite) and link it from `MEMORY.md`. Commit any lesson fixes as `content(week10): verification fixes`. Then use `superpowers:finishing-a-development-branch` to merge `week10-nestjs-ecommerce-api-course` into `main` (the branch contains only the spec/plan and `Week_10/…/content/`; the user's uncommitted Week_09 changes in the main checkout are untouched).
