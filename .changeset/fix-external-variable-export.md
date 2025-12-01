---
"@tokens-studio/figma-plugin": patch
---

Fix variable export regression for external library variables introduced in v2.10.6. Removed overly strict validation that was filtering out remote/library variable references. Added fallback mechanism in `updateVariablesToReference` to find variables by name when import by key fails. This restores the ability to properly attach variable references from published libraries in non-local setups.
