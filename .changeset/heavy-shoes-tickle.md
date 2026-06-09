---
"@tokens-studio/figma-plugin": patch
---

Fixed two issues affecting typography tokens for Studio platform users: typography tokens referencing server-resolved values were not resolving correctly, and even when resolved they did not visually update text layers on apply (font, size, line height and other properties were silently dropped until a manual pull).
