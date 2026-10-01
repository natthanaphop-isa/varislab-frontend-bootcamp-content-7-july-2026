# NestJS Companion Repository Synchronization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a verified 58-branch companion repository in which every `lesson-NN` branch contains the completed code state for the matching current Week 09 lesson.

**Architecture:** Reconstruct the changed SQL lineage from the clean pre-namespace state, reusing exact diffs from the old lesson commits but committing them under the new lesson boundaries. Build the MongoDB lineage from `end-of-chapter-2`, validate every branch against the HTML source of truth, then publish with lease-protected updates and delete obsolete branches only after remote verification.

**Tech Stack:** Git · GitHub SSH remote · Node.js · npm · NestJS 12 · TypeScript 6 · Vitest 4 · Prisma 7/PostgreSQL · Mongoose/MongoDB · Docker Compose

**Spec:** `docs/superpowers/specs/2026-09-17-nestjs-companion-repo-sync-design.md`

## Global Constraints

- `Week_09/01_nestjs_basic/content` is the source of truth and contains exactly 58 numbered lessons.
- A lesson branch represents the application after completing that lesson; a no-code lesson may share a tree or commit with its predecessor.
- `lesson-01` through `lesson-32` retain their existing remote code states.
- The removed configuration namespace and partial-registration implementation must not occur in target `lesson-36` through `lesson-50`.
- `main` and `lesson-50` must resolve to identical trees.
- `lesson-51` begins from the source-code state of `end-of-chapter-2`; `lesson-52` through `lesson-58` form the MongoDB sequence.
- Keep `end-of-chapter-2` and delete remote `lesson-59` through `lesson-67` only after all target refs pass remote verification.
- Never modify `../workshop-content/Nestjs_basic_v1`.
- Never overwrite an unexpected concurrent remote update; every forced ref update uses `--force-with-lease=<ref>:<recorded-old-oid>`.
- The historical repository tracks `tsconfig.build.tsbuildinfo`; after each build, record the result and restore that generated file to the branch's committed version before switching branches. Any other tracked build-time change must be investigated rather than discarded.

## File Structure

### Course repository

- Create: `docs/superpowers/reports/2026-09-17-nestjs-companion-repo-sync.md` — records pre-sync refs, lesson mapping, per-branch checks, tests, and final remote refs.
- Existing source of truth: `Week_09/01_nestjs_basic/content/01_*.html` through `58_*.html` — read-only unless the audit finds a real contradiction and the user separately approves changing course content.

### Companion repository working clone

- Modify on rebuilt SQL branches: `.gitignore`, `package.json`, `package-lock.json`, `src/app.module.ts`, `src/main.ts`, and the lesson-specific files listed in Tasks 3–5.
- Modify on `lesson-33` and `lesson-51`: `README.md` — current 58-lesson branch map.
- Modify on rebuilt MongoDB branches: `docker-compose.yml`, `package.json`, `package-lock.json`, `src/app.module.ts`, `src/coffees/**`, `src/common/dto/pagination-query.dto.ts`, and `src/events/entities/event.entity.ts` as introduced by Tasks 6–7.
- Do not commit helper scripts, dependency directories, generated `dist/`, coverage output, `.env`, or audit scratch files to the companion repository.

---

### Task 1: Create an isolated synchronization workspace and freeze the old refs

**Files:**
- Create: `/private/tmp/nestjs-companion-sync-20260917/pre-sync-refs.txt`
- Create: `/private/tmp/nestjs-companion-sync-20260917/repo/` (isolated clone)
- Create: `docs/superpowers/reports/2026-09-17-nestjs-companion-repo-sync.md`

**Interfaces:**
- Produces: immutable `pre-sync-refs.txt` entries in `<oid> refs/heads/<name>` format, consumed by Tasks 8–9 for lease-protected pushes and final comparison.
- Produces: a clean clone whose `origin/*` refs remain the old source states until publication.

- [ ] **Step 1: Load the isolation instructions**

Read `superpowers:using-git-worktrees` before creating the implementation workspace. Because the target is a separate repository rather than the current course repository, use the fresh clone below as the isolated workspace and do not attach it to the course repository's worktree list.

- [ ] **Step 2: Create the fixed workspace and clone the companion repository**

```bash
mkdir -p /private/tmp/nestjs-companion-sync-20260917
git clone git@github-variden:VaridenTech/varislab-intro-to-nestjs-v1.git /private/tmp/nestjs-companion-sync-20260917/repo
cd /private/tmp/nestjs-companion-sync-20260917/repo
git status --short
git remote -v
```

Expected: clean status and both `origin` URLs equal the requested SSH URL.

- [ ] **Step 3: Record the exact remote state before mutation**

```bash
git ls-remote --heads origin | sort -k2 > /private/tmp/nestjs-companion-sync-20260917/pre-sync-refs.txt
wc -l /private/tmp/nestjs-companion-sync-20260917/pre-sync-refs.txt
```

Expected: 69 refs — `main`, `end-of-chapter-2`, and `lesson-01` through `lesson-67`.

- [ ] **Step 4: Verify the expected source OIDs**

```bash
git rev-parse origin/lesson-32 origin/lesson-34 origin/lesson-35 origin/lesson-37 origin/lesson-59 origin/end-of-chapter-2 origin/lesson-61 origin/lesson-67
```

Expected prefixes, in order: `f25e667`, `d99a48c`, `355016f`, `f49d5df`, `b070c42`, `c92dfb9`, `c4dd17a`, `4a4617b`. Stop before rebuilding if any differs, because the approved mapping was audited against those objects.

- [ ] **Step 5: Create the verification report header**

Create `docs/superpowers/reports/2026-09-17-nestjs-companion-repo-sync.md` in the course repository with this initial structure:

```markdown
# NestJS Companion Repository Sync Report

**Date:** 2026-09-17
**Remote:** `git@github-variden:VaridenTech/varislab-intro-to-nestjs-v1.git`
**Source of truth:** `Week_09/01_nestjs_basic/content`

## Pre-sync snapshot

- Remote branch count: 69
- Snapshot file: `/private/tmp/nestjs-companion-sync-20260917/pre-sync-refs.txt`

## Branch audit

| Branch | Lesson title | Source state | Content check | Build/test |
| --- | --- | --- | --- | --- |

## Repository-wide checks

## Published remote state
```

- [ ] **Step 6: Commit the report scaffold only**

```bash
cd /Users/varis/Sites/varis-lab/frontend-bootcamp-content-7-july-2026
git add docs/superpowers/reports/2026-09-17-nestjs-companion-repo-sync.md
git commit -m "docs: start NestJS companion sync report"
```

### Task 2: Audit unchanged lessons 01–32 before reusing them

**Files:**
- Read: `Week_09/01_nestjs_basic/content/01_*.html` through `32_*.html`
- Read: every tree at `origin/lesson-01` through `origin/lesson-32`
- Modify: `docs/superpowers/reports/2026-09-17-nestjs-companion-repo-sync.md`

**Interfaces:**
- Consumes: the frozen `origin/lesson-01` through `origin/lesson-32` refs.
- Produces: an approved unchanged prefix and 32 report rows; Task 3 starts from its verified `origin/lesson-32` tree.

- [ ] **Step 1: Verify the numbered lesson and branch sets**

```bash
cd /Users/varis/Sites/varis-lab/frontend-bootcamp-content-7-july-2026
find Week_09/01_nestjs_basic/content -maxdepth 1 -type f -name '[0-9][0-9]_*.html' -print | sort | sed -n '1,32p'
cd /private/tmp/nestjs-companion-sync-20260917/repo
for n in $(seq -w 1 32); do git show-ref --verify --quiet "refs/remotes/origin/lesson-$n" || exit 1; done
```

Expected: HTML lessons `01`–`32` in order and all 32 remote refs present.

- [ ] **Step 2: Compare each lesson's cumulative instructions with its branch tree**

For each lesson, inspect its commands and code blocks, then run this loop to expose the complete tree and the delta from the previous lesson:

```bash
for n in $(seq -w 1 32); do
  ref="origin/lesson-$n"
  echo "===== $ref ====="
  git ls-tree -r --name-only "$ref"
  if [ "$n" != "01" ]; then
    p=$(printf '%02d' "$((10#$n - 1))")
    git diff --stat "origin/lesson-$p" "$ref"
    git diff "origin/lesson-$p" "$ref" -- package.json package-lock.json src test prisma docker-compose.yml
  fi
done
```

Confirm that the changed files are exactly the files the HTML creates or edits and that code identifiers, routes, DTO rules, Prisma models, and commands agree. Record the actual source commit and `PASS`/failure reason in the report for every row.

- [ ] **Step 3: Check that the course fork point is exact**

```bash
git rev-parse origin/lesson-18^{tree} origin/end-of-chapter-2^{tree}
```

Expected: the two tree OIDs are identical.

- [ ] **Step 4: Build every distinct unchanged snapshot**

Switch through lessons 01–32, skipping only refs whose tree OID was already built. Keep ignored dependencies between switches; whenever `package-lock.json` changes, run `npm ci`. For each distinct tree that has a `build` script, run:

```bash
npm run build
npm run lint
git status --short
git restore tsconfig.build.tsbuildinfo
```

Record each command and exit status in the report. The status check may show only `tsconfig.build.tsbuildinfo` before it is restored; any other tracked change is a failure. Remove all ignored build output with `git clean -fdX` only after the final branch in this task; never use it outside this isolated clone. Any failure blocks reuse of that branch and must be reconciled against the matching lesson before Task 3.

- [ ] **Step 5: Commit the completed 01–32 audit rows**

```bash
cd /Users/varis/Sites/varis-lab/frontend-bootcamp-content-7-july-2026
git add docs/superpowers/reports/2026-09-17-nestjs-companion-repo-sync.md
git commit -m "docs: audit NestJS lessons 01 through 32"
```

### Task 3: Rebuild configuration lessons 33–35 without namespaces

**Files:**
- Modify: `README.md`
- Modify: `.gitignore`, `package.json`, `package-lock.json`, `src/app.module.ts`, `src/main.ts`
- Modify: `src/coffees/coffees.module.ts`, `src/coffees/coffees.service.ts`
- Create: `src/config/app.config.ts`
- Must not create: `src/coffees/coffees.config.ts`

**Interfaces:**
- Consumes: verified `origin/lesson-32` and old source diffs ending at `origin/lesson-34`, `origin/lesson-35`, and `origin/lesson-37`.
- Produces: local target refs `lesson-33`, `lesson-34`, and `lesson-35`; `lesson-35` is the clean base for all later SQL lessons.

- [ ] **Step 1: Create the rebuild lineage at lesson 32**

```bash
cd /private/tmp/nestjs-companion-sync-20260917/repo
git switch -c rebuild/sql origin/lesson-32
```

- [ ] **Step 2: Apply the merged lesson-33 ConfigModule state**

```bash
git diff --binary origin/lesson-32 origin/lesson-34 -- . ':!README.md' | git apply --index --3way
```

Replace the README introduction and branch map with exactly:

````markdown
# iluvcoffee — NestJS Fundamentals Workshop (Thai)

Companion code for the [NestJS Fundamentals Thai workshop](https://github.com/VaridenTech/varislab-frontend-bootcamp-content-7-july-2026) (58 lessons). Every lesson has its own branch containing the completed code state for that lesson:

```bash
git switch lesson-NN   # for example: git switch lesson-24
npm install
npm run start:dev
```

**Branch map:**

- `lesson-01` … `lesson-18` — Chapters 1–2, from CLI setup through DTO auto-transformation, using in-memory CRUD.
- `end-of-chapter-2` — checkpoint for the completed lesson-18 source state and the starting point of the MongoDB path.
- `lesson-19` … `lesson-50` — PostgreSQL, Prisma, configuration, Nest building blocks, Swagger, Vitest, and e2e testing.
- `main` — identical to the completed SQL path at `lesson-50`.
- `lesson-51` … `lesson-58` — MongoDB/Mongoose path based on `end-of-chapter-2`.
````

Keep the existing Nest-generated README content below the horizontal rule. Then commit and create the target ref:

```bash
git add README.md .gitignore package.json package-lock.json src/app.module.ts src/main.ts
git commit -m "Lesson 33: Configure ConfigModule and environment files"
git branch -f lesson-33 HEAD
```

- [ ] **Step 3: Apply schema validation as lesson 34**

```bash
git diff --binary origin/lesson-34 origin/lesson-35 | git apply --index --3way
git commit -m "Lesson 34: Validate environment variables with Joi"
git branch -f lesson-34 HEAD
```

- [ ] **Step 4: Combine ConfigService and custom configuration as lesson 35**

```bash
git diff --binary origin/lesson-35 origin/lesson-37 | git apply --index --3way
git commit -m "Lesson 35: Use ConfigService and custom configuration"
git branch -f lesson-35 HEAD
```

- [ ] **Step 5: Prove the removed namespace did not enter the new history**

```bash
test ! -e src/coffees/coffees.config.ts
! rg -n "registerAs\(|forFeature\(|coffeesConfig|coffees\.foo" src
git diff --exit-code origin/lesson-37 -- package.json package-lock.json src ':!src/coffees/coffees.config.ts'
```

Expected: the absence checks pass. The final diff is empty because lesson 35 matches old lesson 37 for code and dependencies.

- [ ] **Step 6: Build and audit all three target states**

For each of `lesson-33`, `lesson-34`, and `lesson-35`, switch to the ref, run `npm ci` when the lockfile differs, then run:

```bash
npm run build
npm run lint
```

Compare the complete diff from the preceding target branch to the corresponding HTML lesson and add three report rows.

- [ ] **Step 7: Commit the configuration audit rows**

```bash
cd /Users/varis/Sites/varis-lab/frontend-bootcamp-content-7-july-2026
git add docs/superpowers/reports/2026-09-17-nestjs-companion-repo-sync.md
git commit -m "docs: audit rebuilt NestJS configuration lessons"
```

### Task 4: Rebuild building-block lessons 36–42

**Files:**
- Modify: `src/app.module.ts`, `src/main.ts`, `src/coffees/coffees.controller.ts`, `src/common/common.module.ts`
- Create: `src/common/filters/http-exception.filter.ts`
- Create: `src/common/guards/api-key.guard.ts`
- Create: `src/common/decorators/public.decorator.ts`, `src/common/decorators/protocol.decorator.ts`
- Create: `src/common/interceptors/wrap-response.interceptor.ts`, `src/common/interceptors/timeout.interceptor.ts`
- Create: `src/common/pipes/parse-int.pipe.ts`
- Create: `src/common/middleware/logging.middleware.ts`

**Interfaces:**
- Consumes: clean `lesson-35` and old per-feature diffs that do not contain namespace configuration.
- Produces: sequential local refs `lesson-36` through `lesson-42`.

- [ ] **Step 1: Return to the SQL rebuild tip**

```bash
cd /private/tmp/nestjs-companion-sync-20260917/repo
git switch rebuild/sql
test "$(git rev-parse HEAD)" = "$(git rev-parse lesson-35)"
```

- [ ] **Step 2: Apply and commit the seven exact lesson ranges**

Run the following ranges in order. For each row, apply the diff, inspect `git diff --cached`, commit with the listed message, and create the listed branch:

| Target | Old diff range | Commit message |
| --- | --- | --- |
| `lesson-36` | `origin/lesson-39..origin/lesson-40` | `Lesson 36: Explain request lifecycle and binding` |
| `lesson-37` | `origin/lesson-40..origin/lesson-41` | `Lesson 37: Catch exceptions with filters` |
| `lesson-38` | `origin/lesson-41..origin/lesson-43` | `Lesson 38: Add guards and public-route metadata` |
| `lesson-39` | `origin/lesson-43..origin/lesson-45` | `Lesson 39: Transform responses and handle timeouts` |
| `lesson-40` | `origin/lesson-45..origin/lesson-46` | `Lesson 40: Create a custom pipe` |
| `lesson-41` | `origin/lesson-46..origin/lesson-47` | `Lesson 41: Add request logging middleware` |
| `lesson-42` | `origin/lesson-47..origin/lesson-48` | `Lesson 42: Create a custom parameter decorator` |

Use this function and the seven exact calls below:

```bash
set -euo pipefail
apply_lesson() {
  git diff --binary "$1" "$2" | git apply --index --3way
  git diff --cached --check
  git commit -m "$4"
  git branch -f "$3" HEAD
}

apply_lesson origin/lesson-39 origin/lesson-40 lesson-36 "Lesson 36: Explain request lifecycle and binding"
apply_lesson origin/lesson-40 origin/lesson-41 lesson-37 "Lesson 37: Catch exceptions with filters"
apply_lesson origin/lesson-41 origin/lesson-43 lesson-38 "Lesson 38: Add guards and public-route metadata"
apply_lesson origin/lesson-43 origin/lesson-45 lesson-39 "Lesson 39: Transform responses and handle timeouts"
apply_lesson origin/lesson-45 origin/lesson-46 lesson-40 "Lesson 40: Create a custom pipe"
apply_lesson origin/lesson-46 origin/lesson-47 lesson-41 "Lesson 41: Add request logging middleware"
apply_lesson origin/lesson-47 origin/lesson-48 lesson-42 "Lesson 42: Create a custom parameter decorator"
```

- [ ] **Step 3: Verify namespace removal across the entire rebuilt range**

```bash
for n in $(seq -w 36 42); do
  git cat-file -e "lesson-$n:src/coffees/coffees.config.ts" 2>/dev/null && exit 1
  git grep -n -E 'registerAs\(|ConfigModule\.forFeature|coffeesConfig|coffees\.foo' "lesson-$n" -- src && exit 1 || true
done
```

Expected: exit status 0 and no matches.

- [ ] **Step 4: Build, lint, and audit every rebuilt target**

Switch through `lesson-36`–`lesson-42`, run `npm run build` and `npm run lint`, and compare each target diff with the matching HTML. Explicitly verify both halves of combined lessons 38 and 39 are present. Add seven report rows with the actual result.

- [ ] **Step 5: Commit the building-block audit rows**

```bash
cd /Users/varis/Sites/varis-lab/frontend-bootcamp-content-7-july-2026
git add docs/superpowers/reports/2026-09-17-nestjs-companion-repo-sync.md
git commit -m "docs: audit rebuilt NestJS building-block lessons"
```

### Task 5: Rebuild Swagger and testing lessons 43–50

**Files:**
- Modify: `package.json`, `package-lock.json`, `nest-cli.json`, `src/main.ts`
- Modify: `src/coffees/coffees.controller.ts`, `src/coffees/coffees.service.ts`
- Modify: `src/coffees/dto/create-coffee.dto.ts`, `src/coffees/dto/update-coffee.dto.ts`
- Modify: `src/coffee-rating/coffee-rating.service.spec.ts`, `src/coffees/coffees.controller.spec.ts`, `src/coffees/coffees.service.spec.ts`
- Modify: `test/app.e2e-spec.ts`, `docker-compose.yml`
- Create: `test/coffees/coffees.e2e-spec.ts`

**Interfaces:**
- Consumes: `lesson-42` and old source diffs through `origin/lesson-59`.
- Produces: sequential local refs `lesson-43` through `lesson-50`, with `main` pointing to the exact `lesson-50` commit.

- [ ] **Step 1: Apply and commit the eight exact lesson ranges**

Continue on `rebuild/sql`. The table defines the exact source ranges and target commits:

| Target | Old diff range | Commit message |
| --- | --- | --- |
| `lesson-43` | `origin/lesson-48..origin/lesson-50` | `Lesson 43: Set up Swagger and the CLI plugin` |
| `lesson-44` | `origin/lesson-50..origin/lesson-51` | `Lesson 44: Document model properties` |
| `lesson-45` | `origin/lesson-51..origin/lesson-53` | `Lesson 45: Document responses and group APIs with tags` |
| `lesson-46` | `origin/lesson-53..origin/lesson-55` | `Lesson 46: Start Vitest and create test suites` |
| `lesson-47` | `origin/lesson-55..origin/lesson-56` | `Lesson 47: Add unit tests` |
| `lesson-48` | `origin/lesson-56..origin/lesson-57` | `Lesson 48: Introduce end-to-end tests` |
| `lesson-49` | `origin/lesson-57..origin/lesson-58` | `Lesson 49: Create the first end-to-end test` |
| `lesson-50` | `origin/lesson-58..origin/lesson-59` | `Lesson 50: Implement end-to-end test logic` |

Run these exact calls, using the `apply_lesson` function defined again here so this task is self-contained:

```bash
set -euo pipefail
apply_lesson() {
  git diff --binary "$1" "$2" | git apply --index --3way
  git diff --cached --check
  git commit -m "$4"
  git branch -f "$3" HEAD
}

apply_lesson origin/lesson-48 origin/lesson-50 lesson-43 "Lesson 43: Set up Swagger and the CLI plugin"
apply_lesson origin/lesson-50 origin/lesson-51 lesson-44 "Lesson 44: Document model properties"
apply_lesson origin/lesson-51 origin/lesson-53 lesson-45 "Lesson 45: Document responses and group APIs with tags"
apply_lesson origin/lesson-53 origin/lesson-55 lesson-46 "Lesson 46: Start Vitest and create test suites"
apply_lesson origin/lesson-55 origin/lesson-56 lesson-47 "Lesson 47: Add unit tests"
apply_lesson origin/lesson-56 origin/lesson-57 lesson-48 "Lesson 48: Introduce end-to-end tests"
apply_lesson origin/lesson-57 origin/lesson-58 lesson-49 "Lesson 49: Create the first end-to-end test"
apply_lesson origin/lesson-58 origin/lesson-59 lesson-50 "Lesson 50: Implement end-to-end test logic"
```

- [ ] **Step 2: Set main to the final SQL state**

```bash
git branch -f main lesson-50
test "$(git rev-parse main^{tree})" = "$(git rev-parse lesson-50^{tree})"
```

- [ ] **Step 3: Run progressive validation**

For each target `lesson-43`–`lesson-50`, run `npm ci` when `package-lock.json` changes, then:

```bash
npm run build
npm run lint
```

For `lesson-46` through `lesson-50`, also run:

```bash
npm test
```

For `lesson-50`, start the disposable test database and run the repository's complete e2e lifecycle:

```bash
npm run pretest:e2e
npm run test:e2e
npm run posttest:e2e
```

If `test:e2e` fails, still run `npm run posttest:e2e` before diagnosis so the test container is not left behind.

- [ ] **Step 4: Verify content boundaries and removed code**

```bash
test ! -e src/coffees/coffees.config.ts
! rg -n "registerAs\(|ConfigModule\.forFeature|coffeesConfig|coffees\.foo" src
git diff --exit-code main lesson-50
```

Audit the eight HTML lessons against their target diffs, including both halves of combined lessons 43, 45, and 46. Add report rows 43–50.

- [ ] **Step 5: Commit the Swagger/testing audit rows**

```bash
cd /Users/varis/Sites/varis-lab/frontend-bootcamp-content-7-july-2026
git add docs/superpowers/reports/2026-09-17-nestjs-companion-repo-sync.md
git commit -m "docs: audit rebuilt NestJS Swagger and testing lessons"
```

### Task 6: Create lesson 51 from the Chapter 2 checkpoint

**Files:**
- Modify: `README.md`
- Source code must match: `origin/end-of-chapter-2`

**Interfaces:**
- Consumes: the verified checkpoint tree and the finalized 58-lesson README from `lesson-33`.
- Produces: `rebuild/mongodb` and `lesson-51`, used as the base for MongoDB lessons 52–58.

- [ ] **Step 1: Start from the checkpoint and copy only the current README**

```bash
cd /private/tmp/nestjs-companion-sync-20260917/repo
git switch -c rebuild/mongodb origin/end-of-chapter-2
git show lesson-33:README.md > /private/tmp/nestjs-companion-sync-20260917/README.md
cp /private/tmp/nestjs-companion-sync-20260917/README.md README.md
git add README.md
git commit -m "Lesson 51: Return to the Chapter 2 checkpoint"
git branch -f lesson-51 HEAD
```

- [ ] **Step 2: Prove only documentation differs from the checkpoint**

```bash
git diff --name-only origin/end-of-chapter-2 lesson-51
git diff --exit-code origin/end-of-chapter-2 lesson-51 -- . ':!README.md'
```

Expected: the first command prints only `README.md`; the second exits 0.

- [ ] **Step 3: Build, lint, and audit lesson 51**

Run `npm ci`, `npm run build`, and `npm run lint`. Verify the HTML's stated absence of Prisma and MongoDB additions using:

```bash
test ! -d prisma
test ! -d src/prisma
! rg -n '"@prisma/client"|"@nestjs/mongoose"|"mongoose"' package.json
```

Add lesson 51 to the report and commit the report update.

### Task 7: Rebuild MongoDB lessons 52–58

**Files:**
- Create/modify: `docker-compose.yml`, `package.json`, `package-lock.json`, `src/app.module.ts`
- Modify: `src/coffees/coffees.module.ts`, `src/coffees/coffees.controller.ts`, `src/coffees/coffees.service.ts`, `src/coffees/entities/coffee.entity.ts`
- Create: `src/common/dto/pagination-query.dto.ts`
- Create: `src/events/entities/event.entity.ts`

**Interfaces:**
- Consumes: `lesson-51` and old MongoDB diffs `origin/lesson-60` through `origin/lesson-67`.
- Produces: sequential local refs `lesson-52` through `lesson-58`.

- [ ] **Step 1: Apply and commit the seven MongoDB ranges**

Continue on `rebuild/mongodb`. Apply, inspect, commit, and branch each row in order:

| Target | Old diff range | Commit message |
| --- | --- | --- |
| `lesson-52` | `origin/lesson-60..origin/lesson-61` | `Lesson 52: Run MongoDB with Docker Compose` |
| `lesson-53` | `origin/lesson-61..origin/lesson-62` | `Lesson 53: Introduce the Mongoose module` |
| `lesson-54` | `origin/lesson-62..origin/lesson-63` | `Lesson 54: Create a Mongoose model` |
| `lesson-55` | `origin/lesson-63..origin/lesson-64` | `Lesson 55: Access MongoDB through a Mongoose model` |
| `lesson-56` | `origin/lesson-64..origin/lesson-65` | `Lesson 56: Add MongoDB pagination` |
| `lesson-57` | `origin/lesson-65..origin/lesson-66` | `Lesson 57: Use MongoDB transactions` |
| `lesson-58` | `origin/lesson-66..origin/lesson-67` | `Lesson 58: Add schema indexes` |

Use this function and the seven exact calls below:

```bash
set -euo pipefail
apply_lesson() {
  git diff --binary "$1" "$2" | git apply --index --3way
  git diff --cached --check
  git commit -m "$4"
  git branch -f "$3" HEAD
}

apply_lesson origin/lesson-60 origin/lesson-61 lesson-52 "Lesson 52: Run MongoDB with Docker Compose"
apply_lesson origin/lesson-61 origin/lesson-62 lesson-53 "Lesson 53: Introduce the Mongoose module"
apply_lesson origin/lesson-62 origin/lesson-63 lesson-54 "Lesson 54: Create a Mongoose model"
apply_lesson origin/lesson-63 origin/lesson-64 lesson-55 "Lesson 55: Access MongoDB through a Mongoose model"
apply_lesson origin/lesson-64 origin/lesson-65 lesson-56 "Lesson 56: Add MongoDB pagination"
apply_lesson origin/lesson-65 origin/lesson-66 lesson-57 "Lesson 57: Use MongoDB transactions"
apply_lesson origin/lesson-66 origin/lesson-67 lesson-58 "Lesson 58: Add schema indexes"
```

- [ ] **Step 2: Build and lint every MongoDB snapshot**

Switch through lessons 52–58. Run `npm ci` whenever the lockfile changes, followed by `npm run build` and `npm run lint` for every distinct tree. Compare each target diff with its HTML lesson and add rows 52–58 to the report.

- [ ] **Step 3: Verify the two database paths remain isolated**

```bash
git grep -n '@nestjs/mongoose' lesson-58 -- package.json src
! git grep -n '@prisma/client' lesson-58 -- package.json src
git cat-file -e lesson-58:src/events/entities/event.entity.ts
git cat-file -e lesson-50:prisma/schema.prisma
! git cat-file -e lesson-50:src/events/entities/event.entity.ts 2>/dev/null
```

Expected: Mongoose exists only on the MongoDB path, Prisma remains on the SQL path, and the final Mongo event schema does not leak into SQL.

- [ ] **Step 4: Commit the completed MongoDB audit rows**

```bash
cd /Users/varis/Sites/varis-lab/frontend-bootcamp-content-7-july-2026
git add docs/superpowers/reports/2026-09-17-nestjs-companion-repo-sync.md
git commit -m "docs: audit rebuilt NestJS MongoDB lessons"
```

### Task 8: Run repository-wide pre-publication verification

**Files:**
- Modify: `docs/superpowers/reports/2026-09-17-nestjs-companion-repo-sync.md`

**Interfaces:**
- Consumes: all 58 target refs plus `main` and `end-of-chapter-2`.
- Produces: a signed-off local ref set that Task 9 is allowed to publish.

- [ ] **Step 1: Verify the target ref inventory has no gaps**

```bash
cd /private/tmp/nestjs-companion-sync-20260917/repo
for n in $(seq -w 1 58); do git show-ref --verify --quiet "refs/heads/lesson-$n" || git show-ref --verify --quiet "refs/remotes/origin/lesson-$n" || exit 1; done
test "$(git rev-parse main^{tree})" = "$(git rev-parse lesson-50^{tree})"
test "$(git rev-parse origin/lesson-18^{tree})" = "$(git rev-parse origin/end-of-chapter-2^{tree})"
```

- [ ] **Step 2: Run structural course checks**

In the course repository, verify 58 sequential filenames, exact index membership, continuous previous/next navigation, local link resolution, unique HTML IDs, and balanced major tags using the same audit commands that passed after the lesson merges. Run:

```bash
git diff --check
```

Record the commands and results in the report.

- [ ] **Step 3: Run a final branch-to-content review**

For every lesson 01–58, compare the HTML's files, commands, and final code blocks with the matching branch tree. Use `origin/lesson-$n` for unchanged lessons 01–32 and `lesson-$n` for rebuilt lessons 33–58. For every path named by the lesson, inspect it with `git show "$ref:$path"`. Confirm every report row has a title, exact source state, `PASS` content result, and build/test result. There must be 58 lesson rows:

```bash
rg -c '^\| `lesson-[0-9]{2}` \|' /Users/varis/Sites/varis-lab/frontend-bootcamp-content-7-july-2026/docs/superpowers/reports/2026-09-17-nestjs-companion-repo-sync.md
```

Expected: `58`.

- [ ] **Step 4: Run final companion repository checks**

```bash
git switch lesson-50
npm ci
npm run build
npm run lint
npm test
npm run pretest:e2e
npm run test:e2e
npm run posttest:e2e
git switch lesson-58
npm ci
npm run build
npm run lint
git restore tsconfig.build.tsbuildinfo
git clean -fdX
git status --short
```

Expected: all commands pass and final status is clean after removing ignored build output with `git clean -fdX`.

- [ ] **Step 5: Review the complete local ref graph**

```bash
git log --graph --decorate --oneline --all --simplify-by-decoration
git for-each-ref --sort=refname --format='%(refname:short) %(objectname) %(tree)' refs/heads/lesson-* refs/heads/main
```

Confirm SQL refs are sequential through 50, MongoDB branches from the Chapter 2 source state at 51, and no rebuilt SQL ref descends from old namespace commit `84aca79`:

```bash
for n in $(seq -w 36 50); do git merge-base --is-ancestor 84aca79 "lesson-$n" && exit 1 || true; done
```

- [ ] **Step 6: Commit the pre-publication report**

```bash
cd /Users/varis/Sites/varis-lab/frontend-bootcamp-content-7-july-2026
git add docs/superpowers/reports/2026-09-17-nestjs-companion-repo-sync.md
git commit -m "docs: complete NestJS companion pre-publish verification"
```

### Task 9: Publish replacement refs, verify, then remove obsolete branches

**Files:**
- Read: `/private/tmp/nestjs-companion-sync-20260917/pre-sync-refs.txt`
- Modify: remote refs in `git@github-variden:VaridenTech/varislab-intro-to-nestjs-v1.git`
- Modify: `docs/superpowers/reports/2026-09-17-nestjs-companion-repo-sync.md`

**Interfaces:**
- Consumes: the fully verified local refs and recorded old remote OIDs.
- Produces: the exact remote set `main`, `end-of-chapter-2`, and `lesson-01`–`lesson-58`.

- [ ] **Step 1: Recheck remote concurrency before any push**

```bash
cd /private/tmp/nestjs-companion-sync-20260917/repo
git ls-remote --heads origin | sort -k2 > /private/tmp/nestjs-companion-sync-20260917/immediate-pre-push-refs.txt
diff -u /private/tmp/nestjs-companion-sync-20260917/pre-sync-refs.txt /private/tmp/nestjs-companion-sync-20260917/immediate-pre-push-refs.txt
```

Expected: no diff. If it differs, stop without pushing and report the changed refs.

- [ ] **Step 2: Push rebuilt lesson branches with exact leases**

For `lesson-33` through `lesson-58`, read each old OID from `pre-sync-refs.txt` and push its local target with an exact lease:

```bash
for n in $(seq -w 33 58); do
  ref="refs/heads/lesson-$n"
  old_oid=$(awk -v ref="$ref" '$2 == ref { print $1 }' /private/tmp/nestjs-companion-sync-20260917/pre-sync-refs.txt)
  test -n "$old_oid" || exit 1
  git push origin "lesson-$n:$ref" --force-with-lease="$ref:$old_oid" || exit 1
done
```

Run one ref per command so a failure identifies the exact branch. Lessons 01–32 are not pushed because their verified OIDs remain unchanged.

- [ ] **Step 3: Push main with an exact lease**

Read the old `main` OID from the snapshot, then run:

```bash
main_ref="refs/heads/main"
old_main_oid=$(awk -v ref="$main_ref" '$2 == ref { print $1 }' /private/tmp/nestjs-companion-sync-20260917/pre-sync-refs.txt)
test -n "$old_main_oid"
git push origin main:refs/heads/main --force-with-lease="refs/heads/main:$old_main_oid"
```

Do not update `end-of-chapter-2`; its verified source ref remains unchanged.

- [ ] **Step 4: Verify all published target OIDs before deletion**

```bash
git ls-remote --heads origin | sort -k2 > /private/tmp/nestjs-companion-sync-20260917/post-push-refs.txt
```

For every `lesson-01`–`lesson-58`, compare the remote OID with the verified local or unchanged remote-tracking OID. Compare remote `main` with local `lesson-50`; compare remote `end-of-chapter-2` with its recorded pre-sync OID. Stop without deleting anything if any comparison fails.

- [ ] **Step 5: Delete obsolete branches only after successful verification**

Delete each obsolete branch explicitly:

```bash
git push origin --delete lesson-59 lesson-60 lesson-61 lesson-62 lesson-63 lesson-64 lesson-65 lesson-66 lesson-67
```

- [ ] **Step 6: Verify the final remote branch set exactly**

```bash
git ls-remote --heads origin | sort -k2 > /private/tmp/nestjs-companion-sync-20260917/final-refs.txt
wc -l /private/tmp/nestjs-companion-sync-20260917/final-refs.txt
```

Expected: 60 refs — `main`, `end-of-chapter-2`, and exactly `lesson-01` through `lesson-58`. Confirm no `lesson-59`–`lesson-67` lines remain and all target OIDs match the local validated refs.

- [ ] **Step 7: Finish and commit the report**

Add the final remote count, final OIDs for `main`, `end-of-chapter-2`, and lessons 33–58, the deletion result, and links or command evidence to the report. Then run:

```bash
cd /Users/varis/Sites/varis-lab/frontend-bootcamp-content-7-july-2026
git diff --check
git status --short
git add docs/superpowers/reports/2026-09-17-nestjs-companion-repo-sync.md
git commit -m "docs: record published NestJS companion branches"
```

### Task 10: Final completion verification

**Files:**
- Read: `docs/superpowers/reports/2026-09-17-nestjs-companion-repo-sync.md`
- Read: final remote refs and selected remote trees

**Interfaces:**
- Consumes: the published repository and completed report.
- Produces: evidence required before claiming completion.

- [ ] **Step 1: Load the completion-verification instructions**

Read and follow `superpowers:verification-before-completion`.

- [ ] **Step 2: Clone the published repository independently**

```bash
git clone git@github-variden:VaridenTech/varislab-intro-to-nestjs-v1.git /private/tmp/nestjs-companion-sync-20260917/final-clone
cd /private/tmp/nestjs-companion-sync-20260917/final-clone
```

- [ ] **Step 3: Re-run critical assertions against the fresh clone**

```bash
for n in $(seq -w 1 58); do git show-ref --verify --quiet "refs/remotes/origin/lesson-$n" || exit 1; done
for n in $(seq -w 59 67); do git show-ref --verify --quiet "refs/remotes/origin/lesson-$n" && exit 1 || true; done
test "$(git rev-parse origin/main^{tree})" = "$(git rev-parse origin/lesson-50^{tree})"
test "$(git rev-parse origin/lesson-18^{tree})" = "$(git rev-parse origin/end-of-chapter-2^{tree})"
for n in $(seq -w 36 50); do git cat-file -e "origin/lesson-$n:src/coffees/coffees.config.ts" 2>/dev/null && exit 1 || true; done
```

- [ ] **Step 4: Build the two final paths from the fresh clone**

```bash
git switch --detach origin/lesson-50
npm ci
npm run build
npm run lint
npm test
git clean -fdX
git switch --detach origin/lesson-58
npm ci
npm run build
npm run lint
git restore tsconfig.build.tsbuildinfo
git clean -fdX
git status --short
```

Expected: all commands pass and the final working tree is clean.

- [ ] **Step 5: Report the verified outcome**

State the exact final branch count, `main`/`lesson-50` equality, checkpoint equality, obsolete-branch deletion, build/test results, and link the completed sync report. Do not claim success if any fresh-clone assertion or validation command fails.
