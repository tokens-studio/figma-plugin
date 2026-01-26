---
"@tokens-studio/figma-plugin": patch
---

Fix code syntax not updating on existing Figma variables when token metadata changes

Previously, when exporting tokens to existing Figma variables, changes to code syntax (Web, Android, iOS) in the token would not be applied to the variable. The metadata update logic was being blocked by a tracker that prevented re-processing, even when actual changes were detected. This fix ensures that metadata updates are applied whenever changes are detected, while still avoiding redundant updates within the same export run.
