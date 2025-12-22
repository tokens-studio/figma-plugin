# Extended Variable Collections (Inheritance) — Implementation Plan

This document describes a phased implementation plan for supporting **Figma extended variable collections** (child collections inheriting variables + modes from a parent, with overrides) in Tokens Studio.

## Goals

- Support **multi-brand** / **multi-theme** systems where brand themes extend a base theme.
- Ensure **round-trip** fidelity:
  - Pull from Figma → produces stable `$themes` metadata including inheritance info.
  - Push to Figma → creates/updates collections in correct dependency order and writes values safely.
- Provide **deterministic verification** after each phase:
  - **Unit tests** (Jest) added/updated for the phase.
  - **Manual verification** steps in Figma using the plugin.
  - A **structured debug payload** printed by the plugin that can be pasted into issues/Slack for review.

## Known Figma API Observations (verified on non-Enterprise account)

These were verified manually via Figma plugin console on a local account (not Enterprise):

- **Extended detection**: `collection.parentVariableCollectionId` exists (prototype property), not `parentCollectionId`.
- **Visible variables**: `collection.variableIds` includes inherited variables (getter, not an own property).
- **Effective values**:
  - `variable.valuesByMode` is keyed by **owner collection mode IDs**.
  - `variable.valuesByModeForCollectionAsync(collection)` returns values keyed by the **target collection’s mode IDs**, reflecting overrides.
- **Setting overrides**: `variable.setValueForMode(childModeId, value)` can create an override in the child collection (does not mutate base).
- **Overrides surface**: `collection.variableOverrides` is a map of:
  - `Record<variableId, Record<childModeId, value>>`
- **Clearing overrides**:
  - `collection.removeOverridesForVariable` exists but **expects a Variable node**, not a string ID (error: “Expected node, got string”).
  - No `removeOverrideForMode` method was present in that runtime.
- **Danger**: calling `variable.remove()` on an inherited variable **removes it from the parent** (and it disappears from descendants).
- **Mode renames propagate** from base → child → grandchild (names update across chain, IDs remain distinct).

### Implementation constraints learned from debugging (encode these into code + tests)

- **Do not use `hasOwnProperty` for collection fields**:
  - `variableIds` is a getter on the prototype; use `'variableIds' in collection` and `Array.isArray(collection.variableIds)`.
  - `parentVariableCollectionId` is also not an enumerable own-property in some runtimes.
- **Mode IDs differ per collection**:
  - Child mode IDs are namespaced (`VariableCollectionId:<child>/<mode>`). Use mode **names** to map parent/child modes.
- **Override persistence**:
  - Setting an override to the same value as the inherited value still creates/retains an override.
  - “Revert to inherit” must remove the override (e.g. `removeOverridesForVariable(variableNode)`), not “set to base value”.
- **No per-mode override removal** (observed):
  - Without `removeOverrideForMode`, v1 should prefer “clear all overrides for this variable” behavior unless another API exists.
- **Never delete variables while processing an extended collection**:
  - `variable.remove()` deletes the variable from the owning (parent) collection.
  - When “remove without connection” is enabled, extended themes should clear overrides, not delete variables.
- **Nested inheritance works**:
  - `grand.parentVariableCollectionId === child.id` and overrides remain localized to the collection they’re written in.
- **Variable naming constraints**:
  - The Variables API may reject certain characters in names (we hit “invalid variable name” during console testing).
  - Treat variable naming as validated/sanitized input (and prefer using existing plugin naming conventions rather than inventing new ones in tests).

## Enterprise Plan Unknown (must verify on Enterprise device)

We observed an error on a non-Enterprise account:

- `figma.variables.createVariable(..., extendedCollection, ...)` throws **“Cannot create variables in extended variable collections”**.

We must verify on an **Enterprise** plan whether:

- Creating variables in an extended collection is allowed or still prohibited.

This impacts whether brand-only variables can be created directly in the child collection or must be created in an ancestor and overridden downstream.

## Data Model Changes

### Theme metadata (`$themes`)

Add two optional properties:

- `$extendsThemeId?: string`
  - References another theme by `id` within the same `$themes` array.
  - Set by the UI and used to create extended collections when pushing to Figma.
- `$figmaParentCollectionId?: string`
  - Stores the Figma ID of the parent collection.
  - Populated when:
    - creating collections (resolved from `$extendsThemeId`), and/or
    - pulling from Figma (resolved from `collection.parentVariableCollectionId`).

Notes:
- Theme `id` must be **stable** (do not derive from name at pull time for inheritance references).
- Mode IDs are **not shared** across extended collections; use mode **names** for mapping where needed.

### Collection selection info (UI)

Extend the collection listing type returned to UI with:

- `parentCollectionId?: string` (from `parentVariableCollectionId`)
- `isExtended?: boolean` (derived)

## Debug / Diagnostics Output (standardized)

Each phase will add or reuse a structured log payload from the plugin:

- Console label: `TS_EXTCOLL_DIAGNOSTICS`
- Payload shape (stable across phases):

```json
{
  "phase": "PHASE_NAME",
  "collections": [
    {
      "id": "VariableCollectionId:…",
      "name": "…",
      "parentVariableCollectionId": "VariableCollectionId:… | null",
      "modes": [{"name":"Light","modeId":"…"}],
      "variableIdsCount": 123,
      "variableOverridesSample": {
        "VariableID:…": {"<modeId>": "<value>"}
      }
    }
  ],
  "themes": [
    {
      "id": "theme-id",
      "name": "Light",
      "group": "Brand A",
      "$extendsThemeId": "base-light",
      "$figmaCollectionId": "VariableCollectionId:…",
      "$figmaParentCollectionId": "VariableCollectionId:…",
      "$figmaModeId": "…"
    }
  ],
  "notes": ["…"]
}
```

Implementation note:
- Keep diagnostics behind a **debug flag** (e.g. `settings.debugExtendedCollections` or `figma.clientStorage` toggle) to avoid noisy logs.

---

## Phase 0 — Baseline + API wrappers (no behavior change)

### Work

- Add types:
  - `ThemeObject`: add `$extendsThemeId?`, `$figmaParentCollectionId?`.
  - `themeObjectSchema`: validate both fields.
  - `VariableCollectionSelection`: extend returned info with parent/extended fields.
- Add small runtime helpers (pure functions):
  - `getParentVariableCollectionId(collection): string | undefined`
  - `isExtendedCollection(collection): boolean`
  - `getCollectionVariableIds(collection): string[]` (handles getter / non-enumerable)
- Add diagnostics scaffold (gated), but do not yet change pull/push logic.

### Tests (Jest)

- Schema round-trip:
  - theme object with/without `$extendsThemeId` and `$figmaParentCollectionId` parses.
- Helper tests with mocked collection shapes:
  - `parentVariableCollectionId` on prototype, `variableIds` getter behavior.

### Manual verification (Figma plugin)

- Open plugin, ensure nothing regresses.
- Trigger the diagnostics action (or toggle) and confirm you see:
  - collection list with `parentVariableCollectionId` populated for extended collections.

### Expected debug output

- `TS_EXTCOLL_DIAGNOSTICS.phase = "phase0"`
- For at least one extended collection:
  - `parentVariableCollectionId` is a string.

---

## Phase 1 — Detect + surface extended collections in UI

### Work

- Update `GET_AVAILABLE_VARIABLE_COLLECTIONS` handler to include:
  - `parentCollectionId` from `parentVariableCollectionId`.
  - `isExtended` derived.
- UI: update collection display to show relationships:
  - `Brand A (extends Base)` in import/select dialogs.

### Tests (Jest)

- `getAvailableVariableCollections` unit tests:
  - regular collection → `isExtended=false`
  - extended collection → `isExtended=true`, `parentCollectionId` present

### Manual verification (Figma plugin)

- Create base + child collection in Figma.
- Open the UI area that lists available collections.
- Confirm label indicates extension.

### Expected debug output

- `TS_EXTCOLL_DIAGNOSTICS.phase = "phase1"`
- Include both base and child collections with correct parent IDs.

---

## Phase 2 — Pull variables from extended collections (read-path)

### Work

Refactor `pullVariables` to be **collection-driven**:

- Instead of iterating variables and grouping by `variable.variableCollectionId`, iterate:
  - collections → modes → variables visible to that collection (`collection.variableIds`)
- For each variable ID:
  - `const v = await figma.variables.getVariableByIdAsync(id)`
  - read effective values via `await v.valuesByModeForCollectionAsync(collection)`
  - map modeId → modeName using that collection’s modes
- Override marking (optional):
  - read `collection.variableOverrides` and mark tokens as overridden for that mode.
- Theme metadata:
  - When collection is extended:
    - store `collection.parentVariableCollectionId` into `$figmaParentCollectionId`.
    - best-effort map `$extendsThemeId` by matching parent collection ID to an existing theme’s `$figmaCollectionId`.

### Tests (Jest)

- Pull merging behavior:
  - collection-driven grouping produces token parents `${collection.name}/${mode.name}`.
  - effective reads use `valuesByModeForCollectionAsync` for extended collections.
- Override tagging:
  - given `variableOverrides`, token is marked as overridden for those modes.

### Manual verification (Figma plugin)

- In Figma:
  - base has variable values
  - child overrides a subset
- Use plugin “Pull variables”.
- Confirm:
  - token sets are grouped under the child collection name for child values
  - overridden values match what you set in child
  - inherited values appear even if not overridden

### Expected debug output

- `TS_EXTCOLL_DIAGNOSTICS.phase = "phase2"`
- For child collection:
  - `variableIdsCount` includes inherited variables
  - `variableOverridesSample` includes overridden variableId/modeId pairs

---

## Phase 3 — Create extended collections from themes (write-path: collections)

### Work

Implement dependency-resolved collection creation:

- Add `resolveThemeDependencies(themes)` (topological sort):
  - edges: theme → parentTheme when `$extendsThemeId` present
  - detect cycles and throw a user-facing error
- Update `createNecessaryVariableCollections`:
  - Phase A: create/update base collections (themes without `$extendsThemeId`)
  - Phase B: create extended collections (themes with `$extendsThemeId`)
    - find parent theme by id
    - ensure parent collection exists and store `$figmaCollectionId` if created
    - create child via `parentCollection.extend(childName)`
    - store `$figmaParentCollectionId = parentCollection.id` on the child theme metadata

### Tests (Jest)

- Topological ordering:
  - base → child → grandchild sorts correctly
  - cycles fail with a clear message
- Collection creation calls:
  - uses `.extend` only for themes with `$extendsThemeId`
  - preserves existing logic for non-extended themes

### Manual verification (Figma plugin)

- In UI, create themes:
  - Base (no extends)
  - Brand A extends Base
  - Brand B extends Base
- Push variables/collections from plugin.
- Confirm:
  - collections created in correct order
  - child collections show as extended of base (in Figma UI)

### Expected debug output

- `TS_EXTCOLL_DIAGNOSTICS.phase = "phase3"`
- Themes list includes `$figmaCollectionId` for all processed themes
- Extended themes include `$figmaParentCollectionId`

---

## Phase 4 — Update variables for extended themes (write-path: values + overrides)

### Work

Goal: update values safely without mutating the parent collection.

- When processing a theme whose collection is extended:
  - **Never delete variables** (do not call `variable.remove()`).
  - **Never rename inherited variables**.
  - Set overrides by using the child collection’s modeId:
    - `variable.setValueForMode(childModeId, value)`
  - Revert-to-inherit:
    - do **not** “set override equal to base”
    - call `collection.removeOverridesForVariable(variableNode)` (node, not id)
      - (Per-mode removal is not available in the observed runtime; decide scope accordingly.)
- When `removeStylesAndVariablesWithoutConnection` is enabled:
  - for extended collection:
    - clear overrides for variables not present in the theme/token set (policy decision)
    - but do not remove variables

Enterprise gating:
- If Enterprise allows `createVariable` in extended collections, support brand-only vars in child.
- Otherwise:
  - brand-only vars must be created in base/ancestor (with defaults) and overridden downstream.

### Tests (Jest)

- Extended write safety:
  - never calls `remove()` on variables when collection is extended
  - uses `removeOverridesForVariable(variableNode)` for revert
- Override behavior:
  - writing with child mode ID affects `valuesByModeForCollectionAsync(child)` only

### Manual verification (Figma plugin)

- Start with base + child collections.
- Push tokens for:
  - base theme
  - child theme overrides
- Confirm:
  - base effective values unchanged when pushing child
  - child effective values updated
  - clearing a token value (or toggling off) results in override removal (inherit restored)

### Expected debug output

- `TS_EXTCOLL_DIAGNOSTICS.phase = "phase4"`
- For extended collection:
  - include `variableOverridesSample` changes before/after update
  - notes include `"noVariableDeletes": true`

---

## Phase 5 — UI: Theme inheritance controls

### Work

- Add “Extends theme” selector in theme editor.
- Prevent cycles:
  - exclude self
  - exclude themes that (directly or transitively) extend the current theme
- Display:
  - in list items: `Extends: Base`
  - warnings when parent missing / parent has no `$figmaCollectionId` yet (will be created first)

### Tests (Jest)

- Dependency validation:
  - cycle detection in UI selection logic
- Persisted theme data includes `$extendsThemeId`

### Manual verification (Figma plugin)

- Create/edit theme, select parent.
- Save and confirm `$themes` contains `$extendsThemeId`.
- Push to create collections and verify in Figma.

### Expected debug output

- `TS_EXTCOLL_DIAGNOSTICS.phase = "phase5"`
- Themes include `$extendsThemeId` and resolved `$figmaParentCollectionId` after push/pull.

---

## Phase 6 — Enterprise-only behavior verification & finalization

### Work

On an Enterprise plan device, run a dedicated verification flow:

- Attempt `createVariable` in extended collection via plugin action.
- Decide final behavior:
  - If allowed: implement brand-only vars in child collection (and adjust docs/tests).
  - If prohibited: enforce/educate:
    - brand-only vars must exist in base (ancestor), and child only overrides.

### Tests (Jest)

- Add tests to enforce chosen behavior (gated by a feature flag if needed).

### Manual verification (Figma plugin)

- Run plugin “Extended Collections Diagnostics” and paste output.
- Confirm create-in-child behavior matches the Enterprise result.

### Expected debug output

- `TS_EXTCOLL_DIAGNOSTICS.phase = "phase6"`
- Notes include:
  - `"enterpriseCreateInExtended": "allowed" | "prohibited" | "unknown"`

---

## Appendix A — Enterprise verification console script (copy/paste)

Use this on your Enterprise device in **Plugins → Development → Open Console** while the plugin is running.

It will:
- Create a base collection
- Create an extended child collection
- Attempt to create a variable in the child collection (the Enterprise-only unknown)
- Always verify the supported path: create in base, override in child

### Script

```js
(async () => {
  const PREFIX = `TS-EXT-ENT-${Date.now().toString().slice(-6)}`;
  const baseName = `${PREFIX}-BASE`;
  const childName = `${PREFIX}-CHILD`;

  const safeVarName = (suffix) => `${PREFIX}__${suffix}`;

  const summarizeCollection = (c) => !c ? null : ({
    id: c.id,
    name: c.name,
    key: c.key,
    parentVariableCollectionId: c.parentVariableCollectionId,
    modes: (c.modes || []).map((m) => ({ name: m.name, modeId: m.modeId })),
    variableIdsCount: Array.isArray(c.variableIds) ? c.variableIds.length : null,
    overrideKeys: c.variableOverrides && typeof c.variableOverrides === 'object'
      ? Object.keys(c.variableOverrides).slice(0, 25)
      : null,
  });

  const findCollectionByName = async (name) => {
    const all = await figma.variables.getLocalVariableCollectionsAsync();
    return all.find((c) => c.name === name) || null;
  };

  const result = {
    PREFIX,
    canExtend: null,
    base: null,
    child: null,
    createInChild: { ok: false, error: null, variable: null },
    createInBaseThenOverrideInChild: { ok: false, error: null, variable: null },
  };

  // Base
  let base = await findCollectionByName(baseName);
  if (!base) base = figma.variables.createVariableCollection(baseName);
  if (!(base.modes || []).some((m) => m.name === 'Light')) base.addMode('Light');

  // Child (extended)
  result.canExtend = typeof base.extend === 'function';
  let child = await findCollectionByName(childName);
  if (!child) {
    if (!result.canExtend) {
      result.base = summarizeCollection(base);
      result.child = null;
      console.log('TS_EXT_ENTERPRISE_CHECK', result);
      return;
    }
    child = base.extend(childName);
  }

  result.base = summarizeCollection(base);
  result.child = summarizeCollection(child);

  // Test A: create variable directly in child (Enterprise unknown)
  try {
    const v = figma.variables.createVariable(safeVarName('created_in_child'), child, 'FLOAT');
    result.createInChild.ok = true;
    result.createInChild.variable = { id: v.id, name: v.name, variableCollectionId: v.variableCollectionId };
  } catch (e) {
    result.createInChild.ok = false;
    result.createInChild.error = String(e);
  }

  // Test B: create in base, override in child (expected to work)
  try {
    const v2 = figma.variables.createVariable(safeVarName('created_in_base'), base, 'FLOAT');
    const baseLight = (base.modes || []).find((m) => m.name === 'Light')?.modeId;
    const childLight = (child.modes || []).find((m) => m.name === 'Light')?.modeId;

    v2.setValueForMode(baseLight, 1);
    v2.setValueForMode(childLight, 2);

    const byBase = typeof v2.valuesByModeForCollectionAsync === 'function' ? await v2.valuesByModeForCollectionAsync(base) : null;
    const byChild = typeof v2.valuesByModeForCollectionAsync === 'function' ? await v2.valuesByModeForCollectionAsync(child) : null;

    result.createInBaseThenOverrideInChild.ok = true;
    result.createInBaseThenOverrideInChild.variable = {
      id: v2.id,
      name: v2.name,
      variableCollectionId: v2.variableCollectionId,
      byBase,
      byChild,
      childOverrides: child.variableOverrides,
    };
  } catch (e) {
    result.createInBaseThenOverrideInChild.ok = false;
    result.createInBaseThenOverrideInChild.error = String(e);
  }

  console.log('TS_EXT_ENTERPRISE_CHECK', result);
})();
```

### What to paste back

Paste the single object logged as `TS_EXT_ENTERPRISE_CHECK`, specifically:
- `createInChild.ok`
- `createInChild.error` (if any)
- `child.parentVariableCollectionId` (inside `result.child`)


