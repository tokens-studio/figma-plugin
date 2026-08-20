---
"@tokens-studio/figma-plugin": patch
---

Fix the default preset's box shadow token using `$type` instead of `type` for the shadow type of its individual layers, a leftover from the DTCG migration. The layer type was unreadable, so every layer was applied as a drop shadow instead of one drop and one inner shadow.
