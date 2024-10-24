---
"@tokens-studio/figma-plugin": patch
---

When updating variables we now properly check if the variable needs to be updated, which fixes an issue where Figma was showing library updates even though the values were the same
