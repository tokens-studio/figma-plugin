---
"@tokens-studio/figma-plugin": patch
---

Fix variable export regression for external library variables introduced in v2.10.6. The `preResolveVariableReferences` function now correctly handles both local variables (VariableID: format) and remote/library variables (variable key format) when validating variable references during export. This restores the ability to properly attach variable references from published libraries in non-local setups.
