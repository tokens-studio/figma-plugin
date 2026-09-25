---
"@tokens-studio/figma-plugin": patch
---

Fix themes.json shuffling existing variable IDs on export. `$figmaVariableReferences` was replaced wholesale after creating variables, so the key order followed the current export's iteration order instead of the previous file. It is now rebuilt in the previous file's key order, with new tokens appended at the end and references to deleted tokens still pruned (issue #3791).
