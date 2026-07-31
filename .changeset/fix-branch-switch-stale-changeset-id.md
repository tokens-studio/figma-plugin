---
"@tokens-studio/figma-plugin": patch
---

Fixed a critical bug where switching branches on the Tokens Studio (OAuth) provider kept syncing edits to the previously selected branch's change set instead of the newly selected one, causing destructive writes to land on the wrong branch (e.g. `main`) while the UI showed a different branch selected.
