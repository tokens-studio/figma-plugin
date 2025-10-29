---
"@tokens-studio/figma-plugin": patch
---

Fix composite tokens being skipped during variable export. Typography, border, boxShadow, and composition tokens are now expanded into individual property variables (e.g., typography.fontSize, typography.fontWeight) when exporting as variables.
