---
"@tokens-studio/figma-plugin": patch
---

Add gradient position support for radial and conic gradients. Now supports position keywords (left, top, right, bottom) and percentage values (25%, 50%) in radial-gradient() and conic-gradient() functions. Examples: radial-gradient(ellipse at top, #ff0000, #0000ff) and conic-gradient(at 25% 25%, #ff0000, #0000ff).