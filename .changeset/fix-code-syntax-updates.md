---
"@tokens-studio/figma-plugin": patch
---

Fix code syntax not updating when editing tokens + add diagnostics

When editing a token in the UI, code syntax metadata wasn't being updated on the linked Figma variable. Added metadata update logic to `updateVariablesFromPlugin.ts` and diagnostic logging to understand when the update is triggered.

Changes:
- Added metadata update logic (scopes and code syntax) to `updateVariablesFromToken` handler
- Added diagnostic logging to `setValuesOnVariable.ts` for export debugging
- Added diagnostic logging to `EditTokenForm.tsx` to debug when `updateVariablesFromToken` is called
