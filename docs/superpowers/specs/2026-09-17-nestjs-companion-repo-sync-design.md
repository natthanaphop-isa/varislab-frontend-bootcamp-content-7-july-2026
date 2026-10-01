# NestJS Companion Repository Synchronization Design

**Date:** 2026-09-17  
**Course content:** `Week_09/01_nestjs_basic/content`  
**Companion repository:** `git@github-variden:VaridenTech/varislab-intro-to-nestjs-v1.git`

## Goal

Make every `lesson-NN` branch in the companion repository represent the completed code state at the end of the matching lesson in the current 58-lesson course. Remove obsolete lesson branches only after the replacement branch set has been built and verified.

## Source of Truth

The current HTML lessons under `Week_09/01_nestjs_basic/content` are authoritative. The existing companion repository is reusable implementation history, but its old 67-lesson numbering and branch contents are not authoritative where they conflict with the current course.

Each lesson branch represents the code state **after completing that lesson**. Lessons that only explain concepts and do not introduce a code change may legitimately point to the same commit as the preceding lesson.

## Selected Approach

Use a clean branch cutover while reusing verified commits and patches from the existing repository:

1. Preserve existing commits for lessons whose content and numbering still match.
2. Rebuild the affected SQL history after configuration lessons were consolidated.
3. Do not inherit the removed configuration-namespace implementation.
4. Reapply later building-block, Swagger, and testing changes onto the clean SQL base.
5. Renumber the MongoDB path to lessons 51–58 while keeping its intended fork point.
6. Update repository documentation to describe the 58-lesson structure.
7. Push and verify all replacement refs before deleting obsolete remote branches.

This is preferred over directly renaming old branches because the old SQL history contains code from the removed configuration-namespace lesson. Rebuilding the entire application from scratch is unnecessary and would introduce more opportunities for accidental differences.

## Target Branch Topology

### Shared and SQL path

- `lesson-01` through `lesson-32`: retain the corresponding existing end-of-lesson states.
- `lesson-33`: ConfigModule setup and environment-file behavior.
- `lesson-34`: environment schema validation.
- `lesson-35`: ConfigService plus custom configuration.
- `lesson-36`: request lifecycle explanation and binding building blocks.
- `lesson-37`: exception filters.
- `lesson-38`: guards plus public-route metadata.
- `lesson-39`: response transformation plus timeout interceptors.
- `lesson-40`: pipes.
- `lesson-41`: middleware.
- `lesson-42`: parameter decorators.
- `lesson-43`: Swagger setup plus CLI plugin.
- `lesson-44`: model-property documentation.
- `lesson-45`: response documentation plus tags.
- `lesson-46`: Vitest introduction plus the first test suite.
- `lesson-47`: unit tests.
- `lesson-48`: end-to-end testing introduction.
- `lesson-49`: first end-to-end test.
- `lesson-50`: completed SQL end-to-end behavior.
- `main`: alias of the verified `lesson-50` code state.

### MongoDB path

The MongoDB path remains an alternative continuation from the shared application state represented by `end-of-chapter-2`, rather than inheriting the completed SQL path.

- Keep `end-of-chapter-2`.
- Map the old MongoDB sequence to `lesson-51` through `lesson-58`.
- Preserve the original order and behavior of the eight MongoDB lesson states while checking each one against the newly numbered HTML lesson.

## Existing-to-Target Mapping

| Target | Existing source or reconstruction |
| --- | --- |
| `lesson-01`–`lesson-32` | Existing branches with the same numbers |
| `lesson-33` | Existing lesson 33/34 end state |
| `lesson-34` | Existing lesson 35 |
| `lesson-35` | Existing lesson 37 |
| `lesson-36` | Existing lesson 40 change reapplied to the clean lesson-35 base |
| `lesson-37` | Existing lesson 41 change reapplied |
| `lesson-38` | Existing lessons 42–43 changes combined |
| `lesson-39` | Existing lessons 44–45 changes combined |
| `lesson-40`–`lesson-42` | Existing lessons 46–48 changes reapplied in order |
| `lesson-43` | Existing lessons 49–50 changes combined |
| `lesson-44` | Existing lesson 51 |
| `lesson-45` | Existing lessons 52–53 changes combined |
| `lesson-46` | Existing lessons 54–55 end state |
| `lesson-47`–`lesson-50` | Existing lessons 56–59 changes reapplied in order |
| `lesson-51` | Existing lesson 60 / `end-of-chapter-2` state |
| `lesson-52`–`lesson-58` | Existing lessons 61–67 in order |

Old lessons 38–39 are not imported because they contain the removed configuration namespace and partial-registration material.

## Content-to-Code Contract

For every lesson:

1. Read the lesson's commands, file paths, code snippets, and stated expected behavior.
2. Compare them with the complete tree of the proposed branch.
3. Confirm that all code introduced in the lesson exists and agrees with the lesson.
4. Confirm that code not yet taught does not appear early when it would confuse the workshop flow.
5. Allow unchanged branch states only when the lesson genuinely makes no project change.

Special checks for the rebuilt SQL path:

- `src/coffees/coffees.config.ts` and other namespace/partial-registration artifacts must not appear in lessons 36–50 unless a current lesson explicitly introduces them.
- Imports, providers, module registration, environment access, tests, and Swagger configuration must compile after rebasing changes onto the clean configuration state.
- Combined lessons must end with the complete result of all sections in that lesson.

## Validation

Validation happens before any destructive remote cleanup:

1. Verify that local refs `lesson-01` through `lesson-58` all exist, with no numbering gaps.
2. Generate a lesson-to-branch audit table recording expected files/behavior and the verification result.
3. Run dependency installation using the repository lockfile.
4. Run the repository's formatter/linter, unit tests, end-to-end tests, and production build where the scripts exist.
5. Perform focused checks on distinct snapshots, especially each reconstructed or combined lesson branch.
6. Compare `main` with `lesson-50` and confirm identical trees.
7. Verify the MongoDB lineage starts at the intended shared state and does not contain SQL-only later work.
8. Confirm the README and branch map mention 58 lessons and the correct branch roles.

If an old patch does not apply cleanly, resolve it against the lesson content rather than preserving the old implementation blindly. A failing branch is repaired and retested before progressing.

## Remote Update Safety

1. Build and validate the complete replacement branch set in an isolated clone.
2. Record the current remote refs before changing them so their commit IDs remain recoverable.
3. Push `lesson-01` through `lesson-58`, `main`, and the retained `end-of-chapter-2` ref.
4. Fetch or query the remote again and compare every published ref with the validated local ref.
5. Only after successful remote verification, delete obsolete remote branches `lesson-59` through `lesson-67`.
6. Query the remote one final time to confirm the exact expected branch set.

Force-updating lesson branches is expected because the course was renumbered. Force pushes must use lease protection so an unexpected concurrent remote change stops the operation instead of being overwritten.

## Deliverables

- A companion repository with correctly numbered `lesson-01` through `lesson-58` branches.
- `main` matching the final SQL lesson (`lesson-50`).
- A retained `end-of-chapter-2` branch and correctly based MongoDB lesson path.
- No obsolete remote `lesson-59` through `lesson-67` branches.
- Updated repository documentation.
- A verification report mapping every lesson to its branch and recording build/test/content checks.

## Out of Scope

- Rewriting the course HTML unless a genuine contradiction is found during synchronization.
- Changing the application architecture beyond what the current lessons teach.
- Modifying the unrelated dirty repository at `../workshop-content/Nestjs_basic_v1`.
