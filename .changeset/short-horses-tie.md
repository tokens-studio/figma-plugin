---
"@tokens-studio/figma-plugin": patch
---

Shadow tokens that use the DTCG `offsetX`, `offsetY` and `inset` keys now export to Figma effect styles with all their properties, instead of creating an empty style. Their offsets also show in the token tooltip and the edit form.
