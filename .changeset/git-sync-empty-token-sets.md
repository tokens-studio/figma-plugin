---
"@tokens-studio/figma-plugin": patch
---

Fixed GitHub multi-file sync losing newly created empty token sets: pushing now writes the set's file to the repository (and deletes it when an empty set is removed), so the set no longer silently disappears after reopening the plugin.
