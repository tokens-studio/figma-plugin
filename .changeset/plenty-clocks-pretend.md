---
"@tokens-studio/figma-plugin": patch
---

Fixed border tokens applied to a single side (top, right, bottom or left) setting raw values instead of binding to variables. The side's stroke weight and the stroke color now use the variables of the width and color tokens the border references, as they already did for borders on all sides.
