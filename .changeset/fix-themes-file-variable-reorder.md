---
"@tokens-studio/figma-plugin": patch
---

Fix themes.json shuffling existing variable IDs on export. `$figmaVariableReferences` was replaced wholesale after creating variables, so the key order followed the current export's iteration order instead of the previous file. It now merges into the existing map, preserving the original order and appending only new tokens (issue #3791).
