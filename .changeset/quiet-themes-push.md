---
"@tokens-studio/figma-plugin": patch
---

Fixed exporting styles from themes to Tokens Studio sending every selected theme once per theme. Each theme is now sent once, after all styles exist, and refused themes are reported in one message.
