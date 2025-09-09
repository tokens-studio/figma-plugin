---
"@tokens-studio/figma-plugin": patch
---

Fix unnecessary variable updates for reference tokens with correct aliases

When updating variables with reference tokens, prevent unnecessary updates when the alias already points to the correct variable. This fixes the issue where both source and reference variables were being updated when only the source value changed, but the reference relationship remained the same.