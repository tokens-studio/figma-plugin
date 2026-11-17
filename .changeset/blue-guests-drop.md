---
"@tokens-studio/figma-plugin": patch
---

Fixed rem values using 16px when the base font size setting is empty. The plugin now uses the project's `@system.baseFontSize` token, so variables, applied sizes and tooltips match what Studio shows.
