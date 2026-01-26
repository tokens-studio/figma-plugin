---
"@tokens-studio/figma-plugin": patch
---

Fix code syntax not updating on existing Figma variables and prevent plugin hang

Previously, when exporting tokens to existing Figma variables, changes to code syntax (Web, Android, iOS) in the token would not be applied to the variable. The first fix attempt caused the plugin to hang at "hold on...updating" due to re-processing the same variable multiple times. This fix ensures that metadata updates are applied when changes are detected, marks variables as processed immediately to prevent re-entry, and avoids redundant updates within the same export run.
