---
"@tokens-studio/figma-plugin": patch
---

Fix letterSpacing value 0 being omitted from exported tokens. Changed truthy check to explicit undefined check in convertTokenToFormat to include falsy values like 0.
