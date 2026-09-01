---
"@tokens-studio/figma-plugin": patch
---

Add Prompt to delete stale Figma variables when exporting color tokens that have been converted to gradients. Figma variables can't hold gradient values, so a bound variable from a previous export keeps overriding the new gradient style on any layer that uses it. The export flow now scans for these mismatches and shows a checkbox confirm so you can clean them up in one step.
