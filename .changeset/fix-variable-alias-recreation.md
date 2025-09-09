---
"@tokens-studio/figma-plugin": patch
---

Fix variable reference recreation and deletion bug. Enhanced color variable comparison to use reference-based logic for aliases instead of resolving values, preventing unnecessary updates. Fixed variable deletion bug where variables with correct alias references were incorrectly excluded from tracking. Added comprehensive debugging logs for all variable types.