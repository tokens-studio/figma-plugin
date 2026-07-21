---
"@tokens-studio/figma-plugin": patch
---

Fix Figma variable export writing the same values to every mode of a multi-mode theme group (Tokens Studio OAuth). Server-resolved token deltas are now fetched per theme so each mode resolves independently. Also fixes the analogous by-sets export where active-theme values could leak into unrelated sets.
