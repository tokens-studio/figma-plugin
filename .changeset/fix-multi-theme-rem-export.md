---
"@tokens-studio/figma-plugin": patch
---

Fixed multi-theme variable export to use correct base font size per theme for rem conversion. Previously, when exporting multiple themes simultaneously, all themes would use the base font size from the currently active theme due to shared TokenResolver state.