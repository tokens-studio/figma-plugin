---
"@tokens-studio/figma-plugin": patch
---

Add support for radial and conic gradients in addition to linear gradients. The plugin now supports:
- `radial-gradient()` CSS syntax mapped to Figma's GRADIENT_RADIAL type
- `conic-gradient()` CSS syntax mapped to Figma's GRADIENT_ANGULAR type
- Backward compatibility with existing linear gradient functionality
- Updated reference token extraction to work with all gradient types