# Codebase Domain Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize ThanhVinhStudio into clearer domain modules while preserving existing business behavior, API contracts, and UI flows.

**Architecture:** Refactor in small, verifiable phases. First stabilize current OmniVoice work, then move frontend code into `features/*` and `shared/*`, then split backend schemas/utilities behind compatibility exports. Avoid behavior changes unless a bug blocks the refactor.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, FastAPI, Python 3.12.

---

## Guardrails

- Do not change business logic unless the user explicitly approves it.
- Do not change route paths, payload shapes, response shapes, or user-facing flows.
- Do not rewrite the whole app. Move and split code in focused stages.
- If a data structure needs redesign, stop and propose the schema before editing.
- Add comments only where the logic is not obvious.
- Preserve existing dirty OmniVoice changes and work with them.

## Target File Responsibility Map

### Frontend Shared

- `frontend/app/shared/constants/app.ts`: app-wide constants such as `API_BASE`, `LOGO_URL`, polling and toast timings.
- `frontend/app/shared/lib/api-client.ts`: generic `get`, `post`, and low-level fetch helpers.
- `frontend/app/shared/lib/audio.ts`: audio conversion helpers moved from `frontend/app/lib/audio.ts`.
- `frontend/app/shared/lib/format.ts`: date, time, and duration format helpers moved from `frontend/app/lib/format.ts`.
- `frontend/app/shared/components/toast.tsx`: toast rendering and `showToast`.
- `frontend/app/shared/components/player.tsx`: reusable audio player.
- `frontend/app/shared/types/audio.ts`: reusable `Voice`, `AudioFile`, and generation-related types.
- `frontend/app/shared/types/system.ts`: reusable `SystemStatus`, `DownloadProgress`, and `HardwareInfo`.

### Frontend Features

- `frontend/app/features/omnivoice/types.ts`: `SavedVoice` and OmniVoice hook state/option types.
- `frontend/app/features/omnivoice/constants.ts`: voice presets, non-verbal tags, voice design dropdown options.
- `frontend/app/features/omnivoice/hooks/useOmniVoice.ts`: OmniVoice state and actions.
- `frontend/app/features/omnivoice/components/OmniVoicePanel.tsx`: composition for OmniVoice screen.
- `frontend/app/features/omnivoice/components/VoiceDesignPanel.tsx`: voice design dropdowns and presets.
- `frontend/app/features/omnivoice/components/NonVerbalTagsPanel.tsx`: non-verbal tag buttons and cursor insertion wiring.
- `frontend/app/features/omnivoice/components/SavedVoicesSidebar.tsx`: saved voice selection and deletion list.
- `frontend/app/features/studio/constants.ts`: studio nav items and tab definitions.
- `frontend/app/features/studio/components/StudioShell.tsx`: top-level studio layout composition.
- `frontend/app/features/studio/components/IconNav.tsx`: left icon navigation.
- `frontend/app/features/studio/components/StudioTopbar.tsx`: current page header, search, notification button.
- `frontend/app/features/studio/components/StudioWorkspace.tsx`: TTS workspace composition.
- `frontend/app/features/studio/components/ModeTabs.tsx`: preset/clone/dialogue mode tabs.
- `frontend/app/features/tts/hooks/useTtsGeneration.ts`: existing TTS generation hook with imports updated.
- `frontend/app/features/tts/hooks/useDialogue.ts`: dialogue line state.
- `frontend/app/features/tts/hooks/useVoices.ts`: voice list state.
- `frontend/app/features/tts/components/Sidebar.tsx`: temporary compatibility component while sidebar is split.
- `frontend/app/features/history/hooks/useAudioHistory.ts`: audio history state.
- `frontend/app/features/system/hooks/*`: status, hardware, model switch, and LoRA hooks.

### Backend

- `backend/schemas/audio.py`: `SpeechRequest`, `DialogueLine`, `DialogueRequest`.
- `backend/schemas/lora.py`: `DownloadLoraRequest`, `LoadLoraRequest`.
- `backend/schemas/model.py`: `SwitchModelRequest`.
- `backend/schemas/omnivoice.py`: `OmniVoiceTTSRequest`, `OmniVoiceCloneRequest`.
- `backend/models.py`: compatibility exports from the schema modules.
- `backend/utils/audio.py`: audio normalization, unpacking, response conversion, temp upload helper.
- `backend/utils/downloads.py`: download status helpers.
- `backend/utils/hardware.py`: CUDA and hardware helpers.
- `backend/utils/files.py`: file path and output helpers.

---

## Phase 0: Stabilize Current OmniVoice Work

**Files:**
- Modify: `backend/services/omnivoice_service.py`
- Modify: `frontend/app/components/omnivoice-panel.tsx`
- Verify: `backend/models.py`
- Verify: `backend/routers/omnivoice.py`
- Verify: `frontend/app/hooks/useOmniVoice.ts`
- Verify: `frontend/app/lib/constants.ts`

- [ ] **Step 1: Confirm OmniVoice package API**

Run:

```powershell
@'
import inspect
from omnivoice import OmniVoice
print(inspect.signature(OmniVoice.generate))
print(hasattr(OmniVoice, "clone"))
'@ | .\.venv\Scripts\python.exe -
```

Expected:

```text
generate(... ref_audio ... instruct ...)
False
```

- [ ] **Step 2: Ensure backend uses `generate(ref_audio=...)`**

In `backend/services/omnivoice_service.py`, both saved-voice TTS and clone generation must call `state.omnivoice_tts.generate(...)` with `ref_audio`, not `clone(...)` or `reference_audio`.

Expected saved-voice call shape:

```python
kwargs = {"text": text, "ref_audio": str(ref_audio), "language": language, "speed": speed}
if instruct:
    kwargs["instruct"] = instruct
with state.omnivoice_lock:
    result = state.omnivoice_tts.generate(**kwargs)
```

Expected clone call shape:

```python
result = state.omnivoice_tts.generate(
    text=text,
    ref_audio=tmp_path,
    language=language,
    speed=speed,
)
```

- [ ] **Step 3: Remove unused frontend imports**

In `frontend/app/components/omnivoice-panel.tsx`, ensure the lucide import only includes used icons:

```typescript
import { Radio, Zap, Loader2, Upload, Trash2, Mic, Layers, Volume2, SlidersHorizontal, Sparkles } from "lucide-react";
```

- [ ] **Step 4: Run focused checks**

Run:

```powershell
.\.venv\Scripts\python.exe -m compileall backend\models.py backend\routers\omnivoice.py backend\services\omnivoice_service.py
```

Expected: compile completes without errors.

Run:

```powershell
npx tsc --noEmit
```

from `frontend`.

Expected: no TypeScript errors.

Run:

```powershell
npx eslint app/components/omnivoice-panel.tsx app/hooks/useOmniVoice.ts app/lib/constants.ts
```

from `frontend`.

Expected: no ESLint errors for touched OmniVoice files.

---

## Phase 1: Extract Shared Frontend Types And Constants

**Files:**
- Create: `frontend/app/shared/types/audio.ts`
- Create: `frontend/app/shared/types/system.ts`
- Create: `frontend/app/shared/types/index.ts`
- Create: `frontend/app/shared/constants/app.ts`
- Modify: `frontend/app/types/index.ts`
- Modify: `frontend/app/lib/constants.ts`
- Modify imports in touched hooks/components only.

- [ ] **Step 1: Create shared audio types**

Create `frontend/app/shared/types/audio.ts`:

```typescript
export interface Voice {
  id: string;
  name: string;
}

export interface LoRAAdapter {
  id: string;
  name: string;
  source: string;
  downloaded?: boolean;
}

export interface AudioFile {
  filename: string;
  size_kb: number;
  created: string;
}

export interface DialogueLine {
  id: number;
  text: string;
  voice: string;
  pauseAfter: number;
  emotion: string;
}
```

- [ ] **Step 2: Create shared system types**

Create `frontend/app/shared/types/system.ts`:

```typescript
import type { LoRAAdapter } from "./audio";

export interface DownloadProgress {
  [key: string]: { status: string; progress: number; message: string };
}

export interface SystemStatus {
  base_model: {
    downloaded: boolean;
    loaded: boolean;
    local_path: string;
    remote_repo: string;
  };
  current_model?: { type: string; supports_lora: boolean };
  lora: { active: string | null; available: LoRAAdapter[] };
  download_progress: DownloadProgress;
  outputs_dir: string;
  saved_audio_count: number;
}

export interface HardwareInfo {
  cpu: string;
  ram_gb: number;
  gpu_name?: string | null;
  vram_gb: number;
  recommendation: string;
  reason: string;
}
```

- [ ] **Step 3: Create shared type barrel**

Create `frontend/app/shared/types/index.ts`:

```typescript
export type { AudioFile, DialogueLine, LoRAAdapter, Voice } from "./audio";
export type { DownloadProgress, HardwareInfo, SystemStatus } from "./system";
```

- [ ] **Step 4: Keep legacy type imports compatible**

Replace `frontend/app/types/index.ts` with:

```typescript
export type { AudioFile, DialogueLine, LoRAAdapter, Voice } from "../shared/types/audio";
export type { DownloadProgress, HardwareInfo, SystemStatus } from "../shared/types/system";
```

- [ ] **Step 5: Create shared app constants**

Create `frontend/app/shared/constants/app.ts`:

```typescript
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
export const LOGO_URL = "/logo.png";
export const SAMPLE_RATE = 24000;
export const POLL_INTERVAL_MS = 1500;
export const WAVEFORM_BAR_COUNT = 44;
export const TOAST_DURATION_MS = 4000;
```

- [ ] **Step 6: Keep legacy constants compatible**

Keep `frontend/app/lib/constants.ts` exporting current names. Move only app-wide constants to import/re-export from `shared/constants/app.ts`; leave feature constants in place until their feature phase.

Expected top of `frontend/app/lib/constants.ts`:

```typescript
export {
  API_BASE,
  LOGO_URL,
  SAMPLE_RATE,
  POLL_INTERVAL_MS,
  WAVEFORM_BAR_COUNT,
  TOAST_DURATION_MS,
} from "../shared/constants/app";
```

- [ ] **Step 7: Run checks**

Run from `frontend`:

```powershell
npx tsc --noEmit
npx eslint app/types/index.ts app/lib/constants.ts app/shared/types/audio.ts app/shared/types/system.ts app/shared/types/index.ts app/shared/constants/app.ts
```

Expected: no TypeScript or ESLint errors for these files.

---

## Phase 2: Move OmniVoice Into Feature Folder

**Files:**
- Create: `frontend/app/features/omnivoice/types.ts`
- Create: `frontend/app/features/omnivoice/constants.ts`
- Create: `frontend/app/features/omnivoice/hooks/useOmniVoice.ts`
- Create: `frontend/app/features/omnivoice/components/VoiceDesignPanel.tsx`
- Create: `frontend/app/features/omnivoice/components/NonVerbalTagsPanel.tsx`
- Create: `frontend/app/features/omnivoice/components/SavedVoicesSidebar.tsx`
- Create: `frontend/app/features/omnivoice/components/OmniVoicePanel.tsx`
- Modify: `frontend/app/components/omnivoice-panel.tsx`
- Modify: `frontend/app/hooks/useOmniVoice.ts`
- Modify: `frontend/app/hooks/index.ts`
- Modify: `frontend/app/lib/constants.ts`
- Modify: `frontend/app/studio/page.tsx`

- [ ] **Step 1: Create OmniVoice types**

Create `frontend/app/features/omnivoice/types.ts`:

```typescript
export interface SavedVoice {
  name: string;
  language: string;
  created: string;
  audio_file: string;
}

export interface VoiceOption {
  label: string;
  value: string;
}

export interface VoicePreset {
  name: string;
  hint: string;
  accent: string;
}

export interface NonVerbalTag {
  label: string;
  tag: string;
}
```

- [ ] **Step 2: Move OmniVoice constants**

Create `frontend/app/features/omnivoice/constants.ts` with the current `VOICE_PRESETS`, `NON_VERBAL_TAGS`, `VOICE_GENDERS`, `VOICE_AGES`, `VOICE_PITCHES`, `VOICE_ACCENTS`, and `VOICE_STYLES` values from `frontend/app/lib/constants.ts`.

Then re-export those constants from `frontend/app/lib/constants.ts` during transition:

```typescript
export {
  NON_VERBAL_TAGS,
  VOICE_ACCENTS,
  VOICE_AGES,
  VOICE_GENDERS,
  VOICE_PITCHES,
  VOICE_PRESETS,
  VOICE_STYLES,
} from "../features/omnivoice/constants";
```

- [ ] **Step 3: Move the hook**

Copy `frontend/app/hooks/useOmniVoice.ts` to `frontend/app/features/omnivoice/hooks/useOmniVoice.ts`.

Update imports:

```typescript
import { api } from "../../../lib/api";
import { showToast } from "../../../shared/components/toast";
import { API_BASE } from "../../../shared/constants/app";
import type { SavedVoice } from "../types";
```

Remove the local `SavedVoice` interface from the hook.

- [ ] **Step 4: Keep legacy hook import compatible**

Replace `frontend/app/hooks/useOmniVoice.ts` with:

```typescript
export { useOmniVoice } from "../features/omnivoice/hooks/useOmniVoice";
```

- [ ] **Step 5: Extract `VoiceDesignPanel`**

Create `frontend/app/features/omnivoice/components/VoiceDesignPanel.tsx` with props for the five voice design values and setters. Move only the design dropdowns, disabled prompt preview, and presets from the current OmniVoice panel into this component.

The component must not call backend APIs and must not own generation state.

- [ ] **Step 6: Extract `NonVerbalTagsPanel`**

Create `frontend/app/features/omnivoice/components/NonVerbalTagsPanel.tsx` with:

```typescript
interface NonVerbalTagsPanelProps {
  onInsertTag: (tag: string) => void;
}
```

It renders the current non-verbal tag buttons and calls `onInsertTag(`${item.tag} `)`.

- [ ] **Step 7: Extract `SavedVoicesSidebar`**

Create `frontend/app/features/omnivoice/components/SavedVoicesSidebar.tsx` with props:

```typescript
interface SavedVoicesSidebarProps {
  voices: SavedVoice[];
  selectedVoice: string;
  onSelectVoice: (name: string) => void;
  onDeleteVoice: (name: string) => void;
}
```

Move only the saved voice list UI from the current left sidebar.

- [ ] **Step 8: Move `OmniVoicePanel` composition**

Copy `frontend/app/components/omnivoice-panel.tsx` to `frontend/app/features/omnivoice/components/OmniVoicePanel.tsx`. Replace the extracted sections with the new subcomponents.

The panel remains responsible for:

- setup/load screen
- loaded layout
- textarea cursor insertion
- passing props to subcomponents
- rendering `Player`

- [ ] **Step 9: Keep legacy component import compatible**

Replace `frontend/app/components/omnivoice-panel.tsx` with:

```typescript
export { OmniVoicePanel } from "../features/omnivoice/components/OmniVoicePanel";
```

- [ ] **Step 10: Run checks**

Run from `frontend`:

```powershell
npx tsc --noEmit
npx eslint app/features/omnivoice/**/*.ts app/features/omnivoice/**/*.tsx app/components/omnivoice-panel.tsx app/hooks/useOmniVoice.ts app/lib/constants.ts
```

Expected: no TypeScript or ESLint errors for OmniVoice files.

---

## Phase 3: Split Studio Shell And TTS Workspace

**Files:**
- Create: `frontend/app/features/studio/constants.ts`
- Create: `frontend/app/features/studio/components/IconNav.tsx`
- Create: `frontend/app/features/studio/components/StudioTopbar.tsx`
- Create: `frontend/app/features/studio/components/ModeTabs.tsx`
- Create: `frontend/app/features/studio/components/StudioTextEditor.tsx`
- Create: `frontend/app/features/studio/components/DialoguePreview.tsx`
- Create: `frontend/app/features/studio/components/StudioWorkspace.tsx`
- Modify: `frontend/app/studio/page.tsx`

- [ ] **Step 1: Move nav and tab data**

Create `frontend/app/features/studio/constants.ts` with `NAV_ITEMS` and TTS mode tab definitions currently in `studio/page.tsx`.

Use existing labels and ids exactly.

- [ ] **Step 2: Extract `IconNav`**

Create `IconNav.tsx` that receives:

```typescript
interface IconNavProps {
  activePage: string;
  onNavigate: (page: string) => void;
}
```

Move the left icon nav from `studio/page.tsx` into this component.

- [ ] **Step 3: Extract `StudioTopbar`**

Create `StudioTopbar.tsx` that receives:

```typescript
interface StudioTopbarProps {
  activePage: string;
  sidebarOpen: boolean;
  onCloseSidebar: () => void;
}
```

Move the topbar from `studio/page.tsx` into this component.

- [ ] **Step 4: Extract `ModeTabs`**

Create `ModeTabs.tsx` that receives:

```typescript
interface ModeTabsProps {
  mode: "preset" | "clone" | "dialogue";
  activeLora: string | null;
  onModeChange: (mode: "preset" | "clone" | "dialogue") => void;
}
```

Move the preset/clone/dialogue tabs from `studio/page.tsx`.

- [ ] **Step 5: Extract `StudioTextEditor`**

Create `StudioTextEditor.tsx` for preset and clone text editor sections. It receives the current text, setter, mode, textarea ref, and pause insertion callback.

Do not change pause marker behavior.

- [ ] **Step 6: Extract `DialoguePreview`**

Create `DialoguePreview.tsx` for dialogue preview rendering from `studio/page.tsx`.

It receives `dialogueLines` only.

- [ ] **Step 7: Extract `StudioWorkspace`**

Create `StudioWorkspace.tsx` that composes:

- `Sidebar`
- `ModeTabs`
- `StudioTextEditor`
- `DialoguePreview`
- `Player`

Pass through the existing hook state from `studio/page.tsx`. Do not move hook initialization in this phase.

- [ ] **Step 8: Slim `studio/page.tsx`**

Update `studio/page.tsx` to:

- initialize hooks
- manage `activePage`, `pageVisible`, `sidebarOpen`
- render `SetupScreen`
- render `IconNav`, `StudioTopbar`, and page bodies

No large JSX block for studio workspace should remain.

- [ ] **Step 9: Run checks**

Run from `frontend`:

```powershell
npx tsc --noEmit
npx eslint app/studio/page.tsx app/features/studio/**/*.ts app/features/studio/**/*.tsx
```

Expected: no TypeScript or ESLint errors for touched files.

---

## Phase 4: Split Sidebar Into Focused Panels

**Files:**
- Create: `frontend/app/features/tts/components/sidebar/ModelPanel.tsx`
- Create: `frontend/app/features/tts/components/sidebar/LoraPanel.tsx`
- Create: `frontend/app/features/tts/components/sidebar/PresetVoicePanel.tsx`
- Create: `frontend/app/features/tts/components/sidebar/AudioHistoryPanel.tsx`
- Create: `frontend/app/features/tts/components/sidebar/ClonePanel.tsx`
- Create: `frontend/app/features/tts/components/sidebar/DialogueEditorPanel.tsx`
- Create: `frontend/app/features/tts/components/sidebar/StreamingToggle.tsx`
- Create: `frontend/app/features/tts/components/Sidebar.tsx`
- Modify: `frontend/app/components/sidebar.tsx`

- [ ] **Step 1: Extract pure helpers**

Move `getVoiceEmoji` from `Sidebar` into `frontend/app/features/tts/lib/voice-labels.ts`:

```typescript
export function getVoiceEmoji(name: string): string {
  if (name.includes("nam")) return "👨";
  if (name.includes("nữ") || name.includes("nu")) return "👩";
  return "🎙️";
}
```

If the source file is already mojibake, preserve the current rendered output unless the user approves a text encoding cleanup.

- [ ] **Step 2: Extract `LoraPanel`**

Move the LoRA section into its own component with props for current model, adapters, active adapter, loading, load, and unload callbacks.

- [ ] **Step 3: Extract `ModelPanel`**

Move model selection and hardware detection UI into `ModelPanel`.

- [ ] **Step 4: Extract preset panels**

Move preset emotion, voice select, silence slider, and history dropdown into focused components.

- [ ] **Step 5: Extract clone panel**

Move reference audio upload and reference text input into `ClonePanel`.

- [ ] **Step 6: Extract dialogue editor panel**

Move dialogue line editor list and add/remove/update controls into `DialogueEditorPanel`.

- [ ] **Step 7: Extract streaming toggle**

Move the streaming checkbox into `StreamingToggle`.

- [ ] **Step 8: Compose new Sidebar**

Create `frontend/app/features/tts/components/Sidebar.tsx` that composes the panels and keeps the same `Props` contract as the old sidebar.

- [ ] **Step 9: Keep legacy component import compatible**

Replace `frontend/app/components/sidebar.tsx` with:

```typescript
export { Sidebar } from "../features/tts/components/Sidebar";
```

- [ ] **Step 10: Run checks**

Run from `frontend`:

```powershell
npx tsc --noEmit
npx eslint app/features/tts/**/*.ts app/features/tts/**/*.tsx app/components/sidebar.tsx
```

Expected: no TypeScript or ESLint errors for touched TTS sidebar files.

---

## Phase 5: Move Hooks Into Feature Folders

**Files:**
- Move/copy: `frontend/app/hooks/useTtsGeneration.ts` to `frontend/app/features/tts/hooks/useTtsGeneration.ts`
- Move/copy: `frontend/app/hooks/useDialogue.ts` to `frontend/app/features/tts/hooks/useDialogue.ts`
- Move/copy: `frontend/app/hooks/useVoices.ts` to `frontend/app/features/tts/hooks/useVoices.ts`
- Move/copy: `frontend/app/hooks/useAudioHistory.ts` to `frontend/app/features/history/hooks/useAudioHistory.ts`
- Move/copy: `frontend/app/hooks/useSystemStatus.ts` to `frontend/app/features/system/hooks/useSystemStatus.ts`
- Move/copy: `frontend/app/hooks/useHardware.ts` to `frontend/app/features/system/hooks/useHardware.ts`
- Move/copy: `frontend/app/hooks/useModelSwitch.ts` to `frontend/app/features/system/hooks/useModelSwitch.ts`
- Move/copy: `frontend/app/hooks/useLora.ts` to `frontend/app/features/system/hooks/useLora.ts`
- Modify: `frontend/app/hooks/*.ts`
- Modify: `frontend/app/hooks/index.ts`

- [ ] **Step 1: Move TTS hooks**

Copy TTS hooks into `features/tts/hooks`, update imports to shared types/constants/libs, and replace legacy files with re-exports.

- [ ] **Step 2: Move history hook**

Copy history hook into `features/history/hooks`, update imports, and replace legacy file with re-export.

- [ ] **Step 3: Move system hooks**

Copy system hooks into `features/system/hooks`, update imports, and replace legacy files with re-exports.

- [ ] **Step 4: Update hook barrel**

Keep `frontend/app/hooks/index.ts` exporting the same names. This preserves current imports while the page is gradually migrated.

- [ ] **Step 5: Run checks**

Run from `frontend`:

```powershell
npx tsc --noEmit
npx eslint app/hooks/*.ts app/features/tts/hooks/*.ts app/features/history/hooks/*.ts app/features/system/hooks/*.ts
```

Expected: no TypeScript or ESLint errors for touched hook files.

---

## Phase 6: Split Backend Schemas Behind Compatibility Exports

**Files:**
- Create: `backend/schemas/__init__.py`
- Create: `backend/schemas/audio.py`
- Create: `backend/schemas/lora.py`
- Create: `backend/schemas/model.py`
- Create: `backend/schemas/omnivoice.py`
- Modify: `backend/models.py`

- [ ] **Step 1: Create schema package**

Create `backend/schemas/__init__.py`:

```python
"""Request and response schemas grouped by backend domain."""
```

- [ ] **Step 2: Move model schemas**

Create `backend/schemas/model.py`:

```python
from pydantic import BaseModel, Field


class SwitchModelRequest(BaseModel):
    type: str = Field(..., pattern="^(gguf|pytorch|turbo)$")
```

- [ ] **Step 3: Move LoRA schemas**

Create `backend/schemas/lora.py`:

```python
from pydantic import BaseModel, Field


class DownloadLoraRequest(BaseModel):
    name: str = Field(..., min_length=1)


class LoadLoraRequest(BaseModel):
    name: str = Field(..., min_length=1)
```

- [ ] **Step 4: Move audio schemas**

Create `backend/schemas/audio.py` with the existing `DialogueLine`, `DialogueRequest`, and `SpeechRequest` definitions from `backend/models.py`.

- [ ] **Step 5: Move OmniVoice schemas**

Create `backend/schemas/omnivoice.py` with the existing `OmniVoiceTTSRequest` and `OmniVoiceCloneRequest` definitions from `backend/models.py`, including `instruct`.

- [ ] **Step 6: Replace `backend/models.py` with compatibility exports**

Replace `backend/models.py` with imports from schemas:

```python
"""Compatibility exports for backend request schemas."""

from backend.schemas.audio import DialogueLine, DialogueRequest, SpeechRequest
from backend.schemas.lora import DownloadLoraRequest, LoadLoraRequest
from backend.schemas.model import SwitchModelRequest
from backend.schemas.omnivoice import OmniVoiceCloneRequest, OmniVoiceTTSRequest

__all__ = [
    "DialogueLine",
    "DialogueRequest",
    "DownloadLoraRequest",
    "LoadLoraRequest",
    "OmniVoiceCloneRequest",
    "OmniVoiceTTSRequest",
    "SpeechRequest",
    "SwitchModelRequest",
]
```

- [ ] **Step 7: Run backend checks**

Run:

```powershell
.\.venv\Scripts\python.exe -m compileall backend\models.py backend\schemas backend\routers
```

Expected: compile completes without errors.

---

## Phase 7: Split Backend Utility Modules Incrementally

**Files:**
- Create: `backend/utils/__init__.py`
- Create: `backend/utils/audio.py`
- Create: `backend/utils/hardware.py`
- Create: `backend/utils/downloads.py`
- Create: `backend/utils/files.py`
- Modify: `backend/helpers.py`
- Modify service imports gradually.

- [ ] **Step 1: Create utility package**

Create `backend/utils/__init__.py`:

```python
"""Focused backend utility modules."""
```

- [ ] **Step 2: Move audio helpers first**

Move audio-only helpers from `backend/helpers.py` into `backend/utils/audio.py`. Keep re-exports in `backend/helpers.py` so existing imports continue to work.

Move only helpers that are pure audio concerns, such as:

- `audio_to_response`
- `normalize_audio`
- `unpack_audio_result`
- `save_upload_to_tempfile`
- `pcm16_stream`

- [ ] **Step 3: Move hardware helpers**

Move `has_cuda` and hardware detection helpers into `backend/utils/hardware.py`. Keep re-exports in `backend/helpers.py`.

- [ ] **Step 4: Move download helpers**

Move model download status helpers into `backend/utils/downloads.py`. Keep re-exports in `backend/helpers.py`.

- [ ] **Step 5: Move file/output helpers**

Move output file listing/saving helpers into `backend/utils/files.py`. Keep re-exports in `backend/helpers.py`.

- [ ] **Step 6: Update imports in services**

Update service modules to import from focused utility modules only when the moved helper is used by that service. Do not update every backend file in one sweep.

- [ ] **Step 7: Run backend checks**

Run:

```powershell
.\.venv\Scripts\python.exe -m compileall backend
```

Expected: compile completes without errors.

---

## Phase 8: Final Verification And Risk Review

**Files:**
- Inspect all touched files.
- Do not change files in this phase unless a verification issue is found.

- [ ] **Step 1: Run full focused frontend checks**

Run from `frontend`:

```powershell
npx tsc --noEmit
```

Expected: no TypeScript errors.

Run ESLint on touched folders:

```powershell
npx eslint app/features app/shared app/studio/page.tsx app/components app/hooks app/lib
```

Expected: no errors caused by refactor. If pre-existing unrelated lint errors remain, document them with file paths.

- [ ] **Step 2: Run backend compile**

Run:

```powershell
.\.venv\Scripts\python.exe -m compileall backend
```

Expected: compile completes without errors.

- [ ] **Step 3: Review diff size and boundaries**

Run:

```powershell
git diff --stat
git diff --name-only
```

Expected: changes align with this plan and do not include generated build artifacts.

- [ ] **Step 4: Explain final outcome**

Final explanation must cover:

- what was split
- why it was split that way
- which files own which responsibilities
- verification commands and results
- residual risks
- any schema changes proposed but not applied

## Known Existing Issues To Keep Separate

Full `npm run lint` currently reports unrelated existing errors in files such as `guide-content.tsx`, `saas-shell.tsx`, and `studio/page.tsx`. Fix these only when they are inside a touched refactor boundary or when needed to make the refactor checks meaningful.

## Execution Recommendation

Implement phases 0-2 first, then stop for review. Phases 3-7 are larger file moves and should be done after confirming the feature-folder approach works cleanly with OmniVoice.
