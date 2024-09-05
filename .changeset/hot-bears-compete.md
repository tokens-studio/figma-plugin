---
"@tokens-studio/figma-plugin": patch
---

Fixes variable creation of color token was using a modifier and using a reference. We now correctly create a raw hex value as Figma doesn't have modifiers. Before we falsely used a reference without the modifier applied
