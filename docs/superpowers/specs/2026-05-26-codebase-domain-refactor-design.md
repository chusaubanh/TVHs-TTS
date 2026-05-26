# Codebase Domain Refactor Design

## Goal

Restructure ThanhVinhStudio into clearer domain modules so data, UI, hooks, services, and shared utilities are easier to find and change without changing the product behavior.

## Scope

This refactor covers the current FastAPI backend and Next.js frontend. It keeps every public route, request shape, response shape, screen flow, and local storage behavior compatible with the current app. The work is structural: move code, split large files, centralize shared types/constants, and remove obvious duplication.

The existing OmniVoice changes are treated as in-progress work. The first implementation step must stabilize them before broad restructuring so new regressions are easier to isolate.

## Current Problems

The frontend has several large mixed-responsibility files:

- `frontend/app/components/guide-content.tsx`
- `frontend/app/components/omnivoice-panel.tsx`
- `frontend/app/studio/page.tsx`
- `frontend/app/components/sidebar.tsx`
- `frontend/app/hooks/useOmniVoice.ts`

Shared data contracts are also scattered. For example, `SavedVoice` is declared independently in the OmniVoice hook and panel instead of living in shared domain types. Constants for unrelated domains are collected in `frontend/app/lib/constants.ts`, which makes the file harder to reason about as new features are added.

The backend is already partially split into routers and services, but cross-domain helpers remain concentrated in `backend/helpers.py`, and schema definitions are all grouped in `backend/models.py`.

## Target Frontend Structure

Use a domain-first structure under `frontend/app`:

```text
frontend/app/
  features/
    omnivoice/
      components/
      hooks/
      lib/
      types.ts
      constants.ts
    studio/
      components/
      hooks/
      types.ts
    tts/
      components/
      hooks/
      lib/
      types.ts
      constants.ts
    history/
      components/
      hooks/
      types.ts
    system/
      hooks/
      types.ts
  shared/
    components/
    lib/
    types/
    constants/
```

Feature folders own domain-specific code. `shared` is only for code used by multiple domains, such as base UI primitives, formatting helpers, API client primitives, and cross-domain types.

`frontend/app/studio/page.tsx` should become a thin composition layer that wires feature hooks and renders feature components. It should not own large UI sections or domain-specific business logic.

## Target Backend Structure

Keep the current FastAPI route paths stable, but split internals by responsibility:

```text
backend/
  routers/
  services/
  schemas/
    audio.py
    downloads.py
    omnivoice.py
    system.py
  utils/
    audio.py
    downloads.py
    files.py
    hardware.py
```

`backend/models.py` can remain as a compatibility export during the transition, re-exporting schemas from `backend/schemas/*`. This avoids breaking existing imports during phased refactoring.

`backend/helpers.py` should be reduced gradually by moving functions into focused utility modules. Service modules should import focused helpers instead of one broad helper module.

## Data Boundaries

Shared frontend types must live in one place:

- Voice and LoRA contracts in `features/tts/types.ts` or `shared/types/audio.ts`.
- OmniVoice-specific contracts, including `SavedVoice`, in `features/omnivoice/types.ts`.
- System and hardware contracts in `features/system/types.ts`.
- API response envelopes stay close to the API client or the feature consuming them.

Constants follow the same rule:

- OmniVoice voice design options live in `features/omnivoice/constants.ts`.
- General UI timing constants live in `shared/constants/ui.ts`.
- TTS voice/emotion constants live in `features/tts/constants.ts`.

No domain should import from another feature folder unless it is explicitly composing that feature. Shared reusable contracts move to `shared`.

## Error Handling

The refactor should preserve current user-facing error messages unless a message is clearly broken. Backend exceptions should continue to map to the same HTTP status codes. Frontend feature hooks should keep toast behavior intact while moving logic into clearer helper functions.

## Testing And Verification

Each implementation stage must run focused checks:

- Python compile for touched backend files.
- TypeScript `tsc --noEmit`.
- ESLint for touched frontend files.
- Full frontend lint only after existing unrelated lint errors are fixed or explicitly scoped.

Manual verification after the restructuring:

- App loads the studio screen.
- Base TTS generation flow still works.
- Dialogue generation flow still works.
- History list/play/download/delete still works.
- Model switching and LoRA controls still render and call the backend.
- OmniVoice load, voice design generation, clone, save, list, delete still work.

## Implementation Strategy

Use phased changes with checkpoints:

1. Stabilize the current OmniVoice edits and ensure local checks pass for those files.
2. Extract shared frontend types and constants without moving UI yet.
3. Move OmniVoice into its feature folder because it is currently the active work area.
4. Move studio shell/sidebar/dashboard/player composition into `features/studio` and `shared/components`.
5. Move TTS, dialogue, voices, and history code into feature folders.
6. Split backend schemas and utility modules while preserving compatibility exports.
7. Fix or isolate existing lint failures, then run broader verification.

Each phase should keep the app runnable and avoid mixing behavior changes with file moves.

## Non-Goals

This refactor does not redesign the UI, change API paths, replace libraries, add new features, remove existing pages, or rewrite generation logic. Any behavior changes found during the refactor should be handled as separate bug fixes with their own verification.
